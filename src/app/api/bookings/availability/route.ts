import { NextResponse } from 'next/server';
import { addDays, differenceInCalendarDays, eachDayOfInterval, format, parseISO } from 'date-fns';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

type ReservationWindow = {
  room_id: string;
  check_in_date: string;
  check_out_date: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');

  if (!checkIn || !checkOut) {
    return NextResponse.json({ rooms: [] });
  }

  const selectedStart = parseISO(checkIn);
  const selectedEnd = parseISO(checkOut);

  if (
    Number.isNaN(selectedStart.getTime()) ||
    Number.isNaN(selectedEnd.getTime()) ||
    differenceInCalendarDays(selectedEnd, selectedStart) < 1
  ) {
    return NextResponse.json({ error: 'Invalid date range.' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch (error) {
    console.error('Availability server configuration error:', error);
    return NextResponse.json({ error: 'Availability service is not configured.' }, { status: 500 });
  }

  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .select('id');

  if (roomsError) {
    console.error('Availability rooms query failed:', roomsError);
    return NextResponse.json({ error: 'Could not load rooms.' }, { status: 500 });
  }

  const { data: reservations, error: reservationsError } = await supabase
    .from('reservations')
    .select('room_id, check_in_date, check_out_date')
    .eq('status', 'confirmed');

  if (reservationsError) {
    console.error('Availability reservations query failed:', reservationsError);
    return NextResponse.json({ error: 'Could not load availability.' }, { status: 500 });
  }

  const availability = (rooms ?? []).map((room: { id: string }) => {
    const roomReservations = ((reservations ?? []) as ReservationWindow[])
      .filter((reservation) => reservation.room_id === room.id)
      .map((reservation) => ({
        start: parseISO(`${reservation.check_in_date}T00:00:00Z`),
        end: parseISO(`${reservation.check_out_date}T00:00:00Z`),
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const isUnavailable = roomReservations.some((reservation) =>
      selectedStart < reservation.end && reservation.start < selectedEnd
    );

    const bookedDates = roomReservations.flatMap((reservation) =>
      eachDayOfInterval({ start: reservation.start, end: addDays(reservation.end, -1) })
        .map((date) => format(date, 'yyyy-MM-dd'))
    );

    const nextAvailableDates: string[] = [];
    let currentDate = addDays(new Date(), 1);

    while (nextAvailableDates.length < 7) {
      const isBlocked = roomReservations.some((reservation) =>
        currentDate >= reservation.start && currentDate < reservation.end
      );

      if (!isBlocked) {
        nextAvailableDates.push(format(currentDate, 'yyyy-MM-dd'));
      }

      currentDate = addDays(currentDate, 1);
      if (differenceInCalendarDays(currentDate, new Date()) > 365 * 2) break;
    }

    return {
      roomId: room.id,
      isAvailable: !isUnavailable,
      bookedDates,
      nextAvailableDates: isUnavailable ? nextAvailableDates : [],
    };
  });

  return NextResponse.json({ rooms: availability });
}
