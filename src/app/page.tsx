'use client';
import { useRef } from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { Utensils, BedDouble, MountainSnow, Map, Tag, Bed, Building2, RefreshCw, Star, ArrowRight, MapPin, ChevronLeft, ChevronRight, Quote, User, Download } from 'lucide-react';
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
  const meetingsImage = PlaceHolderImages.find((p) => p.id === 'events-meetings');
  const weddingsImage = PlaceHolderImages.find((p) => p.id === 'events-weddings');

  const { data: rooms, isLoading: roomsLoading } = useSupabaseCollection<Room>('rooms');
  const { data: experiences, isLoading: experiencesLoading } = useSupabaseCollection<Experience>('experiences');

  return (
    <div className="flex flex-col">
      <section className="relative h-screen min-h-[700px] w-full flex flex-col justify-center">
        <Image
          src="/Hero1.jpg"
          alt="Oruthota Chalets Hero Image"
          fill
          className="object-cover"
          priority
        />
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
              <div className="flex flex-wrap gap-4 mt-8">
                <Link href="/fact-sheet" passHref>
                  <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white px-8 h-12 text-sm tracking-widest font-bold">
                    FACT SHEET
                  </Button>
                </Link>
                <Button 
                  variant="default" 
                  className="rounded-none bg-primary text-white hover:bg-[#283618] px-8 h-12 text-sm tracking-widest font-bold flex items-center gap-2 group"
                  onClick={() => window.print()}
                >
                  <Download className="w-4 h-4 transition-transform group-hover:-translate-y-1" />
                  DOWNLOAD PDF
                </Button>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
              <Image
                src="/DSCN1986.jpg"
                alt="Oruthota Chalets"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section >

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <p className="text-primary tracking-widest mb-4">ACCOMMODATION</p>
          <h2 className="font-headline text-4xl text-foreground mb-6">Eco-Friendly Comfort by the Reservoir</h2>
          <p className="text-muted-foreground leading-relaxed mb-12 max-w-3xl mx-auto">
            Nestled amidst the serene hill country landscapes, our chalets and rooms offer breathtaking views of the Victoria Reservoir and the surrounding lush greenery. Each space is thoughtfully designed to blend rustic charm with modern comforts, ensuring a peaceful and memorable stay just 18 kilometres from Kandy.
          </p>
          <div className="flex justify-center items-center gap-8">
            <div className="flex items-center gap-3">
              <Bed className="h-8 w-8 text-primary" />
              <span className="text-foreground font-semibold">Chalets</span>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-primary" />
              <span className="text-foreground font-semibold">Rooms</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full"
          >
            <CarouselContent className="md:justify-center">
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
                        <div className="p-8 text-left md:text-center">
                          <h3 className="font-headline text-3xl text-foreground relative inline-block">
                            {accommodation.title}
                            <div className="absolute bottom-[-10px] left-0 md:left-1/2 md:-translate-x-1/2 w-1/4 border-b-2 border-primary"></div>
                          </h3>
                          <p className="text-muted-foreground mt-8 text-sm leading-relaxed min-h-[120px]">
                            {accommodation.description}
                          </p>
                          <div className="flex items-center justify-start md:justify-center gap-4 text-sm text-foreground my-8">
                            <span>{accommodation.roomCount} Rooms</span>
                            <div className="w-px h-4 bg-border"></div>
                            <span>{accommodation.view}</span>
                          </div>
                          <div className="flex gap-2 justify-start md:justify-center">
                            <Link href="/accommodations" passHref>
                              <Button variant="link" className="text-foreground font-semibold tracking-wider hover:text-primary pl-0 md:pl-4">
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
              <Button asChild variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white">
                <Link href="/dining">
                  FIND OUT MORE <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="relative h-96 min-h-[300px]">
              <Image
                src="/Restaurant.png"
                alt="Wine & Dine at Oruthota Chalets"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-6">
              <div className="h-px bg-foreground w-16 mx-4"></div>
              <p className="text-xs tracking-[0.3em] font-semibold text-muted-foreground uppercase">EXPERIENCES</p>
              <div className="h-px bg-foreground w-16 mx-4"></div>
            </div>
            <h2 className="font-headline text-4xl text-foreground mb-6">Discover the Beauty and Culture of Oruthota Chalets</h2>
            <p className="text-muted-foreground leading-relaxed max-w-4xl mx-auto text-sm">
              At Oruthota Chalets, every moment is crafted to create lasting memories. From relaxing in our mist-filled surroundings to discovering the many things to do in Kandy, or immersing yourself in the rich history of the region, we promise an unforgettable experience that will stay with you long after you leave.
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
            <h2 className="font-headline text-4xl text-foreground mt-2">Unforgettable Events</h2>
            <p className="text-muted-foreground mt-4">
              Design and enhance your event experiences with the very best of Oruthota Chalets
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-12 max-w-7xl mx-auto">
            <div className="border bg-[#FEFAE0] flex flex-col">
              {meetingsImage && (
                <div className="relative h-[300px] w-full">
                  <Image src={meetingsImage.imageUrl} alt={meetingsImage.description} fill className="object-cover" />
                </div>
              )}
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="font-headline text-3xl mb-4 text-[#283618]">Meetings & Events</h3>
                <p className="text-muted-foreground text-md leading-relaxed mb-8 flex-grow">
                  Achieve more with meetings and events that are not only brilliant and beautiful, but also engaging, polished and productive. Created to empower your imagination, our meeting and events offering brings...
                </p>
                <Link href="/events" passHref>
                  <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white px-10 h-12 text-sm tracking-widest font-bold uppercase transition-all">Learn More</Button>
                </Link>
              </div>
            </div>

            <div className="border bg-[#FEFAE0] flex flex-col">
              <div className="relative h-[300px] w-full">
                <Image src="/wedding.png" alt="Weddings and Celebrations" fill className="object-cover" />
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="font-headline text-3xl mb-4 text-[#283618]">Weddings and Celebrations</h3>
                <p className="text-muted-foreground text-md leading-relaxed mb-8 flex-grow">
                  At Oruthota Chalets, your dream wedding comes to life with luxurious venues and a dedicated team, creating unforgettable moments that celebrate your unique love story.
                </p>
                <Link href="/events" passHref>
                  <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white px-10 h-12 text-sm tracking-widest font-bold uppercase transition-all">Learn More</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 bg-[#FAFAFA] relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#606C38]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#DDA15E]/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-20 space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="py-1 px-4 rounded-full bg-[#606C38]/10 text-[#606C38] text-xs font-bold tracking-[0.2em] uppercase">
                Guest Experiences
              </span>
            </div>
            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#283618]">What Our Guests Say</h2>
            <div className="w-24 h-1 bg-[#606C38]/20 mx-auto rounded-full" />
          </div>

          <div className="max-w-6xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 5000,
                  stopOnInteraction: false,
                  stopOnMouseEnter: true,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {testimonials.map((testimonial, index) => {
                  const image = testimonialImages.find(img => img.id === testimonial.id);
                  return (
                    <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2">
                      <div className="h-full transform transition-all duration-500">
                        <div className="bg-white p-10 md:p-12 rounded-[2.5rem] shadow-[0_10px_50px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col items-center text-center gap-8 h-full relative overflow-hidden group hover:border-[#606C38]/30 transition-all">
                          <div className="absolute top-8 right-10 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                            <Quote className="h-24 w-24 text-[#606C38] rotate-180" />
                          </div>

                          <div className="flex items-center gap-1 z-10">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>

                          <p className="text-[#283618]/80 italic leading-relaxed text-xl md:text-2xl font-body z-10 relative">
                            "{testimonial.quote}"
                          </p>

                          <div className="mt-auto flex flex-col items-center gap-4 z-10">
                            {image ? (
                              <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-[#606C38]/20 shadow-sm">
                                <Image
                                  src={image.imageUrl}
                                  alt={testimonial.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-[#606C38]/10 flex items-center justify-center">
                                <User className="w-8 h-8 text-[#606C38]" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-[#283618] text-lg tracking-wide uppercase">{testimonial.name}</h3>
                              <p className="text-xs text-[#606C38] font-bold tracking-widest mt-1 opacity-70 uppercase">{testimonial.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="flex justify-center items-center gap-6 mt-16">
                 <CarouselPrevious className="static -translate-y-0 w-14 h-14 rounded-2xl border-stone-200 text-[#606C38] hover:bg-[#606C38] hover:text-white transition-all shadow-sm" />
                 <Link href="/reviews">
                    <Button variant="outline" className="h-14 px-10 rounded-2xl border-stone-200 text-[#606C38] font-bold tracking-widest uppercase hover:bg-[#606C38] hover:text-white transition-all group">
                        View All Stories <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-2" />
                    </Button>
                 </Link>
                 <CarouselNext className="static -translate-y-0 w-14 h-14 rounded-2xl border-stone-200 text-[#606C38] hover:bg-[#606C38] hover:text-white transition-all shadow-sm" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

    </div >
  );



}


