
'use client';

import React, { useState } from 'react';
import { PageHero } from '@/components/page-hero';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import Image from 'next/image';
import Link from 'next/link';
import { Camera, Image as ImageIcon, Sparkles, ChevronLeft, ChevronRight, X } from 'lucide-react';

const GALLERY_IMAGES = [
  { id: 1, url: '/instagram-1.png', category: 'RESORT VIEW', title: 'Sanctuary Mornings' },
  { id: 2, url: '/instagram-2.png', category: 'LAKEFRONT', title: 'Victoria Reservoir' },
  { id: 3, url: '/instagram-3.png', category: 'DINING', title: 'Garden Breakfast' },
  { id: 4, url: '/instagram-4.png', category: 'RELAXATION', title: 'Mist-Filled Horizons' },
  { id: 5, url: '/Restaurant.png', category: 'DINING', title: 'Wine & Dine' },
  { id: 6, url: '/Room 1.png', category: 'ACCOMMODATION', title: 'Rustic Luxury' },
  { id: 7, url: '/Room 2.png', category: 'SUITE', title: 'Elegant Interiors' },
  { id: 11, url: '/instagram-2.png', category: 'WEDDINGS', title: 'Magical Celebrations' },
  { id: 12, url: '/DSCN1986.jpg', category: 'NATURE', title: 'Garden Sanctuary' },
  { id: 13, url: '/DSC09534.jpg', category: 'RESORT VIEW', title: 'Resort Overview' },
  { id: 14, url: '/DSCN0849.jpg', category: 'LAKEFRONT', title: 'Lake Tranquility' },
  { id: 15, url: '/DSCN1882.jpg', category: 'NATURE', title: 'Lush Greenery' },
  { id: 16, url: '/DSCN1910.jpg', category: 'RESORT VIEW', title: 'Morning Mist' },
  { id: 18, url: '/Hero1.jpg', category: 'AERIAL VIEW', title: 'Breathtaking Heights' },
  { id: 20, url: '/IMG_3197-Edit.jpg', category: 'INTERIORS', title: 'Cozy Corners' },
  { id: 22, url: '/IMG_4022.jpg', category: 'NATURE', title: 'Tropical Flora' },
  { id: 24, url: '/rooms-01.jpg', category: 'ACCOMMODATION', title: 'Standard Room' },
  { id: 34, url: '/Conference Hall.png', category: 'EVENTS', title: 'Conference Hall' },
  { id: 35, url: '/DSC00159.jpg', category: 'DINING', title: 'Terrace View' },
  { id: 36, url: '/Private Parties.png', category: 'EVENTS', title: 'Private Parties' },
  { id: 26, url: '/experiences/2/1.JPG', category: 'EXPERIENCES', title: 'Cultural Touches' },
  { id: 29, url: '/experiences/5/ttd_vv_1.jpg', category: 'EXPERIENCES', title: 'Village Vibes' },
  { id: 37, url: '/For Gallery/1.jpg', category: 'WEDDINGS', title: 'Garden Reception Table' },
  { id: 38, url: '/For Gallery/2.jpg', category: 'WEDDINGS', title: 'Floral Entrance Arch' },
  { id: 39, url: '/For Gallery/3.jpg', category: 'WEDDINGS', title: 'Bridal Lounge Setup' },
  { id: 40, url: '/For Gallery/4.jpg', category: 'WEDDINGS', title: 'Elegant Wedding Decor' },
  { id: 41, url: '/For Gallery/5.jpg', category: 'WEDDINGS', title: 'Celebration Details' },
  { id: 42, url: '/For Gallery/DSC00094.jpg', category: 'WEDDINGS', title: 'Lakeside Ceremony Deck' },
  { id: 43, url: '/For Gallery/DSC00122.jpg', category: 'WEDDINGS', title: 'Reservoir Wedding Setup' },
  { id: 44, url: '/For Gallery/DSC00152_1.jpg', category: 'WEDDINGS', title: 'Garden Ceremony' },
  { id: 45, url: '/For Gallery/DSC00153.jpg', category: 'WEDDINGS', title: 'Vows by the Water' },
  { id: 46, url: '/For Gallery/DSC00168.jpg', category: 'WEDDINGS', title: 'Ceremony Backdrop' },
  { id: 47, url: '/For Gallery/DSC00169 (2).jpg', category: 'WEDDINGS', title: 'Wedding Aisle' },
  { id: 48, url: '/For Gallery/DSC00169.jpg', category: 'WEDDINGS', title: 'Floral Ceremony Arch' },
  { id: 49, url: '/For Gallery/DSC00171.jpg', category: 'WEDDINGS', title: 'Reservoir View Wedding' },
  { id: 50, url: '/For Gallery/DSC00172.jpg', category: 'WEDDINGS', title: 'Lakeside Vows' },
  { id: 51, url: '/For Gallery/DSC00182.jpg', category: 'WEDDINGS', title: 'Golden Hour Ceremony' },
  { id: 52, url: '/For Gallery/DSC00187.jpg', category: 'WEDDINGS', title: 'Scenic Wedding Setup' },
  { id: 53, url: '/For Gallery/DSC00188.jpg', category: 'WEDDINGS', title: 'Hillside Ceremony' },
  { id: 54, url: '/For Gallery/DSC00189.jpg', category: 'WEDDINGS', title: 'Wedding by the Reservoir' },
  { id: 55, url: '/For Gallery/DSC00195.jpg', category: 'WEDDINGS', title: 'Lakeside Wedding Ceremony' },
  { id: 56, url: '/For Gallery/DSC00761.jpg', category: 'WEDDINGS', title: 'Reception Hall Setup' },
  { id: 57, url: '/For Gallery/DSC00767.jpg', category: 'WEDDINGS', title: 'Banquet Celebration' },
  { id: 58, url: '/For Gallery/DSC00779.jpg', category: 'WEDDINGS', title: 'Wedding Feast' },
  { id: 59, url: '/For Gallery/DSC00790.jpg', category: 'WEDDINGS', title: 'Grand Reception' },
  { id: 60, url: '/For Gallery/DSC09515.jpg', category: 'EXPERIENCES', title: 'Village Charm' },
  { id: 61, url: '/For Gallery/DSC09516.jpg', category: 'EXPERIENCES', title: 'Rustic Pathways' },
  { id: 62, url: '/For Gallery/DSC09522.jpg', category: 'EXPERIENCES', title: 'Garden Trails' },
  { id: 63, url: '/For Gallery/DSC09523.jpg', category: 'EXPERIENCES', title: 'Estate Wanderings' },
  { id: 64, url: '/For Gallery/DSC09524.jpg', category: 'EXPERIENCES', title: "Nature's Corner" },
  { id: 65, url: '/For Gallery/DSC09525.jpg', category: 'EXPERIENCES', title: 'Hidden Retreats' },
  { id: 66, url: '/For Gallery/DSC09529.jpg', category: 'EXPERIENCES', title: 'Tranquil Grounds' },
  { id: 67, url: '/For Gallery/DSCN1575.jpg', category: 'EXPERIENCES', title: 'Outdoor Team Activities' },
  { id: 68, url: '/For Gallery/IMG_4263.JPG', category: 'NATURE', title: 'Rustic Garden Pavilion' },
];



