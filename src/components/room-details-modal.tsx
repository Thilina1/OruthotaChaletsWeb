'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Wind, Wifi, Coffee, Utensils, Waves, Car, MountainSnow, X, Star, Users, DollarSign } from 'lucide-react';
import type { Room } from '@/types/room';

interface RoomDetailsModalProps {
  room: Room | null;
  open: boolean;
  onClose: () => void;
}

const ROOM_AMENITIES = [
  { icon: Wifi, label: 'Free Wi-Fi' },
  { icon: Wind, label: 'Air Conditioning' },
  { icon: Coffee, label: 'Tea/Coffee Maker' },
  { icon: Utensils, label: 'In-Room Dining' },
  { icon: Waves, label: 'Pool Access' },
  { icon: Car, label: 'Free Parking' },
  { icon: MountainSnow, label: 'Scenic View' },
  { icon: Star, label: 'Daily Housekeeping' },
];

export function RoomDetailsModal({ room, open, onClose }: RoomDetailsModalProps) {
  if (!room) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden rounded-2xl border-0 shadow-2xl bg-white">
        {/* Visually hidden title for accessibility */}
        <DialogTitle className="sr-only">{room.title} – Room Details</DialogTitle>

        <div className="flex flex-col max-h-[90vh] overflow-y-auto">
          {/* Hero Image */}
          <div className="relative h-[280px] md:h-[380px] w-full shrink-0">
            {room.imageUrl ? (
              <Image
                src={room.imageUrl}
                alt={room.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="h-full w-full bg-muted flex items-center justify-center text-muted-foreground">
                No Image Available
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {/* View Badge */}
            {room.view && (
              <div className="absolute top-4 left-4 z-20">
                <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 uppercase tracking-widest font-semibold text-xs px-3 py-1.5">
                  {room.view}
                </Badge>
              </div>
            )}

            {/* Title on Image */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-10">
              <h2 className="font-headline text-3xl md:text-5xl text-white drop-shadow-xl leading-tight">
                {room.title}
              </h2>
              <div className="flex items-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                ))}
                <span className="text-white/80 text-sm ml-2 font-light">Luxury Accommodation</span>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 md:p-10 space-y-8">
            {/* Quick Info Chips */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#606C38]/10 text-[#283618]">
                <Bed className="w-4 h-4" />
                <span className="text-sm font-semibold">{room.roomCount} {room.roomCount === 1 ? 'Room' : 'Rooms'}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#DDA15E]/15 text-[#8B5A2B]">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-semibold">From ${room.pricePerNight} / night</span>
              </div>
              {room.view && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700">
                  <MountainSnow className="w-4 h-4" />
                  <span className="text-sm font-semibold">{room.view}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h3 className="font-headline text-xl text-[#283618] tracking-wide">About This Room</h3>
              <div className="w-12 h-0.5 bg-[#606C38]/40 rounded-full" />
              <p className="text-muted-foreground leading-relaxed text-base font-light">
                {room.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="space-y-4">
              <h3 className="font-headline text-xl text-[#283618] tracking-wide">Room Amenities</h3>
              <div className="w-12 h-0.5 bg-[#606C38]/40 rounded-full" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ROOM_AMENITIES.map((amenity, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-3 rounded-xl bg-secondary/40 hover:bg-[#606C38]/10 transition-colors duration-200 group"
                  >
                    <amenity.icon className="w-4 h-4 text-[#606C38] shrink-0 group-hover:scale-110 transition-transform duration-200" />
                    <span className="text-xs font-medium text-foreground">{amenity.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Partner Booking Trust */}
            <div className="py-6 border-t border-stone-100">
                <p className="text-[10px] tracking-[0.2em] font-bold text-muted-foreground uppercase mb-4 text-center sm:text-left">Also Bookable Via</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 opacity-60 hover:opacity-100 transition-opacity">
                    <a 
                        href="https://www.booking.com/hotel/lk/oruthota-chalets.en-gb.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="grayscale hover:grayscale-0 transition-all hover:scale-110"
                    >
                        <div className="relative w-28 h-6">
                            <Image src="/booking-logo.svg" alt="Booking.com" fill className="object-contain" />
                        </div>
                    </a>
                    <a 
                        href="https://www.agoda.com/oruthota-chalets/hotel/kandy-lk.html" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="grayscale hover:grayscale-0 transition-all hover:scale-110"
                    >
                        <div className="relative w-24 h-6">
                            <Image src="/color-default.svg" alt="Agoda" fill className="object-contain" />
                        </div>
                    </a>
                </div>
            </div>

            {/* Pricing */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-border/50">
              <div className="text-center sm:text-left">
                <p className="text-xs text-muted-foreground tracking-widest uppercase font-semibold">Starting from</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-headline text-4xl text-[#283618] font-bold">${room.pricePerNight}</span>
                  <span className="text-muted-foreground text-sm">/ night</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Taxes and fees may apply</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="rounded-full h-12 px-8 border-[#606C38]/30 text-[#283618] hover:bg-[#606C38]/5 font-semibold tracking-wide"
                >
                  Close
                </Button>
                <Link href={`/booking?roomId=${room.id}`} passHref>
                  <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full h-12 px-10 bg-[#283618] text-white hover:bg-[#3a4e22] shadow-lg hover:shadow-[#283618]/30 hover:-translate-y-0.5 transition-all font-semibold tracking-wide"
                    onClick={onClose}
                  >
                    Book This Room
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
