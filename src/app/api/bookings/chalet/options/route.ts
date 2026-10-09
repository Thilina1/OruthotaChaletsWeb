import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { addDays, format, parseISO, startOfDay } from 'date-fns';
import { fetchCheckoutHolds } from '@/lib/chalet-availability';

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
};

type ChaletRoom = {
  id: string;
  category_id?: string | null;
  status?: string | null;
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
  const flexibleDateStrings = flexibleDates
    ? Array.from({ length: 9 }, (_, index) => format(addDays(parseISO(availabilityCheckIn), index), 'yyyy-MM-dd'))
    : [];
  const bookingWindowStart = flexibleDates ? flexibleDateStrings[0] : availabilityCheckIn;
  const bookingWindowEnd = flexibleDates
    ? format(addDays(parseISO(flexibleDateStrings[flexibleDateStrings.length - 1]), 1), 'yyyy-MM-dd')
    : availabilityCheckOut;

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
      .select('package_id, room_category_id, rate_per_night, usd_rate_per_night, usd_to_lkr_rate, offer_name, discount_percent, lkr_discount_value, lkr_discount_fixed_value, usd_discount_value, usd_discount_fixed_value')
      .is('occupancy_type_id', null),
    supabase
      .from('chalet_rooms')
      .select('id, category_id, status'),
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
  const checkoutHolds = await fetchCheckoutHolds(supabase, bookingWindowStart, bookingWindowEnd);
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

    return {
      ...category,
      physical_room_count: physicalRoomCount,
      available_room_count: availableRoomCount,
    };
  });
  const availabilityDates = flexibleDateStrings.map(date => {
    const nextDate = format(addDays(parseISO(date), 1), 'yyyy-MM-dd');
    return {
      date,
      categories: Object.fromEntries(
        categoryData.map(category => [category.id, availableRoomCountForCategory(category, date, nextDate)])
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
