import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';


type ChaletRoom = {
  id: string;
  category_id: string | null;
  status: string | null;
};

type ChaletBooking = {
  id: string;
  check_in_date: string;
  check_out_date: string;
  package_id: string | null;
  room_category_id: string | null;
  room_id: string | null;
  room_ids: string[] | null;
  room_allocations: RoomAllocation[] | null;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  adults: number | null;
  children: number | null;
  nationality: string | null;
  rate_per_night: number | null;
  total_nights: number | null;
  subtotal: number | null;
  service_charge: number | null;
  total_amount: number | null;
  currency: 'LKR' | 'USD' | null;
  service_charge_pct: number | null;
  service_charge_currency?: string | null;
  vat_currency?: string | null;
  sscl_currency?: string | null;
  vat_pct: number | null;
  sscl_pct: number | null;
  promo_discount: number | null;
  coupon_discount_amount: number | null;
  promo_code: string | null;
  coupon_code: string | null;
  payment_status: string | null;
  payment_gateway: string | null;
  payment_environment: string | null;
  payhere_order_id: string | null;
  payhere_payment_id: string | null;
  payhere_status_code: string | null;
  payhere_method: string | null;
  payment_option: string | null;
  payment_required_amount: number | null;
  payment_balance_amount: number | null;
  refund_status: string | null;
  refund_amount: number | null;
  refund_service_charge_retained: number | null;
  status: string;
  created_at: string | null;
};

type RoomAllocation = {
  roomId?: string | null;
  roomCategoryId?: string | null;
  packageId?: string | null;
  adults?: number | null;
  children?: number | null;
};

type RoomSlot = {
  key: string;
  roomCategoryId: string;
  packageId: string | null;
  adults: number;
  children: number;
};

