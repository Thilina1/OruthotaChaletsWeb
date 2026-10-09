import { NextResponse } from 'next/server';
import { z } from 'zod';
import { sendBookingConfirmedEmails, sendBookingRefundEmails } from '@/lib/chalet-booking-email';
import { createSupabaseServiceClient } from '@/lib/supabase-server';

const updateSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('mark_paid') }),
  z.object({
    action: z.literal('cancel'),
    reason: z.string().trim().max(500).optional(),
    refundNotes: z.string().trim().max(500).optional(),
  }),
]);

type RouteContext = {
  params: Promise<{ id: string }>;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function getRefundAmount(booking: {
  total_amount: number | null;
  service_charge: number | null;
  payment_required_amount: number | null;
}) {
  const paidAmount = Math.max(0, Number(booking.payment_required_amount || 0));
  const serviceCharge = Math.max(0, Number(booking.service_charge || 0));
  const total = Math.max(0, Number(booking.total_amount || 0));
  const refundableBase = paidAmount > 0 ? Math.min(paidAmount, total) : total;

  return {
    refundAmount: roundMoney(Math.max(0, refundableBase - serviceCharge)),
    serviceChargeRetained: roundMoney(Math.min(serviceCharge, refundableBase)),
  };
}

export async function PATCH(request: Request, context: RouteContext) {
  let payload: z.infer<typeof updateSchema>;
  try {
    payload = updateSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ error: 'Invalid booking update.' }, { status: 400 });
  }

  const { id } = await context.params;
  const supabase = createSupabaseServiceClient();
  const { data: booking, error: lookupError } = await supabase
    .from('chalet_bookings')
    .select('id, customer_name, customer_email, customer_phone, check_in_date, check_out_date, status, payment_status, currency, total_amount, service_charge, payment_required_amount, payment_balance_amount')
    .eq('id', id)
    .single();

  if (lookupError || !booking) {
    return NextResponse.json({ error: 'Booking not found.' }, { status: 404 });
  }

  if (payload.action === 'mark_paid') {
    const paidAmount = Math.max(0, Number(booking.payment_required_amount || booking.total_amount || 0));
    const { data: updated, error } = await supabase
      .from('chalet_bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        payment_method: 'online',
        amount_paid: paidAmount,
        payment_gateway: 'online_demo',
        payment_environment: 'demo',
        payment_balance_amount: 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('id, customer_name, customer_email, customer_phone, check_in_date, check_out_date, status, payment_status, currency, total_amount, service_charge, payment_required_amount, payment_balance_amount, online_account_transaction_id')
      .single();

    if (error || !updated) {
      console.error('Mark booking paid failed:', error);
      return NextResponse.json({ error: 'Could not confirm payment.' }, { status: 500 });
    }

    const { error: postingError } = await supabase.rpc('post_chalet_online_payment', { p_booking_id: id });
    if (postingError) {
      console.error('Confirm booking online payment posting failed:', postingError);
      return NextResponse.json({ error: postingError.message || 'Could not post payment to the online account.' }, { status: 500 });
    }

    try {
      await sendBookingConfirmedEmails({
        id: updated.id,
        customerName: updated.customer_name,
        customerEmail: updated.customer_email,
        customerPhone: updated.customer_phone,
        checkIn: updated.check_in_date,
        checkOut: updated.check_out_date,
        status: updated.status,
        paymentStatus: updated.payment_status,
        currency: updated.currency,
        totalAmount: Number(updated.total_amount || 0),
        paymentRequiredAmount: Number(updated.payment_required_amount || 0),
        paymentBalanceAmount: Number(updated.payment_balance_amount || 0),
        serviceCharge: Number(updated.service_charge || 0),
      });
    } catch (emailError) {
      console.error('Booking confirmation email failed:', emailError);
    }

    return NextResponse.json({ ok: true, booking: updated });
  }

  const refund = getRefundAmount(booking);
  const refundStatus = refund.refundAmount > 0 ? 'refunded' : 'not_required';
  const { data: updated, error } = await supabase
    .from('chalet_bookings')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancellation_reason: payload.reason || null,
      refund_status: refundStatus,
      refund_amount: refund.refundAmount,
      refund_service_charge_retained: refund.serviceChargeRetained,
      refunded_at: refund.refundAmount > 0 ? new Date().toISOString() : null,
      refund_notes: payload.refundNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('id, customer_name, customer_email, customer_phone, check_in_date, check_out_date, status, payment_status, currency, total_amount, service_charge, payment_required_amount, payment_balance_amount, refund_amount, refund_service_charge_retained, refund_notes')
    .single();

  if (error || !updated) {
    console.error('Cancel booking failed:', error);
    return NextResponse.json({ error: 'Could not cancel booking.' }, { status: 500 });
  }

  try {
    await sendBookingRefundEmails({
      id: updated.id,
      customerName: updated.customer_name,
      customerEmail: updated.customer_email,
      customerPhone: updated.customer_phone,
      checkIn: updated.check_in_date,
      checkOut: updated.check_out_date,
      status: updated.status,
      paymentStatus: updated.payment_status,
      currency: updated.currency,
      totalAmount: Number(updated.total_amount || 0),
      paymentRequiredAmount: Number(updated.payment_required_amount || 0),
      paymentBalanceAmount: Number(updated.payment_balance_amount || 0),
      serviceCharge: Number(updated.service_charge || 0),
      refundAmount: Number(updated.refund_amount || 0),
      refundServiceChargeRetained: Number(updated.refund_service_charge_retained || 0),
      refundNotes: updated.refund_notes,
    });
  } catch (emailError) {
    console.error('Booking refund email failed:', emailError);
  }

  return NextResponse.json({ ok: true, booking: updated });
}
