'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, BedDouble, Loader2, CheckCircle2, Maximize2, UserRound, Utensils, X, Wifi, ShowerHead, Tv, Wind, Check, ChevronLeft, ChevronRight, Coffee, CircleUserRound, Trash2, BadgePercent, Search, ShieldCheck, Download } from 'lucide-react';
import { PhoneNumberInput } from '@/components/phone-number-input';
import { downloadChaletBookingBill, type ChaletBookingBill } from '@/lib/chalet-booking-bill-pdf';
import { chaletGuestLimits, clampChaletGuests, maxChildrenFor } from '@/lib/chalet-guest-limits';
import { isValidEmail, isValidInternationalPhone } from '@/lib/contact-validation';
import { readJsonResponse } from '@/lib/fetch-json';
import type { DateRange } from 'react-day-picker';

const DEFAULT_SERVICE_CHARGE_PCT = 10;
const DEFAULT_VAT_PCT = 18;
const DEFAULT_SSCL_PCT = 2.5;

type ChargeCurrency = 'LKR' | 'USD' | 'both';

type BillSettings = {
  service_charge_pct: number;
  service_charge_currency: ChargeCurrency;
  vat_pct: number;
  vat_currency: ChargeCurrency;
  sscl_pct: number;
  sscl_currency: ChargeCurrency;
};

const defaultBillSettings: BillSettings = {
  service_charge_pct: DEFAULT_SERVICE_CHARGE_PCT,
  service_charge_currency: 'both',
  vat_pct: DEFAULT_VAT_PCT,
  vat_currency: 'USD',
  sscl_pct: DEFAULT_SSCL_PCT,
  sscl_currency: 'USD',
};

type BookingDetails = {
  packageId: string;
  roomCategoryId: string;
  packageName: string;
  roomCategoryName: string;
  currency: 'LKR' | 'USD';
  usdToLkrRate: number;
  originalRatePerNight: number;
  ratePerNight: number;
  discountPerNight: number;
  offerName?: string | null;
  packageDescription?: string | null;
  maxAdults?: number | null;
  maxChildren?: number | null;
  maxGuests?: number | null;
  bedConfigurations?: string[] | null;
  nights: number;
  subtotal: number;
  discountedSubtotal: number;
  serviceCharge: number;
  vat: number;
  sscl: number;
  total: number;
};

type BookingCartItem = BookingDetails & {
  id: string;
  adults: number;
  children: number;
  bedding: string;
  childAges: number[];
  specialRequest: string;
  arrivalTime: string;
};

function itemGuestLimits(item: Pick<BookingDetails, 'maxAdults' | 'maxChildren' | 'maxGuests'>) {
  return chaletGuestLimits({ max_adults: item.maxAdults, max_children: item.maxChildren, max_guests: item.maxGuests });
}

const PAYHERE_BILL_KEY = 'oruthota-chalet-bill-';

type PayHereCheckout = {
  actionUrl: string;
  fields: Record<string, string>;
};

function submitPayHereCheckout(payment: PayHereCheckout) {
  const form = document.createElement('form');
  form.method = 'POST';
  form.action = payment.actionUrl;
  form.style.display = 'none';

  Object.entries(payment.fields).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}

type ResolvedRate = {
  currency: 'LKR' | 'USD';
  displayRatePerNight: number;
  displayOriginalRatePerNight: number;
  displayDiscountPerNight: number;
  usdToLkrRate: number;
  originalRatePerNight: number;
  ratePerNight: number;
  discountPerNight: number;
  missingRate: boolean;
};

type RoomCategory = {
  id: string;
  name: string;
  description?: string | null;
  area_sqm?: number | null;
  room_count?: number | null;
  physical_room_count?: number | null;
  available_room_count?: number | null;
  max_adults?: number | null;
  max_children?: number | null;
  max_guests?: number | null;
  bed_configurations?: string[] | null;
  bathroom_features?: Array<string | { name: string; icon?: string }> | null;
  entertainment_features?: Array<string | { name: string; icon?: string }> | null;
  general_amenities?: Array<string | { name: string; icon?: string }> | null;
  internet_features?: Array<string | { name: string; icon?: string }> | null;
  image_urls?: string[] | null;
};

type ChaletPackageFacility = {
  id: string;
  name: string;
};

type ChaletPackage = {
  id: string;
  name: string;
  description?: string | null;
  meal_plan_id?: string | null;
  meal_plan?: string | null;
  chalet_meal_plans?: {
    id: string;
    name: string;
    description?: string | null;
    food_items?: Array<{ id: string; name: string; rate: number }> | null;
    other_costs?: Array<{ id: string; name: string; rate: number }> | null;
  } | null;
  includes_breakfast?: boolean | null;
  includes_lunch?: boolean | null;
  includes_dinner?: boolean | null;
  facilities?: ChaletPackageFacility[] | null;
};

type ChaletRate = {
  package_id: string;
  room_category_id?: string | null;
  rate_per_night: number;
  usd_rate_per_night?: number | null;
  usd_to_lkr_rate?: number | null;
  offer_name?: string | null;
  discount_percent?: number | null;
  lkr_discount_value?: number | null;
  lkr_discount_fixed_value?: number | null;
  usd_discount_value?: number | null;
  usd_discount_fixed_value?: number | null;
};

