
'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { ArrowRight, Utensils, Wine, Coffee, Sunset, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import { PageHero } from '@/components/page-hero';

const DINING_FEATURES = [
  {
    icon: Utensils,
    title: "Farm to Table",
    description: "Fresh ingredients sourced directly from local farmers and our own organic gardens."
  },
  {
    icon: Wine,
    title: "Curated Cellar",
    description: "An extensive collection of international wines and premium spirits to pair with your meal."
  },
  {
    icon: Coffee,
    title: "Ceylon Tea",
    description: "Experience the world's finest tea, brewed to perfection in the heart of the hill country."
  },
  {
    icon: Sunset,
    title: "Scenic Views",
    description: "Every table offers a breathtaking view of the Victoria Reservoir or the Knuckles range."
  }
];

const DINING_VENUES = [
  {
    id: 'colonial-table',
    title: 'The Colonial Table',
    subtitle: 'MAIN RESTAURANT',
    description: `Step back in time at our main restaurant, where colonial elegance meets modern culinary excellence. The high ceilings, antique furniture, and warm lighting create a sophisticated atmosphere perfect for any occasion.
        
        Our daily rotating menu features a fusion of international favorites and Sri Lankan classics, ensuring there is always something new to discover.`,
    imageId: 'dining-wine', // Using existing placeholder
    features: ['Breakfast', 'Lunch', 'Dinner', 'A la Carte']
  },
  {
    id: 'terrace-dining',
    title: 'The River View Terrace',
    subtitle: 'AL FRESCO',
    description: `Immerse yourself in nature while you dine. Our terrace offers panoramic views of the Victoria Reservoir, providing a stunning backdrop for a romantic dinner or a relaxed lunch. 
        
        Enjoy the gentle cool breeze and the sounds of nature as you savor fresh seafood, grilled specialties, and refreshing mocktails.`,
    imageId: 'experience-hike', // Using a scenic image as placeholder for terrace view
    features: ['Outdoor Seating', 'Sunset Views', 'Grill & BBQ']
  }
];

const SIGNATURE_DISHES = [
  {
    title: "Traditional Rice & Curry",
    description: "A feast of heirloom red rice served with 15 different vegetable curries, clay-pot fish, and papadum.",
    price: "$$",
  },
  {
    title: "Victoria Lake Fish",
    description: "Freshly caught seasoned fillet, pan-seared with garlic butter and served with organic steamed vegetables.",
    price: "$$$",
  },
  {
    title: "Smoked Up-country Pork",
    description: "Slow-smoked pork lover's delight, marinated in local spices and served with a spicy pineapple chutney.",
    price: "$$$",
  },
  {
    title: "Watalappam Tart",
    description: "A modern twist on a classic Sri Lankan dessert. Coconut custard pudding with kitul jaggery and cashews.",
    price: "$",
  }
];

