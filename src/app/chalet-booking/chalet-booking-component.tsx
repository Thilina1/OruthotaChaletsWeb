'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, Users, Loader2, CheckCircle2 } from 'lucide-react';

const SERVICE_CHARGE_RATE = 0.1; // 10%

type BookingDetails = {
  packageName: string;
  occupancyName: string;
  ratePerNight: number;
  nights: number;
  subtotal: number;
  serviceCharge: number;
  total: number;
};

export default function ChaletBookingComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const packageId = searchParams.get('packageId') ?? '';
  const occupancyTypeId = searchParams.get('occupancyTypeId') ?? '';
  const defaultAdults = parseInt(searchParams.get('adults') ?? '2', 10);
  const defaultChildren = parseInt(searchParams.get('children') ?? '0', 10);

  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [rateError, setRateError] = useState('');

  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_nic: '',
    nationality: '',
    adults: defaultAdults,
    children: defaultChildren,
    special_requests: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!checkIn || !checkOut || !packageId || !occupancyTypeId) {
      setRateError('Missing booking parameters. Please go back and try again.');
      setLoadingDetails(false);
      return;
    }

    const nights = differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn));
    if (nights < 1) {
      setRateError('Check-out must be after check-in.');
      setLoadingDetails(false);
      return;
    }

    Promise.all([
      supabase.from('chalet_packages').select('name').eq('id', packageId).single(),
      supabase.from('chalet_occupancy_types').select('name').eq('id', occupancyTypeId).single(),
      supabase
        .from('chalet_rates')
        .select('rate_per_night')
        .eq('package_id', packageId)
        .eq('occupancy_type_id', occupancyTypeId)
        .single(),
    ]).then(([pkgRes, occRes, rateRes]) => {
      if (rateRes.error || !rateRes.data) {
        setRateError('No rate found for this package and occupancy combination.');
        setLoadingDetails(false);
        return;
      }

      const ratePerNight = Number(rateRes.data.rate_per_night);
      const subtotal = ratePerNight * nights;
      const serviceCharge = subtotal * SERVICE_CHARGE_RATE;
      const total = subtotal + serviceCharge;

      setDetails({
        packageName: pkgRes.data?.name ?? 'Package',
        occupancyName: occRes.data?.name ?? 'Occupancy',
        ratePerNight,
        nights,
        subtotal,
        serviceCharge,
        total,
      });
      setLoadingDetails(false);
    });
  }, [checkIn, checkOut, packageId, occupancyTypeId]);

  const handleSubmit = async () => {
    if (!form.customer_name.trim() || !form.customer_phone.trim()) {
      toast({ variant: 'destructive', title: 'Required fields missing', description: 'Name and phone number are required.' });
      return;
    }
    if (!details) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('chalet_bookings').insert([{
        check_in_date: checkIn,
        check_out_date: checkOut,
        package_id: packageId,
        occupancy_type_id: occupancyTypeId,
        customer_name: form.customer_name.trim(),
        customer_email: form.customer_email.trim() || null,
        customer_phone: form.customer_phone.trim(),
        customer_nic: form.customer_nic.trim() || null,
        nationality: form.nationality.trim() || null,
        adults: form.adults,
        children: form.children,
        special_requests: form.special_requests.trim() || null,
        rate_per_night: details.ratePerNight,
        total_nights: details.nights,
        status: 'pending',
      }]);

      if (error) throw error;
      setSubmitted(true);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Booking failed', description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#283618] mb-2">Booking Request Sent!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for choosing Oruthota Chalets. Our representative will contact you soon via email and mobile to confirm your reservation — stay tuned!
          </p>
          <Button onClick={() => router.push('/')} className="bg-[#283618] hover:bg-[#3d5324] text-white">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-40">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-[#283618]">Complete Your Booking</h1>
        <p className="text-muted-foreground mt-1">Fill in your details below to request a reservation.</p>
      </div>

      {loadingDetails ? (
        <div className="flex items-center justify-center py-16 gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading pricing details...</span>
        </div>
      ) : rateError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {rateError}
          <Button variant="link" className="text-red-700 pl-2" onClick={() => router.back()}>Go back</Button>
        </div>
      ) : details && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pricing summary — sticky on desktop */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="lg:sticky lg:top-6 space-y-4">
              <Card className="border-[#606C38]/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-[#283618]">Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex gap-2 items-start">
                    <CalendarIcon className="h-4 w-4 mt-0.5 text-[#606C38]" />
                    <div>
                      <div className="font-medium">{format(parseISO(checkIn), 'dd MMM yyyy')} → {format(parseISO(checkOut), 'dd MMM yyyy')}</div>
                      <div className="text-muted-foreground">{details.nights} night{details.nights !== 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Users className="h-4 w-4 mt-0.5 text-[#606C38]" />
                    <div>{form.adults} adult{form.adults !== 1 ? 's' : ''}{form.children > 0 ? `, ${form.children} child${form.children !== 1 ? 'ren' : ''}` : ''}</div>
                  </div>
                  <div className="border-t pt-3 space-y-1.5">
                    <div className="text-muted-foreground">{details.packageName}</div>
                    <div className="text-muted-foreground">{details.occupancyName}</div>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-muted-foreground">
                      <span>LKR {details.ratePerNight.toLocaleString()} × {details.nights} night{details.nights !== 1 ? 's' : ''}</span>
                      <span>LKR {details.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Service charge (10%)</span>
                      <span>LKR {details.serviceCharge.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-base text-[#283618] border-t pt-2">
                      <span>Total</span>
                      <span>LKR {details.total.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-xs text-muted-foreground text-center px-2">
                This is a booking request. Our team will confirm availability and contact you to finalise payment.
              </p>
            </div>
          </div>

          {/* Guest details form */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-[#283618]">Guest Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="name"
                      placeholder="John Silva"
                      value={form.customer_name}
                      onChange={e => setForm(p => ({ ...p, customer_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number <span className="text-red-500">*</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+94 71 234 5678"
                      value={form.customer_phone}
                      onChange={e => setForm(p => ({ ...p, customer_phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={form.customer_email}
                      onChange={e => setForm(p => ({ ...p, customer_email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nic">NIC / Passport No.</Label>
                    <Input
                      id="nic"
                      placeholder="123456789V"
                      value={form.customer_nic}
                      onChange={e => setForm(p => ({ ...p, customer_nic: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="nationality">Nationality</Label>
                    <Input
                      id="nationality"
                      placeholder="Sri Lankan"
                      value={form.nationality}
                      onChange={e => setForm(p => ({ ...p, nationality: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="special">Special Requests</Label>
                  <Textarea
                    id="special"
                    placeholder="Any dietary requirements, room preferences, accessibility needs..."
                    rows={3}
                    value={form.special_requests}
                    onChange={e => setForm(p => ({ ...p, special_requests: e.target.value }))}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[#283618] hover:bg-[#3d5324] text-white h-11 text-sm font-semibold tracking-wide"
                >
                  {submitting ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                  ) : (
                    `Request Booking — LKR ${details.total.toLocaleString()}`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
