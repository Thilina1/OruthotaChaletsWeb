import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExperienceGalleryProps {
  images: string[];
  alt: string;
  autoPlayInterval?: number;
}

export function ExperienceGallery({ images, alt, autoPlayInterval = 5000 }: ExperienceGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered || !images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [images, autoPlayInterval, isHovered]);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Main Large Display */}
      <div 
        className="relative aspect-[16/10] md:aspect-[16/9] w-full overflow-hidden rounded-[2rem] shadow-2xl group cursor-pointer border border-stone-200/50 bg-stone-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Main Image with Transition */}
        {images.map((image, index) => (
          <div
            key={index}
            className={cn(
              "absolute inset-0 transition-all duration-1000 ease-in-out transform",
              index === currentIndex ? "opacity-100 scale-100 translate-x-0" : "opacity-0 scale-110 pointer-events-none",
              index < currentIndex ? "-translate-x-full" : index > currentIndex ? "translate-x-full" : ""
            )}
          >
            <Image
              src={image}
              alt={`${alt} - View ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
          </div>
        ))}
        
        {/* Floating Navigation Controls */}
        <div className={cn(
          "absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between px-4 md:px-6 transition-all duration-500 z-20",
          isHovered ? "opacity-100" : "opacity-0 md:opacity-0"
        )}>
          <button
            onClick={prevImage}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white/30 hover:scale-110 active:scale-95 transition-all shadow-xl group/btn"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8 group-hover/btn:-translate-x-0.5 transition-transform" />
          </button>
          <button
            onClick={nextImage}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white flex items-center justify-center hover:bg-white/30 hover:scale-110 active:scale-95 transition-all shadow-xl group/btn"
            aria-label="Next image"
          >
            <ChevronRight className="w-6 h-6 md:w-8 md:h-8 group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Info Overlays */}
        <div className="absolute top-6 right-6 z-20">
          <div className="px-4 py-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* View Fullscreen Indicator (Visual only for now) */}
        <div className="absolute bottom-6 left-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
           <div className="flex items-center gap-2 text-white/90 text-sm font-medium">
             <Maximize2 className="w-4 h-4" />
             <span className="hidden md:inline">Experience the moment</span>
           </div>
        </div>
      </div>

      {/* Interactive Thumbnails Row */}
      <div className="flex justify-center gap-3 md:gap-4 overflow-x-auto py-2 px-2 no-scrollbar">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "relative flex-shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-xl overflow-hidden transition-all duration-500 ease-out group/thumb",
              currentIndex === index 
                ? "ring-4 ring-[#606C38] ring-offset-2 scale-105 shadow-xl" 
                : "opacity-40 hover:opacity-80 hover:scale-105 grayscale hover:grayscale-0"
            )}
          >
            <Image
              src={image}
              alt={`${alt} thumbnail ${index + 1}`}
              fill
              className="object-cover"
            />
            {currentIndex !== index && (
              <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-transparent transition-colors" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
