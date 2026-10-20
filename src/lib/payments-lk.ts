import crypto from 'crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { payHereEnv } from '@/lib/payhere';
import { sendBookingRequestEmails } from '@/lib/chalet-booking-email';

// payments.lk hosted checkout for chalet bookings (https://payments.lk/developers/api).
// Amounts are LKR cents only; USD bills are charged in LKR at the rate's exchange rate.
const API_BASE = 'https://api.payments.lk/v1';

// Kept on the checkout's booking_payload (not chalet_bookings columns, so they
// are not copied onto the booking).
export type PaymentsLkCheckoutInfo = {
  payments_lk_checkout_id?: string;
  payments_lk_amount_cents?: number;
};

export type PaymentsLkPayment = {
  id: string;
  status: string;
  amountCents: number;
  currency: string;
  reference?: string | null;
  checkoutId?: string | null;
  card?: { scheme?: string | null; last4?: string | null } | null;
  failureMessage?: string | null;
};

export type PaymentsLkCheckout = {
  id: string;
  status: string;
  url: string;
  expiresAt?: string;
  payment?: PaymentsLkPayment | null;
};

// payments.lk is used when its secret key is set (before PayHere).
export function paymentsLkConfig() {
  const secretKey = payHereEnv('PAYMENTS_LK_SECRET_KEY');
  if (!secretKey) return null;
  return { secretKey, sandbox: !secretKey.startsWith('sk_live_') };
}