type FlexibleAvailabilityDate = {
  date: string;
  categories: Record<string, number>;
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

function formatMoney(value: number, currency: 'LKR' | 'USD' = 'LKR') {
  return `${currency} ${roundMoney(value).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatBillAmount(amount: number, currency: 'LKR' | 'USD', usdToLkrRate = 0) {
  const displayAmount = currency === 'USD' && usdToLkrRate > 0 ? amount / usdToLkrRate : amount;
  return formatMoney(displayAmount, currency);
}

function chargeApplies(chargeCurrency: ChargeCurrency, billCurrency: 'LKR' | 'USD') {
  return chargeCurrency === 'both' || chargeCurrency === billCurrency;
}

function discountPercent(original: number, discounted: number) {
  if (original <= 0 || discounted >= original) return 0;
  return Math.round(((original - discounted) / original) * 10000) / 100;
}

function discountAmount(amount: number, percent?: number | null, fixedValue?: number | null) {
  const fixed = Math.max(0, Number(fixedValue || 0));
  if (fixed > 0) return Math.min(amount, fixed);
  return amount * Math.min(100, Math.max(0, Number(percent || 0))) / 100;
}

function resolveRateForNationality(rate: ChaletRate, nationality: string): ResolvedRate {
  if (nationality === 'Non Sri Lankan') {
    const usdRate = Number(rate.usd_rate_per_night || 0);
    const exchangeRate = Number(rate.usd_to_lkr_rate || 0);
    if (usdRate > 0) {
      const discount = discountAmount(usdRate, rate.usd_discount_value ?? rate.discount_percent ?? 0, rate.usd_discount_fixed_value);
      const ratePerNightUsd = Math.max(0, usdRate - discount);
      const amountMultiplier = exchangeRate > 0 ? exchangeRate : 1;
      return {
        currency: 'USD' as const,
        displayOriginalRatePerNight: usdRate,
        displayRatePerNight: ratePerNightUsd,
        displayDiscountPerNight: discount,
        usdToLkrRate: exchangeRate,
        originalRatePerNight: usdRate * amountMultiplier,
        ratePerNight: ratePerNightUsd * amountMultiplier,
        discountPerNight: discount * amountMultiplier,
        missingRate: false,
      };
    }

    return {
      currency: 'USD' as const,
      displayOriginalRatePerNight: 0,
      displayRatePerNight: 0,
      displayDiscountPerNight: 0,
      usdToLkrRate: 0,
      originalRatePerNight: 0,
      ratePerNight: 0,
      discountPerNight: 0,
      missingRate: true,
    };
  }

  const lkrRate = Number(rate.rate_per_night || 0);
  const discount = discountAmount(lkrRate, rate.lkr_discount_value ?? rate.discount_percent ?? 0, rate.lkr_discount_fixed_value);
  return {
    currency: 'LKR' as const,
    displayOriginalRatePerNight: lkrRate,
    displayRatePerNight: Math.max(0, lkrRate - discount),
    displayDiscountPerNight: discount,
    usdToLkrRate: Number(rate.usd_to_lkr_rate || 0),
    originalRatePerNight: lkrRate,
    ratePerNight: Math.max(0, lkrRate - discount),
    discountPerNight: discount,
    missingRate: lkrRate <= 0,
  };
}

function packageFeatureLabels(pkg: ChaletPackage) {
  if (pkg.meal_plan?.trim()) return [pkg.meal_plan.trim()];

  const labels: string[] = [];
  if (pkg.includes_breakfast) labels.push('Bed & breakfast');
  if (pkg.includes_lunch) labels.push('Lunch');
  if (pkg.includes_dinner) labels.push('Dinner');
  (pkg.facilities || []).forEach(facility => {
    if (facility.name) labels.push(facility.name);
  });
  return labels.length > 0 ? labels : [pkg.description || pkg.name];
}

function packageDisplayName(pkg: ChaletPackage) {
  const lower = pkg.name.toLowerCase();
  if (lower.includes('breakfast')) return 'Bed & Breakfast';
  if (lower.includes('half')) return 'Half Board';
  if (lower.includes('full')) return 'Full Board';
  return pkg.name;
}

function rateDiscountLabel(rate: ChaletRate, nationality: string, currency: 'LKR' | 'USD') {
  const percent = nationality === 'Non Sri Lankan'
    ? Number(rate.usd_discount_value ?? rate.discount_percent ?? 0)
    : Number(rate.lkr_discount_value ?? rate.discount_percent ?? 0);
  const fixed = nationality === 'Non Sri Lankan'
    ? Number(rate.usd_discount_fixed_value || 0)
    : Number(rate.lkr_discount_fixed_value || 0);

  if (fixed > 0) return `Discount: ${formatMoney(fixed, currency)} off per night`;
  if (percent > 0) return `Discount: ${percent}% off`;
  return 'Discount: 0';
}

function featureName(feature: string | { name: string; icon?: string }) {
  return typeof feature === 'string' ? feature : feature.name;
}

export default function ChaletBookingComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const checkIn = searchParams.get('checkIn') ?? '';
  const checkOut = searchParams.get('checkOut') ?? '';
  const packageId = searchParams.get('packageId') ?? '';
  const roomCategoryId = searchParams.get('roomCategoryId') ?? '';
  const nationality = searchParams.get('nationality') ?? 'Sri Lankan';
  const promoCode = searchParams.get('promoCode') ?? '';
  const flexibleDatesParam = searchParams.get('flexibleDates') === 'true';

  const [details, setDetails] = useState<BookingDetails | null>(null);
  const [roomCategories, setRoomCategories] = useState<RoomCategory[]>([]);
  const [packages, setPackages] = useState<ChaletPackage[]>([]);
  const [rates, setRates] = useState<ChaletRate[]>([]);
  const [availabilityDates, setAvailabilityDates] = useState<FlexibleAvailabilityDate[]>([]);
  const [billSettings, setBillSettings] = useState<BillSettings>(defaultBillSettings);
  const [selectedPackageId, setSelectedPackageId] = useState(packageId);
  const [selectedRoomCategoryId, setSelectedRoomCategoryId] = useState(roomCategoryId);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [rateError, setRateError] = useState('');
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange | undefined>(() => (
    checkIn && checkOut ? { from: parseISO(checkIn), to: parseISO(checkOut) } : undefined
  ));
  const [hoveredCheckoutDate, setHoveredCheckoutDate] = useState<Date | undefined>(undefined);
  const [selectedNationality, setSelectedNationality] = useState<'Sri Lankan' | 'Non Sri Lankan'>(
    nationality === 'Non Sri Lankan' ? 'Non Sri Lankan' : 'Sri Lankan'
  );
  const [enteredPromoCode, setEnteredPromoCode] = useState(promoCode);
  const [flexibleDates, setFlexibleDates] = useState(flexibleDatesParam);
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discount: number; discountType?: 'percentage' | 'fixed' | null; discountValue?: number; description?: string | null } | null>(null);
  const [promoError, setPromoError] = useState('');
  const [validatingPromo, setValidatingPromo] = useState(false);
  const lastPromoValidationKey = useRef('');
  const [infoRoomCategory, setInfoRoomCategory] = useState<RoomCategory | null>(null);
  const [roomImageIndexes, setRoomImageIndexes] = useState<Record<string, number>>({});
  const [roomInfoImageIndex, setRoomInfoImageIndex] = useState(0);
  const [infoPackage, setInfoPackage] = useState<{
    pkg: ChaletPackage;
    category: RoomCategory;
    rate: ChaletRate;
  } | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [bookingCart, setBookingCart] = useState<BookingCartItem[]>([]);
  const [roomQuantities, setRoomQuantities] = useState<Record<string, number>>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bookingForSomeoneElse, setBookingForSomeoneElse] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'half' | 'full'>('full');
  const [form, setForm] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_nic: '',
    adults: 1,
    children: 0,
    special_requests: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedBill, setSubmittedBill] = useState<ChaletBookingBill | null>(null);
  const [downloadingBill, setDownloadingBill] = useState(false);
  // Online payment result after returning from PayHere (null for demo bookings).
  const [checkoutState, setCheckoutState] = useState<'confirming' | 'booked' | 'failed' | 'problem' | 'delayed' | null>(null);
  const [checkoutId, setCheckoutId] = useState<string | null>(null);

  // Back from PayHere: the booking is created only after PayHere confirms the
  // payment, so wait for it before showing the booking number and bill.
  useEffect(() => {
    const payment = searchParams.get('payment');
    const returnedCheckoutId = searchParams.get('checkout');
    if (!payment || !returnedCheckoutId) return;
    let savedBill: ChaletBookingBill | null = null;
    try {
      const saved = sessionStorage.getItem(`${PAYHERE_BILL_KEY}${returnedCheckoutId}`);
      savedBill = saved ? JSON.parse(saved) as ChaletBookingBill : null;
    } catch {
      savedBill = null;
    }
    if (payment === 'return') {
      setSubmittedBill(savedBill);
      setCheckoutId(returnedCheckoutId);
      setCheckoutState('confirming');
      setSubmitted(true);
    } else if (payment === 'cancelled') {
      toast({
        variant: 'destructive',
        title: 'Payment not completed',
        description: 'No booking was made. You can choose your rooms and try again.',
      });
    }
  }, [searchParams]);

  useEffect(() => {
    if (checkoutState !== 'confirming' || !checkoutId) return;
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/bookings/chalet/checkout?id=${encodeURIComponent(checkoutId)}`, { cache: 'no-store' });
        const result = await readJsonResponse(response);
        if (cancelled) return;
        if (response.ok && result.status === 'booked') {
          setSubmittedBill(prev => prev ? { ...prev, bookingRef: String(result.bookingRef || '') } : prev);
          setCheckoutState('booked');
          return;
        }
        if (response.ok && result.status === 'payment_failed') {
          setCheckoutState('failed');
          return;
        }
        if (response.ok && (result.status === 'paid_unavailable' || result.status === 'amount_mismatch')) {
          setCheckoutState('problem');
          return;
        }
      } catch {
        // Keep waiting; the next attempt may succeed.
      }
      if (cancelled) return;
      if (attempts >= 30) {
        setCheckoutState('delayed');
        return;
      }
      window.setTimeout(poll, 2500);
    };
    poll();
    return () => {
      cancelled = true;
    };
  }, [checkoutState, checkoutId]);

  // Show the "Booking Request Sent!" message from the top of the page.
  useEffect(() => {
    if (submitted) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [submitted]);

  useEffect(() => {
    setSelectedDateRange(checkIn && checkOut ? { from: parseISO(checkIn), to: parseISO(checkOut) } : undefined);
  }, [checkIn, checkOut]);

  useEffect(() => {
    setSelectedNationality(nationality === 'Non Sri Lankan' ? 'Non Sri Lankan' : 'Sri Lankan');
  }, [nationality]);

  useEffect(() => {
    setEnteredPromoCode(promoCode);
  }, [promoCode]);

  useEffect(() => {
    setFlexibleDates(flexibleDatesParam);
  }, [flexibleDatesParam]);

  useEffect(() => {
    setRoomInfoImageIndex(0);
  }, [infoRoomCategory?.id]);

  const roomImages = (category?: RoomCategory | null) => (
    Array.isArray(category?.image_urls) && category.image_urls.length > 0
      ? category.image_urls
      : ['/rooms-01.jpg']
  );

  const changeRoomImage = (category: RoomCategory, direction: 1 | -1) => {
    const images = roomImages(category);
    if (images.length <= 1) return;

    setRoomImageIndexes(prev => {
      const currentIndex = prev[category.id] ?? 0;
      return {
        ...prev,
        [category.id]: (currentIndex + direction + images.length) % images.length,
      };
    });
  };

  const changeRoomInfoImage = (direction: 1 | -1) => {
    const images = roomImages(infoRoomCategory);
    if (images.length <= 1) return;
    setRoomInfoImageIndex(prev => (prev + direction + images.length) % images.length);
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range.to && range.to <= range.from) {
      setSelectedDateRange({ from: range.from, to: undefined });
      setHoveredCheckoutDate(undefined);
      return;
    }

    setSelectedDateRange(range);
    if (range?.from && range.to) {
      setHoveredCheckoutDate(undefined);
      setIsDatePopoverOpen(false);
    }
  };

  const isPreviewRangeDay = (date: Date) => {
    if (!selectedDateRange?.from || selectedDateRange.to || !hoveredCheckoutDate) return false;
    return date > selectedDateRange.from && date <= hoveredCheckoutDate;
  };

  const handleSearch = () => {
    if (!selectedDateRange?.from || !selectedDateRange.to || selectedDateRange.to <= selectedDateRange.from) {
      toast({
        variant: 'destructive',
        title: 'Please select dates',
        description: 'Select a check-in and check-out date to search availability.',
      });
      return;
    }

    const params = new URLSearchParams({
      checkIn: format(selectedDateRange.from, 'yyyy-MM-dd'),
      checkOut: format(selectedDateRange.to, 'yyyy-MM-dd'),
      nationality: selectedNationality,
    });

    if (enteredPromoCode.trim()) params.set('promoCode', enteredPromoCode.trim());
    if (selectedPackageId) params.set('packageId', selectedPackageId);
    if (selectedRoomCategoryId) params.set('roomCategoryId', selectedRoomCategoryId);
    if (flexibleDates) params.set('flexibleDates', 'true');

    router.push(`/chalet-booking?${params.toString()}`);
  };

  useEffect(() => {
    if (!checkIn || !checkOut) {
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

    const optionsParams = new URLSearchParams({ checkIn, checkOut });
    if (flexibleDatesParam) optionsParams.set('flexibleDates', 'true');

    fetch(`/api/bookings/chalet/options?${optionsParams.toString()}`)
      .then(async response => {
        const data = await readJsonResponse(response);
        if (!response.ok) throw new Error(data.error || 'Could not load chalet booking options.');
        return data as {
          categories?: RoomCategory[];
          packages?: ChaletPackage[];
          rates?: ChaletRate[];
          availabilityDates?: FlexibleAvailabilityDate[];
          billSettings?: Partial<BillSettings>;
        };
      })
      .then(data => {
      const categoryData = data.categories || [];
      const packageData = data.packages || [];
      const rateData = data.rates || [];

      if (categoryData.length === 0 || packageData.length === 0 || rateData.length === 0) {
        const missing = [
          categoryData.length === 0 ? 'room types' : '',
          packageData.length === 0 ? 'packages' : '',
          rateData.length === 0 ? 'rates' : '',
        ].filter(Boolean).join(', ');
        setRateError(`No ${missing} are available for online booking.`);
        setLoadingDetails(false);
        return;
      }

      setRoomCategories(categoryData);
      setPackages(packageData);
      setRates(rateData);
      setAvailabilityDates(data.availabilityDates || []);
      setBillSettings({ ...defaultBillSettings, ...(data.billSettings || {}) });

      const initialCategoryId = roomCategoryId || categoryData[0]?.id || '';
      const initialPackageId = packageId || packageData[0]?.id || '';
      setSelectedRoomCategoryId(initialCategoryId);
      setSelectedPackageId(initialPackageId);

      setLoadingDetails(false);
    })
      .catch(error => {
        console.error('Failed to load chalet booking options:', error);
        setRateError((error as Error).message || 'Could not load chalet booking options.');
        setLoadingDetails(false);
      });
  }, [checkIn, checkOut, packageId, roomCategoryId, flexibleDatesParam]);

  const nights = checkIn && checkOut ? differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn)) : 0;
  const rateHasMatrixValue = (rate: ChaletRate, targetNationality: string) => (
    targetNationality === 'Non Sri Lankan'
      ? Number(rate.usd_rate_per_night || 0) > 0
      : Number(rate.rate_per_night || 0) > 0
  );
  const findRate = (categoryId: string, pkgId: string, targetNationality = selectedNationality) => {
    const categoryRate = rates.find(rate => rate.package_id === pkgId && rate.room_category_id === categoryId);
    const defaultRate = rates.find(rate => rate.package_id === pkgId && !rate.room_category_id);

    if (categoryRate && rateHasMatrixValue(categoryRate, targetNationality)) return categoryRate;
    if (defaultRate && rateHasMatrixValue(defaultRate, targetNationality)) return defaultRate;
    return categoryRate || defaultRate;
  };
  const buildDetails = (categoryId: string, pkgId: string, targetNationality = selectedNationality): BookingDetails | null => {
    const category = roomCategories.find(item => item.id === categoryId);
    const pkg = packages.find(item => item.id === pkgId);
    const rate = findRate(categoryId, pkgId, targetNationality);
    if (!category || !pkg || !rate || nights < 1) return null;
    const resolvedRate = resolveRateForNationality(rate, targetNationality);
    if ('missingRate' in resolvedRate && resolvedRate.missingRate) return null;
    const { currency, usdToLkrRate, originalRatePerNight, ratePerNight, discountPerNight } = resolvedRate;
    const subtotal = ratePerNight * nights;
    const discountedSubtotal = subtotal;
    const serviceCharge = chargeApplies(billSettings.service_charge_currency, currency) ? discountedSubtotal * Number(billSettings.service_charge_pct || 0) / 100 : 0;
    const vat = chargeApplies(billSettings.vat_currency, currency) ? discountedSubtotal * Number(billSettings.vat_pct || 0) / 100 : 0;
    const sscl = chargeApplies(billSettings.sscl_currency, currency) ? discountedSubtotal * Number(billSettings.sscl_pct || 0) / 100 : 0;
    return {
      packageId: pkg.id,
      roomCategoryId: category.id,
      packageName: pkg.name,
      roomCategoryName: category.name,
      currency,
      usdToLkrRate,
      originalRatePerNight,
      ratePerNight,
      discountPerNight,
      offerName: rate.offer_name,
      packageDescription: pkg.description,
      maxAdults: category.max_adults,
      maxChildren: category.max_children,
      maxGuests: category.max_guests,
      bedConfigurations: category.bed_configurations,
      nights,
      subtotal,
      discountedSubtotal,
      serviceCharge,
      vat,
      sscl,
      total: discountedSubtotal + serviceCharge + vat + sscl,
    };
  };

  useEffect(() => {
    const nextDetails = buildDetails(selectedRoomCategoryId, selectedPackageId);
    setDetails(nextDetails);
  }, [selectedPackageId, selectedRoomCategoryId, roomCategories, packages, rates, nights, billSettings, selectedNationality]);

  useEffect(() => {
    setBookingCart(prev => prev.map(item => {
      const nextDetails = buildDetails(item.roomCategoryId, item.packageId, selectedNationality);
      if (!nextDetails) return item;
      const guests = clampChaletGuests(itemGuestLimits(nextDetails), item.adults, item.children);
      return { ...item, ...nextDetails, ...guests, childAges: item.childAges.slice(0, guests.children) };
    }));
  }, [roomCategories, packages, rates, nights, billSettings, selectedNationality]);

  const roomQuantityKey = (categoryId: string, pkgId: string) => `${categoryId}:${pkgId}`;

  const selectOffer = (categoryId: string, pkgId: string, quantity?: number) => {
    setSelectedRoomCategoryId(categoryId);
    setSelectedPackageId(pkgId);
    const category = roomCategories.find(item => item.id === categoryId);
    const availableRoomCount = Number(category?.available_room_count ?? 0);
    const remainingRoomCount = Math.max(0, availableRoomCount - selectedRoomCountForCategory(categoryId));
    const requestedQuantity = Math.max(1, Math.min(quantity ?? roomQuantities[roomQuantityKey(categoryId, pkgId)] ?? 1, remainingRoomCount));
    if (remainingRoomCount <= 0 || requestedQuantity <= 0) {
      toast({ variant: 'destructive', title: 'No rooms left', description: 'All available rooms for this room type are already selected.' });
      return;
    }
    const nextDetails = buildDetails(categoryId, pkgId);
    if (!nextDetails) {
      toast({ variant: 'destructive', title: 'Rate not available', description: 'Please choose a package with a configured rate.' });
      return;
    }
    setDetails(nextDetails);
    const initialGuests = clampChaletGuests(itemGuestLimits(nextDetails), form.adults, form.children);
    const nextItems = Array.from({ length: requestedQuantity }, (_, index) => ({
        ...nextDetails,
        id: `${categoryId}-${pkgId}-${Date.now()}-${index}`,
        adults: initialGuests.adults,
        children: initialGuests.children,
        bedding: nextDetails.bedConfigurations?.[0] || '1 King',
        childAges: Array.from({ length: initialGuests.children }, () => 0),
        specialRequest: '',
        arrivalTime: '02:00 pm',
      }));
    setBookingCart(prev => [...prev, ...nextItems]);
    setRoomQuantities(prev => ({ ...prev, [roomQuantityKey(categoryId, pkgId)]: 1 }));
    setCheckoutOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Changing adults can lower how many children the room allows, so the
  // children (and their ages) are trimmed to the room's guest limits.
  const updateCartGuests = (item: BookingCartItem, adults: number, children: number) => {
    const guests = clampChaletGuests(itemGuestLimits(item), adults, children);
    updateCartGuestDetails(item.id, {
      ...guests,
      childAges: Array.from({ length: guests.children }, (_, index) => item.childAges[index] ?? 0),
    });
  };

  const updateCartGuestDetails = (id: string, patch: Partial<BookingCartItem>) => {
    setBookingCart(prev => prev.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const removeCartItem = (id: string) => {
    setBookingCart(prev => prev.filter(item => item.id !== id));
  };

  const selectedRoomCountForCategory = (categoryId: string) => (
    bookingCart.filter(item => item.roomCategoryId === categoryId).length
  );

  const selectFlexibleDate = (date: string, categoryId: string, pkgId: string) => {
    const startDate = parseISO(date);
    const params = new URLSearchParams({
      checkIn: format(startDate, 'yyyy-MM-dd'),
      checkOut: format(addDays(startDate, 1), 'yyyy-MM-dd'),
      nationality: selectedNationality,
      roomCategoryId: categoryId,
      packageId: pkgId,
      flexibleDates: 'true',
    });

    if (enteredPromoCode.trim()) params.set('promoCode', enteredPromoCode.trim());
    router.push(`/chalet-booking?${params.toString()}`);
  };

  const cartSubtotal = bookingCart.reduce((sum, item) => sum + item.discountedSubtotal, 0);
  const cartCurrency = bookingCart[0]?.currency ?? 'LKR';
  const cartUsdToLkrRate = bookingCart[0]?.usdToLkrRate ?? 0;
  // The coupon comes off the room total first; service charge, VAT and SSCL
  // are then charged on the discounted amount (same as the server and admin).
  const promoDiscount = Math.min(appliedPromo?.discount ?? 0, cartSubtotal);
  const discountedCartSubtotal = Math.max(0, cartSubtotal - promoDiscount);
  const cartServiceCharge = bookingCart.length > 0 && chargeApplies(billSettings.service_charge_currency, cartCurrency)
    ? discountedCartSubtotal * Number(billSettings.service_charge_pct || 0) / 100
    : 0;
  const cartVat = bookingCart.length > 0 && chargeApplies(billSettings.vat_currency, cartCurrency)
    ? discountedCartSubtotal * Number(billSettings.vat_pct || 0) / 100
    : 0;
  const cartSscl = bookingCart.length > 0 && chargeApplies(billSettings.sscl_currency, cartCurrency)
    ? discountedCartSubtotal * Number(billSettings.sscl_pct || 0) / 100
    : 0;
  const payableTotal = discountedCartSubtotal + cartServiceCharge + cartVat + cartSscl;
  const paymentRequired = paymentOption === 'half' ? payableTotal / 2 : payableTotal;
  const promoDiscountLabel = appliedPromo
    ? appliedPromo.discountType === 'percentage'
      ? `${Number(appliedPromo.discountValue || 0)}%`
      : formatBillAmount(Number(appliedPromo.discountValue || appliedPromo.discount || 0), cartCurrency, cartUsdToLkrRate)
    : '';
  const promoStatusMessage = appliedPromo
    ? `${appliedPromo.code} applied: ${promoDiscountLabel} off. Only one coupon can be used per booking.`
    : enteredPromoCode.trim()
      ? bookingCart.length > 0
        ? validatingPromo
          ? 'Checking promo code...'
          : promoError || 'Click Apply to use this coupon. Only one coupon can be used per booking.'
        : 'Promo code saved. Add a room to apply it automatically.'
      : 'Add a promo code if you have one.';

  useEffect(() => {
    setAppliedPromo(null);
    setPromoError('');
  }, [cartSubtotal, cartCurrency, checkIn]);

  const validatePromoCode = useCallback(async () => {
    const code = enteredPromoCode.trim().toUpperCase();
    if (!code || bookingCart.length === 0) {
      setAppliedPromo(null);
      setPromoError(code ? 'Please add a room before applying a promo code.' : '');
      return;
    }

    setValidatingPromo(true);
    setPromoError('');
    try {
      const params = new URLSearchParams({
        code,
        currency: cartCurrency,
        roomTotal: String(cartSubtotal),
        checkIn,
      });
      const response = await fetch(`/api/bookings/chalet/promo?${params.toString()}`);
      const result = await readJsonResponse(response);
      if (!response.ok) throw new Error(result.error || 'Promo code is not valid.');
      setAppliedPromo({
        code: result.code,
        discount: Number(result.discount || 0),
        discountType: result.discountType ?? null,
        discountValue: Number(result.discountValue || 0),
        description: result.description ?? null,
      });
    } catch (error) {
      setAppliedPromo(null);
      setPromoError((error as Error).message);
    } finally {
      setValidatingPromo(false);
    }
  }, [bookingCart.length, cartCurrency, cartSubtotal, checkIn, enteredPromoCode]);

  const clearPromoCode = () => {
    lastPromoValidationKey.current = '';
    setEnteredPromoCode('');
    setAppliedPromo(null);
    setPromoError('');
  };

  useEffect(() => {
    const code = enteredPromoCode.trim().toUpperCase();
    if (!code) {
      lastPromoValidationKey.current = '';
      setAppliedPromo(null);
      setPromoError('');
      return;
    }

    if (bookingCart.length === 0) return;

    const validationKey = [code, bookingCart.length, cartSubtotal, cartCurrency, checkIn].join('|');
    if (validationKey === lastPromoValidationKey.current) return;

    const timeout = window.setTimeout(() => {
      lastPromoValidationKey.current = validationKey;
      validatePromoCode();
    }, 500);

    return () => window.clearTimeout(timeout);
  }, [bookingCart.length, cartCurrency, cartSubtotal, checkIn, enteredPromoCode, validatePromoCode]);

  const roomInfoImages = roomImages(infoRoomCategory);
  const roomInfoImage = roomInfoImages[roomInfoImageIndex % roomInfoImages.length] || '/rooms-01.jpg';
  const roomInfoDescription = infoRoomCategory
    ? infoRoomCategory.description || `${infoRoomCategory.name} offers a spacious chalet stay with comfortable bedding, thoughtful amenities, and easy access to the calm surroundings of Oruthota Chalets.`
    : '';

  const handleSubmit = async () => {
    const customerName = `${firstName} ${lastName}`.trim() || form.customer_name.trim();
    if (!customerName || !form.customer_phone.trim() || !form.customer_nic.trim() || !form.customer_email.trim()) {
      toast({ variant: 'destructive', title: 'Required fields missing', description: 'Name, phone number, email, and NIC/Passport No. are required.' });
      return;
    }
    if (!termsAccepted) {
      toast({ variant: 'destructive', title: 'Terms required', description: 'Please agree to the terms and payment terms before booking.' });
      return;
    }
    if (bookingCart.length === 0) {
      toast({ variant: 'destructive', title: 'No rooms selected', description: 'Please add at least one room package before payment.' });
      return;
    }
    if (bookingCart.some(item => item.children > 0 && item.childAges.slice(0, item.children).some(age => age == null || Number.isNaN(age)))) {
      toast({ variant: 'destructive', title: 'Child age required', description: 'Please select the age for each child.' });
      return;
    }
    const email = form.customer_email.trim();
    if (!isValidEmail(email)) {
      toast({ variant: 'destructive', title: 'Invalid email', description: 'Please enter a valid email address.' });
      return;
    }
    if (!isValidInternationalPhone(form.customer_phone)) {
      toast({ variant: 'destructive', title: 'Invalid phone number', description: 'Please enter a valid phone number for the selected country.' });
      return;
    }
    const bookingNotes = [
      ...bookingCart.map((item, index) => [
        `Room ${index + 1}: ${item.roomCategoryName} / ${packageDisplayName({ id: item.packageId, name: item.packageName })}`,
        `Bedding: ${item.bedding}`,
        `Adults: ${item.adults}`,
        `Children: ${item.children}`,
        item.children > 0 ? `Child ages: ${item.childAges.slice(0, item.children).join(', ')}` : '',
        `Estimated arrival time: ${item.arrivalTime}`,
        item.specialRequest.trim() ? `Special request: ${item.specialRequest.trim()}` : '',
      ].filter(Boolean).join('\n')),
      bookingForSomeoneElse ? 'Booking for someone else.' : '',
      `Payment option: ${paymentOption === 'half' ? 'Half payment' : 'Full payment'}`,
    ].filter(Boolean).join('\n');
    const primaryItem = bookingCart[0];

    setSubmitting(true);
    try {
      const response = await fetch('/api/bookings/chalet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkIn,
          checkOut,
          packageId: primaryItem.packageId,
          roomCategoryId: primaryItem.roomCategoryId,
          promoCode: appliedPromo?.code ?? '',
          paymentOption,
          paymentRequiredAmount: paymentRequired,
          rooms: bookingCart.map(item => ({
            packageId: item.packageId,
            roomCategoryId: item.roomCategoryId,
            adults: item.adults,
            children: item.children,
          })),
          nationality: selectedNationality,
          customerName,
          customerEmail: form.customer_email,
          customerPhone: form.customer_phone,
          customerNic: form.customer_nic,
          adults: primaryItem.adults,
          children: primaryItem.children,
          specialRequests: bookingNotes,
        }),
      });

      const result = await readJsonResponse(response);
      if (!response.ok) throw new Error(result.error || 'Booking failed');

      const pricing = result.pricing ?? {};
      const billCurrency: 'LKR' | 'USD' = (result.payment?.currency ?? result.payment?.fields?.currency) === 'USD' ? 'USD' : 'LKR';
      const bill: ChaletBookingBill = {
        bookingRef: String(result.bookingRef || ''),
        createdAt: format(new Date(), 'dd MMM yyyy, hh:mm a'),
        guestName: customerName,
        guestEmail: form.customer_email.trim(),
        guestPhone: form.customer_phone.trim(),
        nationality: selectedNationality,
        checkIn: format(parseISO(checkIn), 'dd MMM yyyy'),
        checkOut: format(parseISO(checkOut), 'dd MMM yyyy'),
        nights: Number(pricing.nights ?? nights),
        currency: billCurrency,
        rooms: bookingCart.map(item => ({
          name: item.roomCategoryName,
          packageName: packageDisplayName({ id: item.packageId, name: item.packageName }),
          adults: item.adults,
          children: item.children,
          amount: item.currency === 'USD' && item.usdToLkrRate > 0 ? item.discountedSubtotal / item.usdToLkrRate : item.discountedSubtotal,
        })),
        subtotal: Number(pricing.subtotal ?? 0),
        promoDiscount: Number(pricing.promoDiscount ?? 0),
        promoCode: appliedPromo?.code ?? null,
        serviceCharge: Number(pricing.serviceCharge ?? 0),
        vat: Number(pricing.vat ?? 0),
        sscl: Number(pricing.sscl ?? 0),
        totalAmount: Number(pricing.totalAmount ?? 0),
        paymentOption: pricing.paymentOption === 'half' ? 'half' : 'full',
        paymentRequiredAmount: Number(pricing.paymentRequiredAmount ?? 0),
        paymentBalanceAmount: Number(pricing.paymentBalanceAmount ?? 0),
        // Shown once paid: straight away for the demo payment, and after
        // PayHere confirms the payment for PayHere bookings.
        paymentStatus: 'paid',
        paymentMethod: result.payment?.provider === 'payhere' ? 'Online payment (PayHere)' : 'Online payment',
      };

      if (result.payment?.provider === 'payhere' && result.payment.actionUrl && result.payment.fields) {
        // Keep the bill so the confirmation screen can show it when PayHere
        // sends the guest back to this page.
        try {
          sessionStorage.setItem(`${PAYHERE_BILL_KEY}${result.checkoutId}`, JSON.stringify(bill));
        } catch {
          // The confirmation screen still works without the saved bill.
        }
        submitPayHereCheckout(result.payment as PayHereCheckout);
        return;
      }

      setSubmittedBill(bill);
      setSubmitted(true);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Booking failed', description: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-36 pb-12 md:pt-40">
        <div className="text-center max-w-md">
          {checkoutState === 'confirming' ? (
            <>
              <Loader2 className="w-16 h-16 text-[#283618] mx-auto mt-[0.5cm] mb-4 animate-spin" />
              <h1 className="text-2xl font-bold text-[#283618] mb-2">Confirming your payment…</h1>
              <p className="text-muted-foreground mb-6">Please wait while we confirm your payment with PayHere and place your booking. Please don&apos;t close this page.</p>
            </>
          ) : checkoutState === 'failed' ? (
            <>
              <X className="w-16 h-16 text-red-500 mx-auto mt-[0.5cm] mb-4" />
              <h1 className="text-2xl font-bold text-[#283618] mb-2">Payment not completed</h1>
              <p className="text-muted-foreground mb-6">Your payment was not completed, so no booking was made. You can choose your rooms and try again.</p>
            </>
          ) : checkoutState === 'problem' ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-amber-500 mx-auto mt-[0.5cm] mb-4" />
              <h1 className="text-2xl font-bold text-[#283618] mb-2">Payment received</h1>
              <p className="text-muted-foreground mb-6">We received your payment, but the selected rooms could not be booked automatically. Our team will contact you shortly by email and phone to arrange your stay or a refund.</p>
            </>
          ) : checkoutState === 'delayed' ? (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mt-[0.5cm] mb-4" />
              <h1 className="text-2xl font-bold text-[#283618] mb-2">Payment is being confirmed</h1>
              <p className="text-muted-foreground mb-6">PayHere is still confirming your payment. Once it is confirmed, your booking is placed and you will receive a confirmation email with your booking number.</p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mt-[0.5cm] mb-4" />
              <h1 className="text-2xl font-bold text-[#283618] mb-2">{checkoutState === 'booked' ? 'Payment Received – Booking Placed!' : 'Booking Request Sent!'}</h1>
              <p className="text-muted-foreground mb-6">
                Thank you for choosing Oruthota Chalets. Our representative will contact you soon via email and mobile to confirm your reservation — stay tuned!
              </p>
            </>
          )}
          {submittedBill?.bookingRef && (checkoutState === null || checkoutState === 'booked') ? (
            <div className="mb-6 rounded-lg border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">Booking Number</p>
              <p className="mt-1 text-xl font-bold tracking-wide text-[#283618]">{submittedBill.bookingRef}</p>
              <p className="mt-1 text-xs text-stone-500">Please keep this number for your reference.</p>
            </div>
          ) : null}
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            {submittedBill?.bookingRef && (checkoutState === null || checkoutState === 'booked') ? (
              <Button
                type="button"
                variant="outline"
                disabled={downloadingBill}
                onClick={async () => {
                  setDownloadingBill(true);
                  try {
                    await downloadChaletBookingBill(submittedBill);
                  } catch (error) {
                    console.error('Bill download failed:', error);
                    toast({ variant: 'destructive', title: 'Could not download the bill', description: 'Please try again.' });
                  } finally {
                    setDownloadingBill(false);
                  }
                }}
                className="gap-2 border-[#283618] text-[#283618]"
              >
                {downloadingBill ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download Bill
              </Button>
            ) : null}
            {checkoutState === 'failed' ? (
              <Button type="button" variant="outline" onClick={() => window.location.assign('/chalet-booking')} className="border-[#283618] text-[#283618]">
                Try Again
              </Button>
            ) : null}
            <Button onClick={() => router.push('/')} className="bg-[#283618] hover:bg-[#3d5324] text-white">
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f5ef] px-4 py-6 pt-36 text-stone-950 md:pt-40">
      <div className="mx-auto max-w-[1680px]">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-[#283618] px-5 py-4 text-white shadow-sm md:flex-row md:items-center md:justify-between lg:px-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#d4dbb8]">Oruthota Chalets</p>
            <h1 className="mt-0.5 text-xl font-bold md:text-2xl">Choose your chalet stay</h1>
            <p className="mt-1 text-xs text-white/70 md:text-sm">Compare rooms, meal plans and offers before checkout.</p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold md:text-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
              <CalendarIcon className="h-3.5 w-3.5 text-[#d4dbb8]" />
              {checkIn ? format(parseISO(checkIn), 'dd MMM') : 'Check-in'} → {checkOut ? format(parseISO(checkOut), 'dd MMM yyyy') : 'Check-out'}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
              {nights > 0 ? `${nights} night${nights === 1 ? '' : 's'}` : 'Dates not set'}
            </span>
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/15">
              {selectedNationality} · {selectedNationality === 'Non Sri Lankan' ? 'USD' : 'LKR'}
            </span>
          </div>
        </div>
      {!checkoutOpen ? (
      <div className="mb-5 rounded-2xl border border-stone-200 bg-white px-4 py-4 shadow-sm">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-[1.35fr_1.35fr_1.05fr_1fr_auto_0.8fr] md:items-end">
          <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
            <PopoverTrigger asChild>
              <button type="button" className="grid gap-3 text-left md:col-span-2 md:grid-cols-2">
                <span>
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Check In</span>
                  <span className="flex h-11 items-center justify-between rounded-lg border border-stone-300 bg-stone-50 px-3.5 text-sm font-semibold text-[#283618] transition-colors hover:border-[#283618]">
                    <span>{selectedDateRange?.from ? format(selectedDateRange.from, 'dd-MM-yyyy') : 'Select date'}</span>
                    <CalendarIcon className="h-5 w-5" />
                  </span>
                </span>
                <span>
                  <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Check Out</span>
                  <span className="flex h-11 items-center justify-between rounded-lg border border-stone-300 bg-stone-50 px-3.5 text-sm font-semibold text-[#283618] transition-colors hover:border-[#283618]">
                    <span>{selectedDateRange?.from && selectedDateRange.to && selectedDateRange.to > selectedDateRange.from ? format(selectedDateRange.to, 'dd-MM-yyyy') : 'Select date'}</span>
                    <CalendarIcon className="h-5 w-5" />
                  </span>
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden rounded-2xl border border-stone-200 bg-white p-0 shadow-2xl" align="start">
              <Calendar
                mode="range"
                selected={selectedDateRange}
                onSelect={handleDateRangeSelect}
                onDayMouseEnter={setHoveredCheckoutDate}
                onDayMouseLeave={() => setHoveredCheckoutDate(undefined)}
                numberOfMonths={2}
                initialFocus
                disabled={{ before: new Date() }}
                modifiers={{ previewRange: isPreviewRangeDay }}
                modifiersClassNames={{
                  previewRange: 'bg-[#ff9900]/25 text-stone-950 rounded-none',
                }}
                className="rounded-2xl bg-white p-5"
                classNames={{
                  months: 'flex flex-col gap-6 md:flex-row',
                  month: 'space-y-5',
                  caption: 'relative flex items-center justify-center pt-1',
                  caption_label: 'text-xl font-semibold tracking-wide text-stone-950',
                  head_cell: 'w-10 rounded-md text-sm font-medium text-stone-900',
                  row: 'mt-2 flex w-full',
                  cell: 'h-10 w-10 p-0 text-center text-sm relative [&:has([aria-selected])]:bg-[#ff9900]/25 first:[&:has([aria-selected])]:rounded-l-full last:[&:has([aria-selected])]:rounded-r-full',
                  day: 'h-10 w-10 rounded-full p-0 text-base font-medium text-stone-950 hover:bg-[#ff9900]/20 hover:text-stone-950 focus:bg-[#ff9900]/20 focus:text-stone-950',
                  day_selected: 'bg-[#ff9900] text-white hover:bg-[#ff9900] hover:text-white focus:bg-[#ff9900] focus:text-white',
                  day_range_middle: 'rounded-none bg-[#ff9900]/25 text-stone-950 hover:bg-[#ff9900]/25 hover:text-stone-950',
                  day_range_end: 'day-range-end rounded-full bg-[#ff9900] text-white hover:bg-[#ff9900] hover:text-white',
                  day_disabled: 'text-stone-300 opacity-60',
                  nav_button: 'h-9 w-9 rounded-full bg-transparent p-0 text-stone-950 opacity-80 hover:bg-stone-100 hover:opacity-100',
                  nav_button_previous: 'absolute left-1',
                  nav_button_next: 'absolute right-1',
                }}
              />
            </PopoverContent>
          </Popover>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Nationality</div>
            <div className="relative">
              <select
                value={selectedNationality}
                onChange={event => setSelectedNationality(event.target.value as 'Sri Lankan' | 'Non Sri Lankan')}
                className="h-11 w-full appearance-none rounded-lg border border-stone-300 bg-stone-50 px-3.5 pr-10 text-sm font-semibold text-[#283618] outline-none transition-colors focus:border-[#283618]"
              >
                <option value="Sri Lankan">Sri Lankan</option>
                <option value="Non Sri Lankan">Non Sri Lankan</option>
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#283618]">
                {selectedNationality === 'Non Sri Lankan' ? 'USD' : 'LKR'}
              </span>
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">Promo Code</div>
            <div className="flex gap-2">
              <Input
                value={enteredPromoCode}
                onChange={event => setEnteredPromoCode(event.target.value.toUpperCase())}
                placeholder="Promo code"
                className="h-11 rounded-lg border-stone-300 bg-stone-50 px-3.5 text-sm font-semibold uppercase text-[#283618] placeholder:normal-case placeholder:font-normal placeholder:text-stone-400 focus-visible:ring-[#283618]"
              />
              <Button
                type="button"
                className="h-11 rounded-lg bg-[#283618] px-4 text-sm font-semibold text-white hover:bg-[#3d5324]"
                disabled={validatingPromo || bookingCart.length === 0 || !enteredPromoCode.trim()}
                onClick={validatePromoCode}
              >
                {validatingPromo ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
              </Button>
            </div>
          </div>
          <label className="flex h-11 cursor-pointer items-center gap-2 whitespace-nowrap rounded-lg border border-stone-200 bg-stone-50 px-3 text-sm font-semibold text-[#283618]">
            <input
              type="checkbox"
              checked={flexibleDates}
              onChange={event => setFlexibleDates(event.target.checked)}
              className="h-4 w-4 accent-[#283618]"
            />
            <span>Flexible Dates</span>
          </label>
          <Button onClick={handleSearch} className="h-11 gap-2 rounded-lg bg-[#283618] text-sm font-semibold text-white hover:bg-[#3d5324]">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
        <div className={`mx-auto mt-3 flex max-w-7xl items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
          appliedPromo
            ? 'bg-green-50 text-green-800 ring-1 ring-green-200'
            : promoError
              ? 'bg-red-50 text-red-800 ring-1 ring-red-200'
              : 'bg-[#f7f5ef] text-stone-700 ring-1 ring-stone-200'
        }`}>
          {appliedPromo ? <CheckCircle2 className="h-4 w-4" /> : <BadgePercent className="h-4 w-4" />}
          <span>{promoStatusMessage}</span>
        </div>
      </div>
      ) : null}

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
      ) : checkoutOpen && bookingCart.length > 0 ? (
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_520px]">
          <div className="space-y-6">
            {bookingCart.map((item, cartIndex) => (
              <section key={item.id} className="rounded-xl bg-white p-6 shadow-sm md:p-8">
                <h1 className="mb-6 text-2xl font-bold text-stone-950">{item.roomCategoryName}</h1>
                <div className="mb-10 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-stone-700">Check In</p>
                    <p className="text-lg font-semibold text-stone-950">{format(parseISO(checkIn), 'dd MMM yyyy')}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-700">Check Out</p>
                    <p className="text-lg font-semibold text-stone-950">{format(parseISO(checkOut), 'dd MMM yyyy')}</p>
                  </div>
                </div>

                <h2 className="mb-3 text-lg font-bold text-stone-950">Guest Details <span className="text-red-600">*</span></h2>
                {cartIndex === 0 ? (
                  <div className="mb-4 grid gap-4 md:grid-cols-2">
                    <Input placeholder="First Name" value={firstName} onChange={event => setFirstName(event.target.value)} className="h-14 text-base" />
                    <Input placeholder="Last Name" value={lastName} onChange={event => setLastName(event.target.value)} className="h-14 text-base" />
                  </div>
                ) : null}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="mb-2 block text-base">Bedding</Label>
                    <select
                      value={item.bedding}
                      onChange={event => updateCartGuestDetails(item.id, { bedding: event.target.value })}
                      className="h-14 w-full rounded-md border border-input bg-white px-4 text-base"
                    >
                      {(item.bedConfigurations?.length ? item.bedConfigurations : ['1 Twin', '1 King']).map(bed => (
                        <option key={bed}>{bed}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="mb-2 block text-base">Adult</Label>
                      <select
                        value={item.adults}
                        onChange={event => updateCartGuests(item, Number(event.target.value), item.children)}
                        className="h-14 w-full rounded-md border border-input bg-white px-4 text-base"
                      >
                        {Array.from({ length: itemGuestLimits(item).maxAdults }, (_, index) => index + 1).map(value => <option key={value}>{value}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="mb-2 block text-base">Child</Label>
                      <select
                        value={item.children}
                        onChange={event => updateCartGuests(item, item.adults, Number(event.target.value))}
                        className="h-14 w-full rounded-md border border-input bg-white px-4 text-base"
                      >
                        {Array.from({ length: maxChildrenFor(itemGuestLimits(item), item.adults) + 1 }, (_, value) => value).map(value => <option key={value}>{value}</option>)}
                      </select>
                    </div>
                    <p className="text-xs text-stone-500 sm:col-span-2">
                      Max {itemGuestLimits(item).maxAdults} adult{itemGuestLimits(item).maxAdults === 1 ? '' : 's'}, {itemGuestLimits(item).maxChildren} child{itemGuestLimits(item).maxChildren === 1 ? '' : 'ren'}, {itemGuestLimits(item).maxGuests} guest{itemGuestLimits(item).maxGuests === 1 ? '' : 's'} in total for this room.
                    </p>
                  </div>
                  {item.childAges.map((age, index) => (
                    <div key={`${item.id}-child-age-${index}`}>
                      <Label className="mb-2 block text-base">Child-{index + 1} Age <span className="text-red-600">*</span></Label>
                      <select
                        value={age}
                        onChange={event => updateCartGuestDetails(item.id, { childAges: item.childAges.map((childAge, childIndex) => childIndex === index ? Number(event.target.value) : childAge) })}
                        className="h-14 w-full rounded-md border border-input bg-white px-4 text-base"
                      >
                        <option value="">Select Age</option>
                        {Array.from({ length: 12 }, (_, value) => value).map(value => <option key={value} value={value}>{value}</option>)}
                      </select>
                    </div>
                  ))}
                  <Input
                    placeholder="Special Request"
                    value={item.specialRequest}
                    onChange={event => updateCartGuestDetails(item.id, { specialRequest: event.target.value })}
                    className="h-14 text-base"
                  />
                  <select
                    value={item.arrivalTime}
                    onChange={event => updateCartGuestDetails(item.id, { arrivalTime: event.target.value })}
                    className="h-14 w-full rounded-md border border-input bg-white px-4 text-base text-stone-600"
                  >
                    <option>01:00 pm</option>
                    <option>01:30 pm</option>
                    <option>02:00 pm</option>
                    <option>02:30 pm</option>
                    <option>03:00 pm</option>
                  </select>
                </div>
              </section>
            ))}

            <section className="rounded-xl bg-white p-6 shadow-sm md:p-8">
              <h2 className="mb-5 text-lg font-bold text-stone-950">Contact Details</h2>
              <label className="mb-8 flex items-center gap-3 text-base font-medium text-stone-900">
                <input type="checkbox" checked={bookingForSomeoneElse} onChange={event => setBookingForSomeoneElse(event.target.checked)} />
                I am booking for someone else
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="mb-2 block">Country code <span className="text-red-600">*</span></Label>
                  <PhoneNumberInput
                    id="checkout-phone"
                    value={form.customer_phone}
                    onChange={value => setForm(p => ({ ...p, customer_phone: value }))}
                    required
                  />
                </div>
                <div>
                  <Label className="mb-2 block">Email <span className="text-red-600">*</span></Label>
                  <Input
                    type="email"
                    placeholder="example@email.com"
                    value={form.customer_email}
                    onChange={event => setForm(p => ({ ...p, customer_email: event.target.value }))}
                    className="h-14 text-base"
                  />
                </div>
                <div>
                  <Label className="mb-2 block">NIC / Passport No. <span className="text-red-600">*</span></Label>
                  <Input
                    placeholder="NIC / Passport No."
                    value={form.customer_nic}
                    onChange={event => setForm(p => ({ ...p, customer_nic: event.target.value }))}
                    className="h-14 text-base"
                  />
                </div>
              </div>
            </section>
          </div>

          <aside className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-28 lg:self-start">
            <div className="mb-6 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-bold text-stone-950">Booking Details</h2>
              <Button onClick={() => setCheckoutOpen(false)} className="rounded-md bg-[#283618] px-6 text-base text-white hover:bg-[#3d5324]">
                ‹ Book more
              </Button>
            </div>
            <div className="space-y-5">
              {bookingCart.map(item => (
                <div key={`checkout-summary-${item.id}`} className="border-b pb-5">
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-stone-950">{item.roomCategoryName}</h3>
                      <p className="mt-3 text-base font-semibold text-green-700 underline underline-offset-4">{packageDisplayName({ id: item.packageId, name: item.packageName })} - {selectedNationality === 'Non Sri Lankan' ? 'Non Resident' : 'Resident'}</p>
                    </div>
                    <button type="button" onClick={() => removeCartItem(item.id)} className="text-stone-900 hover:text-red-700">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="rounded-md border p-5">
                    <div className="grid grid-cols-4 items-center gap-4 text-sm">
                      <div><p className="font-medium">Check In</p><p className="font-semibold">{format(parseISO(checkIn), 'dd MMM yyyy')}</p></div>
                      <div><p className="font-medium">Check Out</p><p className="font-semibold">{format(parseISO(checkOut), 'dd MMM yyyy')}</p></div>
                      <div className="flex items-center justify-center text-lg font-bold">{item.adults + item.children}<UserRound className="ml-1 h-4 w-4" /></div>
                      <div className="text-right font-bold">{formatBillAmount(item.discountedSubtotal, item.currency, item.usdToLkrRate)}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between font-bold">
                    <span>Sub Total</span>
                    <span>{formatBillAmount(item.discountedSubtotal, item.currency, item.usdToLkrRate)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={`mb-5 rounded-md border p-5 ${
              appliedPromo ? 'border-green-200 bg-green-50' : promoError ? 'border-red-200 bg-red-50' : 'border-stone-200 bg-stone-50'
            }`}>
              <label className="mb-2 flex items-center gap-2 text-sm font-bold text-stone-800" htmlFor="checkout-promo-code">
                <BadgePercent className="h-4 w-4" />
                Promo Code
              </label>
              <Input
                id="checkout-promo-code"
                value={enteredPromoCode}
                onChange={event => setEnteredPromoCode(event.target.value.toUpperCase())}
                placeholder="Enter promo code"
                className="h-11 bg-white uppercase"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="h-10 rounded-md bg-[#283618] px-4 font-bold text-white hover:bg-[#3d5324]"
                  disabled={validatingPromo || bookingCart.length === 0 || !enteredPromoCode.trim()}
                  onClick={validatePromoCode}
                >
                  {validatingPromo ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgePercent className="mr-2 h-4 w-4" />}
                  Apply
                </Button>
                {enteredPromoCode.trim() ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-10 rounded-md px-4 font-bold"
                    onClick={clearPromoCode}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Remove
                  </Button>
                ) : null}
              </div>
              <p className={`mt-2 text-sm font-semibold ${appliedPromo ? 'text-green-700' : promoError ? 'text-red-700' : 'text-stone-600'}`}>
                {promoStatusMessage}
              </p>
            </div>
            <div className="mb-6 rounded-md border border-stone-200 p-5">
              <h3 className="mb-4 text-lg font-bold">Price Summary</h3>
              <div className="space-y-3 border-t pt-4 text-sm font-semibold text-stone-700">
                <div className="flex justify-between">
                  <span>Room Total</span>
                  <span>{formatBillAmount(cartSubtotal, bookingCart[0].currency, bookingCart[0].usdToLkrRate)}</span>
                </div>
                {promoDiscount > 0 ? (
                  <div className="flex justify-between text-green-700">
                    <span>Promo Discount ({appliedPromo?.code}{promoDiscountLabel ? ` - ${promoDiscountLabel}` : ''})</span>
                    <span>-{formatBillAmount(promoDiscount, cartCurrency, cartUsdToLkrRate)}</span>
                  </div>
                ) : null}
                {cartServiceCharge > 0 ? (
                  <div className="flex justify-between">
                    <span>Service Charge ({billSettings.service_charge_pct}%)</span>
                    <span>{formatBillAmount(cartServiceCharge, bookingCart[0].currency, bookingCart[0].usdToLkrRate)}</span>
                  </div>
                ) : null}
                {cartVat > 0 ? (
                  <div className="flex justify-between">
                    <span>VAT ({billSettings.vat_pct}%)</span>
                    <span>{formatBillAmount(cartVat, bookingCart[0].currency, bookingCart[0].usdToLkrRate)}</span>
                  </div>
                ) : null}
                {cartSscl > 0 ? (
                  <div className="flex justify-between">
                    <span>SSCL ({billSettings.sscl_pct}%)</span>
                    <span>{formatBillAmount(cartSscl, bookingCart[0].currency, bookingCart[0].usdToLkrRate)}</span>
                  </div>
                ) : null}
              </div>
              <div className="mt-4 flex justify-between border-t pt-4 font-bold">
                <span>Total</span>
                <span>{formatBillAmount(payableTotal, cartCurrency, cartUsdToLkrRate)}</span>
              </div>
            </div>
            <h3 className="mb-4 text-lg font-bold">Payment Options</h3>
            <div className="mb-3 rounded-md border border-[#283618] bg-[#f7f5ef] p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 text-base font-semibold transition ${
                  paymentOption === 'half' ? 'border-[#283618] bg-white text-[#283618]' : 'border-stone-200 bg-white/70 text-stone-700'
                }`}>
                  <input
                    type="radio"
                    name="paymentOption"
                    checked={paymentOption === 'half'}
                    onChange={() => setPaymentOption('half')}
                  />
                  Half Payment
                </label>
                <label className={`flex cursor-pointer items-center gap-3 rounded-md border p-4 text-base font-semibold transition ${
                  paymentOption === 'full' ? 'border-[#283618] bg-white text-[#283618]' : 'border-stone-200 bg-white/70 text-stone-700'
                }`}>
                  <input
                    type="radio"
                    name="paymentOption"
                    checked={paymentOption === 'full'}
                    onChange={() => setPaymentOption('full')}
                  />
                  Full Payment
                </label>
              </div>
              <div className="mt-5 space-y-2 border-t pt-4 font-bold">
                <div className="flex justify-between gap-4">
                  <span>Total Bill</span>
                  <span>{formatBillAmount(payableTotal, cartCurrency, cartUsdToLkrRate)}</span>
                </div>
                <div className="flex justify-between gap-4 text-[#283618]">
                  <span>Payment Required</span>
                  <span>{formatBillAmount(paymentRequired, cartCurrency, cartUsdToLkrRate)}</span>
                </div>
                {paymentOption === 'half' ? (
                  <div className="flex justify-between gap-4 text-sm font-semibold text-stone-600">
                    <span>Balance Due</span>
                    <span>{formatBillAmount(payableTotal - paymentRequired, cartCurrency, cartUsdToLkrRate)}</span>
                  </div>
                ) : null}
              </div>
            </div>
            <label className="mb-3 flex items-start gap-3 text-sm">
              <input type="checkbox" checked={termsAccepted} onChange={event => setTermsAccepted(event.target.checked)} />
              <span>By booking, you have agreed to our <span className="text-green-700 underline">Terms and Conditions</span> | <span className="text-green-700 underline">Payment Terms</span></span>
            </label>
            <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-stone-600">
              <ShieldCheck className="h-4 w-4 text-green-700" />
              Your booking request is sent securely to Oruthota Chalets.
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="mt-5 h-14 w-full rounded-md bg-[#283618] text-lg text-white hover:bg-[#3d5324]">
              {submitting ? 'Submitting...' : 'Pay Now'}
            </Button>
          </aside>
        </div>
      ) : (
        <div className={bookingCart.length > 0 ? "grid gap-6 lg:grid-cols-[1fr_520px]" : "space-y-6"}>
          <div className="space-y-4">
              {flexibleDates && availabilityDates.length > 0 ? (
                <div className="space-y-6">
                  {roomCategories.map(category => {
                    const categoryRates = packages
                      .map(pkg => ({ pkg, rate: findRate(category.id, pkg.id, selectedNationality) }))
                      .filter(item => item.rate);
                    const selectedCategoryRoomCount = selectedRoomCountForCategory(category.id);

                    if (categoryRates.length === 0) return null;

                    return (
                      <section key={`flex-${category.id}`} className="overflow-hidden rounded-xl bg-white shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[1120px] border-collapse text-sm">
                            <thead>
                              <tr className="bg-[#283618] text-white">
                                <th className="w-[330px] border-r border-white/35 px-4 py-4 text-left align-top">
                                  <div className="text-xl font-bold">{category.name}</div>
                                  <button
                                    type="button"
                                    onClick={() => setInfoRoomCategory(category)}
                                    className="mt-1 text-sm font-medium underline underline-offset-4"
                                  >
                                    More Info ↗
                                  </button>
                                </th>
                                {availabilityDates.map(slot => (
                                  <th key={`${category.id}-${slot.date}`} className="w-[110px] border-r border-white/35 px-3 py-4 text-center">
                                    <div className="font-bold">{format(parseISO(slot.date), 'EEE')}</div>
                                    <div className="font-semibold">{format(parseISO(slot.date), 'd MMM')}</div>
                                  </th>
                                ))}
                                <th className="w-[110px] px-3 py-4 text-center">Room(s)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {categoryRates.map(({ pkg, rate }) => {
                                const resolvedRate = resolveRateForNationality(rate as ChaletRate, selectedNationality);
                                const missingRate = 'missingRate' in resolvedRate && resolvedRate.missingRate;
                                const featureLabels = packageFeatureLabels(pkg);

                                return (
                                  <tr key={`flex-${category.id}-${pkg.id}`} className="border-b border-stone-200 last:border-b-0">
                                    <td className="border-r border-stone-200 px-4 py-4 align-top">
                                      <div className="font-bold text-stone-950">
                                        {packageDisplayName(pkg)} - {selectedNationality === 'Non Sri Lankan' ? 'Non Resident' : 'Resident'}
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setInfoPackage({ pkg, category, rate: rate as ChaletRate })}
                                        className="mt-2 text-sm font-semibold text-green-700 underline underline-offset-4"
                                      >
                                        More Info ↗
                                      </button>
                                      <div className="mt-3 flex flex-wrap gap-2">
                                        {featureLabels.slice(0, 2).map((label, index) => (
                                          <span key={`flex-${pkg.id}-${label}-${index}`} className="inline-flex items-center gap-2 rounded border border-stone-300 px-2 py-1 text-xs font-semibold text-stone-700">
                                            {index === 0 && pkg.includes_breakfast ? <Coffee className="h-4 w-4" /> : <Utensils className="h-4 w-4" />}
                                            {label}
                                          </span>
                                        ))}
                                      </div>
                                    </td>
                                    {availabilityDates.map(slot => {
                                      const availableForDate = Number(slot.categories?.[category.id] ?? 0);
                                      const remainingForDate = Math.max(0, availableForDate - selectedCategoryRoomCount);
                                      const selectedDate = slot.date === checkIn;
                                      const disabled = missingRate || remainingForDate <= 0;

                                      return (
                                        <td key={`flex-${category.id}-${pkg.id}-${slot.date}`} className={`border-r border-stone-200 p-0 text-center ${disabled ? 'bg-stone-100' : selectedDate ? 'bg-[#eef1e4]' : 'bg-white'}`}>
                                          <button
                                            type="button"
                                            onClick={() => selectFlexibleDate(slot.date, category.id, pkg.id)}
                                            disabled={disabled}
                                            className={`flex h-full min-h-[86px] w-full flex-col items-center justify-center gap-1 px-2 py-3 font-bold transition-colors ${
                                              disabled
                                                ? 'cursor-not-allowed text-stone-400'
                                                : 'text-stone-950 hover:bg-green-50 focus:bg-green-50'
                                            }`}
                                            aria-label={disabled ? `${category.name} unavailable on ${slot.date}` : `Select ${category.name} on ${slot.date}`}
                                          >
                                            {disabled ? (
                                              <span className="text-2xl font-semibold">X</span>
                                            ) : (
                                              <>
                                                {resolvedRate.displayDiscountPerNight > 0 ? (
                                                  <span className="text-xs text-red-700 line-through">
                                                    {formatMoney(resolvedRate.displayOriginalRatePerNight, resolvedRate.currency)}
                                                  </span>
                                                ) : null}
                                                <span className="text-lg">{formatMoney(resolvedRate.displayRatePerNight, resolvedRate.currency)}</span>
                                                <span className="text-[11px] font-semibold text-stone-500">{remainingForDate} left</span>
                                              </>
                                            )}
                                          </button>
                                        </td>
                                      );
                                    })}
                                    <td className="px-3 py-4 text-center align-middle">
                                      <Button
                                        onClick={() => selectOffer(category.id, pkg.id)}
                                        disabled={missingRate || Math.max(0, Number(category.available_room_count ?? 0) - selectedCategoryRoomCount) <= 0}
                                        className="h-9 rounded-full bg-white px-5 font-bold text-[#283618] ring-1 ring-stone-300 hover:bg-[#283618] hover:text-white"
                                      >
                                        Book
                                      </Button>
                                      <p className="mt-2 text-xs font-semibold text-stone-600">
                                        {Math.max(0, Number(category.available_room_count ?? 0) - selectedCategoryRoomCount)} available
                                      </p>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    );
                  })}
                </div>
              ) : null}
              {!flexibleDates ? roomCategories.map(category => {
                const categoryImages = roomImages(category);
                const categoryImageIndex = roomImageIndexes[category.id] ?? 0;
                const categoryImage = categoryImages[categoryImageIndex % categoryImages.length] || '/rooms-01.jpg';
                const availableRoomCount = Number(category.available_room_count ?? 0);
                const selectedCategoryRoomCount = selectedRoomCountForCategory(category.id);
                const remainingRoomCount = Math.max(0, availableRoomCount - selectedCategoryRoomCount);
                const categoryRates = packages
                  .map(pkg => ({ pkg, rate: findRate(category.id, pkg.id, selectedNationality) }))
                  .filter(item => item.rate);

                if (categoryRates.length === 0) return null;

                return (
                  <div key={category.id} className="grid gap-4 overflow-hidden rounded-2xl border border-stone-200 bg-white p-3 shadow-sm md:p-4 lg:grid-cols-[400px_1fr]">
                    <div className="relative h-[220px] overflow-hidden rounded-xl bg-stone-100 lg:h-full lg:min-h-[260px]">
                      <span className={`absolute left-3 top-3 z-10 rounded-full px-3 py-1 text-xs font-semibold text-white shadow ${remainingRoomCount > 0 ? 'bg-[#bc6c25]' : 'bg-stone-700'}`}>
                        {remainingRoomCount > 0
                          ? `Last ${remainingRoomCount} Room${remainingRoomCount === 1 ? '' : 's'}`
                          : 'Sold Out'}
                      </span>
                      <img src={categoryImage} alt={category.name} className="h-full w-full object-cover" />
                      {categoryImages.length > 1 ? (
                        <>
                          <button
                            type="button"
                            onClick={() => changeRoomImage(category, -1)}
                            className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/30 transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label={`Previous image for ${category.name}`}
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => changeRoomImage(category, 1)}
                            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-lg ring-1 ring-white/30 transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                            aria-label={`Next image for ${category.name}`}
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </>
                      ) : null}
                      <span className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
                        {categoryImageIndex + 1} / {categoryImages.length}
                      </span>
                    </div>
                    <div className="px-1 py-1">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
                        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <h3 className="text-lg font-bold text-[#283618] md:text-xl">{category.name}</h3>
                          <span className="text-xs font-semibold text-stone-500">{remainingRoomCount} room{remainingRoomCount === 1 ? '' : 's'} available</span>
                          <button
                            type="button"
                            onClick={() => setInfoRoomCategory(category)}
                            className="text-sm font-medium text-[#606C38] underline underline-offset-4 hover:text-[#283618]"
                          >
                            More Info ↗
                          </button>
                        </div>
                        <div className="flex gap-2 text-sm font-semibold text-stone-700">
                          {category.max_guests ? (
                            <Popover>
                              <PopoverTrigger asChild>
                                <button type="button" className="inline-flex h-8 items-center gap-1 rounded-full bg-stone-100 px-2.5 transition-colors hover:bg-stone-200" aria-label="View guest limits">
                                  <UserRound className="h-4 w-4" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-72 rounded-md border-stone-200 bg-white p-0 shadow-xl">
                                <div className="divide-y divide-stone-200 px-4 py-2 text-stone-800">
                                  <div className="flex items-center justify-between gap-4 py-3">
                                    <div className="flex items-center gap-3 text-lg">
                                      <UserRound className="h-5 w-5 text-stone-500" />
                                      <span>Adults</span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                      <span className="text-sm font-semibold uppercase tracking-widest text-stone-500">Max</span>
                                      <span className="text-xl font-bold text-stone-950">{chaletGuestLimits(category).maxAdults}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 py-3">
                                    <div className="flex items-center gap-3 text-lg">
                                      <UserRound className="h-5 w-5 text-stone-500" />
                                      <span>Children</span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                      <span className="text-sm font-semibold uppercase tracking-widest text-stone-500">Max</span>
                                      <span className="text-xl font-bold text-stone-950">{chaletGuestLimits(category).maxChildren}</span>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between gap-4 py-3">
                                    <div className="flex items-center gap-3 text-lg">
                                      <CircleUserRound className="h-5 w-5 text-stone-500" />
                                      <span>Guests Allowed</span>
                                    </div>
                                    <div className="flex items-baseline gap-3">
                                      <span className="text-sm font-semibold uppercase tracking-widest text-stone-500">Max</span>
                                      <span className="text-xl font-bold text-stone-950">{category.max_guests}</span>
                                    </div>
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                          ) : null}
                          {category.area_sqm ? (
                            <span className="inline-flex h-8 items-center gap-1.5 rounded-full bg-stone-100 px-3 text-xs"><Maximize2 className="h-3.5 w-3.5" /> {category.area_sqm} m²</span>
                          ) : null}
                          <Popover>
                            <PopoverTrigger asChild>
                              <button type="button" className="inline-flex h-8 items-center gap-1 rounded-full bg-stone-100 px-2.5 transition-colors hover:bg-stone-200" aria-label="View bedding configuration">
                                <BedDouble className="h-4 w-4" />
                              </button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-72 rounded-md border-stone-200 bg-white p-0 shadow-xl">
                              <div className="px-4 py-4 text-stone-800">
                                <h4 className="mb-3 text-lg font-bold text-stone-950">Bedding Configuration</h4>
                                <div className="space-y-2">
                                  {(category.bed_configurations?.length ? category.bed_configurations : ['King or Twin bedding']).map((bed, index) => (
                                    <div key={`${category.id}-bed-${index}`} className="flex items-center gap-3 rounded bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700">
                                      <BedDouble className="h-4 w-4 text-stone-500" />
                                      <span>{bed}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <div className="divide-y">
                        {categoryRates.map(({ pkg, rate }) => {
                          const resolvedRate = resolveRateForNationality(rate as ChaletRate, selectedNationality);
                          const ratePerNight = resolvedRate.displayRatePerNight;
                          const originalSubtotal = resolvedRate.displayOriginalRatePerNight * nights;
                          const subtotal = ratePerNight * nights;
                          const discountTotal = resolvedRate.displayDiscountPerNight * nights;
                          const rowTotal = subtotal;
                          const originalRowTotal = originalSubtotal;
                          const offerPercent = discountPercent(originalSubtotal, subtotal);
                          const active = selectedRoomCategoryId === category.id && selectedPackageId === pkg.id;
                          const featureLabels = packageFeatureLabels(pkg);
                          const missingRate = 'missingRate' in resolvedRate && resolvedRate.missingRate;
                          const hasDiscount = !missingRate && discountTotal > 0;
                          const offerName = rate?.offer_name || 'Special Offer';
                          const discountLabel = rateDiscountLabel(rate as ChaletRate, selectedNationality, resolvedRate.currency);
                          const quantityKey = roomQuantityKey(category.id, pkg.id);
                          const selectedQuantity = Math.min(roomQuantities[quantityKey] ?? 1, Math.max(1, remainingRoomCount));
                          return (
                            <div key={`${category.id}-${pkg.id}`} className={`grid gap-3 rounded-xl px-3 py-4 transition-colors xl:grid-cols-[1fr_auto_170px_auto] xl:items-center xl:gap-5 ${active ? 'bg-[#f3f5ec]' : 'hover:bg-stone-50'}`}>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                  <h4 className="text-base font-semibold text-stone-900">{packageDisplayName(pkg)} <span className="font-normal text-stone-500">· {selectedNationality === 'Non Sri Lankan' ? 'Non Resident' : 'Resident'}</span></h4>
                                  <button
                                    type="button"
                                    onClick={() => setInfoPackage({ pkg, category, rate: rate as ChaletRate })}
                                    className="text-sm font-medium text-[#606C38] underline underline-offset-4 hover:text-[#283618]"
                                  >
                                    Details
                                  </button>
                                </div>
                                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                  {featureLabels.map((label, index) => (
                                    <span key={`${pkg.id}-${label}-${index}`} className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700">
                                      {index === 0 && pkg.includes_breakfast ? <Coffee className="h-3.5 w-3.5" /> : <Utensils className="h-3.5 w-3.5" />}
                                      {label}
                                    </span>
                                  ))}
                                  {hasDiscount ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200" title={discountLabel}>
                                      <BadgePercent className="h-3.5 w-3.5" />
                                      {offerName}: {offerPercent > 0 ? `${Math.round(offerPercent)}% off · ` : ''}Save {formatMoney(discountTotal, resolvedRate.currency)}
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                              <div className="flex items-center gap-4 xl:gap-5">
                                <span className="inline-flex items-center gap-1 text-sm font-medium text-stone-600" title="Maximum guests per room">
                                  <CircleUserRound className="h-4 w-4" /> Up to {category.max_guests || 2}
                                </span>
                                <label className="flex items-center gap-2 text-sm text-stone-600">
                                  Rooms
                                  <select
                                    value={remainingRoomCount > 0 ? selectedQuantity : 0}
                                    onChange={event => setRoomQuantities(prev => ({ ...prev, [quantityKey]: Number(event.target.value) }))}
                                    disabled={remainingRoomCount <= 0 || missingRate}
                                    className="h-9 w-16 rounded-lg border border-stone-300 bg-white px-2 text-sm font-semibold text-stone-800 disabled:bg-stone-100 disabled:text-stone-400"
                                  >
                                    {Array.from({ length: remainingRoomCount + 1 }, (_, count) => (
                                      <option key={count} value={count} disabled={count === 0}>{count}</option>
                                    ))}
                                  </select>
                                </label>
                              </div>
                              <div className="flex items-baseline justify-between gap-3 xl:block xl:text-right">
                                {missingRate ? (
                                  <p className="text-sm font-bold text-red-700">Rate not set</p>
                                ) : (
                                  <>
                                    <div>
                                      {hasDiscount ? <p className="text-xs font-medium text-stone-400 line-through">{formatMoney(originalRowTotal, resolvedRate.currency)}</p> : null}
                                      <p className="text-xl font-bold text-stone-950">{formatMoney(rowTotal, resolvedRate.currency)}</p>
                                    </div>
                                    <p className="text-xs text-stone-500">
                                      {formatMoney(ratePerNight, resolvedRate.currency)} / night · {nights} night{nights !== 1 ? 's' : ''}
                                    </p>
                                  </>
                                )}
                              </div>
                              <Button
                                onClick={() => selectOffer(category.id, pkg.id, selectedQuantity)}
                                disabled={missingRate || remainingRoomCount <= 0}
                                className="h-10 w-full rounded-lg bg-[#283618] px-6 text-sm font-semibold text-white hover:bg-[#3d5324] xl:w-auto"
                              >
                                {remainingRoomCount <= 0 ? 'Sold Out' : 'Book'}
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }) : null}
            </div>

          {bookingCart.length > 0 ? (
            <aside className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
              <h2 className="mb-5 text-2xl font-bold text-stone-950">Booking Details</h2>
              <div className="space-y-6">
                {bookingCart.map(item => (
                  <div key={item.id} className="border-b pb-5">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-stone-950">{item.roomCategoryName}</h3>
                        <p className="mt-2 text-sm font-semibold text-green-700 underline underline-offset-4">
                          {packageDisplayName({ id: item.packageId, name: item.packageName })} - {selectedNationality === 'Non Sri Lankan' ? 'Non Resident' : 'Resident'}
                        </p>
                      </div>
                      <button type="button" onClick={() => removeCartItem(item.id)} className="text-xl font-bold text-stone-700">⌫</button>
                    </div>
                    <div className="rounded-md border p-4">
                      <div className="grid grid-cols-4 items-center gap-3 text-sm">
                        <div><p className="font-medium">Check In</p><p className="font-semibold">{format(parseISO(checkIn), 'dd MMM yyyy')}</p></div>
                        <div><p className="font-medium">Check Out</p><p className="font-semibold">{format(parseISO(checkOut), 'dd MMM yyyy')}</p></div>
                        <div className="flex items-center justify-center text-lg font-bold">{item.adults + item.children}<UserRound className="ml-1 h-4 w-4" /></div>
                        <div className="text-right font-bold">{formatBillAmount(item.discountedSubtotal, item.currency, item.usdToLkrRate)}</div>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between text-sm font-bold">
                      <span>Sub Total</span>
                      <span>{formatBillAmount(item.discountedSubtotal, item.currency, item.usdToLkrRate)}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-md border p-5">
                <h3 className="mb-4 text-lg font-bold">Price Summary</h3>
                <div className="space-y-3 border-t pt-4 text-sm font-semibold text-stone-700">
                  <div className="flex justify-between">
                    <span>Room Total</span>
                    <span>{formatBillAmount(cartSubtotal, bookingCart[0].currency, bookingCart[0].usdToLkrRate)}</span>
                  </div>
                  {promoDiscount > 0 ? (
                    <div className="flex justify-between text-green-700">
                      <span>Promo Discount ({appliedPromo?.code}{promoDiscountLabel ? ` - ${promoDiscountLabel}` : ''})</span>
                      <span>-{formatBillAmount(promoDiscount, cartCurrency, cartUsdToLkrRate)}</span>
                    </div>
                  ) : null}
                  {cartServiceCharge > 0 ? (
                    <div className="flex justify-between">
                      <span>Service Charge ({billSettings.service_charge_pct}%)</span>
                      <span>{formatBillAmount(cartServiceCharge, bookingCart[0].currency, bookingCart[0].usdToLkrRate)}</span>
                    </div>
                  ) : null}
                  {cartVat > 0 ? (
                    <div className="flex justify-between">
                      <span>VAT ({billSettings.vat_pct}%)</span>
                      <span>{formatBillAmount(cartVat, bookingCart[0].currency, bookingCart[0].usdToLkrRate)}</span>
                    </div>
                  ) : null}
                  {cartSscl > 0 ? (
                    <div className="flex justify-between">
                      <span>SSCL ({billSettings.sscl_pct}%)</span>
                      <span>{formatBillAmount(cartSscl, bookingCart[0].currency, bookingCart[0].usdToLkrRate)}</span>
                    </div>
                  ) : null}
                </div>
                <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatBillAmount(payableTotal, cartCurrency, cartUsdToLkrRate)}</span>
                </div>
              </div>
              {enteredPromoCode.trim() ? (
                <div className={`mt-5 flex items-center gap-2 rounded-md px-4 py-3 text-sm font-semibold ${
                  appliedPromo ? 'bg-green-50 text-green-800 ring-1 ring-green-200' : promoError ? 'bg-red-50 text-red-800 ring-1 ring-red-200' : 'bg-stone-50 text-stone-700 ring-1 ring-stone-200'
                }`}>
                  {appliedPromo ? <CheckCircle2 className="h-4 w-4" /> : <BadgePercent className="h-4 w-4" />}
                  <span>{promoStatusMessage}</span>
                </div>
              ) : null}
              <Button onClick={() => setCheckoutOpen(true)} className="mt-5 h-14 w-full rounded-md border border-[#283618] bg-white text-lg font-bold text-[#283618] hover:bg-[#283618] hover:text-white">
                Complete Booking
              </Button>
            </aside>
          ) : null}
        </div>
      )}

      <Dialog open={!!infoPackage} onOpenChange={(open) => !open && setInfoPackage(null)}>
        <DialogContent
          hideCloseButton
          className="left-auto right-0 top-0 h-screen max-h-screen w-full max-w-[720px] translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-white p-0 shadow-2xl data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:rounded-none"
        >
          {infoPackage ? (() => {
            const packageName = packageDisplayName(infoPackage.pkg);
            const mealPlanLabel = infoPackage.pkg.meal_plan?.trim() || packageFeatureLabels(infoPackage.pkg)[0] || packageName;
            const mealPlanDetails = infoPackage.pkg.chalet_meal_plans;
            const foodItems = Array.isArray(mealPlanDetails?.food_items) ? mealPlanDetails.food_items : [];
            const otherCosts = Array.isArray(mealPlanDetails?.other_costs) ? mealPlanDetails.other_costs : [];

            return (
              <div className="px-6 py-8 md:px-12 md:py-12">
                <DialogTitle className="sr-only">{packageName} package details</DialogTitle>
                <div className="mb-10 flex items-start justify-between gap-6">
                  <div>
                    <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-green-700">{infoPackage.category.name}</p>
                    <h2 className="text-2xl font-bold text-stone-950">
                      {packageName} - {selectedNationality === 'Non Sri Lankan' ? 'Non Resident' : 'Resident'}
                    </h2>
                    {infoPackage.pkg.description ? (
                      <p className="mt-4 max-w-xl text-base leading-7 text-stone-700">{infoPackage.pkg.description}</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => setInfoPackage(null)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-950"
                    aria-label="Close package details"
                  >
                    <X className="h-7 w-7" />
                  </button>
                </div>

                <div className="space-y-8">
                  <div>
                    <img
                      src="https://cfstatic.staah.net/h*600/medium_1660550307_841_1604685330245.jpg?k=582NDd1GCXaKzrEjZS5RVGUnFGCpeYrjmgkwMQ=="
                      alt="Cuisine"
                      className="h-64 w-full rounded-md object-cover"
                    />
                  </div>

	                  <div>
	                    <h3 className="mb-4 text-xl font-bold text-stone-950">Cuisine</h3>
	                    <div className="overflow-hidden rounded-md border border-stone-200">
                      <div className="grid grid-cols-[140px_1fr] border-b border-stone-200 text-sm">
                        <div className="bg-stone-50 px-4 py-3 font-bold text-stone-900">Child Age</div>
                        <div className="px-4 py-3 font-semibold text-stone-700">6 - 11 Years</div>
                      </div>
                      <div className="grid grid-cols-[140px_1fr] border-b border-stone-200 text-sm">
                        <div className="bg-stone-50 px-4 py-3 font-bold text-stone-900">Infant Age</div>
                        <div className="px-4 py-3 font-semibold text-stone-700">0 - 5 Years</div>
                      </div>
                      <div className="grid grid-cols-[140px_1fr] text-sm">
                        <div className="bg-stone-50 px-4 py-3 font-bold text-stone-900">Meal Plan</div>
                        <div className="flex items-center gap-2 px-4 py-3 font-semibold text-stone-700">
                          {mealPlanLabel}
                          <Coffee className="h-5 w-5 text-green-700" />
                        </div>
                      </div>
	                    </div>
	                  </div>

	                  {foodItems.length > 0 ? (
	                    <div>
	                      <h3 className="mb-4 text-xl font-bold text-stone-950">Food Items</h3>
	                      <div className="overflow-hidden rounded-md border border-stone-200">
	                        {foodItems.map((item, index) => (
	                          <div key={item.id || `${item.name}-${index}`} className={`grid grid-cols-[1fr_140px] text-sm ${index < foodItems.length - 1 ? 'border-b border-stone-200' : ''}`}>
	                            <div className="px-4 py-3 font-semibold text-stone-700">{item.name}</div>
	                            <div className="bg-stone-50 px-4 py-3 text-right font-bold text-stone-900">
	                              {formatMoney(Number(item.rate || 0), selectedNationality === 'Non Sri Lankan' ? 'USD' : 'LKR')}
	                            </div>
	                          </div>
	                        ))}
	                      </div>
	                    </div>
	                  ) : null}

	                  {otherCosts.length > 0 ? (
	                    <div>
	                      <h3 className="mb-4 text-xl font-bold text-stone-950">Other Costs</h3>
	                      <div className="overflow-hidden rounded-md border border-stone-200">
	                        {otherCosts.map((item, index) => (
	                          <div key={item.id || `${item.name}-${index}`} className={`grid grid-cols-[1fr_140px] text-sm ${index < otherCosts.length - 1 ? 'border-b border-stone-200' : ''}`}>
	                            <div className="px-4 py-3 font-semibold text-stone-700">{item.name}</div>
	                            <div className="bg-stone-50 px-4 py-3 text-right font-bold text-stone-900">
	                              {formatMoney(Number(item.rate || 0), selectedNationality === 'Non Sri Lankan' ? 'USD' : 'LKR')}
	                            </div>
	                          </div>
	                        ))}
	                      </div>
	                    </div>
	                  ) : null}

	                  <div>
                    <h3 className="mb-3 text-xl font-bold text-stone-950">Child Policy</h3>
                    <p className="text-sm leading-7 text-stone-700">
                      0 - 04.99 years - Free of charge sharing parents room on basis booked (No extra bed provided)
                      <br />
                      5 - 11.99 years - 50% discount on the sharing double rate on basis booked
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-bold text-stone-950">Extra Bed Policy</h3>
                    <p className="text-sm leading-7 text-stone-700">15 USD Per Bed Per Night</p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-bold text-stone-950">Cancellation Policy</h3>
                    <p className="text-sm leading-7 text-stone-700">
                      Free Cancellation - No cancellation charges is applied incase the booking is cancelled before 14 days of the arrival date.
                      <br />
                      <br />
                      If the cancellation is made within 14 days of arrival, 100% of the stay will be charged.
                      <br />
                      <br />
                      Your card will be charged for entire stay by the hotel, any time after the booking is made.
                      <br />
                      <br />
                      The booking will not be guaranteed and will be auto cancelled by the hotel, in case of invalid credit card or payment not received.
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-3 text-xl font-bold text-stone-950">Privacy Statement</h3>
                    <p className="text-sm leading-7 text-stone-700">
                      Oruthota Chalets is committed to privacy for everyone who accesses our website. This site only collects personal data about you as needed to provide you with outstanding service, and to help process your request or provide you with information.
                    </p>
                  </div>
                </div>
              </div>
            );
          })() : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!infoRoomCategory} onOpenChange={(open) => !open && setInfoRoomCategory(null)}>
        <DialogContent
          hideCloseButton
          className="left-auto right-0 top-0 h-screen max-h-screen w-full max-w-[1080px] translate-x-0 translate-y-0 overflow-y-auto rounded-none border-0 bg-white p-0 shadow-2xl data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:rounded-none"
        >
          {infoRoomCategory ? (
            <div className="px-6 py-8 md:px-14 md:py-12">
              <DialogTitle className="sr-only">{infoRoomCategory.name} room details</DialogTitle>
              <div className="mb-12 flex items-start justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-bold text-stone-950">{infoRoomCategory.name}</h2>
                    {infoRoomCategory.max_guests ? (
                      <span className="inline-flex h-8 items-center rounded bg-stone-100 px-2 text-stone-900">
                        <UserRound className="h-4 w-4" />
                      </span>
                    ) : null}
                    {infoRoomCategory.bed_configurations?.length ? (
                      <span className="inline-flex h-8 items-center rounded bg-stone-100 px-2 text-stone-900">
                        <BedDouble className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-stone-700">
                    {infoRoomCategory.area_sqm ? <span>{infoRoomCategory.area_sqm} square meters</span> : null}
                    {infoRoomCategory.max_guests ? <span>Up to {infoRoomCategory.max_guests} guests</span> : null}
                    {infoRoomCategory.available_room_count ? <span>{infoRoomCategory.available_room_count} available</span> : null}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setInfoRoomCategory(null)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-950"
                  aria-label="Close room details"
                >
                  <X className="h-7 w-7" />
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[420px_1fr] lg:items-start">
                <div className="relative h-[295px] overflow-hidden bg-stone-100">
                  <img src={roomInfoImage} alt={infoRoomCategory.name} className="h-full w-full object-cover" />
                  {roomInfoImages.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => changeRoomInfoImage(-1)}
                        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/30 transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label={`Previous image for ${infoRoomCategory.name}`}
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        type="button"
                        onClick={() => changeRoomInfoImage(1)}
                        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/30 transition hover:bg-black/75 focus:outline-none focus:ring-2 focus:ring-white"
                        aria-label={`Next image for ${infoRoomCategory.name}`}
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  ) : null}
                  <span className="absolute bottom-4 left-4 rounded bg-black px-3 py-1.5 text-sm font-semibold text-white">
                    {roomInfoImageIndex + 1} / {roomInfoImages.length} Images
                  </span>
                </div>

                <p className="max-w-xl text-base font-medium leading-8 text-stone-900">
                  {roomInfoDescription}
                </p>
              </div>

              <div className="mt-14">
                <h3 className="text-2xl font-bold text-stone-950">Facilities</h3>
                <div className="mt-5 grid gap-8 md:grid-cols-3">
                  <div>
                    <h4 className="mb-3 text-base font-bold text-stone-950">Bathroom Features</h4>
                    <div className="space-y-3">
                      {(infoRoomCategory.bathroom_features?.length ? infoRoomCategory.bathroom_features : ['Shower']).map((feature, index) => (
                        <div key={`bathroom-${index}`} className="flex items-center gap-3 text-sm font-medium text-stone-900">
                          <ShowerHead className="h-5 w-5" />
                          {featureName(feature)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-base font-bold text-stone-950">Entertainment</h4>
                    <div className="space-y-3 text-sm font-medium text-stone-900">
                      {(infoRoomCategory.entertainment_features?.length ? infoRoomCategory.entertainment_features : ['Satellite / Cable TV']).map((feature, index) => (
                        <div key={`entertainment-${index}`} className="flex items-center gap-3">
                          <Tv className="h-5 w-5" />
                          {featureName(feature)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-base font-bold text-stone-950">General Amenities</h4>
                    <div className="space-y-3">
                      {(infoRoomCategory.general_amenities?.length ? infoRoomCategory.general_amenities : ['Air Conditioning']).map((feature, index) => (
                        <div key={`amenity-${index}`} className="flex items-center gap-3 text-sm font-medium text-stone-900">
                          <Wind className="h-5 w-5" />
                          {featureName(feature)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-base font-bold text-stone-950">Internet</h4>
                    <div className="space-y-3">
                      {(infoRoomCategory.internet_features?.length ? infoRoomCategory.internet_features : ['FREE WiFi']).map((feature, index) => (
                        <div key={`internet-${index}`} className="flex items-center gap-3 text-sm font-medium text-stone-900">
                          <Wifi className="h-5 w-5" />
                          {featureName(feature)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="mb-3 text-base font-bold text-stone-950">Room Comfort</h4>
                    <div className="flex items-center gap-3 text-sm font-medium text-stone-900">
                      <Check className="h-5 w-5" />
                      Daily Housekeeping
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-2xl font-bold text-stone-950">Bedding Configuration</h3>
                <p className="mt-4 text-sm font-medium text-stone-900">
                  {infoRoomCategory.bed_configurations?.length ? infoRoomCategory.bed_configurations.join(' or ') : 'King or Twin bedding'}
                </p>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
