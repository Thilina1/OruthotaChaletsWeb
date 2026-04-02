
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, User, Plus, Minus, Utensils, Clock } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TableBookingModal } from './table-booking-modal';

export function BookingForm({ showBuffet = false }: { showBuffet?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'stay' | 'buffet'>('stay');
  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState({
    adults: 2,
    children: 0,
  });
  const [isGuestsPopoverOpen, setIsGuestsPopoverOpen] = useState(false);

  useEffect(() => {
    // Set initial dates only on the client to avoid hydration mismatch
    const today = new Date();
    setCheckInDate(today);
    setCheckOutDate(addDays(today, 1));
  }, []);


  const handleGuestChange = (type: 'adults' | 'children', operation: 'increment' | 'decrement') => {
    setGuests(prev => {
      const currentValue = prev[type];
      if (operation === 'increment') {
        return { ...prev, [type]: currentValue + 1 };
      }
      if (operation === 'decrement' && currentValue > (type === 'adults' ? 1 : 0)) {
        return { ...prev, [type]: currentValue - 1 };
      }
      return prev;
    });
  };

  const handleFindRoom = () => {
    if (!checkInDate || !checkOutDate) {
      toast({
        variant: 'destructive',
        title: 'Please select dates',
        description: 'You must select a check-in and check-out date.',
      });
      return;
    }

    const checkInString = format(checkInDate, 'yyyy-MM-dd');
    const checkOutString = format(checkOutDate, 'yyyy-MM-dd');
    const adults = guests.adults;
    const children = guests.children;


    router.push(`/bookings?checkIn=${checkInString}&checkOut=${checkOutString}&adults=${adults}&children=${children}`);
  };

  return (
    <div className="max-w-6xl mx-auto py-4">
      {/* Tab Switcher */}
      {showBuffet && (
        <div className="flex gap-4 mb-4 px-2">
          <button 
            onClick={() => setActiveTab('stay')}
            className={cn(
              "pb-2 text-sm font-bold tracking-widest uppercase transition-all border-b-2",
              activeTab === 'stay' ? "text-[#283618] border-[#283618]" : "text-muted-foreground border-transparent hover:text-[#283618]"
            )}
          >
            Book a Stay
          </button>
          <button 
            onClick={() => setActiveTab('buffet')}
            className={cn(
              "pb-2 text-sm font-bold tracking-widest uppercase transition-all border-b-2",
              activeTab === 'buffet' ? "text-[#283618] border-[#283618]" : "text-muted-foreground border-transparent hover:text-[#283618]"
            )}
          >
            Book a Buffet
          </button>
        </div>
      )}

      <div className="bg-[#FEFAE0]/60 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0.5 overflow-hidden rounded-lg shadow-sm">
          {(!showBuffet || activeTab === 'stay') ? (
            <>
              <div className="bg-white p-3 md:col-span-1 flex items-center justify-between gap-2 border-r border-stone-100">
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center justify-between text-left">
                  <div>
                    <label className="text-xs text-gray-500 block">Check-in</label>
                    <span className="text-base text-black">{checkInDate ? format(checkInDate, 'dd/MM/yyyy') : 'Select date'}</span>
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

          <div className="bg-white p-3 md:col-span-1 flex items-center justify-between gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center justify-between text-left">
                  <div>
                    <label className="text-xs text-gray-500 block">Check-out</label>
                    <span className="text-base text-black">{checkOutDate ? format(checkOutDate, 'dd/MM/yyyy') : 'Select date'}</span>
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

          <div className="bg-white p-3 md:col-span-1 flex items-center justify-between gap-2">
            <Popover open={isGuestsPopoverOpen} onOpenChange={setIsGuestsPopoverOpen}>
              <PopoverTrigger asChild>
                <button className="w-full flex items-center justify-between text-left">
                  <div>
                    <label className="text-xs text-gray-500 block">Guests</label>
                    <span className="text-base text-black truncate w-32">{guests.adults} adults, {guests.children} children</span>
                  </div>
                  <User className="h-6 w-6 text-gray-400" />
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Adults</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleGuestChange('adults', 'decrement')}>
                        <Minus className="h-4 w-4" />
                      </Button>

                      <span className="w-6 text-center">{guests.adults}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleGuestChange('adults', 'increment')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Children</label>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleGuestChange('children', 'decrement')}>
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-6 text-center">{guests.children}</span>
                      <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => handleGuestChange('children', 'increment')}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" onClick={() => setIsGuestsPopoverOpen(false)}>Done</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <Button 
            onClick={activeTab === 'stay' ? handleFindRoom : () => setIsTableModalOpen(true)} 
            className="bg-[#283618] text-white rounded-none text-base font-semibold tracking-wider h-full md:col-span-1 hover:bg-[#3d5324] transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
          >
            {activeTab === 'stay' ? 'CHECK AVAILABILITY' : 'BOOK A BUFFET'}
          </Button>
            </>
          ) : (
            <div className="col-span-4 bg-white p-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#606C38]/10 flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-[#606C38]" />
                </div>
                <div>
                  <h3 className="font-headline text-xl text-[#283618]">Scenic Dining at 360</h3>
                  <p className="text-sm text-muted-foreground">Experience Al Fresco dining with magical mountain views.</p>
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
                className="bg-[#283618] text-white rounded-xl px-8 h-12 hover:bg-[#3d5324] transition-all"
              >
                BOOK A BUFFET
              </Button>
            </div>
          )}
        </div>
      </div>

      <TableBookingModal open={isTableModalOpen} onClose={() => setIsTableModalOpen(false)} />
    </div>
  );
}
