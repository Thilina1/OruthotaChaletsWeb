import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { fetchCheckoutHolds } from '@/lib/chalet-availability';
import { combinedGuestLimitSource, roomGuestLimits } from '@/lib/chalet-guest-limits';

function createReadClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration.');
  }

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

type RoomCategory = {
  id: string;
  room_count?: number | null;
  max_adults?: number | null;
  max_children?: number | null;
  max_guests?: number | null;
};

type ChaletRoom = {
  id: string;
  category_id?: string | null;
  status?: string | null;
  min_adults?: number | null;
  max_adults?: number | null;
  max_children?: number | null;
  max_guests?: number | null;
};

type ChaletBookingWindow = {
  room_id?: string | null;
  room_ids?: string[] | null;
  room_category_id?: string | null;
  room_allocations?: Array<{ roomCategoryId?: string | null }> | null;
  check_in_date?: string | null;
  check_out_date?: string | null;
};

const defaultBillSettings = {
  service_charge_pct: 10,
  service_charge_currency: 'both',
  vat_pct: 18,
  vat_currency: 'USD',
  sscl_pct: 2.5,
  sscl_currency: 'USD',
};

function bookingUsesRoom(booking: ChaletBookingWindow, roomId: string) {
  if (booking.room_id === roomId) return true;
  return Array.isArray(booking.room_ids) && booking.room_ids.includes(roomId);
}

function bookingHasAssignedRoom(booking: ChaletBookingWindow) {
  return Boolean(booking.room_id || (Array.isArray(booking.room_ids) && booking.room_ids.length > 0));
}

function bookingCategoryHoldCount(booking: ChaletBookingWindow, categoryId: string) {
  if (Array.isArray(booking.room_allocations) && booking.room_allocations.length > 0) {
    return booking.room_allocations.filter(allocation => allocation.roomCategoryId === categoryId).length;
  }
  return booking.room_category_id === categoryId && !bookingHasAssignedRoom(booking) ? 1 : 0;
}

function bookingOverlapsDateRange(booking: ChaletBookingWindow, checkIn: string, checkOut: string) {
  if (!booking.check_in_date || !booking.check_out_date) return true;
  return booking.check_in_date < checkOut && booking.check_out_date > checkIn;
}

