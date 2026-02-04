'use client';

import Image from 'next/image';
import { PageHero } from '@/components/page-hero';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { Bed, Building2, Wind, Wifi, Car, Coffee, Utensils, Waves } from 'lucide-react';
import { useSupabaseCollection } from '@/hooks/use-supabase';
import type { Room } from '@/types/room';
import Link from 'next/link';
import { Suspense } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const RESORT_AMENITIES = [
  { icon: Wifi, label: "High-Speed Wifi" },
  { icon: Wind, label: "Air Conditioning" },
  { icon: Car, label: "Free Parking" },
  { icon: Coffee, label: "Tea/Coffee Maker" },
  { icon: Utensils, label: "In-Room Dining" },
  { icon: Waves, label: "Infinity Pool" }
];

function CheckAvailabilityListComponent() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-estate');
  const { data: rooms, isLoading } = useSupabaseCollection<Room>('rooms');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />
        <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="py-1 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase border border-white/20">
                Private Havens
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Accommodations
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light tracking-wide max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
              Sanctuaries of peace designed to blend seamlessly with nature.
            </p>
          </div>
        </div>
      </section>

      {/* Booking Form Integration */}
      <div className="relative z-20 -mt-16 container mx-auto px-4 mb-16">
        <div className="bg-card rounded-xl shadow-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
          <BookingForm />
        </div>
      </div>

      {/* Intro Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center space-y-12">
          <div className="space-y-6">
            <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase">Your Private Sanctuary</p>
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Tropical Tranquility & Elegance</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full opacity-60" />
            <p className="text-muted-foreground leading-relaxed text-lg font-light">
              Experience our tropical modernist design with breathtaking lake views and lush jungle canopies.
              Just minutes from iconic cultural landmarks like the Dambulla Cave Temples and Sigiriya Rock Fortress.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 md:gap-8">
            {RESORT_AMENITIES.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3 group">
                <div className="p-4 bg-secondary/50 rounded-2xl group-hover:bg-primary/10 transition-colors duration-300">
                  <item.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <span className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rooms List */}
      <section className="pb-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-32">
            {isLoading && (
              <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="text-muted-foreground animate-pulse">Loading your sanctuary...</p>
              </div>
            )}

            {rooms?.map((accommodation, index) => {
              const isEven = index % 2 === 0;

              return (
                <div key={accommodation.id} className={cn(
                  "flex flex-col lg:flex-row gap-10 lg:gap-20 items-center group perspective-1000",
                  !isEven && "lg:flex-row-reverse"
                )}>
                  {/* Image Side */}
                  <div className="w-full lg:w-1/2 relative h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl transform transition-transform duration-500 group-hover:rotate-1">
                    {accommodation.imageUrl ? (
                      <Image
                        src={accommodation.imageUrl}
                        alt={accommodation.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                        No Image Available
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 transition-opacity duration-500" />

                    {/* Price Badge */}
                    <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-md shadow-lg px-6 py-4 rounded-xl flex flex-col items-center z-10 border border-white/40">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Starting from</span>
                      <span className="font-headline text-2xl text-primary font-bold">${accommodation.pricePerNight}</span>
                    </div>

                    {/* View Badge (Mobile/Desktop) */}
                    <div className="absolute top-6 left-6">
                      <Badge variant="secondary" className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm border-0 uppercase tracking-wider font-semibold text-xs px-3 py-1.5">
                        {accommodation.view || 'Scenic View'}
                      </Badge>
                    </div>
                  </div>

                  {/* Content Side */}
                  <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
                    <div className="space-y-4 w-full">
                      <h3 className="font-headline text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight">
                        {accommodation.title}
                      </h3>
                      <div className={cn(
                        "w-20 h-1 bg-border rounded-full",
                        isEven ? "mx-auto lg:mx-0" : "mx-auto lg:ml-auto lg:mr-0" // Align based on layout side if strictly following zig-zag, but standard left align is usually cleaner for text block. Let's keep visually consistent with content block alignment.
                      )} style={{ marginLeft: isEven ? '0' : 'auto', marginRight: isEven ? 'auto' : '0' }} />
                      {/* ^ Inline style override for specific zig-zag text alignment if desired, or just simplify to left-align always for readability. Let's simplify and keep text left-aligned in desktop for better readability, or align with the block direction. */}
                    </div>

                    <p className="text-muted-foreground leading-relaxed text-lg font-light max-w-xl">
                      {accommodation.description}
                    </p>

                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 w-full max-w-sm">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <Bed className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground">{accommodation.roomCount} Rooms</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <Building2 className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground">Luxury Suite</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <Wind className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground">Climate Control</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors">
                        <Wifi className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm font-medium text-foreground">Free Wifi</span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                      <Link href={`/booking?roomId=${accommodation.id}`} passHref className="w-full sm:w-auto">
                        <Button size="lg" className="w-full sm:w-auto bg-primary text-primary-foreground rounded-full px-8 h-12 shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 transition-all text-base tracking-wide font-semibold">
                          Check Availability
                        </Button>
                      </Link>
                      <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full h-12 border-primary/30 text-foreground hover:bg-primary/5 hover:text-primary transition-all text-base tracking-wide font-semibold">
                        Room Details
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-primary relative overflow-hidden text-primary-foreground text-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4 max-w-3xl">
          <h2 className="font-headline text-4xl md:text-5xl mb-6 leading-tight">Not sure which sanctuary to choose?</h2>
          <p className="text-primary-foreground/90 mb-10 text-xl font-light leading-relaxed">
            Our dedicated team is happy to help you select the perfect accommodation for your tropical getaway.
          </p>
          <Link href="/contact" passHref>
            <Button variant="secondary" size="lg" className="rounded-full px-10 h-14 text-lg font-bold bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all">
              Contact Us Today
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function AccommodationsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <CheckAvailabilityListComponent />
    </Suspense>
  )
}
