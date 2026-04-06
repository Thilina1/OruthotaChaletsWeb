'use client';
import { useRef, useState } from 'react';
import Image from 'next/image';
import Autoplay from 'embla-carousel-autoplay';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { STATIC_EXPERIENCES } from '@/data/experiences';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { Utensils, BedDouble, MountainSnow, Map, Tag, Bed, Building2, RefreshCw, Star, ArrowRight, MapPin, ChevronLeft, ChevronRight, Quote, User, Download, Facebook, Instagram } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import Link from 'next/link';
import { useSupabaseCollection } from '@/hooks/use-supabase';
import type { Room } from '@/types/room';
import type { Experience } from '@/types/experience';
import { RoomDetailsModal } from '@/components/room-details-modal';

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.59-5.71-.29-2.63.85-5.21 2.87-6.9 1.47-1.21 3.39-1.84 5.3-1.74v4.02c-1.22-.06-2.45.36-3.33 1.25-.97.94-1.38 2.37-1.05 3.68.32 1.48 1.62 2.65 3.12 2.8 1.2.14 2.44-.24 3.34-1.03.74-.7 1.11-1.74 1.09-2.74-.01-4.8.01-9.6-.01-14.4z" />
  </svg>
);

const testimonials = [
  {
    id: 'testimonial-1',
    name: 'Anton Selvakumar Dilan',
    location: 'Guest Review',
    quote: 'Stayed at this property for 02 nights with friends and really liked it and enjoyed our stay. The resort is located by the lake/river front. The sceneries are really lovely…'
  },
  {
    id: 'testimonial-2',
    name: 'Peter Gayan Munasinghe',
    location: 'Guest Review',
    quote: 'I love this place because of the environment. It is in a beautiful location. Someone can say its too far from city, but to experience the Creation you must visit. Tasty food according to your taste. Friendly staff will help you experience.'
  },
  {
    id: 'testimonial-3',
    name: 'Saman IWA Tours ~ Sri Lanka',
    location: 'Travel Professional',
    quote: 'Hotel manager from the front desk made us feel welcomed and comfortable. The villa is spotlessly clean and the rooms are big and spacious and the beds are so comfortable. The view from our room was very pleasant. The pool is great. Distant views so beautiful. The staff were superb. Definitely we will be back and highly recommend this place.'
  },
  {
    id: 'testimonial-4',
    name: 'Ramalingam J',
    location: 'Business Guest',
    quote: 'A very beautiful masterpiece by Mr. Michael Sansoni. What a great view of the Victoria Lake and the surrounding mountains, the garden and the set up. The service is par excellence. Food was great. Best recommended.'
  }
];


