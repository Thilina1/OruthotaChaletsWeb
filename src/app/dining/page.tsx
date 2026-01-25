
'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export default function DiningPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'dining-wine');

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
              Wine & Dine
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
          <p className="text-primary tracking-widest mb-4">DINING</p>
          <h2 className="font-headline text-4xl text-foreground mb-6">Exquisite Culinary Journeys</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Indulge in an array of culinary delights at Oruthota Chalets. Our chefs craft exquisite dishes using the freshest local ingredients, offering a symphony of flavors that range from authentic Sri Lankan specialties to international cuisine. Whether it's a romantic dinner or a casual meal, our dining experiences are designed to delight your senses.
          </p>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center border p-4">
            <div className="p-8 text-center">
              <p className="text-sm tracking-[0.2em] text-muted-foreground">MAIN RESTAURANT</p>
              <h2 className="font-headline text-4xl text-foreground mt-2">The Colonial Table</h2>
              <div className="flex justify-center my-4">
                <div className="w-24 h-px bg-primary relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rotate-45"></div>
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto mb-8">
                Enjoy our exquisite range of dishes ranging from Italian, Western, Sri Lankan specialities. Drinks that refresh your mind and soul specially tailor made for you.
              </p>
              <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white">
                VIEW MENU <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            {heroImage && (
              <div className="relative h-96 min-h-[300px]">
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={heroImage.imageHint}
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
