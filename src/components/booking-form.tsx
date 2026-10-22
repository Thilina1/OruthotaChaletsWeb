
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { stayCalendarDayClassNames, stayDayClassNames, stayDayModifiers } from '@/lib/stay-calendar';
import { Calendar as CalendarIcon, ChevronDown, Utensils, Clock, Globe, Tag } from 'lucide-react';
import { format, differenceInCalendarDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TableBookingModal } from './table-booking-modal';

export function BookingForm({ showTableBooking = false }: { showTableBooking?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'stay' | 'table'>(showTableBooking ? 'table' : 'stay');
  const [isMounted, setIsMounted] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [hoveredCheckoutDate, setHoveredCheckoutDate] = useState<Date | undefined>(undefined);
  // Which field opened the calendar. Once both dates are set, a day clicked
  // from Check-in changes only the check-in and one from Check-out only the check-out.
  const [dateField, setDateField] = useState<'checkIn' | 'checkOut'>('checkIn');
  const [nationality, setNationality] = useState<'Sri Lankan' | 'Non Sri Lankan' | ''>('');
  const [promoCode, setPromoCode] = useState('');
  // One calendar month on phones, two side by side on wider screens.
  const [isWideScreen, setIsWideScreen] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const query = window.matchMedia('(min-width: 768px)');
    const update = () => setIsWideScreen(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const hasValidRange = Boolean(dateRange?.from && dateRange.to && dateRange.to > dateRange.from);
  const nights = hasValidRange && dateRange?.from && dateRange.to ? differenceInCalendarDays(dateRange.to, dateRange.from) : 0;

  const handleDateRangeSelect = (range: DateRange | undefined, clickedDay?: Date) => {
    const current = dateRange;
    if (clickedDay && current?.from && current.to) {
      if (dateField === 'checkIn') {
        if (clickedDay < current.to) {
          setDateRange({ from: clickedDay, to: current.to });
          setIsDatePopoverOpen(false);
        } else {
          // On or after the old check-out: choose a new check-out next.
          setDateRange({ from: clickedDay, to: undefined });
          setDateField('checkOut');
        }
        setHoveredCheckoutDate(undefined);
        return;
      }
      if (clickedDay > current.from) {
        setDateRange({ from: current.from, to: clickedDay });
        setHoveredCheckoutDate(undefined);
        setIsDatePopoverOpen(false);
        return;
      }
      // A check-out on or before the check-in starts a new stay from that day.
      setDateRange({ from: clickedDay, to: undefined });
      return;
    }
    if (range?.from && range.to && range.to <= range.from) {
      setDateRange({ from: range.from, to: undefined });
      setHoveredCheckoutDate(undefined);
      return;
    }

    setDateRange(range);
    if (range?.from && range.to) {
      setHoveredCheckoutDate(undefined);
      setIsDatePopoverOpen(false);
    }
  };

  const handleFindRoom = () => {
    if (!dateRange?.from || !dateRange.to || dateRange.to <= dateRange.from) {
      toast({
        variant: 'destructive',
        title: 'Please select dates',
        description: 'You must select a check-in and check-out date.',
      });
      return;
    }
    if (!nationality) {
      toast({
        variant: 'destructive',
        title: 'Please select nationality',
        description: 'You must select your nationality before booking.',
      });
      return;
    }
    const checkInString = format(dateRange.from, 'yyyy-MM-dd');
    const checkOutString = format(dateRange.to, 'yyyy-MM-dd');
    const bookingParams = new URLSearchParams({
      checkIn: checkInString,
      checkOut: checkOutString,
      nationality,
    });

    if (promoCode.trim()) {
      bookingParams.set('promoCode', promoCode.trim());
    }

    router.push(`/chalet-booking?${bookingParams.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl py-3">
      {/* Tab Switcher */}
      {isMounted && showTableBooking && (
        <div className="flex gap-4 mb-4 px-2">
          <button
            onClick={() => setActiveTab('table')}
            className={cn(
              "pb-2 text-sm font-bold tracking-widest uppercase transition-all border-b-2",
              activeTab === 'table' ? "text-[#283618] border-[#283618]" : "text-muted-foreground border-transparent hover:text-[#283618]"
            )}
          >
            Book a Table
          </button>
          <button
            onClick={() => setActiveTab('stay')}
            className={cn(
              "pb-2 text-sm font-bold tracking-widest uppercase transition-all border-b-2",
              activeTab === 'stay' ? "text-[#283618] border-[#283618]" : "text-muted-foreground border-transparent hover:text-[#283618]"
            )}
          >
            Book a Stay
          </button>
        </div>
      )}

      <div className="mx-auto max-w-6xl rounded-2xl border border-white/40 bg-white/90 p-2.5 shadow-lg backdrop-blur-md md:max-w-7xl md:rounded-3xl md:p-3">
        <div className="grid w-full grid-cols-2 items-stretch gap-1 md:grid-cols-[1fr_1fr_1fr_1fr_auto] md:gap-0">
          {(!showTableBooking || activeTab === 'stay') ? (
            <>
              {/* Check-in / Check-out */}
              <Popover open={isDatePopoverOpen} onOpenChange={setIsDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <button type="button" className="col-span-2 grid grid-cols-2 rounded-xl text-left transition-colors hover:bg-stone-100/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#283618]/40">
                    <span onClick={() => setDateField('checkIn')} className="flex items-center gap-3 px-5 py-3.5 md:px-7 md:py-5">
                      <CalendarIcon className="h-5 w-5 shrink-0 text-[#283618] md:h-6 md:w-6" />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 md:text-xs">Check-in</span>
                        <span className={cn('block truncate text-base font-semibold md:mt-0.5 md:text-lg', dateRange?.from ? 'text-stone-900' : 'text-stone-400')}>
                          {dateRange?.from ? format(dateRange.from, 'EEE, dd MMM') : 'Add date'}
                        </span>
                      </span>
                    </span>
                    <span onClick={() => setDateField(dateRange?.from ? 'checkOut' : 'checkIn')} className="flex items-center gap-3 border-l border-stone-200 px-5 py-3.5 md:px-7 md:py-5">
                      <CalendarIcon className="h-5 w-5 shrink-0 text-[#283618] md:h-6 md:w-6" />
                      <span className="min-w-0">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 md:text-xs">
                          Check-out{nights > 0 ? <span className="ml-1 normal-case tracking-normal text-[#606C38]">· {nights} night{nights === 1 ? '' : 's'}</span> : null}
                        </span>
                        <span className={cn('block truncate text-base font-semibold md:mt-0.5 md:text-lg', hasValidRange ? 'text-stone-900' : 'text-stone-400')}>
                          {hasValidRange && dateRange?.to ? format(dateRange.to, 'EEE, dd MMM') : 'Add date'}
                        </span>
                      </span>
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden rounded-2xl border border-stone-200 bg-white p-0 shadow-2xl" align="start">
                  {dateRange?.from ? (
                    <div className="border-b border-stone-100 px-5 pt-4 pb-3 text-sm font-semibold text-[#283618]">
                      {dateField === 'checkIn' && dateRange.to ? 'Choose a new check-in date' : 'Choose a check-out date'}
                    </div>
                  ) : null}
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range, clickedDay) => handleDateRangeSelect(range, clickedDay)}
                    defaultMonth={dateRange?.from}
                    onDayMouseEnter={setHoveredCheckoutDate}
                    onDayMouseLeave={() => setHoveredCheckoutDate(undefined)}
                    numberOfMonths={isWideScreen ? 2 : 1}
                    initialFocus
                    // Choosing a check-out: only days after the check-in.
                    disabled={dateField === 'checkOut' && dateRange?.from && dateRange.to
                      ? [{ before: new Date() }, { before: new Date(dateRange.from.getFullYear(), dateRange.from.getMonth(), dateRange.from.getDate() + 1) }]
                      : { before: new Date() }}
                    modifiers={stayDayModifiers(dateRange, hoveredCheckoutDate)}
                    modifiersClassNames={stayDayClassNames}
                    className="rounded-2xl bg-white p-4"
                    classNames={{
                      months: 'flex flex-col gap-6 md:flex-row',
                      month: 'space-y-4',
                      caption: 'relative flex items-center justify-center pt-1',
                      caption_label: 'text-base font-semibold tracking-wide text-stone-950',
                      head_cell: 'w-10 rounded-md text-xs font-medium text-stone-500',
                      row: 'mt-1.5 flex w-full',
                      ...stayCalendarDayClassNames,
                      day: 'h-10 w-full rounded-full p-0 text-sm font-medium text-stone-950 hover:bg-[#f39c34]/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f39c34]',
                      day_disabled: 'text-stone-300 opacity-60',
                      nav_button: 'h-8 w-8 rounded-full bg-transparent p-0 text-stone-950 opacity-80 hover:bg-stone-100 hover:opacity-100',
                      nav_button_previous: 'absolute left-1',
                      nav_button_next: 'absolute right-1',
                    }}
                  />
                </PopoverContent>
              </Popover>

              {/* Nationality: the (invisible) select covers the whole field, so a
                  click anywhere on it opens the dropdown. */}
              <div className="relative flex cursor-pointer items-center gap-3 rounded-xl px-5 py-3.5 transition-colors hover:bg-stone-100/80 focus-within:bg-stone-100/80 focus-within:ring-2 focus-within:ring-[#283618]/30 md:rounded-none md:border-l md:border-stone-200 md:px-7 md:py-5">
                <Globe className="h-5 w-5 shrink-0 text-[#283618] md:h-6 md:w-6" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 md:text-xs">Nationality</span>
                  <span className={cn('block truncate pr-6 text-base font-semibold md:mt-0.5 md:text-lg', nationality ? 'text-stone-900' : 'text-stone-400')}>
                    {nationality || 'Select'}
                  </span>
                </span>
                <ChevronDown className="pointer-events-none absolute bottom-4 right-3 h-5 w-5 text-stone-400 md:bottom-6 md:right-6" />
                <select
                  aria-label="Nationality"
                  value={nationality}
                  onChange={e => setNationality(e.target.value as 'Sri Lankan' | 'Non Sri Lankan' | '')}
                  className="absolute inset-0 h-full w-full cursor-pointer appearance-none opacity-0"
                >
                  <option value="" disabled>Select</option>
                  <option value="Sri Lankan">Sri Lankan</option>
                  <option value="Non Sri Lankan">Non Sri Lankan</option>
                </select>
              </div>

              {/* Promo Code */}
              <label htmlFor="promo-code" className="flex cursor-text items-center gap-3 rounded-xl px-5 py-3.5 md:px-7 md:py-5 transition-colors hover:bg-stone-100/80 md:rounded-none md:border-l md:border-stone-200">
                <Tag className="h-5 w-5 shrink-0 text-[#283618] md:h-6 md:w-6" />
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500 md:text-xs">Promo code</span>
                  <input
                    id="promo-code"
                    type="text"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    placeholder="Optional"
                    autoComplete="off"
                    className="w-full border-0 bg-transparent p-0 text-base font-semibold uppercase md:mt-0.5 md:text-lg text-stone-900 outline-none placeholder:normal-case placeholder:font-normal placeholder:text-stone-400"
                  />
                </span>
              </label>

              {/* Book button */}
              <Button
                onClick={activeTab === 'stay' ? handleFindRoom : () => setIsTableModalOpen(true)}
                className="col-span-2 h-14 rounded-xl bg-[#283618] px-9 text-base font-semibold tracking-wide text-white shadow-sm transition-all hover:bg-[#3d5324] active:scale-[0.98] md:col-span-1 md:ml-3 md:h-auto md:rounded-2xl md:px-12 md:text-lg"
              >
                {activeTab === 'stay' ? 'Book Now' : 'Book a Table'}
              </Button>
            </>
          ) : (
            <div className="col-span-2 md:col-span-5 bg-white p-3 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#606C38]/10 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-[#606C38]" />
                </div>
                <div>
                  <h3 className="font-headline text-xl text-[#283618]">Scenic Dining at Oruthota Chalets</h3>
                  {/* <p className="text-sm text-muted-foreground">Experience Al Fresco dining with magical mountain views.</p> */}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-[10px] tracking-widest text-[#283618] font-bold uppercase">
                <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg"><Clock className="w-3 h-3" /> Breakfast</div>
                <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg"><Clock className="w-3 h-3" /> Lunch</div>
                <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg"><Clock className="w-3 h-3" /> High Tea</div>
                <div className="flex items-center gap-2 bg-stone-50 px-3 py-2 rounded-lg"><Clock className="w-3 h-3" /> Dinner</div>
              </div>
              <Button
                onClick={() => setIsTableModalOpen(true)}
                className="bg-[#283618] text-white rounded-lg px-6 h-10 text-xs hover:bg-[#3d5324] transition-all"
              >
                BOOK A TABLE
              </Button>
            </div>
          )}
        </div>
      </div>

      <TableBookingModal open={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} />
    </div>
  );
}
