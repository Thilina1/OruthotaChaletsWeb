import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { completeCheckoutFromPaymentsLk, verifyPaymentsLkSignature, type PaymentsLkPayment } from '@/lib/payments-lk';
import { payHereEnv } from '@/lib/payhere';

type PaymentsLkEvent = {
  id?: string;
  type?: string;
  data?: (PaymentsLkPayment & { object?: string }) | { object?: string; payment?: PaymentsLkPayment; id?: string };
};

// payments.lk webhook (dashboard > Webhooks > endpoint: <site>/api/payments/payments-lk/webhook).
// The payment's reference is the booking checkout ID. Events can repeat; the
// booking is still created only once.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const secret = payHereEnv('PAYMENTS_LK_WEBHOOK_SECRET');
  if (!secret) {
    console.error('payments.lk webhook received but PAYMENTS_LK_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Webhook secret not configured.' }, { status: 500 });
  }
  if (!verifyPaymentsLkSignature(rawBody, request.headers.get('payments-signature'), secret)) {
    console.error('payments.lk webhook signature mismatch (check PAYMENTS_LK_WEBHOOK_SECRET).');
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  let event: PaymentsLkEvent;
  try {
    event = JSON.parse(rawBody) as PaymentsLkEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  // payment.* events carry the payment; checkout.* events carry the checkout
  // with its payment inside.
  const data = event.data ?? {};
  const payment = (data.object === 'payment' ? data : (data as { payment?: PaymentsLkPayment }).payment) as PaymentsLkPayment | undefined;
  const checkoutId = payment?.reference || '';
  if (!payment || !/^[0-9a-f-]{36}$/i.test(checkoutId)) {
    // Not a chalet booking payment (or an event type we do not use).
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const result = await completeCheckoutFromPaymentsLk(createSupabaseServiceClient(), checkoutId, payment);
    return NextResponse.json({ ok: true, status: result.status });
  } catch (error) {
    // A 500 makes payments.lk send the event again later.
    console.error('payments.lk webhook processing failed:', { eventId: event.id, type: event.type, checkoutId, error });
    return NextResponse.json({ error: 'Could not process the payment.' }, { status: 500 });
  }
}
