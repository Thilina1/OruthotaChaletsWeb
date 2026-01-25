'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useCollection, useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import type { Experience } from '@/types/experience';


export default function ExperiencesPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'experience-hike');
  
  const firestore = useFirestore();
  const experiencesCollectionRef = useMemo(
    () => (firestore ? collection(firestore, 'experiences') : null),
    [firestore]
  );
  const { data: experiences, isLoading } = useCollection<Experience>(experiencesCollectionRef);


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
                    Experiences
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
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.2em] text-muted-foreground">UNFORGETTABLE</p>
            <h2 className="font-headline text-4xl text-foreground mt-2">EXPERIENCES</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
             {isLoading && <p className="text-center col-span-3">Loading experiences...</p>}
             {experiences?.map((experience) => (
                <div key={experience.id} className="text-center">
                  {experience.imageUrl && (
                    <div className="relative h-96 mb-6">
                      <Image
                        src={experience.imageUrl}
                        alt={experience.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <h3 className="font-headline text-2xl text-foreground mb-2">{experience.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed px-4">
                    {experience.description}
                  </p>
                </div>
              ))}
          </div>
          <div className="text-center mt-12">
            <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-sm tracking-wider">
              INQUIRE NOW <RefreshCw className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

    