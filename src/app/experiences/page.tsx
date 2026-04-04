'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PageHero } from '@/components/page-hero';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { RefreshCw, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ExperienceGallery } from '@/components/experience-gallery';

import { STATIC_EXPERIENCES, type StaticExperience } from '@/data/experiences';

export default function ExperiencesPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'experience-hike');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const getImageUrl = (id: string) => {
    const img = PlaceHolderImages.find(p => p.id === id);
    return img ? img.imageUrl : (heroImage?.imageUrl || '');
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
        <Image
            src="/High-Knuckles-Glamping-in-Sri-Lanka.avif"
            alt="Experiences at Oruthota Chalets"
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
            priority
          />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />
        <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-700">
              <span className="py-1 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase border border-white/20">
                Discover Local Life
              </span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              Experiences
            </h1>
            <p className="text-lg md:text-xl text-white/90 font-light tracking-wide max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
              From the authentic life of a rural family to adventurous treks in heritage sites.
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

      <section className="pb-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-24 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-center mb-6 mt-16">
              <div className="h-px bg-foreground w-16 mx-4"></div>
              <p className="text-xs tracking-[0.3em] font-semibold text-muted-foreground uppercase">EXPERIENCES</p>
              <div className="h-px bg-foreground w-16 mx-4"></div>
            </div>
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Discover the Beauty and Culture</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-4xl mx-auto">
              At Oruthota Chalets, every moment is cratted to create lasting memories. From relaxing in our mist-tilled surroundings to discovering the many things to do in Kandy, or immersing yourself in the rich history of the region, we promise an unforgettable experience that will stay with you long after you leave.
            </p>
          </div>

          <div className="flex flex-col gap-32">
            {STATIC_EXPERIENCES.map((experience, index) => {
              const isEven = index % 2 === 0;
              const isExpanded = expandedItems.includes(experience.id);
              const imageUrl = getImageUrl(experience.imageId);

              return (
                <div
                  key={experience.id}
                  className={cn(
                    "flex flex-col gap-10 lg:gap-20 items-center",
                    isEven ? "lg:flex-row" : "lg:flex-row-reverse"
                  )}
                >
                  {/* Image/Gallery Side */}
                  <div className="w-full lg:w-1/2 relative group perspective-1000">
                    {experience.galleryImages && experience.galleryImages.length > 0 ? (
                      <ExperienceGallery images={experience.galleryImages} alt={experience.title} />
                    ) : (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-2xl transform transition-transform duration-500 group-hover:rotate-1">
                        <Image
                          src={imageUrl}
                          alt={experience.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        <div className="absolute top-6 left-6">
                          <Badge variant="secondary" className="bg-white/95 text-foreground px-4 py-1.5 text-xs tracking-widest font-bold shadow-lg backdrop-blur-md uppercase">
                            {experience.category}
                          </Badge>
                        </div>
                        {/* Decorative Background */}
                        <div className={cn(
                          "absolute -bottom-6 -z-10 w-full h-full rounded-2xl border border-primary/20 bg-primary/5 transition-transform duration-500 group-hover:translate-x-2 group-hover:translate-y-2",
                          isEven ? "-right-6" : "-left-6"
                        )} />
                      </div>
                    )}
                  </div>

                  {/* Content Side */}
                  <div className="w-full lg:w-1/2 flex flex-col items-start text-left space-y-6">
                    <h3 className="font-headline text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight">
                      {experience.title}
                    </h3>

                    <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                      <div className={cn(
                        "transition-all duration-700 ease-in-out overflow-hidden relative",
                        !isExpanded ? "max-h-[120px]" : "max-h-[1000px]"
                      )}>
                        <p className="whitespace-pre-line">
                          {experience.description}
                        </p>
                        {!isExpanded && (
                          <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                        )}
                      </div>
                    </div>

                    <Button
                      variant="link"
                      onClick={() => toggleExpand(experience.id)}
                      className="p-0 h-auto text-primary font-bold tracking-widest hover:text-primary/80 hover:no-underline group/btn flex items-center gap-2 text-sm mt-2"
                    >
                      {isExpanded ? 'READ LESS' : 'READ MORE'}
                      <ArrowRight className={cn(
                        "w-4 h-4 transition-transform duration-300",
                        !isExpanded && "group-hover/btn:translate-x-1",
                        isExpanded && "rotate-180"
                      )} />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-32">
            <div className="relative overflow-hidden rounded-3xl bg-secondary/30 border border-border/60 p-10 md:p-16 max-w-4xl mx-auto">
              {/* Abstract decorative circles */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

              <div className="relative z-10 flex flex-col items-center">
                <h3 className="font-headline text-3xl md:text-4xl mb-4 text-foreground">Ready for an Adventure?</h3>
                <p className="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
                  Contact us to arrange any of these experiences during your stay. We're happy to customize activities to your preferences.
                </p>
                <Link href="/contact" passHref>
                  <Button className="rounded-full px-8 h-12 text-base shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                    INQUIRE NOW <RefreshCw className="w-4 h-4 ml-2 animate-spin-slow" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

