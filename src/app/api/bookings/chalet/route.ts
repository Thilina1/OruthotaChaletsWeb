import { NextResponse } from 'next/server';
import { differenceInCalendarDays, format, parseISO, startOfDay } from 'date-fns';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail, isValidInternationalPhone } from '@/lib/contact-validation';
import { sendBookingRequestEmails } from '@/lib/chalet-booking-email';
import { chaletGuestLimits } from '@/lib/chalet-guest-limits';
import { buildPayHereCheckout, payHereConfig } from '@/lib/payhere';
import { CHECKOUT_HOLD_MINUTES, findUnavailableRoomCategory } from '@/lib/chalet-availability';

const DEFAULT_SERVICE_CHARGE_PCT = 10;
const DEFAULT_VAT_PCT = 18;
const DEFAULT_SSCL_PCT = 2.5;
type ChargeCurrency = 'LKR' | 'USD' | 'both';

const defaultBillSettings = {
  service_charge_pct: DEFAULT_SERVICE_CHARGE_PCT,
  service_charge_currency: 'both' as ChargeCurrency,
  vat_pct: DEFAULT_VAT_PCT,
  vat_currency: 'USD' as ChargeCurrency,
  sscl_pct: DEFAULT_SSCL_PCT,
  sscl_currency: 'USD' as ChargeCurrency,
};

const chaletBookingSchema = z.object({
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  packageId: z.string().uuid(),
  roomCategoryId: z.string().uuid().optional().or(z.literal('')),
  rooms: z.array(z.object({
    packageId: z.string().uuid(),
    roomCategoryId: z.string().uuid(),
    adults: z.coerce.number().int().min(1).max(20),
    children: z.coerce.number().int().min(0).max(20),
  })).optional(),
  nationality: z.enum(['Sri Lankan', 'Non Sri Lankan']).default('Sri Lankan'),
  promoCode: z.string().trim().max(40).optional().or(z.literal('')),
  paymentOption: z.enum(['half', 'full']).default('full'),
  paymentRequiredAmount: z.coerce.number().min(0).optional(),
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().min(1).max(254),
  customerPhone: z.string().trim().min(1).max(32),
  customerNic: z.string().trim().min(1).max(80),
  adults: z.coerce.number().int().min(1).max(20),
  children: z.coerce.number().int().min(0).max(20),
  specialRequests: z.string().trim().max(1000).optional().or(z.literal('')),
});

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function splitCustomerName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || 'Guest';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : firstName;
  return { firstName, lastName };
}

function normalizeIdentity(value: string) {
  return value.trim().replace(/\s+/g, '').toUpperCase();
}

