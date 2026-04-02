'use client';

import React from 'react';
import { PageHero } from '@/components/page-hero';
import { Star, Quote, User, Verified, Sparkles, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const ALL_REVIEWS = [
  {
    id: 1,
    name: "John & Sarah Miller",
    location: "Melbourne, Australia",
    date: "March 2024",
    rating: 5,
    title: "An Unforgettable Escape",
    content: "Our stay at Oruthota Chalets was nothing short of magical. The view of the Victoria Reservoir at sunrise is something we'll never forget. The staff felt like family and the food was the best we had in Sri Lanka.",
    avatar: "/testimonial-1.png", // Using existing placeholder logic if available or just user icon
    verified: true
  },
  {
    id: 2,
    name: "David Chen",
    location: "Singapore",
    date: "February 2024",
    rating: 5,
    title: "Eco-Luxury at its Best",
    content: "I've stayed in many resorts, but the tranquility here is unmatched. The blend of rustic charm and modern comfort is perfectly executed. The sustainability efforts are also very impressive.",
    verified: true
  },
  {
    id: 3,
    name: "Elena Rodriguez",
    location: "Madrid, Spain",
    date: "January 2024",
    rating: 5,
    title: "Peace and Serenity",
    content: "If you want to disconnect from the world, this is the place. Waking up to the sound of birds and the gentle breeze from the lake was exactly what I needed. Highly recommend the lake-front chalets.",
    verified: true
  },
  {
    id: 4,
    name: "Thomas Wright",
    location: "London, UK",
    date: "December 2023",
    rating: 4,
    title: "Breathtaking Views",
    content: "The location is stunning. Access is through a small village road which adds to the authentic experience. The service was excellent and the rooms were very clean and well-maintained.",
    verified: true
  },
  {
    id: 5,
    name: "Priya Gunawardena",
    location: "Colombo, Sri Lanka",
    date: "November 2023",
    rating: 5,
    title: "Perfect Weekend Getaway",
    content: "A hidden gem just a short drive from Kandy. It's the perfect place for a family retreat. The children loved the open spaces and the pool. We will definitely be back!",
    verified: true
  },
  {
    id: 6,
    name: "Hans Schmidt",
    location: "Munich, Germany",
    date: "October 2023",
    rating: 5,
    title: "Exceptional Hospitality",
    content: "From the traditional welcome to the personalized service throughout our stay, everything was exceptional. The staff goes above and beyond to ensure you have a memorable stay.",
    verified: true
  }
];

export default function ReviewsPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <PageHero
        title="Guest Stories"
        subtitle="Reviews"
        description="Read about the experiences of our guests and discover why Oruthota Chalets is considered a true sanctuary in the heart of Sri Lanka."
        imageUrl="/Hero1_new.jpg" // Using a high-quality existing image
        imageAlt="Oruthota Chalets Reviews Hero"
        titleClassName="text-5xl md:text-6xl lg:text-7xl"
      />

      <section className="py-24 px-4 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#606C38]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DDA15E]/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-[#606C38]" />
              <span className="py-1 px-4 rounded-full bg-[#606C38]/10 text-[#606C38] text-xs font-bold tracking-[0.2em] uppercase">
                Authentic Experiences
              </span>
              <Sparkles className="w-4 h-4 text-[#DDA15E]" />
            </div>
            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#283618] leading-tight">
              What Our Guests Love
            </h2>
            <div className="w-24 h-1 bg-[#606C38]/20 mx-auto rounded-full" />
          </div>

          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {ALL_REVIEWS.map((review) => (
              <div 
                key={review.id} 
                className="break-inside-avoid group bg-white p-8 md:p-10 rounded-3xl shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-stone-100 hover:border-[#606C38]/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] relative"
              >
                <div className="absolute top-6 right-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity duration-500">
                  <Quote className="w-20 h-20 text-[#606C38] rotate-180" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={cn(
                          "w-4 h-4",
                          i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-stone-200"
                        )} 
                      />
                    ))}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-headline text-2xl text-[#283618] leading-snug">
                      "{review.title}"
                    </h3>
                    <p className="text-muted-foreground font-body leading-relaxed text-lg italic">
                      {review.content}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-stone-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#606C38]/10 flex items-center justify-center">
                        <User className="w-6 h-6 text-[#606C38]" />
                      </div>
                      <div>
                        <p className="font-bold text-[#283618] tracking-wide">{review.name}</p>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{review.location}</p>
                      </div>
                    </div>
                    {review.verified && (
                      <div className="flex items-center gap-1 bg-[#606C38]/5 px-3 py-1 rounded-full cursor-help group/v" title="Verified Guest">
                        <Verified className="w-3 h-3 text-[#606C38]" />
                        <span className="text-[10px] font-bold text-[#606C38] uppercase tracking-tighter">Verified</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 bg-[#283618] rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden">
            {/* Dark theme CTA */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/Hero1_new.jpg')] bg-cover bg-center opacity-10" />
            <div className="relative z-10 space-y-8">
              <h2 className="font-headline text-4xl md:text-5xl text-white">Have you stayed with us?</h2>
              <p className="text-white/70 text-lg max-w-2xl mx-auto font-body">
                We would love to hear about your experience. Your feedback helps us maintain the highest standards of hospitality.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Button asChild className="bg-[#DDA15E] hover:bg-[#BC8A4C] text-white rounded-xl h-14 px-8 text-md font-bold tracking-widest uppercase transition-all">
                  <Link href="/contact">Write a Review</Link>
                </Button>
                <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 rounded-xl h-14 px-8 text-md font-bold tracking-widest uppercase transition-all">
                  Tripadvisor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

import { cn } from '@/lib/utils';