type ChaletRate = {
  package_id: string | null;
  room_category_id: string | null;
  usd_to_lkr_rate: number | null;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getNights(booking: Pick<ChaletBooking, 'check_in_date' | 'check_out_date' | 'total_nights'>) {
  const storedNights = Number(booking.total_nights || 0);
  if (storedNights > 0) return storedNights;

  const checkIn = new Date(`${booking.check_in_date}T00:00:00`);
  const checkOut = new Date(`${booking.check_out_date}T00:00:00`);
  const diff = (checkOut.getTime() - checkIn.getTime()) / 86400000;
  return Number.isFinite(diff) && diff > 0 ? diff : 1;
}

function findExchangeRate(booking: ChaletBooking, rates: ChaletRate[]) {
  const slots = getRoomSlots(booking);
  const slotRates = slots
    .map(slot => rates.find(rate => (
      rate.package_id === slot.packageId
      && rate.room_category_id === slot.roomCategoryId
      && Number(rate.usd_to_lkr_rate || 0) > 0
    )) ?? rates.find(rate => (
      rate.package_id === slot.packageId
      && !rate.room_category_id
      && Number(rate.usd_to_lkr_rate || 0) > 0
    )))
    .filter(Boolean) as ChaletRate[];

  const exchangeRates = slotRates.map(rate => Number(rate.usd_to_lkr_rate || 0)).filter(rate => rate > 0);
  if (exchangeRates.length > 0) {
    return exchangeRates.reduce((sum, rate) => sum + rate, 0) / exchangeRates.length;
  }

  const fallback = rates.find(rate => Number(rate.usd_to_lkr_rate || 0) > 0);
  return Number(fallback?.usd_to_lkr_rate || 0);
}

function buildBill(booking: ChaletBooking, rates: ChaletRate[]) {
  const currency = booking.currency || (booking.nationality === 'Non Sri Lankan' ? 'USD' : 'LKR');
  const nights = getNights(booking);
  const subtotal = Number(booking.subtotal ?? 0) > 0
    ? Number(booking.subtotal)
    : Number(booking.rate_per_night || 0) * nights;
  // Coupon off the room subtotal first, then service charge / VAT / SSCL on
  // the discounted amount, only where the booking applies them to its currency
  // (same rule as the booking page and the admin app).
  const discount = Math.min(subtotal, Number(booking.coupon_discount_amount ?? booking.promo_discount ?? 0));
  const discountedSubtotal = Math.max(0, subtotal - discount);
  const applies = (chargeCurrency?: string | null) => !chargeCurrency || chargeCurrency === 'both' || chargeCurrency === currency;
  const serviceCharge = applies(booking.service_charge_currency) ? discountedSubtotal * Number(booking.service_charge_pct || 0) / 100 : 0;
  const vat = applies(booking.vat_currency) ? discountedSubtotal * Number(booking.vat_pct || 0) / 100 : 0;
  const sscl = applies(booking.sscl_currency) ? discountedSubtotal * Number(booking.sscl_pct || 0) / 100 : 0;
  const total = discountedSubtotal + serviceCharge + vat + sscl;
  const exchangeRate = findExchangeRate(booking, rates);

  const convert = (amount: number, targetCurrency: 'LKR' | 'USD') => {
    if (currency === targetCurrency) return amount;
    if (exchangeRate <= 0) return null;
    return currency === 'USD' ? amount * exchangeRate : amount / exchangeRate;
  };

  return {
    currency,
    exchangeRate: exchangeRate > 0 ? roundMoney(exchangeRate) : null,
    nights,
    subtotal: roundMoney(subtotal),
    serviceCharge: roundMoney(serviceCharge),
    vat: roundMoney(vat),
    sscl: roundMoney(sscl),
    discount: roundMoney(discount),
    total: roundMoney(total),
    lkrTotal: convert(total, 'LKR') == null ? null : roundMoney(convert(total, 'LKR') as number),
    usdTotal: convert(total, 'USD') == null ? null : roundMoney(convert(total, 'USD') as number),
    lkrSubtotal: convert(subtotal, 'LKR') == null ? null : roundMoney(convert(subtotal, 'LKR') as number),
    usdSubtotal: convert(subtotal, 'USD') == null ? null : roundMoney(convert(subtotal, 'USD') as number),
    paymentStatus: booking.payment_status || 'unpaid',
    paymentOption: booking.payment_option === 'half' ? 'half' : 'full',
    paymentRequired: roundMoney(Number(booking.payment_required_amount || total)),
    paymentBalance: roundMoney(Number(booking.payment_balance_amount || 0)),
    promoCode: booking.coupon_code || booking.promo_code,
  };
}

function bookingUsesRoom(booking: Pick<ChaletBooking, 'room_id' | 'room_ids'>, roomId: string) {
  if (booking.room_id === roomId) return true;
  return Array.isArray(booking.room_ids) && booking.room_ids.includes(roomId);
}

function bookingsOverlap(a: Pick<ChaletBooking, 'check_in_date' | 'check_out_date'>, b: Pick<ChaletBooking, 'check_in_date' | 'check_out_date'>) {
  return a.check_in_date < b.check_out_date && a.check_out_date > b.check_in_date;
}

function getRoomSlots(booking: ChaletBooking): RoomSlot[] {
  if (Array.isArray(booking.room_allocations) && booking.room_allocations.length > 0) {
    return booking.room_allocations
      .map((allocation, index) => ({
        key: `${booking.id}-${index}`,
        roomCategoryId: allocation.roomCategoryId || booking.room_category_id || '',
        packageId: allocation.packageId || booking.package_id,
        adults: Number(allocation.adults ?? booking.adults ?? 1),
        children: Number(allocation.children ?? booking.children ?? 0),
      }))
      .filter(slot => slot.roomCategoryId);
  }

  if (!booking.room_category_id) return [];

  const requestedRoomCount = Array.isArray(booking.room_ids) && booking.room_ids.length > 0
    ? booking.room_ids.length
    : 1;

  return Array.from({ length: requestedRoomCount }, (_, index) => ({
    key: `${booking.id}-${index}`,
    roomCategoryId: booking.room_category_id as string,
    packageId: booking.package_id,
    adults: Number(booking.adults ?? 1),
    children: Number(booking.children ?? 0),
  }));
}

function availableRoomsForSlot(params: {
  booking: ChaletBooking;
  slot: RoomSlot;
  rooms: ChaletRoom[];
  bookings: ChaletBooking[];
}) {
  return params.rooms.filter(room => {
    if (room.category_id !== params.slot.roomCategoryId) return false;
    if (room.status !== 'available') return false;

    const usedByOtherBooking = params.bookings.some(otherBooking => (
      otherBooking.id !== params.booking.id
      && otherBooking.status !== 'cancelled'
      && bookingsOverlap(params.booking, otherBooking)
      && bookingUsesRoom(otherBooking, room.id)
    ));

    return !usedByOtherBooking;
  });
}

export async function GET() {
  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch (error) {
    console.error('Dashboard chalet bookings configuration error:', error);
    return NextResponse.json({ error: 'Dashboard service is not configured.' }, { status: 500 });
  }

  const [bookingsRes, roomsRes, categoriesRes, packagesRes, ratesRes] = await Promise.all([
    supabase
      .from('chalet_bookings')
      .select('id, check_in_date, check_out_date, package_id, room_category_id, room_id, room_ids, room_allocations, customer_name, customer_phone, customer_email, adults, children, nationality, rate_per_night, total_nights, subtotal, service_charge, total_amount, currency, service_charge_pct, service_charge_currency, vat_pct, vat_currency, sscl_pct, sscl_currency, promo_discount, coupon_discount_amount, promo_code, coupon_code, payment_status, payment_gateway, payment_environment, payhere_order_id, payhere_payment_id, payhere_status_code, payhere_method, payment_option, payment_required_amount, payment_balance_amount, refund_status, refund_amount, refund_service_charge_retained, status, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('chalet_rooms')
      .select('id, category_id, status')
      .order('id'),
    supabase
      .from('chalet_room_categories')
      .select('id, name')
      .order('name'),
    supabase
      .from('chalet_packages')
      .select('id, name')
      .order('name'),
    supabase
      .from('chalet_rates')
      .select('package_id, room_category_id, usd_to_lkr_rate'),
  ]);

  if (bookingsRes.error || roomsRes.error || categoriesRes.error || packagesRes.error || ratesRes.error) {
    console.error('Dashboard chalet bookings query failed:', {
      bookings: bookingsRes.error,
      rooms: roomsRes.error,
      categories: categoriesRes.error,
      packages: packagesRes.error,
      rates: ratesRes.error,
    });
    return NextResponse.json({ error: 'Could not load chalet bookings.' }, { status: 500 });
  }

  const bookings = (bookingsRes.data ?? []) as ChaletBooking[];
  const rooms = (roomsRes.data ?? []) as ChaletRoom[];
  const rates = (ratesRes.data ?? []) as ChaletRate[];
  const categoriesById = Object.fromEntries((categoriesRes.data ?? []).map(category => [category.id, category.name]));
  const packagesById = Object.fromEntries((packagesRes.data ?? []).map(pkg => [pkg.id, pkg.name]));

  return NextResponse.json({
    bookings: bookings.map(booking => {
      const bill = buildBill(booking, rates);
      return {
        ...booking,
        original_total_amount: booking.total_amount,
        original_currency: booking.currency,
        total_amount: bill.lkrTotal ?? bill.total,
        currency: 'LKR',
        bill,
        slots: getRoomSlots(booking).map(slot => ({
        ...slot,
        categoryName: categoriesById[slot.roomCategoryId] ?? 'Room category',
        packageName: slot.packageId ? packagesById[slot.packageId] ?? 'Package' : 'Package',
        availableRoomCount: availableRoomsForSlot({ booking, slot, rooms, bookings }).length,
        })),
      };
    }),
  });
}
