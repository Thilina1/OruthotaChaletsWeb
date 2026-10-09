import crypto from 'crypto';

// PayHere checkout for chalet bookings (https://support.payhere.lk/api-&-mobile-sdk/checkout-api).
export function getSiteOrigin(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL
    || process.env.SITE_URL
    || request.headers.get('origin')
    || new URL(request.url).origin;
}

// Env values pasted with quotes or stray spaces/new lines (e.g. in the Vercel
// dashboard) would break the PayHere hash, so they are cleaned first.
export function payHereEnv(name: string) {
  return (process.env[name] || '').trim().replace(/^(['"])(.*)\1$/, '$2').trim();
}

export function payHereSandbox() {
  return payHereEnv('PAYHERE_SANDBOX').toLowerCase() !== 'false';
}

export function md5(value: string) {
  return crypto.createHash('md5').update(value).digest('hex').toUpperCase();
}

// PayHere is used when its merchant details are set; otherwise bookings use
// the demo online payment (marked paid straight away).
export function payHereConfig() {
  const merchantId = payHereEnv('PAYHERE_MERCHANT_ID');
  const merchantSecret = payHereEnv('PAYHERE_MERCHANT_SECRET');
  if (!merchantId || !merchantSecret) return null;
  return { merchantId, merchantSecret, sandbox: payHereSandbox() };
}

export function buildPayHereCheckout(params: {
  request: Request;
  merchantId: string;
  merchantSecret: string;
  sandbox: boolean;
  // Checkout ID: PayHere's order ID; the booking is created after payment.
  orderId: string;
  description: string;
  amount: number;
  currency: 'LKR' | 'USD';
  firstName: string;
  lastName: string;
  customerEmail: string;
  customerPhone: string;
  customerNic: string;
}) {
  const origin = getSiteOrigin(params.request).replace(/\/$/, '');
  const amount = params.amount.toFixed(2);
  const hash = md5(`${params.merchantId}${params.orderId}${amount}${params.currency}${md5(params.merchantSecret)}`);

  return {
    provider: 'payhere',
    sandbox: params.sandbox,
    actionUrl: params.sandbox
      ? 'https://sandbox.payhere.lk/pay/checkout'
      : 'https://www.payhere.lk/pay/checkout',
    fields: {
      merchant_id: params.merchantId,
      return_url: `${origin}/chalet-booking?payment=return&checkout=${params.orderId}`,
      cancel_url: `${origin}/chalet-booking?payment=cancelled&checkout=${params.orderId}`,
      notify_url: `${origin}/api/payments/payhere/notify`,
      first_name: params.firstName,
      last_name: params.lastName,
      email: params.customerEmail,
      phone: params.customerPhone,
      address: params.customerNic,
      city: 'Kandy',
      country: 'Sri Lanka',
      order_id: params.orderId,
      items: params.description,
      currency: params.currency,
      amount,
      hash,
    },
  };
}
