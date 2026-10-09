import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { format, parseISO } from 'date-fns';

type PromoCode = {
  id: string;
  code: string;
  description?: string | null;
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

export async function GET(request: Request) {
  let supabase;
  try {
    supabase = createReadClient();
  } catch (error) {
    console.error('Promo validation configuration error:', error);
    return NextResponse.json({ error: 'Promo service is not configured.' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim().toUpperCase() || '';
  const roomTotal = Number(searchParams.get('roomTotal') || 0);
  const bookingDate = format(new Date(), 'yyyy-MM-dd');

  if (!code || roomTotal <= 0) {
    return NextResponse.json({ error: 'Please enter a valid promo code.' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('chalet_coupons')
    .select('id, code, description, discount_type, discount_value, max_discount_amount, min_bill_amount, max_bill_amount, valid_from, valid_to, max_usage')
    .eq('code', code)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    console.error('Promo validation failed:', error);
    return NextResponse.json({ error: 'Could not validate promo code.' }, { status: 500 });
  }

  let usedCount = 0;
  if (data?.id) {
    const { count, error: countError } = await supabase
      .from('chalet_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', data.id)
      .neq('status', 'cancelled');
    if (countError) {
      console.error('Coupon usage count failed:', countError);
      return NextResponse.json({ error: 'Could not validate promo code.' }, { status: 500 });
    }
    usedCount = count || 0;
  }

  const coupon = data ? { ...data, used_count: usedCount } as PromoCode : null;
  const result = validatePromo(coupon, { roomTotal, bookingDate });
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: 404 });

  return NextResponse.json({
    code,
    couponId: data?.id,
    description: data?.description ?? null,
    discountType: data?.discount_type ?? null,
    discountValue: Number(data?.discount_value || 0),
    discount: result.discount,
  });
}
