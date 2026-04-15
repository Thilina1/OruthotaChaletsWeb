'use client';

import React from 'react';
import { PageHero } from '@/components/page-hero';
import {
  Heart,
  Users,
  Music,
  UtensilsCrossed,
  Camera,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Clock,
  Mic2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

const EVENT_TYPES = [
  {
    title: "Weddings & Celebrations",
    description: "Exchange your vows against the breathtaking backdrop of the Victoria Reservoir. Our lakeside gardens provide a romantic sanctuary for your special day.",
    icon: Heart,
    image: "/wedding.png",
    features: ["Lakeside Ceremony Space", "Customizable Decor Themes", "Gourmet Catering Options", "Dedicated Wedding Coordinator"]
  },
  {
    title: "Conferences and events",
    description: "Inspire your team in a serene environment away from city distractions. Perfect for strategy sessions, team building, and intimate executive retreats.",
    icon: Users,
    image: "/meetings.jpg",
    features: ["AV Equipment & Support", "High-Speed connectivity", "Team Building Activities", "Tailored Coffee Breaks"]
  },
  {
    title: "Private Parties",
    description: "Celebrate life's milestones with elegance. From intimate birthdays to grand anniversaries, we create personalized experiences that last a lifetime.",
    icon: Sparkles,
    image: "/instagram-1.png",
    features: ["Private Dining Venues", "Live Music Arrangements", "Themed Decorations", "Exclusive Property Hire"]
  }
];

const AMENITIES = [
  { icon: UtensilsCrossed, title: "Exquisite Catering", desc: "A blend of local flavors and international favorites." },
  { icon: Mic2, title: "AV Technology", desc: "Modern sound systems and projection equipment." },
  { icon: Camera, title: "Scenic Backdrops", desc: "Stunning locations for photography and videography." },
  { icon: ShieldCheck, title: "Expert Planning", desc: "Professional staff to manage every detail of your event." }
];

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <PageHero
        title="Unforgettable Events"
        subtitle="Memories in the Making"
        description="Whether it's a dream wedding, a corporate retreat, or an intimate celebration, Oruthota Chalets offers the perfect canvas for your most significant moments."
        imageUrl="/Hero1_new.jpg"
        imageAlt="Oruthota Chalets Events"
        titleClassName="text-5xl md:text-6xl lg:text-7xl"
      />

      <section className="py-24 px-4 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#606C38]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="font-headline text-4xl md:text-5xl text-[#283618] mb-6">Designed to Inspire</h2>
            <p className="text-muted-foreground font-body text-lg leading-relaxed">
              From the tranquil lakeside gardens to the rustic elegance of our main lodge, our venues are meticulously designed to host events that are as unique as they are unforgettable.
            </p>
          </div>

          <div className="space-y-24">
            {EVENT_TYPES.map((event, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 lg:gap-20`}
              >
                <div className="w-full md:w-1/2 relative group">
                  <div className="absolute inset-0 bg-[#606C38] scale-95 translate-x-4 translate-y-4 rounded-[2.5rem] opacity-20 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-500" />
                  <div className="relative h-[400px] lg:h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <Image
                      src={event.image || "/Placeholder.jpg"}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                </div>

                <div className="w-full md:w-1/2 space-y-8">
                  <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#606C38]/10 text-[#606C38] font-bold text-xs uppercase tracking-widest">
                    <event.icon className="w-4 h-4" />
                    Event Excellence
                  </div>
                  <h3 className="font-headline text-4xl text-[#283618]">{event.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {event.description}
                  </p>

                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {event.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-stone-600 font-body font-medium">
                        <div className="w-5 h-5 rounded-full bg-[#DDA15E]/20 flex items-center justify-center">
                          <Sparkles className="w-3 h-3 text-[#DDA15E]" />
                        </div>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button asChild className="bg-[#606C38] hover:bg-[#283618] text-white rounded-xl h-14 px-8 text-md font-bold tracking-widest uppercase group">
                    <Link href="/contact" className="flex items-center gap-2">
                      Inquire Now
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Amenities Section */}
      <section className="py-24 bg-stone-50">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="text-center mb-16">
            <h2 className="font-headline text-3xl md:text-4xl text-[#283618] mb-4">Venue Amenities</h2>
            <div className="h-1 w-20 bg-[#DDA15E] mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {AMENITIES.map((amenity, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl text-center space-y-4 shadow-sm hover:shadow-md transition-all border border-stone-100 translate-y-0 hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#606C38]/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <amenity.icon className="w-8 h-8 text-[#606C38]" />
                </div>
                <h4 className="font-headline text-xl text-[#283618]">{amenity.title}</h4>
                <p className="text-muted-foreground text-sm font-body line-clamp-2">
                  {amenity.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#283618]" />
        <Image
          src="/Hero3.jpg"
          alt="Oruthota Events"
          fill
          className="object-cover opacity-20 mix-blend-overlay"
        />
        <div className="container mx-auto max-w-5xl px-4 relative z-10 text-center text-white space-y-8">
          <h2 className="font-headline text-4xl md:text-6xl">Let's create something extraordinary</h2>
          <p className="text-white/80 font-body text-xl max-w-2xl mx-auto leading-relaxed">
            Contact our dedicated events team today to start planning your bespoke event at the heart of Sri Lanka's cultural capital.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <Button asChild size="lg" className="bg-[#DDA15E] hover:bg-[#BC6C25] text-white rounded-xl h-16 px-12 text-lg font-bold tracking-widest uppercase">
              <Link href="/contact">Get in Touch</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-[#283618] rounded-xl h-16 px-12 text-lg font-bold tracking-widest uppercase">
              <Link href="/gallery">View Gallery</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
