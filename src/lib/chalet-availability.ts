import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// A booking (or online checkout) that occupies chalets for a date range:
// either specific chalets (room_id / room_ids) or room types without a chalet
// assigned yet (room_allocations / room_category_id).
export type ChaletBookingWindow = {
  room_id?: string | null;
  room_ids?: string[] | null;
  room_category_id?: string | null;
  room_allocations?: Array<{ roomId?: string | null; roomCategoryId?: string | null }> | null;
  check_in_date?: string | null;
  check_out_date?: string | null;
};

export const CHECKOUT_HOLD_MINUTES = 5;

export function bookingUsesRoom(booking: ChaletBookingWindow, roomId: string) {
  if (booking.room_id === roomId) return true;
  return Array.isArray(booking.room_ids) && booking.room_ids.includes(roomId);
}

export function bookingCategoryHoldCount(booking: ChaletBookingWindow, categoryId: string) {
  if (Array.isArray(booking.room_allocations) && booking.room_allocations.length > 0) {
    return booking.room_allocations.filter(allocation => allocation.roomCategoryId === categoryId).length;
  }
  return booking.room_category_id === categoryId && !booking.room_id && (!Array.isArray(booking.room_ids) || booking.room_ids.length === 0) ? 1 : 0;
}

// Server-side Supabase client for chalet bookings. Works with the public key:
// checkouts are reached only through the database functions in migration
// 20261004000001_chalet_booking_checkouts.sql.
export function createChaletDbClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('Missing Supabase configuration.');
  return createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Online checkouts still waiting for payment hold their room types, so a room
// a guest is paying for is not sold to someone else meanwhile.
export async function fetchCheckoutHolds(supabase: SupabaseClient, checkIn: string, checkOut: string): Promise<ChaletBookingWindow[]> {
  const { data, error } = await supabase.rpc('get_chalet_checkout_holds', { p_check_in: checkIn, p_check_out: checkOut });
  if (error) {
    // Before the checkouts migration is run there are no holds to count.
    console.warn('Chalet checkout holds could not be loaded:', error.message);
    return [];
  }
  return ((data ?? []) as { check_in_date: string; check_out_date: string; room_allocations: unknown }[]).map(row => ({
    room_id: null,
    room_ids: [],
    room_category_id: null,
    room_allocations: Array.isArray(row.room_allocations) ? row.room_allocations : [],
    check_in_date: row.check_in_date,
    check_out_date: row.check_out_date,
  }));
}

// Checks that each room type has enough free chalets for the requested count
// on these dates. Every booking except cancelled ones holds its dates, plus
// checkouts awaiting payment. Returns the first room type that is short.
// (The database checks again when the checkout is saved and after payment.)
export async function findUnavailableRoomCategory(supabase: SupabaseClient, params: {
  checkIn: string;
  checkOut: string;
  roomsByCategory: Record<string, number>;
}) {
  const categoryIds = Object.keys(params.roomsByCategory);
  if (categoryIds.length === 0) return null;
  const [{ data: roomRows, error: roomsError }, { data: bookingRows, error: bookingsError }, checkoutHolds] = await Promise.all([
    supabase
      .from('chalet_rooms')
      .select('id, category_id, status')
      .in('category_id', categoryIds),
    supabase
      .from('chalet_bookings')
      .select('room_id, room_ids, room_category_id, room_allocations')
      .neq('status', 'cancelled')
      .lt('check_in_date', params.checkOut)
      .gt('check_out_date', params.checkIn),
    fetchCheckoutHolds(supabase, params.checkIn, params.checkOut),
  ]);
  if (roomsError) throw roomsError;
  if (bookingsError) throw bookingsError;

  const windows = [...((bookingRows ?? []) as ChaletBookingWindow[]), ...checkoutHolds];
  for (const [categoryId, requestedCount] of Object.entries(params.roomsByCategory)) {
    const categoryRooms = (roomRows ?? []).filter(room => room.category_id === categoryId && room.status === 'available');
    const freeRooms = categoryRooms.filter(room => !windows.some(booking => bookingUsesRoom(booking, room.id))).length;
    const heldByRoomType = windows.reduce((count, booking) => count + bookingCategoryHoldCount(booking, categoryId), 0);
    const available = Math.max(0, freeRooms - heldByRoomType);
    if (available < requestedCount) return { categoryId, available };
  }
  return null;
}
