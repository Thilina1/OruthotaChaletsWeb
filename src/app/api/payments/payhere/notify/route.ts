import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createSupabaseServiceClient } from '@/lib/supabase-server';
import { payHereEnv, payHereSandbox } from '@/lib/payhere';
import { createChaletDbClient } from '@/lib/chalet-availability';
import { sendBookingRequestEmails } from '@/lib/chalet-booking-email';

function md5(value: string) {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase();
}

function verifyPayHereNotification(form: FormData) {
  const merchantSecret = payHereEnv('PAYHERE_MERCHANT_SECRET');
  if (!merchantSecret) return false;

  const merchantId = String(form.get('merchant_id') || '');
  const orderId = String(form.get('order_id') || '');
  const amount = String(form.get('payhere_amount') || '');
  const currency = String(form.get('payhere_currency') || '');
  const statusCode = String(form.get('status_code') || '');
  const md5sig = String(form.get('md5sig') || '').toUpperCase();
  const localSignature = md5(`${merchantId}${orderId}${amount}${currency}${statusCode}${md5(merchantSecret)}`);

  return Boolean(md5sig) && md5sig === localSignature;
}

function paymentStatusFromPayHere(statusCode: string) {
  if (statusCode === '2') return 'paid';
  if (statusCode === '0') return 'pending';
  if (statusCode === '-1') return 'cancelled';
  if (statusCode === '-2') return 'failed';
  if (statusCode === '-3') return 'chargedback';
  return 'unpaid';
}

type CheckoutNotifyResult = {
  status?: string;
  booking_id?: string;
  booking_ref?: string;
  email_details?: Record<string, unknown>;
};

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error('PayHere notification parse failed:', error);
    return NextResponse.json({ error: 'Invalid notification.' }, { status: 400 });
  }

  if (!verifyPayHereNotification(form)) {
    console.error('PayHere notification signature mismatch (check PAYHERE_MERCHANT_SECRET in Vercel):', {
      orderId: String(form.get('order_id') || ''),
      paymentId: String(form.get('payment_id') || ''),
    });
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  const orderId = String(form.get('order_id') || '');
  const statusCode = String(form.get('status_code') || '');
  const paymentStatus = paymentStatusFromPayHere(statusCode);

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order ID.' }, { status: 400 });
  }

  // Website bookings paid online: the order is a checkout. The database checks
  // PayHere's signature again and, for a successful payment, re-checks the
  // rooms and creates the booking (only once, even if PayHere repeats this).
  let checkoutResult = null as CheckoutNotifyResult | null;
  try {
    const db = createChaletDbClient();
    const paymentFields = {
      p_order_id: orderId,
      p_payhere_amount: String(form.get('payhere_amount') || ''),
      p_payhere_currency: String(form.get('payhere_currency') || ''),
      p_status_code: statusCode,
      p_payment_id: String(form.get('payment_id') || '') || null,
      p_method: String(form.get('method') || '') || null,
      p_status_message: String(form.get('status_message') || '') || null,
      p_environment: payHereSandbox() ? 'sandbox' : 'live',
    };
    // With the service role key the signature checked above is enough. With
    // only the public key, the database checks the signature again against
    // the merchant secret saved in Supabase.
    const { data, error } = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? await db.rpc('chalet_complete_checkout_payment', paymentFields)
      : await db.rpc('chalet_payhere_notify', {
        ...paymentFields,
        p_merchant_id: String(form.get('merchant_id') || ''),
        p_md5sig: String(form.get('md5sig') || ''),
      });
    if (error) {
      // Before the checkouts migration is run, fall through to the older flow.
      if (error.code !== 'PGRST202' && error.code !== '42883') {
        // INVALID_SIGNATURE here means the site accepted PayHere's signature but
        // the secret saved in Supabase (chalet_private_settings) is different.
        const reason = error.message?.includes('INVALID_SIGNATURE')
          ? 'The PayHere merchant secret saved in Supabase does not match PAYHERE_MERCHANT_SECRET.'
          : error.message?.includes('PAYHERE_SECRET_NOT_SET')
            ? 'The PayHere merchant secret is not saved in Supabase (chalet_private_settings).'
            : 'Could not complete the booking.';
        console.error('PayHere checkout notification failed:', reason, error);
        return NextResponse.json({ error: reason }, { status: 500 });
      }
    } else {
      checkoutResult = data as CheckoutNotifyResult;
    }
  } catch (error) {
    console.error('PayHere notification Supabase configuration error:', error);
    return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 500 });
  }

  if (checkoutResult && checkoutResult.status !== 'not_found') {
    if (checkoutResult.status === 'booked' && checkoutResult.booking_id) {
      try {
        const emailResults = await sendBookingRequestEmails({
          ...(checkoutResult.email_details ?? {}),
          id: checkoutResult.booking_id,
          bookingRef: checkoutResult.booking_ref,
          paymentStatus: 'paid',
          paymentMethod: `Online payment (PayHere${form.get('method') ? ` - ${String(form.get('method'))}` : ''})`,
        } as Parameters<typeof sendBookingRequestEmails>[0]);
        const notSent = emailResults.filter(result => !result.sent).map(result => result.label);
        if (notSent.length > 0) console.error('Chalet booking emails not sent after payment:', { orderId, notSent });
      } catch (error) {
        console.error('Chalet booking email after payment failed:', error);
      }
    }
    if (checkoutResult.status === 'paid_unavailable' || checkoutResult.status === 'amount_mismatch') {
      console.error('PayHere payment needs attention:', { orderId, status: checkoutResult.status });
    }
    return NextResponse.json({ ok: true, status: checkoutResult.status });
  }

  let supabase;
  try {
    supabase = createSupabaseServiceClient();
  } catch (error) {
    console.error('PayHere notification Supabase configuration error:', error);
    return NextResponse.json({ error: 'Payment service is not configured.' }, { status: 500 });
  }

  // Bookings created before payment (older flow): update the booking itself.
  const updatePayload = {
    payment_status: paymentStatus,
    payment_gateway: 'payhere',
    payment_environment: payHereSandbox() ? 'sandbox' : 'live',
    payhere_order_id: orderId,
    payhere_payment_id: String(form.get('payment_id') || '') || null,
    payhere_status_code: statusCode,
    payhere_status_message: String(form.get('status_message') || '') || null,
    payhere_method: String(form.get('method') || '') || null,
    payhere_amount: Number(form.get('payhere_amount') || 0),
    payhere_currency: String(form.get('payhere_currency') || '') || null,
    payhere_received_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('chalet_bookings')
    .update(updatePayload)
    .eq('id', orderId);

  if (error) {
    console.error('PayHere notification booking update failed:', error);
    return NextResponse.json({ error: 'Could not update payment.' }, { status: 500 });
  }

  if (paymentStatus === 'paid') {
    const { error: postingError } = await supabase.rpc('post_chalet_online_payment', { p_booking_id: orderId });
    if (postingError) {
      console.error('PayHere online account posting failed:', postingError);
      return NextResponse.json({ error: 'Payment saved, but account posting failed.' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
