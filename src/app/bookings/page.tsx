
'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { useSupabaseCollection } from '@/hooks/use-supabase';
import { useMemo, useState } from 'react';
import type { Room } from '@/types/room';
import type { Reservation } from '@/types/reservation';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { parseISO, addDays, format, differenceInCalendarDays, eachDayOfInterval } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';


function BookingsListComponent() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-estate');
  const searchParams = useSearchParams();

  const checkIn = searchParams.get('checkIn');
  const checkOut = searchParams.get('checkOut');
  const adults = searchParams.get('adults');
  const children = searchParams.get('children');
  const guests = (parseInt(adults || '0') + parseInt(children || '0')).toString();

  const { data: rooms, isLoading: isLoadingRooms } = useSupabaseCollection<Room>('rooms');
  const { data: reservations, isLoading: isLoadingReservations } = useSupabaseCollection<Reservation>('reservations');

  const processedRooms = useMemo(() => {
    if (isLoadingReservations || !rooms || !checkIn || !checkOut) {
      return rooms?.map(room => ({ ...room, isAvailable: false, nextAvailableDates: [], bookedDates: [] })) || [];
    }

    if (!reservations) { // Still loading or no reservations found
      return rooms.map(room => ({ ...room, isAvailable: true, nextAvailableDates: [], bookedDates: [] }));
    }

    const selectedStart = parseISO(checkIn);
    const selectedEnd = parseISO(checkOut);

    return rooms.map(room => {
      const roomReservations = (reservations || [])
        .filter(res => res.room_id === room.id && res.status === 'confirmed')
        .map(res => {
          // By appending 'T00:00:00Z', we ensure parsing happens in UTC, avoiding timezone issues.
          const checkInDate = parseISO(res.check_in_date + 'T00:00:00Z');
          const checkOutDate = parseISO(res.check_out_date + 'T00:00:00Z');
          return {
            start: checkInDate,
            end: checkOutDate
          }
        })
        .sort((a, b) => a.start.getTime() - b.start.getTime());

      const isUnavailable = roomReservations.some(res =>
        selectedStart < res.end && res.start < selectedEnd
      );

      const bookedDates = roomReservations.flatMap(res =>
        eachDayOfInterval({ start: res.start, end: addDays(res.end, -1) })
      );

      if (!isUnavailable) {
        return { ...room, isAvailable: true, nextAvailableDates: [], bookedDates };
      }

      // Logic to find next 7 available individual days
      const nextAvailableDates: Date[] = [];
      let currentDate = addDays(new Date(), 1); // Start checking from tomorrow

      while (nextAvailableDates.length < 7) {
        const isBlocked = roomReservations.some(res =>
          currentDate >= res.start && currentDate < res.end
        );

        if (!isBlocked) {
          nextAvailableDates.push(new Date(currentDate));
        }

        currentDate = addDays(currentDate, 1);

        // Safety break to prevent infinite loops
        if (differenceInCalendarDays(currentDate, new Date()) > 365 * 2) break;
      }

      return { ...room, isAvailable: false, nextAvailableDates, bookedDates };
    });
  }, [rooms, reservations, checkIn, checkOut, isLoadingReservations]);

  const isLoading = isLoadingRooms || isLoadingReservations;

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/IMG_4022.jpg"
          alt="Available Rooms at Oruthota Chalets"
          fill
          className="object-cover transition-transform duration-1000 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />
        <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="py-1 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase border border-white/20">
                Your Sanctuary
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100 uppercase">
              Available Rooms
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light tracking-wide max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
              Find the perfect space for your peaceful retreat at Oruthota Chalets.
            </p>
          </div>
        </div>
      </section>

      <div className="bg-background">
        <div className="py-8">
          <BookingForm />
        </div>
      </div>

      {checkIn && checkOut && (
        <div className="py-4 bg-secondary text-center text-foreground">
          <p>Showing availability for: <strong>{format(parseISO(checkIn), 'PPP')}</strong> to <strong>{format(parseISO(checkOut), 'PPP')}</strong> for <strong>{guests}</strong> guest(s).</p>
        </div>
      )}

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
            {isLoading && <p className="text-center">Checking availability...</p>}
            {!isLoading && !processedRooms.length && (
              <div className="text-center col-span-full bg-background p-12">
                <h3 className="font-headline text-2xl text-destructive">No Rooms Found</h3>
                <p className="text-muted-foreground mt-4">We couldn't find any rooms to check. Please check back later.</p>
              </div>
            )}

            {processedRooms?.map((accommodation) => {
              const bookingLink = `/booking?roomId=${accommodation.id}&checkIn=${checkIn || ''}&checkOut=${checkOut || ''}&adults=${adults || 2}&children=${children || 0}`;
              return (
                <div key={accommodation.id} className="bg-background overflow-hidden">
                  <div className="grid md:grid-cols-2 items-center">
                    <div className="relative h-80 md:h-full min-h-[300px]">
                      {accommodation.imageUrl ? (
                        <Image
                          src={accommodation.imageUrl}
                          alt={accommodation.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="p-8 text-center">
                      <div className="mb-4 min-h-[60px]">
                        {accommodation.isAvailable ? (
                          <Badge variant="default" className="bg-green-600 hover:bg-green-700">Available</Badge>
                        ) : (
                          <>
                            <Badge variant="destructive">Not Available</Badge>
                            {accommodation.nextAvailableDates.length > 0 && (
                              <div className="text-sm text-muted-foreground mt-2">
                                <p>Next available dates:</p>
                                <p className="font-semibold text-primary text-xs">
                                  {accommodation.nextAvailableDates.map(date => format(date, 'MMM dd')).join(', ')}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <h3 className="font-headline text-3xl text-foreground relative inline-block">
                        {accommodation.title}
                        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1/4 border-b-2 border-primary"></div>
                      </h3>
                      <p className="text-muted-foreground mt-8 text-sm leading-relaxed min-h-[120px] max-w-md mx-auto">
                        {accommodation.description}
                      </p>
                      <div className="flex items-center justify-center gap-4 text-sm text-foreground my-8">
                        <span>{accommodation.roomCount} Rooms</span>
                        <div className="w-px h-4 bg-border"></div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/50">
                        <span className="text-sm text-muted-foreground font-medium">Price per night</span>
                        <span className="font-bold text-lg text-primary">LKR {accommodation.pricePerNight.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground"> / night</span>
                      </div>
                      <div className="flex gap-2 justify-center items-center">

                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="text-foreground font-semibold tracking-wider hover:text-primary">
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              VIEW CALENDAR
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="multiple"
                              min={1}
                              selected={[]}
                              disabled={accommodation.bookedDates}
                              modifiers={{ booked: accommodation.bookedDates }}
                              modifiersClassNames={{
                                booked: 'day-booked',
                                disabled: 'day-booked',
                              }}
                              defaultMonth={checkIn ? parseISO(checkIn) : new Date()}
                            />
                          </PopoverContent>
                        </Popover>

                        <Link href={bookingLink} passHref>
                          <Button className="bg-primary text-primary-foreground rounded-sm font-semibold tracking-wider hover:bg-primary/90" disabled={!accommodation.isAvailable}>
                            BOOK NOW
                          </Button>
                        </Link>
                      </div>

                      {/* Partner Booking Logos */}
                      <div className="pt-8 flex flex-col items-center gap-4">
                        <p className="text-[10px] tracking-[0.2em] font-bold text-muted-foreground uppercase">Also Bookable Via</p>
                        <div className="flex items-center gap-6 opacity-70 hover:opacity-100 transition-opacity">
                          <a 
                            href="https://www.booking.com/hotel/lk/oruthota-chalets.en-gb.html" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="grayscale hover:grayscale-0 transition-all hover:scale-110"
                          >
                            <div className="relative w-24 h-6">
                              <Image src="/booking-logo.svg" alt="Booking.com" fill className="object-contain" />
                            </div>
                          </a>
                          <a 
                            href="https://www.agoda.com/oruthota-chalets/hotel/kandy-lk.html" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="grayscale hover:grayscale-0 transition-all hover:scale-110"
                          >
                            <div className="relative w-20 h-6">
                              <Image src="/color-default.svg" alt="Agoda" fill className="object-contain" />
                            </div>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  );
}


export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
      <BookingsListComponent />
    </Suspense>
  )
}
