'use client';

import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Ban, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { readJsonResponse } from '@/lib/fetch-json';

type BookingSlot = {
  key: string;
  roomCategoryId: string;
  categoryName: string;
  packageName: string;
  adults: number;
  children: number;
  availableRoomCount: number;
};

type ChaletBooking = {
  id: string;
  check_in_date: string;
  check_out_date: string;
  customer_name: string;
  customer_phone: string | null;
  customer_email: string | null;
  nationality: string | null;
  status: string;
  payment_option: string | null;
  payment_required_amount: number | null;
  payment_balance_amount: number | null;
  refund_status: string | null;
  refund_amount: number | null;
  refund_service_charge_retained: number | null;
  bill: {
    currency: 'LKR' | 'USD';
    exchangeRate: number | null;
    nights: number;
    subtotal: number;
    serviceCharge: number;
    vat: number;
    sscl: number;
    discount: number;
    total: number;
    lkrTotal: number | null;
    usdTotal: number | null;
    lkrSubtotal: number | null;
    usdSubtotal: number | null;
    paymentStatus: string;
    paymentOption: 'half' | 'full';
    paymentRequired: number;
    paymentBalance: number;
    promoCode: string | null;
  };
  slots: BookingSlot[];
};

function shortId(id: string) {
  return id.slice(0, 8);
}

function statusTone(status: string) {
  if (status === 'confirmed' || status === 'checked_in') return 'bg-green-600 text-white';
  if (status === 'cancelled') return 'bg-red-600 text-white';
  if (status === 'checked_out') return 'bg-stone-500 text-white';
  return 'bg-amber-500 text-white';
}

