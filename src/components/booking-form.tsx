
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, Utensils, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TableBookingModal } from './table-booking-modal';
import { supabase } from '@/lib/supabase';

type ChaletPackage = { id: string; name: string; description?: string };
type OccupancyType = { id: string; name: string; max_guests?: number };

export function BookingForm({ showTableBooking = false }: { showTableBooking?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'stay' | 'table'>(showTableBooking ? 'table' : 'stay');
  const [isMounted, setIsMounted] = useState(false);
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);

  // Chalet package & occupancy
  const [packages, setPackages] = useState<ChaletPackage[]>([]);
  const [occupancyTypes, setOccupancyTypes] = useState<OccupancyType[]>([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [selectedOccupancy, setSelectedOccupancy] = useState('');

  useEffect(() => {
    const today = new Date();
    setCheckInDate(today);
    setCheckOutDate(addDays(today, 1));
    setIsMounted(true);

    // Fetch chalet packages and occupancy types
    Promise.all([
      supabase.from('chalet_packages').select('id, name, description').order('name'),
      supabase.from('chalet_occupancy_types').select('id, name, max_guests').order('name'),
    ]).then(([pkgRes, occRes]) => {
      if (pkgRes.data) {
        setPackages(pkgRes.data as ChaletPackage[]);
        if (pkgRes.data.length > 0) setSelectedPackage(pkgRes.data[0].id);
      }
      if (occRes.data) {
        setOccupancyTypes(occRes.data as OccupancyType[]);
        if (occRes.data.length > 0) setSelectedOccupancy(occRes.data[0].id);
      }
    });
  }, []);


  const handleFindRoom = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        variant: 'destructive',
        title: 'Please select dates',
        description: 'You must select a check-in and check-out date.',
      });
      return;
    }
    if (!selectedPackage || !selectedOccupancy) {
      toast({
        variant: 'destructive',
        title: 'Please select a package',
        description: 'Choose a package and occupancy type to continue.',
      });
      return;
    }

    const checkInString = format(checkInDate, 'yyyy-MM-dd');
    const checkOutString = format(checkOutDate, 'yyyy-MM-dd');

    router.push(
      `/chalet-booking?checkIn=${checkInString}&checkOut=${checkOutString}&packageId=${selectedPackage}&occupancyTypeId=${selectedOccupancy}`
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
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

      <div className="bg-[#FEFAE0]/60 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-white/20">
        {/* Third-party Booking Platforms */}
        {(!showTableBooking || activeTab === 'stay') && (
          <div className="mb-3 pb-3 border-b border-stone-100 flex flex-col items-center justify-center gap-4">
            <span className="text-[10px] tracking-[0.2em] font-bold text-[#606C38]/60 uppercase">Book via trusted platforms</span>
            <div className="flex gap-6 items-center">
              <a
                href="https://www.booking.com/hotel/lk/oruthota-chalets.en-gb.html"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110"
              >
                <div className="relative w-24 h-6">
                  <Image
                    src="/booking-logo.svg"
                    alt="Booking.com"
                    fill
                    className="object-contain"
                  />
                </div>
              </a>
              <a
                href="https://www.agoda.com/oruthota-chalets/hotel/kandy-lk.html?cid=1844104&ds=r0%2FnkB5pGgAzoCui"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300 hover:scale-110"
              >
                <div className="relative w-20 h-6">
                  <Image
                    src="/color-default.svg"
                    alt="Agoda"
                    fill
                    className="object-contain"
                  />
                </div>
              </a>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-0.5 overflow-hidden rounded-lg shadow-sm">
          {(!showTableBooking || activeTab === 'stay') ? (
            <>
              {/* Check-in */}
              <div className="bg-white p-2 md:col-span-1 flex items-center justify-between gap-2 border-r border-stone-100">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center justify-between text-left">
                      <div>
                        <label className="text-[10px] text-gray-500 block">Check-in</label>
                        <span className="text-sm text-black">{checkInDate ? format(checkInDate, 'dd/MM/yyyy') : 'Select date'}</span>
                      </div>
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkInDate}
                      onSelect={(date) => {
                        setCheckInDate(date);
                        if (date && checkOutDate && date >= checkOutDate) {
                          setCheckOutDate(addDays(date, 1));
                        }
                      }}
                      initialFocus
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out */}
              <div className="bg-white p-2 md:col-span-1 flex items-center justify-between gap-2 border-r border-stone-100">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full flex items-center justify-between text-left">
                      <div>
                        <label className="text-[10px] text-gray-500 block">Check-out</label>
                        <span className="text-sm text-black">{checkOutDate ? format(checkOutDate, 'dd/MM/yyyy') : 'Select date'}</span>
                      </div>
                      <CalendarIcon className="h-6 w-6 text-gray-400" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOutDate}
                      onSelect={setCheckOutDate}
                      initialFocus
                      disabled={{ before: checkInDate ? addDays(checkInDate, 1) : addDays(new Date(), 1) }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Package */}
              <div className="bg-white p-2 md:col-span-1 flex items-center gap-2 border-r border-stone-100">
                <div className="w-full">
                  <label className="text-[10px] text-gray-500 block">Package</label>
                  <select
                    value={selectedPackage}
                    onChange={e => setSelectedPackage(e.target.value)}
                    className="text-sm text-black bg-transparent border-0 outline-none w-full cursor-pointer appearance-none"
                  >
                    {packages.length === 0 && <option value="">Loading...</option>}
                    {packages.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Occupancy Type */}
              <div className="bg-white p-2 md:col-span-1 flex items-center gap-2 border-r border-stone-100">
                <div className="w-full">
                  <label className="text-[10px] text-gray-500 block">Occupancy</label>
                  <select
                    value={selectedOccupancy}
                    onChange={e => setSelectedOccupancy(e.target.value)}
                    className="text-sm text-black bg-transparent border-0 outline-none w-full cursor-pointer appearance-none"
                  >
                    {occupancyTypes.length === 0 && <option value="">Loading...</option>}
                    {occupancyTypes.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.name}{o.max_guests ? ` · Max ${o.max_guests}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Check Availability button */}
              <Button
                onClick={activeTab === 'stay' ? handleFindRoom : () => setIsTableModalOpen(true)}
                className="bg-[#283618] text-white rounded-none text-xs font-semibold tracking-wider h-full px-4 md:col-span-1 hover:bg-[#3d5324] transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
              >
                {activeTab === 'stay' ? 'BOOK NOW' : 'BOOK A TABLE'}
              </Button>
            </>
          ) : (
            <div className="col-span-6 bg-white p-3 flex flex-col md:flex-row items-center justify-between gap-4">
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