export async function GET(request: Request) {
  let supabase;

  try {
    supabase = createReadClient();
  } catch (error) {
    console.error('Chalet options server configuration error:', error);
    return NextResponse.json({ error: 'Booking service is not configured.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const flexibleDates = searchParams.get('flexibleDates') === 'true';
  const today = startOfDay(new Date());
  const availabilityCheckIn = checkIn || format(today, 'yyyy-MM-dd');
  const availabilityCheckOut = checkOut || format(addDays(today, 1), 'yyyy-MM-dd');
  // Flexible dates: 9 nights, each priced and checked on its own (the guest
  // picks an arrival and a departure night). flexStart moves the window
  // (the page's arrows); it never starts before today.
  const flexStartParam = searchParams.get('flexStart');
  const requestedFlexStart = flexStartParam && /^\d{4}-\d{2}-\d{2}$/.test(flexStartParam) ? flexStartParam : availabilityCheckIn;
  const flexWindowStart = differenceInCalendarDays(parseISO(requestedFlexStart), today) < 0 ? format(today, 'yyyy-MM-dd') : requestedFlexStart;
  const flexibleDateStrings = flexibleDates
    ? Array.from({ length: 9 }, (_, index) => format(addDays(parseISO(flexWindowStart), index), 'yyyy-MM-dd'))
    : [];
  // The bookings loaded must cover both the searched stay and the flexible window.
  const flexibleWindowEnd = flexibleDates
    ? format(addDays(parseISO(flexibleDateStrings[flexibleDateStrings.length - 1]), 1), 'yyyy-MM-dd')
    : availabilityCheckOut;
  const bookingWindowStart = flexibleDates && flexibleDateStrings[0] < availabilityCheckIn ? flexibleDateStrings[0] : availabilityCheckIn;
  const bookingWindowEnd = flexibleWindowEnd > availabilityCheckOut ? flexibleWindowEnd : availabilityCheckOut;

  const [categoryRes, packageRes, rateRes, roomsRes, bookingsRes, settingsRes] = await Promise.all([
    supabase
      .from('chalet_room_categories')
      .select('id, name, description, area_sqm, room_count, max_adults, max_children, max_guests, bed_configurations, bathroom_features, entertainment_features, general_amenities, internet_features, image_urls, is_active, sort_order')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('chalet_packages')
      .select('id, name, description, meal_plan_id, meal_plan, includes_breakfast, includes_lunch, includes_dinner, facilities, is_active, sort_order, chalet_meal_plans(id, name, description, food_items, other_costs)')
      .eq('is_active', true)
      .order('sort_order'),
    supabase
      .from('chalet_rates')
      // All columns, so the adult/child rates are included once their migration is run.
      .select('*')
      .is('occupancy_type_id', null),
    supabase
      .from('chalet_rooms')
      // All columns, so min_adults is included once its migration is run.
      .select('*'),
    supabase
      .from('chalet_bookings')
      .select('room_id, room_ids, room_category_id, room_allocations, check_in_date, check_out_date')
      // Every booking holds its dates (checked-out ones too) until it is cancelled.
      .neq('status', 'cancelled')
      .lt('check_in_date', bookingWindowEnd)
      .gt('check_out_date', bookingWindowStart),
    supabase
      .from('app_settings')
      .select('value')
      .eq('key', 'chalet_bill_settings')
      .maybeSingle(),
  ]);

  if (categoryRes.error || packageRes.error || rateRes.error || roomsRes.error || bookingsRes.error) {
    console.error('Chalet options query failed:', {
      categories: categoryRes.error,
    packages: packageRes.error,
    rates: rateRes.error,
    rooms: roomsRes.error,
    bookings: bookingsRes.error,
    settings: settingsRes.error,
    });
    if (categoryRes.error || packageRes.error || rateRes.error || roomsRes.error || bookingsRes.error) {
      return NextResponse.json({ error: 'Could not load chalet booking options.' }, { status: 500 });
    }
  }

  const rooms = (roomsRes.data ?? []) as ChaletRoom[];
  // Online checkouts waiting for payment hold their room types too.
  // The viewing guest's own unpaid checkout does not count against them.
  const checkoutHolds = await fetchCheckoutHolds(supabase, bookingWindowStart, bookingWindowEnd, searchParams.get('ownCheckout'));
  const bookings = [...(bookingsRes.data ?? []), ...checkoutHolds] as ChaletBookingWindow[];
  const categoryData = (categoryRes.data ?? []) as RoomCategory[];
  const availableRoomCountForCategory = (category: RoomCategory, checkInDate: string, checkOutDate: string) => {
    const categoryRooms = rooms.filter(room => room.category_id === category.id);
    const physicalRoomCount = categoryRooms.length;
    const overlappingBookings = bookings.filter(booking => bookingOverlapsDateRange(booking, checkInDate, checkOutDate));
    const bookedAssignedRoomCount = categoryRooms.filter(room =>
      overlappingBookings.some(booking => bookingUsesRoom(booking, room.id))
    ).length;
    const bookedCategoryRoomCount = overlappingBookings.reduce(
      (count, booking) => count + bookingCategoryHoldCount(booking, category.id),
      0
    );
    const bookedRoomCount = bookedAssignedRoomCount + bookedCategoryRoomCount;
    const availablePhysicalRoomCount = categoryRooms.length === 0
      ? physicalRoomCount
      : categoryRooms.filter(room => room.status === 'available').length;
    return Math.max(0, availablePhysicalRoomCount - bookedRoomCount);
  };

  const categories = categoryData.map(category => {
    const categoryRooms = rooms.filter(room => room.category_id === category.id);
    const physicalRoomCount = categoryRooms.length;
    const availableRoomCount = availableRoomCountForCategory(category, availabilityCheckIn, availabilityCheckOut);
    // Guests are limited per room, not per room type. The website shows the
    // biggest room's limits and checks each party against the free rooms.
    const overlappingBookings = bookings.filter(booking => bookingOverlapsDateRange(booking, availabilityCheckIn, availabilityCheckOut));
    const freeRoomGuestLimits = categoryRooms
      .filter(room => room.status === 'available' && !overlappingBookings.some(booking => bookingUsesRoom(booking, room.id)))
      .map(room => roomGuestLimits(room, category));
    const combinedLimits = combinedGuestLimitSource(categoryRooms.map(room => roomGuestLimits(room, category)));

    return {
      ...category,
      ...(combinedLimits ?? {}),
      physical_room_count: physicalRoomCount,
      available_room_count: availableRoomCount,
      room_guest_limits: freeRoomGuestLimits,
    };
  });
  // Free rooms of a room type for a stay, with each room's guest limits.
  const freeRoomLimitsForCategory = (category: RoomCategory, checkInDate: string, checkOutDate: string) => {
    const overlapping = bookings.filter(booking => bookingOverlapsDateRange(booking, checkInDate, checkOutDate));
    return rooms
      .filter(room => room.category_id === category.id && room.status === 'available' && !overlapping.some(booking => bookingUsesRoom(booking, room.id)))
      .map(room => roomGuestLimits(room, category));
  };

  const availabilityDates = flexibleDateStrings.map(date => {
    const stayEnd = format(addDays(parseISO(date), 1), 'yyyy-MM-dd');
    return {
      date,
      checkOut: stayEnd,
      categories: Object.fromEntries(
        categoryData.map(category => [category.id, availableRoomCountForCategory(category, date, stayEnd)])
      ),
      roomGuestLimits: Object.fromEntries(
        categoryData.map(category => [category.id, freeRoomLimitsForCategory(category, date, stayEnd)])
      ),
    };
  });

  return NextResponse.json({
    categories,
    packages: packageRes.data ?? [],
    rates: rateRes.data ?? [],
    availabilityDates,
    billSettings: { ...defaultBillSettings, ...((settingsRes.data?.value as Record<string, unknown> | null) ?? {}) },
  });
}
