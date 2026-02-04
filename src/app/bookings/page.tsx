
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
        .filter(res => res.roomId === room.id && res.status === 'confirmed')
        .map(res => {
          // By appending 'T00:00:00Z', we ensure parsing happens in UTC, avoiding timezone issues.
          const checkInDate = parseISO(res.checkInDate + 'T00:00:00Z');
          const checkOutDate = parseISO(res.checkOutDate + 'T00:00:00Z');
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
      <section className="relative h-[50vh] min-h-[400px] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 w-full px-4 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-headline text-5xl md:text-7xl tracking-wider font-normal text-white/90">
              Available Rooms
            </h1>
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
                        <span>{accommodation.view}</span>
                      </div>
                      <div className="mb-8">
                        <span className="font-bold text-lg text-primary">${accommodation.pricePerNight}</span>
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