function createBookingClient() {
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

function discountAmount(amount: number, percent?: number | null, fixedValue?: number | null) {
  const fixed = Math.max(0, Number(fixedValue || 0));
  if (fixed > 0) return Math.min(amount, fixed);
  return amount * Math.min(100, Math.max(0, Number(percent || 0))) / 100;
}

function applyRateDiscount(amount: number, percent?: number | null, fixedValue?: number | null) {
  return Math.max(0, amount - discountAmount(amount, percent, fixedValue));
}

function getCustomerBillCurrency(nationality?: string | null): 'LKR' | 'USD' {
  return nationality === 'Non Sri Lankan' ? 'USD' : 'LKR';
}

function chargeApplies(chargeCurrency: ChargeCurrency, billCurrency: 'LKR' | 'USD') {
  return chargeCurrency === 'both' || chargeCurrency === billCurrency;
}


function resolveRateForNationality(rateData: {
  rate_per_night: number;
  usd_rate_per_night?: number | null;
  usd_to_lkr_rate?: number | null;
  discount_percent?: number | null;
  lkr_discount_value?: number | null;
  lkr_discount_fixed_value?: number | null;
  usd_discount_value?: number | null;
  usd_discount_fixed_value?: number | null;
}, nationality?: string) {
  if (nationality === 'Non Sri Lankan') {
    const usdRate = Number(rateData.usd_rate_per_night || 0);
    if (usdRate > 0) {
      return applyRateDiscount(usdRate, rateData.usd_discount_value ?? rateData.discount_percent ?? 0, rateData.usd_discount_fixed_value);
    }
  }

  return applyRateDiscount(Number(rateData.rate_per_night), rateData.lkr_discount_value ?? rateData.discount_percent ?? 0, rateData.lkr_discount_fixed_value);
}

type RequestedRoom = {
  packageId: string;
  roomCategoryId: string;
  adults: number;
  children: number;
};

type RateRow = {
  package_id?: string | null;
  room_category_id?: string | null;
  rate_per_night: number;
  usd_rate_per_night?: number | null;
  usd_to_lkr_rate?: number | null;
  discount_percent?: number | null;
  lkr_discount_value?: number | null;
  lkr_discount_fixed_value?: number | null;
  usd_discount_value?: number | null;
  usd_discount_fixed_value?: number | null;
};

type PromoCode = {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  max_discount_amount?: number | null;
  min_bill_amount: number;
  max_bill_amount?: number | null;
  valid_from?: string | null;
  valid_to?: string | null;
  max_usage?: number | null;
  used_count?: number | null;
};

function calculatePromoDiscount(promo: PromoCode, roomTotal: number) {
  if (promo.discount_type === 'fixed') return Math.min(roomTotal, Number(promo.discount_value || 0));
  const discount = roomTotal * Math.min(100, Math.max(0, Number(promo.discount_value || 0))) / 100;
  return promo.max_discount_amount ? Math.min(discount, Number(promo.max_discount_amount)) : discount;
}

function validatePromo(promo: PromoCode | null, params: {
  roomTotal: number;
  bookingDate: string;
}) {
  if (!promo) return { error: 'Promo code not found.' };
  if (Number(promo.min_bill_amount || 0) > params.roomTotal) return { error: 'Room total is below the minimum required for this promo code.' };
  if (promo.max_bill_amount && params.roomTotal > Number(promo.max_bill_amount)) return { error: 'Room total is above the maximum allowed for this promo code.' };
  if (promo.max_usage != null && Number(promo.used_count || 0) >= Number(promo.max_usage)) return { error: 'Promo code usage limit has been reached.' };
  if (promo.valid_from && params.bookingDate < promo.valid_from) return { error: 'Promo code is not active yet.' };
  if (promo.valid_to && params.bookingDate > promo.valid_to) return { error: 'Promo code has expired.' };
  return { discount: calculatePromoDiscount(promo, params.roomTotal) };
}

export async function POST(request: Request) {
  let payload: z.infer<typeof chaletBookingSchema>;

  try {
    payload = chaletBookingSchema.parse(await request.json());
  } catch {
    return badRequest('Please check the booking details and try again.');
  }

  const email = payload.customerEmail.trim();
  if (!isValidEmail(email)) {
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

  const requestedRooms = payload.rooms?.length
    ? payload.rooms
    : [{
      packageId: payload.packageId,
      roomCategoryId: payload.roomCategoryId || '',
      adults: payload.adults,
      children: payload.children,
    }];

  if (requestedRooms.some(room => !room.roomCategoryId)) {
    return badRequest('Please select a room type before booking.');
  }
  if (requestedRooms.some(room => !room.packageId)) {
    return badRequest('Please select a package before booking.');
  }

  let supabase;
  try {
    supabase = createBookingClient();
  } catch (error) {
    console.error('Chalet booking server configuration error:', error);
    return NextResponse.json({ error: 'Booking service is not configured. Please contact our team.' }, { status: 500 });
  }

  const requestedRoomsByCategory = requestedRooms.reduce<Record<string, number>>((counts, room) => {
    counts[room.roomCategoryId] = (counts[room.roomCategoryId] || 0) + 1;
    return counts;
  }, {});
  const requestedCategoryIds = Object.keys(requestedRoomsByCategory);
  const requestedPackageIds = [...new Set(requestedRooms.map(room => room.packageId))];
  const [{ data: rateRows, error: ratesError }, { data: categoryRows, error: categoriesError }, { data: packageRows }] = await Promise.all([
    supabase
      .from('chalet_rates')
      .select('package_id, room_category_id, rate_per_night, usd_rate_per_night, usd_to_lkr_rate, discount_percent, lkr_discount_value, lkr_discount_fixed_value, usd_discount_value, usd_discount_fixed_value')
      .in('package_id', requestedPackageIds)
      .is('occupancy_type_id', null),
    supabase
      .from('chalet_room_categories')
      .select('id, name, max_adults, max_children, max_guests')
      .in('id', requestedCategoryIds),
    supabase
      .from('chalet_packages')
      .select('id, name')
      .in('id', requestedPackageIds),
  ]);

  if (ratesError || categoriesError) {
    console.error('Chalet availability verification failed:', { ratesError, categoriesError });
    return NextResponse.json({ error: 'Could not verify room availability.' }, { status: 500 });
  }

  const findRateForRoom = (room: RequestedRoom) => {
    const rates = (rateRows ?? []) as RateRow[];
    return rates.find(rate => rate.package_id === room.packageId && rate.room_category_id === room.roomCategoryId)
      ?? rates.find(rate => rate.package_id === room.packageId && !rate.room_category_id)
      ?? null;
  };

  if (requestedRooms.some(room => !findRateForRoom(room))) {
    return badRequest('No rate found for one or more selected room type and package combinations.');
  }

  for (const room of requestedRooms) {
    const category = (categoryRows ?? []).find(item => item.id === room.roomCategoryId);
    const limits = chaletGuestLimits(category);
    if (room.adults > limits.maxAdults || room.children > limits.maxChildren || room.adults + room.children > limits.maxGuests) {
      return badRequest(`${category?.name || 'This room'} allows up to ${limits.maxAdults} adult(s), ${limits.maxChildren} child(ren) and ${limits.maxGuests} guest(s) in total.`);
    }
  }

  // Every booking (checked-out ones too) holds its dates until it is
  // cancelled, and so do online checkouts still waiting for payment.
  let unavailable;
  try {
    unavailable = await findUnavailableRoomCategory(supabase, {
      checkIn: payload.checkIn,
      checkOut: payload.checkOut,
      roomsByCategory: requestedRoomsByCategory,
    });
  } catch (error) {
    console.error('Chalet availability verification failed:', error);
    return NextResponse.json({ error: 'Could not verify room availability.' }, { status: 500 });
  }
  if (unavailable) {
    const categoryName = (categoryRows ?? []).find(item => item.id === unavailable.categoryId)?.name || 'the selected room type';
    return NextResponse.json(
      { error: `Only ${unavailable.available} room${unavailable.available === 1 ? '' : 's'} available for ${categoryName} on the selected dates.` },
      { status: 409 }
    );
  }

  const settingsRes = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'chalet_bill_settings')
    .maybeSingle();
  const billSettings = { ...defaultBillSettings, ...((settingsRes.data?.value as Record<string, unknown> | null) ?? {}) };
  const billCurrency = getCustomerBillCurrency(payload.nationality);
  const ratePerNight = requestedRooms.reduce((sum, room) => {
    const roomRate = findRateForRoom(room);
    return sum + (roomRate ? resolveRateForNationality(roomRate, payload.nationality) : 0);
  }, 0);
  const subtotal = ratePerNight * nights;
  const promoCode = payload.promoCode?.trim().toUpperCase() || '';
  let promoDiscount = 0;
  let couponId: string | null = null;

  if (promoCode) {
    const { data: promo, error: promoError } = await supabase
      .from('chalet_coupons')
      .select('id, code, discount_type, discount_value, max_discount_amount, min_bill_amount, max_bill_amount, valid_from, valid_to, max_usage')
      .eq('code', promoCode)
      .eq('is_active', true)
      .maybeSingle();

    if (promoError) {
      console.error('Promo validation failed:', promoError);
      return NextResponse.json({ error: 'Could not validate promo code.' }, { status: 500 });
    }

    let usedCount = 0;
    if (promo?.id) {
      const { count, error: countError } = await supabase
        .from('chalet_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('coupon_id', promo.id)
        .neq('status', 'cancelled');
      if (countError) {
        console.error('Coupon usage count failed:', countError);
        return NextResponse.json({ error: 'Could not validate promo code.' }, { status: 500 });
      }
      usedCount = count || 0;
    }

    const coupon = promo ? { ...promo, used_count: usedCount } as PromoCode : null;
    const promoResult = validatePromo(coupon, {
      roomTotal: subtotal,
      bookingDate: format(new Date(), 'yyyy-MM-dd'),
    });
    if ('error' in promoResult) return badRequest(promoResult.error ?? 'Promo code is not valid.');
    promoDiscount = Math.min(promoResult.discount, subtotal);
    couponId = coupon?.id || null;
  }

  // The coupon comes off the room subtotal first; service charge, VAT and SSCL
  // are then charged on the discounted amount (same rule as the admin app).
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);
  const serviceCharge = chargeApplies(billSettings.service_charge_currency as ChargeCurrency, billCurrency) ? discountedSubtotal * Number(billSettings.service_charge_pct || 0) / 100 : 0;
  const vat = chargeApplies(billSettings.vat_currency as ChargeCurrency, billCurrency) ? discountedSubtotal * Number(billSettings.vat_pct || 0) / 100 : 0;
  const sscl = chargeApplies(billSettings.sscl_currency as ChargeCurrency, billCurrency) ? discountedSubtotal * Number(billSettings.sscl_pct || 0) / 100 : 0;
  const totalAmount = Math.max(0, discountedSubtotal + serviceCharge + vat + sscl);
  const paymentRequiredAmount = payload.paymentOption === 'half' ? totalAmount / 2 : totalAmount;
  // With PayHere no booking is created here: the guest pays first and the
  // booking is created when PayHere confirms the payment (payments/payhere/notify).
  const payHere = paymentRequiredAmount > 0 ? payHereConfig() : null;
  const initialPaymentStatus = 'paid';
  const { firstName, lastName } = splitCustomerName(payload.customerName);
  const customerIdentity = normalizeIdentity(payload.customerNic);
  const { error: guestError } = await supabase
    .from('guests')
    .upsert([{
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: payload.customerPhone.trim(),
      id_card_number: payload.customerNic.trim(),
    }], { onConflict: 'email' });

  if (guestError) {
    console.error('Chalet guest upsert failed:', guestError);
    return NextResponse.json({ error: 'Could not save customer details.' }, { status: 500 });
  }

  const customerData = {
    name: payload.customerName.trim(),
    phone: payload.customerPhone.trim(),
    email,
    id_number: customerIdentity,
    updated_at: new Date().toISOString(),
  };
  const { data: existingCustomer, error: customerLookupError } = await supabase
    .from('customers')
    .select('id')
    .eq('id_number', customerIdentity)
    .maybeSingle();

  if (customerLookupError) {
    console.error('Chalet customer lookup failed:', customerLookupError);
    return NextResponse.json({ error: 'Could not save customer details.' }, { status: 500 });
  }

  const customerSave = existingCustomer?.id
    ? await supabase.from('customers').update(customerData).eq('id', existingCustomer.id)
    : await supabase.from('customers').insert([{ ...customerData, created_at: new Date().toISOString() }]);

  if (customerSave.error) {
    console.error('Chalet customer save failed:', customerSave.error);
    return NextResponse.json({ error: 'Could not save customer details.' }, { status: 500 });
  }

  const bookingInsertPayload = {
    check_in_date: format(checkInDate, 'yyyy-MM-dd'),
    check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
    package_id: payload.packageId,
    occupancy_type_id: null,
    room_id: null,
    room_ids: [],
    room_allocations: requestedRooms.map(room => ({
      roomId: null,
      roomCategoryId: room.roomCategoryId,
      packageId: room.packageId,
      adults: room.adults,
      children: room.children,
    })),
    room_category_id: payload.roomCategoryId || null,
    nationality: payload.nationality,
    customer_name: payload.customerName.trim(),
    customer_email: email,
    customer_phone: payload.customerPhone.trim(),
    customer_nic: customerIdentity,
    adults: requestedRooms.reduce((sum, room) => sum + room.adults, 0),
    children: requestedRooms.reduce((sum, room) => sum + room.children, 0),
    special_requests: payload.specialRequests?.trim() || null,
    rate_per_night: ratePerNight,
    promo_code: promoCode || null,
    promo_discount: promoDiscount,
    coupon_id: couponId,
    coupon_code: promoCode || null,
    coupon_discount_amount: promoDiscount,
    currency: billCurrency,
    payment_option: payload.paymentOption,
    payment_required_amount: paymentRequiredAmount,
    payment_balance_amount: Math.max(0, totalAmount - paymentRequiredAmount),
    payment_method: 'online',
    amount_paid: paymentRequiredAmount,
    // Charges and which currency each applies to, as quoted to the guest; the
    // admin app bills from these saved values.
    service_charge_pct: Number(billSettings.service_charge_pct || 0),
    service_charge_currency: billSettings.service_charge_currency,
    vat_pct: Number(billSettings.vat_pct || 0),
    vat_currency: billSettings.vat_currency,
    sscl_pct: Number(billSettings.sscl_pct || 0),
    sscl_currency: billSettings.sscl_currency,
    payment_status: initialPaymentStatus,
    payment_gateway: 'online_demo',
    payment_environment: 'demo',
    total_nights: nights,
    status: 'pending',
  };

  // Rooms for the booking confirmation PDF attached to the booking emails.
  const confirmationRooms = requestedRooms.map(room => {
    const roomRate = findRateForRoom(room);
    return {
      name: (categoryRows ?? []).find(item => item.id === room.roomCategoryId)?.name || 'Chalet',
      packageName: (packageRows ?? []).find(item => item.id === room.packageId)?.name || '',
      adults: room.adults,
      children: room.children,
      amount: (roomRate ? resolveRateForNationality(roomRate, payload.nationality) : 0) * nights,
    };
  });

  const emailDetails = {
    rooms: confirmationRooms,
    promoCode: promoCode || null,
    paymentMethod: payHere ? 'Online payment (PayHere)' : 'Online payment',
    customerName: payload.customerName.trim(),
    customerEmail: email,
    customerPhone: payload.customerPhone.trim(),
    nationality: payload.nationality,
    checkIn: format(checkInDate, 'yyyy-MM-dd'),
    checkOut: format(checkOutDate, 'yyyy-MM-dd'),
    nights,
    status: 'pending',
    paymentStatus: initialPaymentStatus,
    paymentOption: payload.paymentOption,
    currency: billCurrency,
    ratePerNight,
    subtotal,
    promoDiscount,
    totalAmount,
    paymentRequiredAmount,
    paymentBalanceAmount: Math.max(0, totalAmount - paymentRequiredAmount),
    serviceCharge,
    serviceChargePct: Number(billSettings.service_charge_pct || 0),
    vat,
    vatPct: Number(billSettings.vat_pct || 0),
    sscl,
    ssclPct: Number(billSettings.sscl_pct || 0),
  };
  const pricing = {
    ratePerNight,
    nights,
    subtotal,
    serviceCharge,
    vat,
    sscl,
    promoDiscount,
    paymentOption: payload.paymentOption,
    paymentRequiredAmount,
    paymentBalanceAmount: Math.max(0, totalAmount - paymentRequiredAmount),
    totalAmount,
  };

  if (payHere) {
    // Rooms are available: keep the booking details as a checkout (the
    // database checks availability again and holds the rooms while the guest
    // pays) and send the guest to PayHere. No booking is created yet.
    const amount = Math.round(paymentRequiredAmount * 100) / 100;
    const { data: checkoutId, error: checkoutError } = await supabase.rpc('create_chalet_checkout', {
      p_booking: bookingInsertPayload,
      p_email_details: emailDetails,
      p_amount: amount,
      p_currency: billCurrency,
      p_hold_minutes: CHECKOUT_HOLD_MINUTES,
    });
    if (checkoutError || !checkoutId) {
      if (checkoutError?.message?.includes('ROOMS_UNAVAILABLE')) {
        const [, categoryId, available] = checkoutError.message.match(/ROOMS_UNAVAILABLE:([^:]+):(\d+)/) ?? [];
        const categoryName = (categoryRows ?? []).find(item => item.id === categoryId)?.name || 'the selected room type';
        return NextResponse.json(
          { error: `Only ${Number(available || 0)} room${Number(available) === 1 ? '' : 's'} available for ${categoryName} on the selected dates.` },
          { status: 409 }
        );
      }
      console.error('Chalet checkout save failed:', checkoutError);
      return NextResponse.json({
        error: checkoutError?.code === 'PGRST202' || checkoutError?.code === '42883'
          ? 'Online payment is not set up yet. Please run the chalet booking checkouts migration.'
          : 'Could not start the payment. Please try again.',
      }, { status: 500 });
    }
    const checkout = { id: String(checkoutId) };

    return NextResponse.json({
      ok: true,
      checkoutId: checkout.id,
      payment: buildPayHereCheckout({
        request,
        ...payHere,
        orderId: checkout.id,
        description: `Oruthota Chalets booking ${bookingInsertPayload.check_in_date} to ${bookingInsertPayload.check_out_date}`,
        amount,
        currency: billCurrency,
        firstName,
        lastName,
        customerEmail: email,
        customerPhone: payload.customerPhone.trim(),
        customerNic: payload.customerNic.trim(),
      }),
      pricing,
    });
  }

  let insertResult = await supabase.from('chalet_bookings').insert([bookingInsertPayload]).select('id, booking_ref').single();

  if (
    insertResult.error?.code === 'PGRST204'
    && ['payment_balance_amount', 'payment_method', 'amount_paid'].some(column => insertResult.error?.message.includes(column))
  ) {
    console.error('Chalet booking insert failed because payment columns are missing:', insertResult.error);
    return NextResponse.json({
      error: 'Payment database fields are missing. Please run the Supabase online payment migration before submitting bookings.',
      missingMigration: 'supabase/migrations/20261003000006_front_desk_online_payment_account.sql',
    }, { status: 500 });
  }

  if (insertResult.error) {
    console.error('Chalet booking insert failed:', insertResult.error);
    if (insertResult.error.code === '23P01') {
      return NextResponse.json(
        { error: 'This room was just booked by another guest. Please choose another available room.' },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: 'Could not submit booking request.' }, { status: 500 });
  }

  const bookingRef = insertResult.data.booking_ref || insertResult.data.id;
  if (paymentRequiredAmount > 0) {
    const { error: postingError } = await supabase.rpc('post_chalet_online_payment', { p_booking_id: insertResult.data.id });
    if (postingError) {
      console.error('Demo online payment posting failed:', postingError);
    }
  }

  try {
    await sendBookingRequestEmails({
      ...emailDetails,
      id: insertResult.data.id,
      bookingRef: insertResult.data.booking_ref,
    });
  } catch (error) {
    console.error('Chalet booking email failed:', error);
  }

  return NextResponse.json({
    ok: true,
    bookingId: insertResult.data.id,
    bookingRef,
    payment: {
      provider: 'online_demo',
      status: initialPaymentStatus,
      amount: paymentRequiredAmount,
      currency: billCurrency,
    },
    pricing,
  });
}
