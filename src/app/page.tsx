'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { Utensils, BedDouble, MountainSnow, Map, Tag, Bed, Building2, RefreshCw, Star, ArrowRight, MapPin, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Link from 'next/link';
import { useSupabaseCollection } from '@/hooks/use-supabase';
import type { Room } from '@/types/room';
import type { Experience } from '@/types/experience';

const testimonials = [
  {
    id: 'testimonial-1',
    name: 'John Doe',
    location: 'New York, USA',
    quote: 'An unforgettable stay! The colonial charm, combined with modern luxury, made our trip to Kandy truly special. The views are breathtaking, and the service is impeccable. We felt like royalty.'
  },
  {
    id: 'testimonial-2',
    name: 'Emily Williams',
    location: 'London, UK',
    quote: 'Oruthota Chalets is a gem. The serene environment and the beautifully restored bungalow provided the perfect escape. The staff went above and beyond to make our stay comfortable. Highly recommended!'
  },
  {
    id: 'testimonial-3',
    name: 'David Chen',
    location: 'Sydney, Australia',
    quote: 'From the moment we arrived, we were captivated by the elegance and tranquility of this place. The personalized experiences and the attention to detail are what set this hotel apart. A must-visit in Sri Lanka.'
  }
];

export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-estate');
  const aboutImage = PlaceHolderImages.find((p) => p.id === 'about-us-image');
  const testimonialImages = PlaceHolderImages.filter(p => p.id.startsWith('testimonial-'));
  const diningImage = PlaceHolderImages.find(p => p.id === 'dining-wine');

  const { data: rooms, isLoading: roomsLoading } = useSupabaseCollection<Room>('rooms');
  const { data: experiences, isLoading: experiencesLoading } = useSupabaseCollection<Experience>('experiences');

  return (
    <div className="flex flex-col">
      <section className="relative h-screen min-h-[700px] w-full flex flex-col justify-center">
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
        <br></br><br></br><br></br><br></br>
        <div className="relative z-10 flex flex-col flex-grow justify-center items-center text-center text-white px-4">
          <div className="flex flex-col items-center justify-center md:mt-0">
            <h1 className="font-headline text-5xl md:text-8xl tracking-wider font-normal text-white/90 mt-32 md:mt-0">
              Oruthota Chalets
            </h1>
            <p className="mt-2 text-lg md:text-2xl text-white/80">
              The Aura of Tranquility
            </p>
            <div className="mt-8 flex flex-wrap justify-center items-center gap-4 md:gap-8">
              <div className="flex items-center gap-2">
                <Utensils className="h-6 w-6 text-white" />
                <span className="text-white font-light text-sm">Fine Dining</span>
              </div>
              <div className="flex items-center gap-2">
                <BedDouble className="h-6 w-6 text-white" />
                <span className="text-white font-light text-sm">Luxury Rooms</span>
              </div>
              <div className="flex items-center gap-2">
                <MountainSnow className="h-6 w-6 text-white" />
                <span className="text-white font-light text-sm">Excursions</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-20 p-4 md:px-4 mt-auto w-full">
          <BookingForm />
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="px-4 text-sm tracking-widest text-muted-foreground">ORUTHOTA CHALETS</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>
          <h2 className="font-headline text-5xl text-foreground mb-6">Welcome to Oruthota Chalets</h2>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p className="font-semibold text-lg">The Aura of Tranquility</p>
            <p>
              Oruthota Chalets… a beautiful family-oriented holiday resort overlooking the waters of the Victoria Reservoir is located approximately 18 kilometers from the city of Kandy. This eco-friendly resort is nestled amidst a picturesque, tranquil and rural setting, well away from the busyness of a city life.
            </p>
            <p>
              Access to Oruthota Chalets is through a typical rural road of about a kilometre, off the main road. Experience the rural lifestyles of a little hamlet, with multi-religious influences whilst driving to this unique concept of a beautiful eco-friendly holiday resort.
            </p>
            <p>
              Enjoy the perfect ambiance for a well-deserved, relaxed holiday in the Hill Country of Sri Lanka. Here is the ideal destination to unwind yourself from your busy lifestyle and enjoy the nature that surrounds Oruthota Chalets – a stay to be remembered always!!!!
            </p>
          </div>
          <div className="mt-8">
            <Link href="https://www.google.com/maps/search/?api=1&query=Kandy" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white">
                <MapPin className="mr-2 h-4 w-4" />
                Location on Map
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-16 text-center">
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-end">
                <span className="font-headline text-6xl text-primary tracking-tighter">45</span>
                <span className="font-headline text-2xl text-primary ml-1 mb-1">min</span>
              </div>
              <p className="tracking-[0.2em] text-xs text-muted-foreground mt-1">TO KANDY CITY</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-end">
                <span className="font-headline text-6xl text-primary tracking-tighter">1</span>
                <span className="font-headline text-2xl text-primary ml-1 mb-1">Hrs</span>
              </div>
              <p className="tracking-[0.2em] text-xs text-muted-foreground mt-1">TO KNUCKLES</p>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="flex items-end">
                <span className="font-headline text-6xl text-primary tracking-tighter">4</span>
                <span className="font-headline text-2xl text-primary ml-1 mb-1">Hrs</span>
              </div>
              <p className="tracking-[0.2em] text-xs text-muted-foreground mt-1">TO COLOMBO</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left">
              <p className="text-primary tracking-widest mb-2">ORUTHOTA CHALETS</p>
              <h2 className="font-headline text-4xl text-foreground mb-6">A Hidden Fairytale by the Waters of Victoria</h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Nestled amidst the serene landscapes of Sri Lanka’s Hill Country, Oruthota Chalets is a hidden fairytale overlooking the tranquil waters of the Victoria Reservoir, just 18 kilometers from the historic city of Kandy. Set within a picturesque rural setting, this eco-friendly, family-oriented retreat offers a peaceful escape far removed from the bustle of city life. Reached via a charming village road, guests are gently introduced to the authentic rhythms of a small hamlet enriched with multi-religious traditions. From reconnecting with nature to unwinding in storybook-like surroundings, Oruthota Chalets promises a truly relaxing getaway and memories to cherish long after your stay. ✨🌿
              </p>
              <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white">
                FACT SHEET
              </Button>
            </div>
            {aboutImage && (
              <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src={aboutImage.imageUrl}
                  alt={aboutImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={aboutImage.imageHint}
                />
              </div>
            )}
          </div>
        </div>
      </section >

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-primary tracking-widest mb-4">ACCOMMODATION</p>
          <h2 className="font-headline text-4xl text-foreground mb-6">Tropical Tranquility and Contemporary Elegance</h2>
          <p className="text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
            Experience Bawa's tropical modernist design with breathtaking lake views and lush jungle canopies just minutes from iconic cultural landmarks like the Dambulla Cave Temples and Sigiriya Rock Fortress. Relaxing serene rooms and suites which blend nature, exclusivity and contemporary comforts.
          </p>
          <div className="flex justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <Bed className="h-8 w-8 text-primary" />
              <span className="text-foreground font-semibold">137 Rooms</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-foreground font-semibold">15 Suites</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <Carousel
            opts={{
              align: "center",
            }}
            className="w-full"
          >
            <CarouselContent className="justify-center">
              {roomsLoading && <p className="text-center w-full">Loading rooms...</p>}
              {!roomsLoading && (!rooms || rooms.length === 0) && (
                <p className="text-center w-full text-muted-foreground p-8">No rooms available at the moment.</p>
              )}
              {rooms?.slice(0, 3).map((accommodation) => {
                return (
                  <CarouselItem key={accommodation.id} className="md:basis-1/2 lg:basis-1/3">
                    <div className="p-1">
                      <div className="bg-background">
                        {accommodation.imageUrl && (
                          <div className="relative h-80">
                            <Image
                              src={accommodation.imageUrl}
                              alt={accommodation.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <div className="p-8 text-center">
                          <h3 className="font-headline text-3xl text-foreground relative inline-block">
                            {accommodation.title}
                            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-1/4 border-b-2 border-primary"></div>
                          </h3>
                          <p className="text-muted-foreground mt-8 text-sm leading-relaxed min-h-[120px]">
                            {accommodation.description}
                          </p>
                          <div className="flex items-center justify-center gap-4 text-sm text-foreground my-8">
                            <span>{accommodation.roomCount} Rooms</span>
                            <div className="w-px h-4 bg-border"></div>
                            <span>{accommodation.view}</span>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Link href="/accommodations" passHref>
                              <Button variant="link" className="text-foreground font-semibold tracking-wider hover:text-primary">
                                MORE DETAILS
                              </Button>
                            </Link>
                            <Link href={`/booking?roomId=${accommodation.id}`} passHref>
                              <Button className="bg-primary text-primary-foreground rounded-sm font-semibold tracking-wider hover:bg-primary/90">
                                BOOK NOW
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <CarouselPrevious className="static -translate-y-0 rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
              <CarouselNext className="static -translate-y-0 rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground" />
            </div>
          </Carousel>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center border p-4">
            <div className="p-8 text-center">
              <p className="text-sm tracking-[0.2em] text-muted-foreground">UNFORGETTABLE</p>
              <h2 className="font-headline text-4xl text-foreground mt-2">WINE &amp; DINE</h2>
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
                FIND OUT MORE <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            {diningImage && (
              <div className="relative h-96 min-h-[300px]">
                <Image
                  src={diningImage.imageUrl}
                  alt={diningImage.description}
                  fill
                  className="object-cover"
                  data-ai-hint={diningImage.imageHint}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.2em] text-muted-foreground">UNFORGETTABLE</p>
            <h2 className="font-headline text-4xl text-foreground mt-2">EXPERIENCES</h2>
            <p className="text-muted-foreground leading-relaxed mt-4 max-w-2xl mx-auto">
              Explore the rich cultural heritage and breathtaking landscapes that surround Oruthota Chalets. From ancient temples to scenic hikes, our curated experiences offer a glimpse into the soul of Sri Lanka.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {experiencesLoading && <p className="col-span-3 text-center">Loading experiences...</p>}
            {!experiencesLoading && (!experiences || experiences.length === 0) && (
              <p className="col-span-3 text-center text-muted-foreground">Experiences coming soon.</p>
            )}
            {experiences?.slice(0, 3).map((experience) => {
              return (
                <div key={experience.id} className="text-center w-full md:w-[30%] min-w-[300px]">
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
              );
            })}
          </div>
          <div className="text-center mt-12">
            <Link href="/experiences" passHref>
              <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-sm tracking-wider">
                VIEW ALL EXPERIENCES <RefreshCw className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.2em] text-primary">TESTIMONIALS</p>
            <h2 className="font-headline text-4xl text-foreground mt-2">What Our Guests Say</h2>
          </div>
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-4xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {testimonials.map((testimonial, index) => {
                const image = testimonialImages.find(img => img.id === testimonial.id);
                return (
                  <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2">
                    <div className="h-full transform transition-all duration-300 hover:-translate-y-1">
                      <div className="bg-card text-card-foreground shadow-lg rounded-xl p-8 md:p-10 text-center flex flex-col items-center gap-6 border h-full relative overflow-hidden group">
                        <div className="absolute top-4 right-6 opacity-10">
                          <Quote className="h-24 w-24 text-primary rotate-180" />
                        </div>

                        {image && (
                          <div className="relative h-24 w-24 rounded-full overflow-hidden shrink-0 border-4 border-primary/10 shadow-md z-10">
                            <Image
                              src={image.imageUrl}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                              data-ai-hint={image.imageHint}
                            />
                          </div>
                        )}
                        <div className="z-10 flex flex-col items-center w-full">
                          <div className="flex mb-4">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>
                          <p className="text-muted-foreground italic leading-relaxed mb-6 text-lg">
                            "{testimonial.quote}"
                          </p>
                          <div className="mt-auto">
                            <h3 className="font-bold text-foreground text-lg uppercase tracking-wide">{testimonial.name}</h3>
                            <p className="text-xs text-primary font-medium tracking-wider mt-1">{testimonial.location}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground hidden md:flex" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 rounded-full border-primary text-primary hover:bg-primary hover:text-primary-foreground hidden md:flex" />
          </Carousel>
        </div>
      </section>

    </div >
  );



}


