
'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';

export default function GalleryPage() {
  const galleryImages = PlaceHolderImages;

  return (
    <div className="flex flex-col">
      <section className="relative h-[50vh] min-h-[400px] w-full">
        {galleryImages[0] && (
          <Image
            src={galleryImages[0].imageUrl}
            alt={galleryImages[0].description}
            fill
            className="object-cover"
            priority
            data-ai-hint={galleryImages[0].imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 w-full px-4 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-headline text-5xl md:text-7xl tracking-wider font-normal text-white/90">
              Gallery
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
          <p className="text-primary tracking-widest mb-4">PHOTO GALLERY</p>
          <h2 className="font-headline text-4xl text-foreground mb-6">A Glimpse of Paradise</h2>
          <p className="text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Explore the beauty and elegance of Oruthota Chalets through our curated gallery. Each image captures a moment of the serene and luxurious experience that awaits you.
          </p>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {galleryImages.map((p) => (
              <div key={p.id} className="break-inside-avoid">
                <Image
                  src={p.imageUrl}
                  alt={p.description}
                  width={500}
                  height={p.imageUrl.includes('1080') ? 720 : 300}
                  className="object-cover w-full h-auto rounded-lg shadow-lg"
                  data-ai-hint={p.imageHint}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
