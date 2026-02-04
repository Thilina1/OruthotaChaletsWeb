
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { differenceInCalendarDays, format, addDays, startOfDay } from 'date-fns';
import type { Room } from '@/types/room';
import type { Guest } from '@/types/guest';
import type { Reservation } from '@/types/reservation';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';


export default function BookingPageComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  const [room, setRoom] = useState<Room | null>(null);

  const roomId = searchParams.get('roomId');
  const today = startOfDay(new Date());

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idCardNumber, setIdCardNumber] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  const [checkInDate, setCheckInDate] = useState<Date | undefined>(() => {
    const cin = searchParams.get('checkIn');
    try {
      if (cin && new Date(cin) > today) return new Date(cin);
    } catch { }
    return addDays(today, 1);
  });
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(() => {
    const cout = searchParams.get('checkOut');
    const cin = searchParams.get('checkIn');
    const cinDate = cin ? new Date(cin) : addDays(today, 1);
    try {
      if (cout && new Date(cout) > cinDate) return new Date(cout);
    } catch { }
    return addDays(cinDate, 1);
  });
  const adults = useMemo(() => parseInt(searchParams.get('adults') || '2'), [searchParams]);
  const children = useMemo(() => parseInt(searchParams.get('children') || '0'), [searchParams]);
  const numberOfGuests = useMemo(() => adults + children, [adults, children]);


  useEffect(() => {
    async function fetchRoom() {
      if (!roomId) return;
      const { data, error } = await supabase.from('rooms').select('*').eq('id', roomId).single();
      if (data) {
        setRoom(data as Room);
      }
      if (error) {
        console.error('Error fetching room:', error);
      }
    }
    fetchRoom();
  }, [roomId]);

  const numberOfNights = useMemo(() => {
    if (checkInDate && checkOutDate && checkOutDate > checkInDate) {
      return differenceInCalendarDays(checkOutDate, checkInDate);
    }
    return 0;
  }, [checkInDate, checkOutDate]);

  const totalCost = useMemo(() => {
    if (room && numberOfNights > 0) {
      return room.pricePerNight * numberOfNights;
    }
    return 0;
  }, [room, numberOfNights]);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!room || !checkInDate || !checkOutDate) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not submit booking. Please try again later.' });
      return;
    }

    if (numberOfNights <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Dates', description: 'Check-out date must be after check-in date.' });
      return;
    }

    try {
      // Create or update guest information - simplified for guest checkout
      // In a real app, you'd check if guest exists by email
      const guestData = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone_number: phone,
        id_card_number: idCardNumber,
      };

      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .upsert([guestData], { onConflict: 'email' }) // Assuming email is unique/primary key for guest lookup
        .select()
        .single();

      if (guestError) throw guestError;

      // Create reservation
      const reservationData = {
        guest_id: guest.id, // Supabase generated UUID
        room_id: room.id,
        room_title: room.title,
        guest_name: `${firstName} ${lastName}`,
        guest_email: email,
        check_in_date: format(checkInDate, 'yyyy-MM-dd'),
        check_out_date: format(checkOutDate, 'yyyy-MM-dd'),
        number_of_guests: numberOfGuests,
        total_cost: totalCost,
        status: 'confirmed',
        special_requests: specialRequests,
        id_card_number: idCardNumber,
        guest_phone: phone
      };

      const { error: reservationError } = await supabase
        .from('reservations')
        .insert([reservationData]);

      if (reservationError) throw reservationError;

      toast({ title: 'Booking Request Sent!', description: 'We have received your request and will confirm shortly.' });
      router.push('/');

    } catch (error: any) {
      console.error('Booking failed:', error);
      toast({ variant: 'destructive', title: 'Booking Failed', description: error.message });
    }
  };

  const isLoading = !room;

  if (isLoading) {
    return <div className="container mx-auto p-4 text-center">Loading...</div>;
  }

  if (!room) {
    return <div className="container mx-auto p-4 text-center text-destructive">Room not found. Please select a valid room.</div>;
  }

  return (
    <div className="bg-secondary">
      <br></br><br></br><br></br>
      <div className="container mx-auto py-20 px-4">
        <h1 className="font-headline text-4xl text-center text-foreground mb-12">Confirm Your Booking</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Room and Booking Details */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <div className="relative h-60 w-full mb-4">
                  <Image src={room.imageUrl} alt={room.title} fill className="object-cover rounded-t-lg" />
                </div>
                <CardTitle className="font-headline text-2xl">{room.title}</CardTitle>
                <CardDescription>{room.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Price per night</span>
                  <span className="font-semibold">${room.pricePerNight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Number of nights</span>
                  <span className="font-semibold">{numberOfNights > 0 ? numberOfNights : '-'}</span>
                </div>
                <div className="border-t my-2"></div>
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-foreground">Total cost</span>
                  <span className="font-bold text-primary">${totalCost.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guest Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleBooking}>
              <Card>
                <CardHeader>
                  <CardTitle>Guest Information</CardTitle>
                  <CardDescription>Please provide your details to complete the booking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="check-in">Check-in Date</Label>
                      <div id="check-in" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{checkInDate ? format(checkInDate, 'PPP') : 'N/A'}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="check-out">Check-out Date</Label>
                      <div id="check-out" className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 px-3 py-2 text-sm">
                        <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>{checkOutDate ? format(checkOutDate, 'PPP') : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="id-card-number">NIC / Passport Number</Label>
                    <Input id="id-card-number" value={idCardNumber} onChange={(e) => setIdCardNumber(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="special-requests">Special Requests</Label>
                    <Textarea id="special-requests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="Any special requirements? Let us know." />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={numberOfNights <= 0}>
                    Request to Book
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
