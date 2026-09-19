import { NextResponse } from 'next/server';
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { z } from 'zod';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { isValidEmail, isValidInternationalPhone } from '@/lib/contact-validation';

const SERVICE_CHARGE_RATE = 0.1;

const chaletBookingSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  packageId: z.string().uuid(),
  occupancyTypeId: z.string().uuid(),
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().max(254).optional().or(z.literal('')),
  customerPhone: z.string().trim().min(1).max(32),
  customerNic: z.string().trim().min(1).max(80),
  adults: z.coerce.number().int().min(1).max(20),
  children: z.coerce.number().int().min(0).max(20),
  specialRequests: z.string().trim().max(1000).optional().or(z.literal('')),
});

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function POST(request: Request) {
  let payload: z.infer<typeof chaletBookingSchema>;

  try {
    payload = chaletBookingSchema.parse(await request.json());
  } catch {
    return badRequest('Please check the booking details and try again.');
  }

  const email = payload.customerEmail?.trim() ?? '';
  if (email && !isValidEmail(email)) {
    return badRequest('Please enter a valid email address.');
  }

  if (!isValidInternationalPhone(payload.customerPhone)) {
    return badRequest('Please enter a valid phone number.');
  }

  const checkInDate = parseISO(payload.checkIn);
  const checkOutDate = parseISO(payload.checkOut);
  const nights = differenceInCalendarDays(checkOutDate, checkInDate);

  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime()) || nights < 1) {
    return badRequest('Check-out must be after check-in.');
  }

  if (checkInDate < startOfDay(new Date())) {
    return badRequest('Check-in date cannot be in the past.');
  }

  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch (error) {
    console.error('Chalet booking server configuration error:', error);
    return NextResponse.json({ error: 'Booking service is not configured. Please contact our team.' }, { status: 500 });
  }

  const { data: occupancy, error: occupancyError } = await supabase
    .from('chalet_occupancy_types')
    .select('max_guests')
    .eq('id', payload.occupancyTypeId)
    .single();

  if (occupancyError) {
    return badRequest('Invalid occupancy type.');
  }

  const maxGuests = Number(occupancy?.max_guests ?? 0);
  if (maxGuests > 0 && payload.adults + payload.children > maxGuests) {
    return badRequest(`This occupancy option allows up to ${maxGuests} guests.`);
  }

  const { data: rate, error: rateError } = await supabase
    .from('chalet_rates')
    .select('rate_per_night')
    .eq('package_id', payload.packageId)
    .eq('occupancy_type_id', payload.occupancyTypeId)
    .single();

  if (rateError || !rate) {
    return badRequest('No rate found for this package and occupancy combination.');
  }

  const ratePerNight = Number(rate.rate_per_night);
  const subtotal = ratePerNight * nights;
  const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
  const totalAmount = subtotal + serviceCharge;

  const { error: insertError } = await supabase.from('chalet_bookings').insert([{
    check_in_date: format(checkInDate, 'yyyy-MM-dd'),
    check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
    package_id: payload.packageId,
    occupancy_type_id: payload.occupancyTypeId,
    customer_name: payload.customerName.trim(),
    customer_email: email || null,
    customer_phone: payload.customerPhone.trim(),
    customer_nic: payload.customerNic.trim(),
    adults: payload.adults,
    children: payload.children,
    special_requests: payload.specialRequests?.trim() || null,
    rate_per_night: ratePerNight,
    total_nights: nights,
    status: 'pending',
  }]);

  if (insertError) {
    console.error('Chalet booking insert failed:', insertError);
    return NextResponse.json({ error: 'Could not submit booking request.' }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    pricing: {
      ratePerNight,
      nights,
      subtotal,
      serviceCharge,
      totalAmount,
    },
  });
}
