import { NextResponse } from 'next/server';
import { createChaletDbClient } from '@/lib/chalet-availability';

// Status of an online (PayHere) checkout, polled by the booking page after the
// guest returns from PayHere until the booking is created.
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
