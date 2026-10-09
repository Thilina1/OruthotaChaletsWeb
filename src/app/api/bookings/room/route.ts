import { NextResponse } from 'next/server';
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { isValidEmail, isValidInternationalPhone } from '@/lib/contact-validation';

const roomBookingSchema = z.object({
  roomId: z.string().min(1).max(120),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  adults: z.coerce.number().int().min(1).max(20),
  children: z.coerce.number().int().min(0).max(20),
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  email: z.string().trim().min(1).max(254),
  phone: z.string().trim().min(1).max(32),
  idCardNumber: z.string().trim().max(80).optional().or(z.literal('')),
  specialRequests: z.string().trim().max(1000).optional().or(z.literal('')),
});

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: z.infer<typeof roomBookingSchema>;

  try {
    payload = roomBookingSchema.parse(await request.json());
  } catch {
    return badRequest('Please check the booking details and try again.');
  }

  if (!isValidEmail(payload.email)) {
    return badRequest('Please enter a valid email address.');
  }

  if (!isValidInternationalPhone(payload.phone)) {
    return badRequest('Please enter a valid phone number.');
  }

  const checkInDate = parseISO(payload.checkIn);
  const checkOutDate = parseISO(payload.checkOut);
  const nights = differenceInCalendarDays(checkOutDate, checkInDate);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || nights < 1) {
    return badRequest('Check-out date must be after check-in date.');
  }

  if (checkInDate < startOfDay(new Date())) {
    return badRequest('Check-in date cannot be in the past.');
  }

  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch (error) {
    console.error('Room booking server configuration error:', error);
    return NextResponse.json({ error: 'Booking service is not configured. Please contact our team.' }, { status: 500 });
  }

  const { data: room, error: roomError } = await supabase
    .from('rooms')
    .select('id, title, pricePerNight')
    .eq('id', payload.roomId)
    .single();

  if (roomError || !room) {
    return badRequest('Room not found.');
  }

  const { data: existingBookings, error: availabilityError } = await supabase
    .from('reservations')
    .select('id')
    .eq('room_id', payload.roomId)
    .eq('status', 'confirmed')
    .lt('check_in_date', format(checkOutDate, 'yyyy-MM-dd'))
    .gt('check_out_date', format(checkInDate, 'yyyy-MM-dd'));

  if (availabilityError) {
    console.error('Availability check failed:', availabilityError);
    return NextResponse.json({ error: 'Could not verify availability.' }, { status: 500 });
  }

  if (existingBookings && existingBookings.length > 0) {
    return NextResponse.json({ error: 'This room is no longer available for the selected dates.' }, { status: 409 });
  }

  const totalCost = Number(room.pricePerNight) * nights;
  const guestData = {
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    email: payload.email.trim(),
    phone_number: payload.phone.trim(),
    id_card_number: payload.idCardNumber?.trim() || null,
  };

  const { data: guest, error: guestError } = await supabase
    .from('guests')
    .upsert([guestData], { onConflict: 'email' })
    .select('id')
    .single();

  if (guestError || !guest) {
    console.error('Guest upsert failed:', guestError);
    return NextResponse.json({ error: 'Could not create guest record.' }, { status: 500 });
  }

  const { error: reservationError } = await supabase.from('reservations').insert([{
    guest_id: guest.id,
    room_id: room.id,
    room_title: room.title,
    guest_name: `${payload.firstName.trim()} ${payload.lastName.trim()}`,
    guest_email: payload.email.trim(),
    check_in_date: format(checkInDate, 'yyyy-MM-dd'),
    check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
    number_of_guests: payload.adults + payload.children,
    total_cost: totalCost,
    status: 'pending',
    special_requests: payload.specialRequests?.trim() || null,
    id_card_number: payload.idCardNumber?.trim() || null,
    guest_phone: payload.phone.trim(),
  }]);

  if (reservationError) {
    console.error('Reservation insert failed:', reservationError);
    return NextResponse.json({ error: 'Could not submit booking request.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    pricing: {
      pricePerNight: Number(room.pricePerNight),
      nights,
      totalCost,
    },
  });
}
