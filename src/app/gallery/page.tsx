
'use client';

import { PageHero } from '@/components/page-hero';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import Image from 'next/image';

export default function GalleryPage() {
  const galleryImages = PlaceHolderImages;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <PageHero
        title="Our Gallery"
        description="Immerse yourself in the visual journey of Oruthota Chalets."
        imageUrl={galleryImages[0]?.imageUrl || ''}
        imageAlt={galleryImages[0]?.description || 'Oruthota Chalets Gallery'}
        imageHint={galleryImages[0]?.imageHint}
      />

      {/* Booking Form Integration */}
      <div className="relative z-20 -mt-16 container mx-auto px-4 mb-12">
        <div className="bg-card rounded-xl shadow-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
          <BookingForm />
        </div>
      </div>

      <section className="pb-20 pt-8 bg-background">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <div className="inline-block">
              <span className="py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
                Oruthota Chalets
              </span>
            </div>
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">
              A Glimpse of Paradise
            </h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-light">
              Explore the beauty and elegance of Oruthota Chalets through our curated gallery.
              Each image captures a moment of the serene and luxurious experience that awaits you.
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {galleryImages.map((p, index) => (
              <div
                key={p.id}
                className="break-inside-avoid relative group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 ease-out"
              >
                <div className="relative w-full overflow-hidden bg-muted">
                  <Image
                    src={p.imageUrl}
                    alt={p.description}
                    width={500}
                    height={p.imageUrl.includes('1080') ? 720 : 300}
                    className="object-cover w-full h-auto transition-transform duration-700 ease-in-out group-hover:scale-110"
                    data-ai-hint={p.imageHint}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