export default function Home() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'hero-estate');
  const aboutImage = PlaceHolderImages.find((p) => p.id === 'about-us-image');
  const diningImage = PlaceHolderImages.find(p => p.id === 'dining-wine');
  const meetingsImage = PlaceHolderImages.find((p) => p.id === 'events-meetings');
  const weddingsImage = PlaceHolderImages.find((p) => p.id === 'events-weddings');

  const { data: rooms, isLoading: roomsLoading } = useSupabaseCollection<Room>('rooms');
  const { data: experiences, isLoading: experiencesLoading } = useSupabaseCollection<Experience>('experiences');
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

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
          <div className="mt-8 flex flex-col items-center gap-8">
            <Link href="https://maps.app.goo.gl/TpzL2ciq5FgdUk6M9" target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-sm tracking-[0.2em] font-medium transition-all duration-300">
                <MapPin className="mr-3 h-5 w-5" />
                LOCATION ON MAP
              </Button>
            </Link>

            <div className="flex items-center gap-6">
              <div className="h-px w-12 bg-gray-200"></div>
              <div className="flex gap-4">
                <Link href="https://web.facebook.com/OruthotaChaletsKandy/?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer" title="Follow us on Facebook">
                  <Button variant="ghost" size="icon" className="rounded-full text-primary hover:text-white hover:bg-primary transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-primary">
                    <Facebook className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://www.instagram.com/oruthotachalets/" target="_blank" rel="noopener noreferrer" title="Follow us on Instagram">
                  <Button variant="ghost" size="icon" className="rounded-full text-primary hover:text-white hover:bg-primary transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-primary">
                    <Instagram className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="https://www.tiktok.com/@oruthota_chalets?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer" title="Follow us on TikTok">
                  <Button variant="ghost" size="icon" className="rounded-full text-primary hover:text-white hover:bg-primary transition-all duration-300 hover:scale-110 shadow-sm border border-transparent hover:border-primary">
                    <TikTokIcon className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
              <div className="h-px w-12 bg-gray-200"></div>
            </div>
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
                            <Button
                              variant="link"
                              className="text-foreground font-semibold tracking-wider hover:text-primary pl-0 md:pl-4"
                              onClick={() => setSelectedRoom(accommodation)}
                            >
                              MORE DETAILS
                            </Button>
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

        {/* Explore CTA */}
        <div className="text-center mt-12">
          <Link href="/accommodations" passHref>
            <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white px-8 py-6 text-sm tracking-wider">
              VIEW ACCOMMODATIONS <RefreshCw className="w-4 h-4 ml-2" />
            </Button>
          </Link>
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
            {STATIC_EXPERIENCES.filter(exp =>
              ['culinary-tourism', 'knuckles-trek', 'rural-activities'].includes(exp.id)
            ).map((experience) => {
              const imageUrl = experience.galleryImages?.[0] || PlaceHolderImages.find(p => p.id === experience.imageId)?.imageUrl || '/placeholder.svg';
              return (
                <div key={experience.id} className="group text-center w-full md:w-[30%] min-w-[300px]">
                  <div className="relative h-96 mb-8 overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                    <Image
                      src={imageUrl}
                      alt={experience.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-6 left-0 right-0 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <Link href="/experiences" className="inline-flex items-center text-white font-bold tracking-widest text-xs uppercase">
                        Explore More <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </div>
                  </div>
                  <h3 className="font-headline text-2xl text-foreground mb-3 transition-colors group-hover:text-primary">{experience.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed px-4 line-clamp-3">
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
            <div className="border bg-[#FEFAE0] flex flex-col items-stretch">
              <div className="relative h-[300px] w-full overflow-hidden">
                <Image
                  src={meetingsImage?.imageUrl || "/meetings.jpg"}
                  alt={meetingsImage?.description || "Meetings & Corporate Events"}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              </div>
              <div className="p-10 flex flex-col flex-grow">
                <h3 className="font-headline text-3xl mb-4 text-[#283618]">Meetings & Events</h3>
                <p className="text-muted-foreground text-md leading-relaxed mb-8 flex-grow">
                  Achieve more with meetings and events that are not only brilliant and beautiful, but also engaging, polished and productive. Created to empower your imagination, our meeting and events offering brings together the best of technology and nature.
                </p>
                <Link href="/events" passHref>
                  <Button variant="outline" className="rounded-none border-primary text-primary hover:bg-primary hover:text-white px-10 h-12 text-sm tracking-widest font-bold uppercase transition-all">Learn More</Button>
                </Link>
              </div>
            </div>

            <div className="border bg-[#FEFAE0] flex flex-col">
              <div className="relative h-[300px] w-full overflow-hidden">
                <Image
                  src="/wedding.png"
                  alt="Weddings and Celebrations"
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
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
            <h2 className="font-headline text-xl md:text-2xl lg:text-3xl text-[#283618]">What Our Guests Say</h2>
            <div className="w-16 h-0.5 bg-[#606C38]/20 mx-auto rounded-full" />
          </div>

          <div className="max-w-5xl mx-auto">
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
                  return (
                    <CarouselItem key={testimonial.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                      <div className="h-full transform transition-all duration-500">
                        <div className="bg-white p-5 md:p-6 rounded-[2rem] shadow-[0_10px_50px_rgb(0,0,0,0.04)] border border-stone-100 flex flex-col items-center text-center gap-3 h-full relative overflow-hidden group hover:border-[#606C38]/30 transition-all">
                          <div className="absolute top-4 right-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500">
                            <Quote className="h-10 w-10 text-[#606C38] rotate-180" />
                          </div>

                          <div className="flex items-center gap-1 z-10">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                            ))}
                          </div>

                          <p className="text-[#283618]/80 italic leading-relaxed text-xs md:text-sm font-body z-10 relative">
                            "{testimonial.quote}"
                          </p>

                          <div className="mt-auto flex flex-col items-center gap-1 z-10">
                            <div>
                              <h3 className="font-bold text-[#283618] text-xs tracking-wide uppercase">{testimonial.name}</h3>
                              <p className="text-[8px] text-[#606C38] font-bold tracking-widest opacity-70 uppercase">{testimonial.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <div className="flex justify-center items-center gap-6 mt-16">
                <CarouselPrevious className="static -translate-y-0 w-10 h-10 rounded-xl border-stone-200 text-[#606C38] hover:bg-[#606C38] hover:text-white transition-all shadow-sm" />
                <Link href="/reviews">
                  <Button variant="outline" className="h-10 px-6 rounded-xl border-stone-200 text-[#606C38] text-xs font-bold tracking-widest uppercase hover:bg-[#606C38] hover:text-white transition-all group">
                    View All Stories <ArrowRight className="ml-2 w-3 h-3 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
                <CarouselNext className="static -translate-y-0 w-10 h-10 rounded-xl border-stone-200 text-[#606C38] hover:bg-[#606C38] hover:text-white transition-all shadow-sm" />
              </div>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Reviews CTA Section */}
      <section className="py-16 bg-white border-t border-stone-100 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              plugins={[
                Autoplay({
                  delay: 4000,
                  stopOnInteraction: false,
                }),
              ]}
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-8">
                {/* TripAdvisor Card */}
                <CarouselItem className="pl-4 md:pl-8 basis-full lg:basis-1/2">
                  <div className="bg-[#FEFAE0]/40 rounded-[2rem] p-6 md:p-10 text-center border border-[#606C38]/10 shadow-[0_15px_40px_rgba(96,108,56,0.05)] relative group overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
                    {/* Decorative background logo */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                      <Image src="/logotipo-tripadvisor.png" alt="" width={200} height={200} className="object-contain grayscale" />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-center">
                        <div className="relative w-[120px] h-[28px] transition-transform duration-300 hover:scale-110">
                          <Image
                            src="/logotipo-tripadvisor.png"
                            alt="TripAdvisor"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h2 className="font-headline text-2xl md:text-3xl text-[#283618]">Have you stayed with us?</h2>
                        <p className="text-muted-foreground text-md leading-relaxed">
                          We would love to hear about your experience. Your feedback helps us maintain the highest standards.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link
                          href="https://www.tripadvisor.com/Hotel_Review-g1199439-d1052258-Reviews-Oruthota_Chalets-Digana_Kandy_District_Central_Province.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-[#606C38] text-white hover:bg-[#283618] rounded-full px-8 h-12 text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 group/btn">
                            Write a Review
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>

                      <div className="pt-4 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-4 h-4 rounded-full bg-[#00AF87] flex items-center justify-center">
                                <Star className="h-2 w-2 text-white fill-current" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[#283618] font-bold text-sm">Excellent</span>
                        </div>
                        <span className="text-stone-400 text-[9px] font-bold tracking-widest uppercase">Highly Recommended on Tripadvisor</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Google Reviews Card */}
                <CarouselItem className="pl-4 md:pl-8 basis-full lg:basis-1/2">
                  <div className="bg-[#E3F2FD]/40 rounded-[2rem] p-6 md:p-10 text-center border border-[#1976D2]/10 shadow-[0_15px_40px_rgba(25,118,210,0.05)] relative group overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
                    {/* Decorative background logo */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                      <Image src="/google-logo.png" alt="" width={200} height={200} className="object-contain grayscale" />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-center">
                        <div className="relative w-[120px] h-[28px] transition-transform duration-300 hover:scale-110">
                          <Image
                            src="/google-logo.png"
                            alt="Google Reviews"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h2 className="font-headline text-2xl md:text-3xl text-[#1A237E]">Love our services?</h2>
                        <p className="text-muted-foreground text-md leading-relaxed">
                          Please share your experience on Google. Your feedback is invaluable to us and our future guests.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link
                          href="https://www.google.com/search?q=Oruthota+Chalets+Digana#lrd=0x3ae360e9f6ed0591:0x7b6a1200021c3260,1,,,"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-[#1976D2] text-white hover:bg-[#0D47A1] rounded-full px-8 h-12 text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 group/btn">
                            Write a Review
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>

                      <div className="pt-4 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-4 h-4 rounded-full bg-[#FBBC05] flex items-center justify-center">
                                <Star className="h-2 w-2 text-white fill-current" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[#1A237E] font-bold text-sm">Excellent</span>
                        </div>
                        <span className="text-stone-400 text-[9px] font-bold tracking-widest uppercase">Highly Recommended on Google</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Booking.com Card */}
                <CarouselItem className="pl-4 md:pl-8 basis-full lg:basis-1/2">
                  <div className="bg-[#E7F2F9]/40 rounded-[2rem] p-6 md:p-10 text-center border border-[#003580]/10 shadow-[0_15px_40px_rgba(0,53,128,0.05)] relative group overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
                    {/* Decorative background logo */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                      <Image src="/booking-logo.svg" alt="" width={200} height={200} className="object-contain grayscale" />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-center">
                        <div className="relative w-[150px] h-[35px] transition-transform duration-300 hover:scale-110">
                          <Image
                            src="/booking-logo.svg"
                            alt="Booking.com"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h2 className="font-headline text-2xl md:text-3xl text-[#003580]">Trusted by Travelers</h2>
                        <p className="text-muted-foreground text-md leading-relaxed">
                          We are proud to be highly rated on Booking.com. See what our global guests are saying about their stay.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link
                          href="https://www.booking.com/hotel/lk/oruthota-chalets.en-gb.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-[#003580] text-white hover:bg-[#00224D] rounded-full px-8 h-12 text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 group/btn">
                            View Reviews
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>

                      <div className="pt-4 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-[#003580] text-white px-2 py-1 rounded-md font-bold text-lg">9.1</div>
                          <div className="flex flex-col items-start leading-none">
                            <span className="text-[#003580] font-bold text-sm">Superb</span>
                            <span className="text-stone-400 text-[9px] font-bold tracking-widest uppercase mt-0.5">Recommended on Booking.com</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>

                {/* Agoda Card */}
                <CarouselItem className="pl-4 md:pl-8 basis-full lg:basis-1/2">
                  <div className="bg-[#FFF9E6]/40 rounded-[2rem] p-6 md:p-10 text-center border border-[#FCB716]/10 shadow-[0_15px_40px_rgba(252,183,22,0.05)] relative group overflow-hidden flex flex-col justify-between h-full min-h-[400px]">
                    {/* Decorative background logo */}
                    <div className="absolute -right-10 -bottom-10 opacity-[0.03] group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                      <Image src="/color-default.svg" alt="" width={200} height={200} className="object-contain grayscale" />
                    </div>

                    <div className="relative z-10 space-y-6">
                      <div className="flex justify-center">
                        <div className="relative w-[120px] h-[35px] transition-transform duration-300 hover:scale-110">
                          <Image
                            src="/color-default.svg"
                            alt="Agoda"
                            fill
                            className="object-contain"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h2 className="font-headline text-2xl md:text-3xl text-[#283618]">Top Rated on Agoda</h2>
                        <p className="text-muted-foreground text-md leading-relaxed">
                          Join thousands of travelers who have chosen Oruthota Chalets as their preferred destination on Agoda.
                        </p>
                      </div>

                      <div className="pt-2">
                        <Link
                          href="https://www.agoda.com/oruthota-chalets/hotel/kandy-lk.html"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-[#FF5A5F] text-white hover:bg-[#D32F2F] rounded-full px-8 h-12 text-sm font-bold tracking-widest uppercase shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 group/btn">
                            Check Agoda Reviews
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                          </Button>
                        </Link>
                      </div>

                      <div className="pt-4 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div key={i} className="w-4 h-4 rounded-full bg-[#FCB716] flex items-center justify-center">
                                <Star className="h-2 w-2 text-white fill-current" />
                              </div>
                            ))}
                          </div>
                          <span className="text-[#283618] font-bold text-sm">Outstanding</span>
                        </div>
                        <span className="text-stone-400 text-[9px] font-bold tracking-widest uppercase">Verified on Agoda</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </section>

      {/* Room Details Modal */}
      <RoomDetailsModal
        room={selectedRoom}
        open={!!selectedRoom}
        onClose={() => setSelectedRoom(null)}
      />
    </div>
  );



}