export default function DiningPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'dining-wine');

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <PageHero
        title="Wine & Dine"
        subtitle="Culinary Journeys"
        description="A symphony of flavors tailored to your palate, set against the backdrop of mist-covered mountains."
        imageUrl={heroImage?.imageUrl || ''}
        imageAlt={heroImage?.description || 'Dining at Oruthota Chalets'}
        imageHint={heroImage?.imageHint}
      />

      {/* Booking Form Integration */}
      <div className="relative z-20 -mt-16 container mx-auto px-4 mb-16">
        <div className="bg-card rounded-xl shadow-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
          <BookingForm />
        </div>
      </div>

      {/* Intro / Philosophy */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 text-center max-w-4xl space-y-12">
          <div className="text-center mb-24 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-center mb-6 mt-16">
              <div className="h-px bg-foreground w-16 mx-4"></div>
              <p className="text-xs tracking-[0.3em] font-semibold text-muted-foreground uppercase">Culinary Philosophy</p>
              <div className="h-px bg-foreground w-16 mx-4"></div>
            </div>
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Exquisite Culinary Journeys</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl mx-auto">
              Indulge in an array of culinary delights at Oruthota Chalets. Our chefs craft exquisite dishes using the freshest local ingredients, offering a symphony of flavors that range from authentic Sri Lankan specialties to international cuisine. Whether it&apos;s a romantic dinner under the stars or a casual family meal, our dining experiences are designed to delight your senses and nourish your soul.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {DINING_FEATURES.map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/60 transition-colors group">
                <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-headline text-xl mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scenic Dining Settings */}
      <section className="bg-background">
        <div className="flex flex-col lg:flex-row min-h-[600px]">
          {/* Left Content Area */}
          <div className="w-full lg:w-1/2 bg-[#Fdf7f5] p-12 lg:p-24 flex flex-col justify-center">
            <div className="max-w-xl mx-auto lg:ml-auto lg:mr-0 xl:mr-12 w-full space-y-10">

              <div className="flex items-center space-x-4">
                <p className="text-[10px] tracking-[0.3em] font-semibold text-muted-foreground uppercase whitespace-nowrap">SCENIC DINING SETTINGS</p>
                <div className="h-px bg-foreground flex-grow max-w-[100px]"></div>
              </div>

              <h2 className="font-headline text-4xl md:text-5xl text-foreground">360 by Oruthota Chalets</h2>

              <div className="space-y-6 text-muted-foreground text-sm leading-loose">
                <p>
                  At Oruthota Chalets, you&apos;re invited to experience Al Fresco dining across distinct settings. Whether you&apos;re enjoying panoramic views from the terrace, basking in the golden glow of sunset, or soaking in the serene surroundings by the lake, each dining area offers a unique atmosphere, perfectly blending exquisite cuisine with the breathtaking beauty of the highlands.
                </p>
                <p>
                  Message our reservations team via Whatsapp to reserve a table at our restaurant with magical mountain views.
                </p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex items-center text-xs tracking-widest text-foreground font-semibold">
                  <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span>BREAKFAST: 07.30 AM - 10.00 AM</span>
                </div>
                <div className="flex items-center text-xs tracking-widest text-foreground font-semibold">
                  <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span>LUNCH: 12.30 AM - 3.00 PM</span>
                </div>
                <div className="flex items-center text-xs tracking-widest text-foreground font-semibold">
                  <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span>HIGH TEA: 3.00 PM - 5.00 PM</span>
                </div>
                <div className="flex items-center text-xs tracking-widest text-foreground font-semibold">
                  <Clock className="w-4 h-4 mr-3 text-muted-foreground" />
                  <span>DINNER: 07.30 PM - 10.30 PM</span>
                </div>
              </div>

              <div className="pt-6">
                <Button className="bg-[#bd2830] hover:bg-[#9a1e24] text-white rounded-none px-8 py-6 text-xs font-bold tracking-[0.2em] uppercase transition-colors">
                  BOOK A TABLE <ArrowRight className="w-4 h-4 ml-6" />
                </Button>
              </div>

            </div>
          </div>

          {/* Right Image Area */}
          <div className="w-full lg:w-1/2 relative min-h-[400px] lg:min-h-full">
            <div className="absolute inset-0 lg:inset-y-12 lg:right-12 lg:left-0 z-10">
              {heroImage && (
                <Image
                  src={heroImage.imageUrl}
                  alt="Scenic Dining"
                  fill
                  className="object-cover shadow-2xl"
                />
              )}
            </div>
            {/* Carousel Dots placeholder */}
            <div className="absolute bottom-4 lg:bottom-0 left-0 right-0 lg:right-12 flex justify-center gap-2 pb-4">
              <div className="w-2 h-2 rounded-full bg-[#bd2830]"></div>
              <div className="w-2 h-2 rounded-full bg-[#bd2830]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-center mb-6 mt-16">
              <div className="h-px bg-foreground w-16 mx-4"></div>
              <p className="text-xs tracking-[0.3em] font-semibold text-muted-foreground uppercase">DINING VENUES</p>
              <div className="h-px bg-foreground w-16 mx-4"></div>
            </div>
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Our Venues</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl mx-auto">
              Discover unique settings tailored to every mood and occasion.
            </p>
          </div>

          <div className="flex flex-col gap-32">
            {DINING_VENUES.map((venue, index) => {
              const isEven = index % 2 === 0;
              const image = PlaceHolderImages.find(p => p.id === venue.imageId) || heroImage; // Fallback

              return (
                <div key={venue.id} className={cn(
                  "flex flex-col gap-10 lg:gap-20 items-center",
                  isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                )}>
                  {/* Image Side */}
                  <div className="w-full lg:w-1/2 relative group perspective-1000">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl transform transition-transform duration-500 group-hover:rotate-1">
                      {image && (
                        <Image
                          src={image.imageUrl}
                          alt={venue.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                      <div className="absolute top-6 left-6">
                        <Badge variant="secondary" className="bg-white/95 text-foreground px-4 py-1.5 text-xs tracking-widest font-bold shadow-lg backdrop-blur-md uppercase">
                          {venue.subtitle}
                        </Badge>
                      </div>
                    </div>
                    {/* Decorative Background */}
                    <div className={cn(
                      "absolute -bottom-6 -z-10 w-full h-full rounded-2xl border border-primary/20 bg-primary/5 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2",
                      isEven ? "-right-6" : "-left-6"
                    )} />
                  </div>

                  {/* Content Side */}
                  <div className="w-full lg:w-1/2 flex flex-col items-start text-left space-y-6">
                    <h3 className="font-headline text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
                      {venue.title}
                    </h3>

                    <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                      <p className="whitespace-pre-line text-sm leading-relaxed">
                        {venue.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 justify-start mt-4">
                      {venue.features.map(f => (
                        <Badge key={f} variant="outline" className="border-border text-muted-foreground px-3 py-1.5 text-xs uppercase tracking-wider">
                          {f}
                        </Badge>
                      ))}
                    </div>

                    <div className="pt-4 mt-2">
                      <Button variant="link" className="p-0 h-auto text-primary font-bold tracking-widest hover:text-primary/80 hover:no-underline group/btn flex items-center gap-2 text-sm">
                        VIEW MENU <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Signature Dishes Grid */}
      <section className="py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <p className="text-xs font-bold tracking-[0.3em] text-primary uppercase">Taste the Difference</p>
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Signature Creations</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {SIGNATURE_DISHES.map((dish, idx) => (
              <div key={idx} className="group p-8 md:p-10 border border-border/60 hover:border-primary/30 transition-all duration-300 bg-background hover:shadow-xl hover:-translate-y-1 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150 duration-500" />

                <div className="flex justify-between items-baseline mb-4 relative z-10">
                  <h4 className="font-headline text-2xl md:text-3xl text-foreground group-hover:text-primary transition-colors">{dish.title}</h4>
                  <span className="text-muted-foreground font-serif italic text-lg">{dish.price}</span>
                </div>

                <div className="w-12 h-0.5 bg-border group-hover:bg-primary/50 mb-6 transition-colors duration-500" />

                <p className="text-muted-foreground leading-relaxed text-lg font-light relative z-10">
                  {dish.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-muted-foreground italic max-w-2xl mx-auto text-sm">
              * Please inform our staff of any allergies or dietary restrictions. We are happy to accommodate vegan and gluten-free requests.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-primary relative overflow-hidden text-primary-foreground text-center">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <div className="container relative z-10 mx-auto px-4 max-w-3xl">
          <h2 className="font-headline text-4xl md:text-5xl mb-6">Reserve Your Table</h2>
          <p className="text-primary-foreground/90 mb-10 text-xl font-light leading-relaxed">
            Whether it&apos;s a special celebration or a quiet dinner for two, let us reserve the perfect spot for you.
          </p>
          <Button size="lg" className="rounded-full px-10 h-14 bg-white text-primary hover:bg-white/90 shadow-2xl hover:shadow-black/20 hover:-translate-y-1 transition-all text-lg font-bold">
            Book a Table <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
