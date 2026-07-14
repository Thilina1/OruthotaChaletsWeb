'use client';

import Image from 'next/image';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { Wind, Wifi, Car, Coffee, Utensils, Waves } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const RESORT_AMENITIES = [
  { icon: Wifi, label: "High-Speed Wifi" },
  { icon: Wind, label: "Air Conditioning" },
  { icon: Car, label: "Free Parking" },
  { icon: Coffee, label: "Tea/Coffee Maker" },
  { icon: Utensils, label: "In-Room Dining" },
  { icon: Waves, label: "Pool Access" }
];

function CheckAvailabilityListComponent() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <Image
          src="/rooms-01.jpg"
          alt="Oruthota Chalets Accommodations"
          fill
          className="object-cover transition-transform duration-1000 hover:scale-105"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />
        <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="py-1 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase border border-white/20">
                Private Havens
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Accommodation
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
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Eco-Friendly Comfort by the Reservoir</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full opacity-60" />
            <p className="text-muted-foreground leading-relaxed text-lg font-light">
              Discover our thoughtfully designed chalets and rooms with breathtaking views of the Victoria Reservoir and surrounding hill country landscapes. Just 18 kilometres from the historic city of Kandy, each space blends rustic charm with modern comforts for a truly peaceful retreat.
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

          {/* Partner Booking Logos */}
          <div className="pt-4 flex flex-col items-center gap-4">
            <p className="text-[10px] tracking-[0.2em] font-bold text-muted-foreground uppercase">Bookable Via</p>
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
      </section>

      {/* Bottom CTA */}
      <section className="py-24 bg-[#DDA15E] relative overflow-hidden text-[#283618] text-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4 max-w-3xl">
          <h2 className="font-headline text-4xl md:text-5xl mb-6 leading-tight">Not sure which sanctuary to choose?</h2>
          <p className="text-[#283618]/90 mb-10 text-xl font-light leading-relaxed">
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