function formatMoney(value: number | null, currency: 'LKR' | 'USD') {
  if (value == null) return 'Not available';
  return `${currency} ${value.toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function getBookingTotalInLkr(booking: ChaletBooking) {
  if (booking.bill.lkrTotal != null) return booking.bill.lkrTotal;
  if (booking.bill.currency === 'LKR') return booking.bill.total;
  if (booking.bill.currency === 'USD' && booking.bill.exchangeRate) {
    return booking.bill.total * booking.bill.exchangeRate;
  }
  return null;
}

export default function DashboardChaletBookingsPage() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<ChaletBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/dashboard/chalet/bookings', { cache: 'no-store' });
      const result = await readJsonResponse(response);
      if (!response.ok) throw new Error(result.error || 'Could not load chalet bookings.');

      const nextBookings = (result.bookings ?? []) as ChaletBooking[];
      setBookings(nextBookings);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not load bookings',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const updateBooking = async (booking: ChaletBooking, action: 'mark_paid' | 'cancel') => {
    if (action === 'cancel' && !window.confirm('Cancel this booking and record the refund? Service charge will be retained.')) {
      return;
    }

    setUpdatingId(booking.id);
    try {
      const response = await fetch(`/api/dashboard/chalet/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action === 'mark_paid'
          ? { action }
          : {
            action,
            reason: 'Cancelled from dashboard',
            refundNotes: 'Service charge retained according to cancellation policy.',
          }),
      });
      const result = await readJsonResponse(response);
      if (!response.ok) throw new Error(result.error || 'Could not update booking.');
      toast({
        title: action === 'mark_paid' ? 'Booking confirmed' : 'Booking cancelled',
        description: action === 'mark_paid'
          ? 'Payment was marked paid and confirmation emails were queued.'
          : 'Refund details were recorded and refund emails were queued.',
      });
      await loadBookings();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Could not update booking',
        description: error instanceof Error ? error.message : 'Please try again.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  const unassignedCount = useMemo(() => (
    bookings.reduce((count, booking) => (
      count + booking.slots.filter(slot => slot.availableRoomCount === 0).length
    ), 0)
  ), [bookings]);

  const grandTotalLkr = useMemo(() => (
    bookings.reduce((sum, booking) => sum + (getBookingTotalInLkr(booking) ?? 0), 0)
  ), [bookings]);

  const missingLkrTotalCount = useMemo(() => (
    bookings.filter(booking => getBookingTotalInLkr(booking) == null).length
  ), [bookings]);

  const convertedUsdBookingCount = useMemo(() => (
    bookings.filter(booking => booking.bill.currency === 'USD' && getBookingTotalInLkr(booking) != null).length
  ), [bookings]);

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-28 text-stone-950">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#102a5c]">Dashboard</p>
            <h1 className="mt-2 text-3xl font-bold">Chalet Bookings</h1>
            <p className="mt-1 text-sm text-stone-600">
              Availability counts for requested room categories. Room assignment is handled in the admin web app.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="rounded-sm bg-[#102a5c] text-white">{unassignedCount} fully booked requests</Badge>
            <Button type="button" variant="outline" onClick={loadBookings} disabled={loading} className="gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center bg-white text-stone-600">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading chalet bookings...
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white p-10 text-center text-stone-600">No chalet bookings found.</div>
        ) : (
          <div className="space-y-4">
            <div className="border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="block text-xs font-bold uppercase tracking-[0.14em] text-[#102a5c]">Grand Total</span>
                  <span className="mt-1 block text-3xl font-bold text-stone-950">{formatMoney(grandTotalLkr, 'LKR')}</span>
                </div>
                <div className="text-sm font-medium text-stone-600">
                  {bookings.length} booking{bookings.length === 1 ? '' : 's'} loaded
                  {convertedUsdBookingCount > 0 ? ` · ${convertedUsdBookingCount} USD booking${convertedUsdBookingCount === 1 ? '' : 's'} converted to LKR` : ''}
                  {missingLkrTotalCount > 0 ? ` · ${missingLkrTotalCount} missing LKR conversion` : ''}
                </div>
              </div>
            </div>
            {bookings.map(booking => {
              return (
                <section key={booking.id} className="bg-white p-5 shadow-sm">
                  <div className="grid gap-4 lg:grid-cols-[280px_1fr] lg:items-start">
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Badge className={`rounded-sm ${statusTone(booking.status)}`}>{booking.status}</Badge>
                        <Badge className="rounded-sm bg-stone-800 text-white">{booking.bill.paymentStatus}</Badge>
                        <span className="text-xs font-semibold text-stone-500">#{shortId(booking.id)}</span>
                      </div>
                      <h2 className="text-lg font-bold">{booking.customer_name}</h2>
                      <p className="mt-1 text-sm text-stone-600">{booking.customer_phone || booking.customer_email || 'No contact saved'}</p>
                      <p className="mt-3 text-sm font-semibold text-stone-800">
                        {format(parseISO(booking.check_in_date), 'dd MMM yyyy')} - {format(parseISO(booking.check_out_date), 'dd MMM yyyy')}
                      </p>
                      <div className="mt-4 border border-stone-200 bg-stone-50 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
                            {booking.nationality || 'Guest'} bill
                          </span>
                          <span className="text-xs font-semibold text-stone-500">
                            Base {booking.bill.currency}
                          </span>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div>
                            <span className="block text-xs font-semibold text-stone-500">Total LKR</span>
                            <span className="block text-base font-bold text-stone-950">{formatMoney(booking.bill.lkrTotal, 'LKR')}</span>
                          </div>
                          <div>
                            <span className="block text-xs font-semibold text-stone-500">Total USD</span>
                            <span className="block text-base font-bold text-stone-950">{formatMoney(booking.bill.usdTotal, 'USD')}</span>
                          </div>
                        </div>
                        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-stone-200 pt-3 text-xs text-stone-600">
                          <span>Subtotal: {formatMoney(booking.bill.subtotal, booking.bill.currency)}</span>
                          <span>Service: {formatMoney(booking.bill.serviceCharge, booking.bill.currency)}</span>
                          <span>VAT: {formatMoney(booking.bill.vat, booking.bill.currency)}</span>
                          <span>SSCL: {formatMoney(booking.bill.sscl, booking.bill.currency)}</span>
                          <span>Payment: {booking.bill.paymentOption === 'half' ? 'Half payment' : 'Full payment'}</span>
                          <span>Required: {formatMoney(booking.bill.paymentRequired, booking.bill.currency)}</span>
                          {booking.bill.paymentBalance > 0 ? (
                            <span>Balance: {formatMoney(booking.bill.paymentBalance, booking.bill.currency)}</span>
                          ) : null}
                          {booking.bill.discount > 0 ? (
                            <span>
                              Coupon discount: {formatMoney(booking.bill.discount, booking.bill.currency)}
                            </span>
                          ) : null}
                          {booking.bill.exchangeRate ? <span>USD rate: LKR {booking.bill.exchangeRate.toLocaleString()}</span> : null}
                        </div>
                        {booking.bill.promoCode ? (
                          <div className="mt-3 rounded-sm border border-green-200 bg-green-50 px-3 py-2 text-xs font-semibold text-green-800">
                            Coupon applied: {booking.bill.promoCode}
                            {booking.bill.discount > 0 ? ` (${formatMoney(booking.bill.discount, booking.bill.currency)} off)` : ''}
                          </div>
                        ) : null}
                        <div className="mt-3 grid gap-2 border-t border-stone-200 pt-3 text-xs text-stone-600">
                          <span>Payment option: {booking.payment_option === 'half' ? 'Half payment' : 'Full payment'}</span>
                          <span>Payment required: {formatMoney(booking.payment_required_amount, booking.bill.currency)}</span>
                          <span>Balance: {formatMoney(booking.payment_balance_amount, booking.bill.currency)}</span>
                          {booking.refund_status && booking.refund_status !== 'not_required' ? (
                            <>
                              <span>Refund status: {booking.refund_status}</span>
                              <span>Refund amount: {formatMoney(booking.refund_amount, booking.bill.currency)}</span>
                              <span>Service retained: {formatMoney(booking.refund_service_charge_retained, booking.bill.currency)}</span>
                            </>
                          ) : null}
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            className="gap-2 bg-green-700 text-white hover:bg-green-800"
                            disabled={updatingId === booking.id || booking.status === 'cancelled' || booking.bill.paymentStatus === 'paid'}
                            onClick={() => updateBooking(booking, 'mark_paid')}
                          >
                            {updatingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Mark paid
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="gap-2 border-red-200 text-red-700 hover:bg-red-50"
                            disabled={updatingId === booking.id || booking.status === 'cancelled'}
                            onClick={() => updateBooking(booking, 'cancel')}
                          >
                            {updatingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                            Cancel / refund
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                      {booking.slots.length === 0 ? (
                        <div className="border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                          This booking does not have a requested room category saved.
                        </div>
                      ) : booking.slots.map((slot, index) => (
                        <div key={slot.key} className="border border-stone-200 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#102a5c]">
                                Requested Room {index + 1}
                              </span>
                              <span className="block text-sm font-bold text-stone-950">{slot.categoryName}</span>
                              <span className="mt-1 block text-xs text-stone-500">
                                {slot.packageName} · {slot.adults} adult{slot.adults === 1 ? '' : 's'} · {slot.children} child{slot.children === 1 ? '' : 'ren'}
                              </span>
                            </div>
                            <Badge className={`rounded-sm ${slot.availableRoomCount > 0 ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                              {slot.availableRoomCount} available
                            </Badge>
                          </div>
                          {slot.availableRoomCount === 0 ? (
                            <span className="mt-3 block text-xs font-semibold text-red-600">No available rooms for this category/date range.</span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
