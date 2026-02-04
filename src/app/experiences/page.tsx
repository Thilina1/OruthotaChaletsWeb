'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PageHero } from '@/components/page-hero';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { Button } from '@/components/ui/button';
import { RefreshCw, MapPin, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type StaticExperience = {
  id: string;
  title: string;
  description: string;
  imageId: string;
  category: string;
};

const STATIC_EXPERIENCES: StaticExperience[] = [
  {
    id: 'walk-in-village',
    title: 'A Walk in the Village',
    description: `Here is an opportunity to offer a new experience to our visitors to Sri Lanka. "A Walk in the Village" is an inspiring and soul-searching activity. We are proud to share with our visitors the authentic life of a rural family. Unlike the common routine visits to tourist attractions, "A Walk in the Village" will allow our foreign guests to understand the way of life of our rural community, its culture and family situations. The positive feedback from our past visits, have inspired us to further enhance this activity to provide a great new experience to our visitors from overseas.`,
    imageId: 'experience-hike',
    category: 'CULTURAL',
  },
  {
    id: 'culinary-tourism',
    title: 'Culinary Tourism',
    description: `At Oruthota Chalets we offer "Tourism with a Difference." Taking the advantage of the landscapes that surrounds the Resort, we offer activities with a difference. Our objective is for our guests to leave Sri Lanka with lasting memories of a different touristic nature.`,
    imageId: 'dining-wine',
    category: 'GASTRONOMY',
  },
  {
    id: 'rural-activities',
    title: 'A Feel to Typical Rural Activities: Weaving of Coconut Palms',
    description: `Most roofs of rural homes are thatched with coconut palms. In certain areas of the country rural folk would even build their entire homes with thatched coconut palms, it is very common in fishing areas. It is an interesting weave that is done on the fresh (green) leaves, and serves as a cover to roofs and walls of homes. Visitors enjoy trying out this activity. This can be a morning program after breakfast, in the large garden area of Oruthota Chalets, visitors will be taught how to weave a coconut palm. Individual attention will be given to every visitor until they get familiar with this art. This is a wonderful experience and memory to take back home.`,
    imageId: 'accommodation-2',
    category: 'TRADITIONAL',
  },
  {
    id: 'day-by-river',
    title: 'A Day by the River',
    description: `Here is an opportunity to offer another new experience to our visitors to Sri Lanka – "A Day by the River" with the experience of a river bath. Tourism is not limited to sightseeing; an authentic psychocentric tourist will always wish to experience the typical culture of a destination. We are proud to share with our visitors the authentic life of a rural family. Many of our humble village folk enjoy a river bath after a day’s work is done. People bathing and washing clothes at a river is a common sight around Sri Lanka. This unique activity will give our foreign guests an opportunity to experience this common ritual of our rural folk.`,
    imageId: 'accommodation-3',
    category: 'LEISURE',
  },
  {
    id: 'veddha-village',
    title: 'Visit to the Veddha Village',
    description: `(Home of the Indigenous people of Sri Lanka)\nThis activity has two options:\n\n1. A day excursion to the village of the Veddha people in Dambana\n2. A visit by a couple of the Veddha people to Oruthota Chalets\n\nThe 1st option will require a whole day with a pack lunch. The village is located about 72 kilometers from Oruthota Chalets. The tour is unique to all visitors as they experience the authentic life of an indigenous Sri Lankan – the veddha. The visit begins with a welcome from the Veddha Chieftain at his humble abode. He will talk about his clan and their lifestyles. They use a dialect unique to their community. Translators are available for day excursions. Thereafter, the visitors will be taken into the jungles to see what they do for a living. How they haunt for food, how they make traps for animals, various rituals etc. will be included.`,
    imageId: 'experience-shooting',
    category: 'HERITAGE',
  },
  {
    id: 'knuckles-trek',
    title: 'Trek to the Knuckles Mountain Range',
    description: `With an overnight camp (optional).\nKnuckles Mountain Range received its UNESCO World Heritage Site Inscription in 2010, and is a popular eco-tourism venue. It has also been declared as a conservation area, and known as the Knuckles National Heritage and Wilderness area. This is a "must visit" location for nature lovers and the adventurous tourist.`,
    imageId: 'experience-hike',
    category: 'ADVENTURE',
  },
  {
    id: 'meemure-trek',
    title: 'Trek to the Meemure Village',
    description: `With an overnight camp (optional).\nMeemure is one of the most remote villages in Sri Lanka with the only access of about a 14 kilometer trail from its ajacent village called Loolwatte. The village is renowned for its scenic beauty and beautiful waterways. The residents depend on a number of staple crops as their income and mode of existence. A day trip will include all the beautiful locations found in the village. The more adventurous visitor can opt for an overnight camp at this picturesque village in the mountains, amidst lush greenery and maybe beside the calm river that winds its way along the village and down the mountain slopes.`,
    imageId: 'experience-atv',
    category: 'ADVENTURE',
  },
];

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
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover transition-transform duration-1000 hover:scale-105"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
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
          <div className="text-center mb-24 max-w-3xl mx-auto space-y-4">
            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Curated Activities</h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full opacity-60" />
            <p className="text-muted-foreground text-lg leading-relaxed font-light">
              We offer activities with a difference, allowing our guests to leave Sri Lanka with lasting memories of a unique touristic nature.
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
                  {/* Image Side */}
                  <div className="w-full lg:w-1/2 relative group perspective-1000">
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
                      {experience.title}
                    </h3>

                    <div className="prose prose-lg prose-neutral dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                      <p className={cn(
                        "transition-all duration-700 ease-in-out overflow-hidden relative",
                        !isExpanded && "line-clamp-4 mask-image-b-fade"
                      )}>
                        {experience.description}
                      </p>
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
                <Button className="rounded-full px-8 h-12 text-base shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                  INQUIRE NOW <RefreshCw className="w-4 h-4 ml-2 animate-spin-slow" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

