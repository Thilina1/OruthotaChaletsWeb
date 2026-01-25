
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, User, Plus, Minus } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function BookingForm() {
    const router = useRouter();
    const { toast } = useToast();

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
            return {...prev, [type]: currentValue + 1};
        }
        if (operation === 'decrement' && currentValue > (type === 'adults' ? 1 : 0)) {
            return {...prev, [type]: currentValue - 1};
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
    <div className="max-w-6xl mx-auto">
      <div className="bg-background/80 backdrop-blur-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0.5">
          <div className="bg-white p-3 md:col-span-1 flex items-center justify-between gap-2">
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
          <Button onClick={handleFindRoom} className="bg-primary text-primary-foreground rounded-none text-base font-semibold tracking-wider h-full md:col-span-1 hover:bg-primary/90">
            CHECK AVAILABILITY
          </Button>
        </div>
      </div>
    </div>
  );
}
