import { NextResponse } from 'next/server';
import { createChaletDbClient } from '@/lib/chalet-availability';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import {
  completeCheckoutFromPaymentsLk,
  paymentsLkConfig,
  retrievePaymentsLkCheckout,
  type PaymentsLkCheckoutInfo,
} from '@/lib/payments-lk';

// While a payments.lk checkout still waits for its webhook (or the webhook
// cannot reach this site, e.g. on localhost), ask payments.lk for the result
// and finish the booking from that. The guest's return to the page is never
// trusted on its own.
async function syncPaymentsLkCheckout(checkoutId: string) {
  if (!paymentsLkConfig() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const db = createSupabaseServiceClient();
  const { data: checkout } = await db
    .from('chalet_booking_checkouts')
    .select('status, booking_payload')
    .eq('id', checkoutId)
    .maybeSingle();
  const paymentsLkCheckoutId = (checkout?.booking_payload as PaymentsLkCheckoutInfo | null)?.payments_lk_checkout_id;
  if (checkout?.status !== 'awaiting_payment' || !paymentsLkCheckoutId) return;
  const remote = await retrievePaymentsLkCheckout(paymentsLkCheckoutId);
  if (remote.payment) await completeCheckoutFromPaymentsLk(db, checkoutId, remote.payment);
}

// Status of an online checkout, polled by the booking page after the guest
// returns from the payment page until the booking is created.
export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid checkout.' }, { status: 400 });
  }

  let supabase;
  try {
    supabase = createChaletDbClient();
  } catch {
    return NextResponse.json({ error: 'Booking service is not configured.' }, { status: 500 });
  }

  try {
    await syncPaymentsLkCheckout(id);
  } catch (error) {
    // The webhook may still complete it; keep reporting the saved status.
    console.error('payments.lk checkout status check failed:', error);
  }

  const { data, error } = await supabase.rpc('get_chalet_checkout_status', { p_checkout_id: id });
  if (error) {
    console.error('Chalet checkout status lookup failed:', error);
    return NextResponse.json({ error: 'Could not load the payment status.' }, { status: 500 });
  }
  const checkout = Array.isArray(data) ? data[0] : data;
  if (!checkout) {
    return NextResponse.json({ error: 'Checkout not found.' }, { status: 404 });
  }

  return NextResponse.json({ status: checkout.status, bookingRef: checkout.booking_ref || null });
}

// The guest cancelled on the payment page: end this checkout's room hold now
// instead of waiting for it to expire. A payment made later still books if
// the rooms are free.
export async function POST(request: Request) {
  const id = new URL(request.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: 'Invalid checkout.' }, { status: 400 });
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true });
  const { error } = await createSupabaseServiceClient()
    .from('chalet_booking_checkouts')
    .update({ expires_at: new Date().toISOString() })
    .eq('id', id)
    .eq('status', 'awaiting_payment');
  if (error) {
    console.error('Releasing cancelled checkout failed:', error);
    return NextResponse.json({ error: 'Could not release the rooms.' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