async function paymentsLkRequest<T>(path: string, init: RequestInit & { idempotencyKey?: string } = {}): Promise<T> {
  const config = paymentsLkConfig();
  if (!config) throw new Error('payments.lk is not configured.');
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${config.secretKey}`,
      'Content-Type': 'application/json',
      ...(init.idempotencyKey ? { 'Idempotency-Key': init.idempotencyKey } : {}),
      ...init.headers,
    },
    cache: 'no-store',
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(`payments.lk ${response.status}: ${body?.code || ''} ${body?.message || ''}`.trim());
    (error as Error & { details?: unknown }).details = body;
    throw error;
  }
  return body as T;
}

// payments.lk takes only Sri Lankan numbers (e.g. 0771234567); others are
// left out and the guest types a number on the payment page.
export function sriLankanPhone(value?: string | null) {
  const digits = (value || '').replace(/\D/g, '');
  if (/^94[1-9]\d{8}$/.test(digits)) return `0${digits.slice(2)}`;
  if (/^0[1-9]\d{8}$/.test(digits)) return digits;
  if (/^[1-9]\d{8}$/.test(digits)) return `0${digits}`;
  return null;
}

export function createPaymentsLkCheckout(params: {
  checkoutId: string;
  amountCents: number;
  description: string;
  customer: { name: string; email: string; phone?: string | null };
  successUrl: string;
  cancelUrl: string;
  expiresInMinutes: number;
}) {
  return paymentsLkRequest<PaymentsLkCheckout>('/checkouts', {
    method: 'POST',
    // One payments.lk checkout per booking checkout, even if this is retried.
    idempotencyKey: `chalet-checkout-${params.checkoutId}`,
    body: JSON.stringify({
      amountCents: params.amountCents,
      description: params.description.slice(0, 120),
      reference: params.checkoutId,
      customer: {
        name: params.customer.name.slice(0, 80),
        email: params.customer.email,
        ...(sriLankanPhone(params.customer.phone) ? { phone: sriLankanPhone(params.customer.phone) } : {}),
      },
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
      expiresInMinutes: params.expiresInMinutes,
    }),
  });
}

export function retrievePaymentsLkCheckout(paymentsLkCheckoutId: string) {
  return paymentsLkRequest<PaymentsLkCheckout>(`/checkouts/${encodeURIComponent(paymentsLkCheckoutId)}`);
}

// Payments-Signature: "t=<unix seconds>,v1=<hex>[,v1=<hex>]", an HMAC-SHA256 of
// "<t>.<raw body>" with the endpoint's signing secret. Any v1 may match (one
// per secret while a secret is being rotated).
export function verifyPaymentsLkSignature(rawBody: string, header: string | null, secret: string, toleranceSeconds = 300) {
  if (!header || !secret) return false;
  const parts = header.split(',').map(part => part.trim().split('='));
  const timestamp = Number(parts.find(([key]) => key === 't')?.[1]);
  const signatures = parts.filter(([key]) => key === 'v1').map(([, value]) => value || '');
  if (!Number.isFinite(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest();
  return signatures.some(signature => {
    const given = Buffer.from(signature, 'hex');
    return given.length === expected.length && crypto.timingSafeEqual(given, expected);
  });
}

type CompleteResult = {
  status?: string;
  booking_id?: string;
  booking_ref?: string;
  email_details?: Record<string, unknown>;
};

// Finishes a booking checkout from a payments.lk payment (webhook or the
// return page's status check). The database re-checks the rooms and creates
// the booking only once, however many times this runs. Needs the service
// role client (checkouts are not readable with the public key).
export async function completeCheckoutFromPaymentsLk(db: SupabaseClient, checkoutId: string, payment: PaymentsLkPayment) {
  const { data: checkout, error } = await db
    .from('chalet_booking_checkouts')
    .select('id, status, amount, currency, booking_payload')
    .eq('id', checkoutId)
    .maybeSingle();
  if (error) throw error;
  if (!checkout) return { status: 'not_found' };

  // Only final results change the checkout; "processing" etc. wait for the next event.
  const statusCode = payment.status === 'succeeded'
    ? '2'
    : payment.status === 'failed'
      ? '-2'
      : payment.status === 'canceled'
        ? '-1'
        : null;
  if (!statusCode) return { status: checkout.status };

  // The paid LKR amount must match what this checkout asked payments.lk for.
  // The database compares the checkout's own amount/currency, so a match is
  // passed on as that; anything else as the LKR actually paid (a mismatch).
  const info = (checkout.booking_payload ?? {}) as PaymentsLkCheckoutInfo;
  const paidAsExpected = payment.currency === 'LKR' && payment.amountCents === Number(info.payments_lk_amount_cents);
  const method = payment.card?.scheme
    ? `${payment.card.scheme}${payment.card.last4 ? ` ****${payment.card.last4}` : ''}`
    : null;

  const { data, error: completeError } = await db.rpc('chalet_complete_checkout_payment', {
    p_order_id: checkoutId,
    p_payhere_amount: paidAsExpected ? String(checkout.amount) : (payment.amountCents / 100).toFixed(2),
    p_payhere_currency: paidAsExpected ? checkout.currency : payment.currency,
    p_status_code: statusCode,
    p_payment_id: payment.id,
    p_method: method,
    p_status_message: payment.failureMessage || payment.status,
    p_environment: paymentsLkConfig()?.sandbox === false ? 'live' : 'sandbox',
  });
  if (completeError) throw completeError;
  const result = (data ?? {}) as CompleteResult;

  if (result.status === 'booked' && result.booking_id) {
    // The database function labels the booking as PayHere; correct the gateway.
    const { error: gatewayError } = await db
      .from('chalet_bookings')
      .update({ payment_gateway: 'payments_lk' })
      .eq('id', result.booking_id);
    if (gatewayError) console.error('payments.lk gateway label update failed:', gatewayError);

    try {
      const emailResults = await sendBookingRequestEmails({
        ...(result.email_details ?? {}),
        id: result.booking_id,
        bookingRef: result.booking_ref,
        paymentStatus: 'paid',
        paymentMethod: `Online payment (payments.lk${method ? ` - ${method}` : ''})`,
      } as Parameters<typeof sendBookingRequestEmails>[0]);
      const notSent = emailResults.filter(item => !item.sent).map(item => item.label);
      if (notSent.length > 0) console.error('Chalet booking emails not sent after payment:', { checkoutId, notSent });
    } catch (emailError) {
      console.error('Chalet booking email after payment failed:', emailError);
    }
  }
  if (result.status === 'paid_unavailable' || result.status === 'amount_mismatch') {
    console.error('payments.lk payment needs attention:', { checkoutId, paymentId: payment.id, status: result.status });
  }
  return result;
}
