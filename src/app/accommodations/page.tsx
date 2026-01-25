
'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { Bed, Building2 } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import type { Room } from '@/types/room';
import Link from 'next/link';
import { Suspense } from 'react';

function CheckAvailabilityListComponent() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-estate');
  const firestore = useFirestore();

  const roomsCollectionRef = useMemo(
    () => (firestore ? collection(firestore, 'rooms') : null),
    [firestore]
  );
  const { data: rooms, isLoading } = useCollection<Room>(roomsCollectionRef);

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
                    Accommodations
                </h1>
            </div>
        </div>
      </section>

      <div className="bg-background">
        <div className="py-8">
            <BookingForm />
        </div>
      </div>

       <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-primary tracking-widest mb-4">ACCOMMODATION</p>
          <h2 className="font-headline text-4xl text-foreground mb-6">Tropical Tranquility and Contemporary Elegance</h2>
          <p className="text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
            Experience Bawa's tropical modernist design with breathtaking lake views and lush jungle canopies just minutes from iconic cultural landmarks like the Dambulla Cave Temples and Sigiriya Rock Fortress. Relaxing serene rooms and suites which blend nature, exclusivity and contemporary comforts.
          </p>
          <div className="flex justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <Bed className="h-8 w-8 text-primary" />
              <span className="text-foreground font-semibold">137 Rooms</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-foreground font-semibold">15 Suites</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-1 gap-12">
            {isLoading && <p className="text-center">Loading accommodations...</p>}
            {rooms?.map((accommodation) => {
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
                      <div className="flex gap-2 justify-center">
                        <Button variant="link" className="text-foreground font-semibold tracking-wider hover:text-primary">
                          MORE DETAILS
                        </Button>
                        <Link href={`/booking?roomId=${accommodation.id}`} passHref>
                          <Button className="bg-primary text-primary-foreground rounded-sm font-semibold tracking-wider hover:bg-primary/90">
                            BOOK NOW
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )})}
          </div>
        </div>
      </section>
    </div>
  );
}


export default function AccommodationsPage() {
    return (
        <Suspense fallback={<div className="text-center p-8">Loading...</div>}>
            <CheckAvailabilityListComponent />
        </Suspense>
    )
}