export default function GalleryPage() {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const openModal = (index: number) => setSelectedImageIndex(index);
  const closeModal = () => setSelectedImageIndex(null);
  
  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex + 1) % GALLERY_IMAGES.length);
    }
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedImageIndex !== null) {
      setSelectedImageIndex((selectedImageIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <PageHero
        title="Visual Journey"
        subtitle="Gallery"
        description="Immerse yourself in the breathtaking beauty of Oruthota Chalets. From our serene lake views to our rustic chic interiors, explore the essence of our sanctuary."
        imageUrl="/instagram-1.png"
        imageAlt="Oruthota Chalets Gallery Hero"
        titleClassName="text-5xl md:text-6xl lg:text-7xl"
      />

      {/* Booking Form Integration */}
      <div className="relative z-20 -mt-16 container mx-auto px-4 mb-20">
        <div className="bg-white rounded-2xl shadow-[0_20px_50px_rgb(0,0,0,0.1)] border border-stone-100 overflow-hidden backdrop-blur-sm">
          <BookingForm />
        </div>
      </div>

      <section className="pb-32 pt-8 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#606C38]/5 rounded-full blur-[120px] -translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#DDA15E]/5 rounded-full blur-[100px] translate-y-1/3 translate-x-1/4 pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-[#606C38]" />
              <span className="py-1 px-4 rounded-full bg-[#606C38]/10 text-[#606C38] text-xs font-bold tracking-[0.2em] uppercase">
                A Glimpse of Paradise
              </span>
              <Sparkles className="w-4 h-4 text-[#DDA15E]" />
            </div>
            <h2 className="font-headline text-4xl md:text-5xl lg:text-6xl text-[#283618] leading-tight">
              Captured Moments
            </h2>
            <div className="w-24 h-1 bg-[#606C38]/20 mx-auto rounded-full" />
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed font-body max-w-2xl mx-auto">
              Explore the unique blend of nature and luxury at Oruthota Chalets through our curated lens.
            </p>
          </div>

          {/* Masonry Grid */}
          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
            {GALLERY_IMAGES.map((img, index) => (
              <div
                key={img.id}
                onClick={() => openModal(index)}
                className="break-inside-avoid relative group rounded-3xl overflow-hidden shadow-[0_4px_25px_rgb(0,0,0,0.05)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.15)] transition-all duration-500 ease-out border border-stone-100 cursor-pointer"
              >
                <div className="relative w-full overflow-hidden bg-muted">
                  <Image
                    src={img.url}
                    alt={img.title}
                    width={800}
                    height={800}
                    className="object-cover w-full h-auto transition-transform duration-1000 ease-in-out group-hover:scale-110"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-24 text-center">
            <p className="text-stone-400 font-body text-sm italic">
                Experience the beauty for yourself. <Link href="/accommodations" className="text-[#606C38] font-bold hover:underline">Book your stay today.</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={closeModal}
        >
          <button 
            onClick={closeModal}
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-50 p-2"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button 
            onClick={prevImage}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-50 p-2"
          >
            <ChevronLeft className="w-10 h-10 md:w-12 md:h-12" />
          </button>

          <div className="relative w-full max-w-5xl h-[80vh] px-12 md:px-24" onClick={(e) => e.stopPropagation()}>
            <Image
              src={GALLERY_IMAGES[selectedImageIndex].url}
              alt={GALLERY_IMAGES[selectedImageIndex].title}
              fill
              className="object-contain"
            />
          </div>

          <button 
            onClick={nextImage}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white/70 hover:text-white transition-colors z-50 p-2"
          >
            <ChevronRight className="w-10 h-10 md:w-12 md:h-12" />
          </button>
          

        </div>
      )}
    </main>
  );
}
