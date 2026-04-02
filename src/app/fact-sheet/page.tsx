'use client';

import React from 'react';
import { PageHero } from '@/components/page-hero';
import { 
  Hotel, 
  Utensils, 
  MapPin, 
  Thermometer, 
  Waves, 
  Wifi, 
  ShieldCheck, 
  Clock, 
  Info,
  Car,
  Plane,
  Sparkles,
  Download
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const FACT_SECTIONS = [
  {
    title: "Overview",
    icon: Info,
    items: [
      { label: "Property Type", value: "Boutique Eco-Resort" },
      { label: "Location", value: "Rajawella, Digana, Kandy (18km from City Center)" },
      { label: "Total Area", value: "Overlooking Victoria Reservoir" },
      { label: "Vibe", value: "Rustic, Tranquil, and Family-Oriented" }
    ]
  },
  {
    title: "Accommodation",
    icon: Hotel,
    items: [
      { label: "Total Units", value: "8 Private Chalets + Main Lodge Rooms" },
      { label: "Chalet Types", value: "A-Frame Chalets & Lakefront Suites" },
      { label: "Amenities", value: "Private Balconies, En-suite Bathrooms" },
      { label: "Occupancy", value: "2-4 Adults per Chalet (Family options)" }
    ]
  },
  {
    title: "Dining",
    icon: Utensils,
    items: [
      { label: "Restaurant", value: "Main Dining Hall (Western & Sri Lankan)" },
      { label: "Signature", value: "Traditional Kandy Rice & Curry" },
      { label: "Services", value: "Private Dining, BBQ nights, Lakeview Lounge" },
      { label: "Bar", value: "Exotic Juices & Curated Beverages" }
    ]
  },
  {
    title: "Location & Access",
    icon: MapPin,
    items: [
      { label: "Kandy City", value: "45 Minutes Drive" },
      { label: "Knuckles Range", value: "1 Hour Drive" },
      { label: "Airport (CMB)", value: "4 Hours Drive" },
      { label: "Access", value: "Typical Village Road (Scenic Drive)" }
    ]
  },
  {
    title: "Climate & Settings",
    icon: Thermometer,
    items: [
      { label: "Avg Temp", value: "21°C - 28°C" },
      { label: "Best Time", value: "December to April (High Season)" },
      { label: "Landscape", value: "Tropical Garden, Lakeview Slopes" },
      { label: "Elevation", value: "Approx 450m above sea level" }
    ]
  },
  {
    title: "Facilities",
    icon: Waves,
    items: [
      { label: "Swimming Pool", value: "Overflow Infinity Pool with Lake View" },
      { label: "Connectivity", value: "High-Speed Wi-Fi in Public Areas" },
      { label: "Security", value: "24/7 Gated Property with Concierge" },
      { label: "Parking", value: "On-site Secure Parking for Guests" }
    ]
  }
];

export default function FactSheetPage() {
  return (
    <main className="min-h-screen bg-[#FAFAFA]">
      <PageHero
        title="Property Fact Sheet"
        subtitle="Essentials"
        description="Every detail carefully curated for your peace of mind. Discover the specifications, facilities, and unique offerings of Oruthota Chalets."
        imageUrl="/Hero1_new.jpg"
        imageAlt="Oruthota Chalets Property"
        titleClassName="text-5xl md:text-6xl lg:text-7xl"
      />

      <section className="py-24 px-4 bg-background relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#606C38]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DDA15E]/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {FACT_SECTIONS.map((section, idx) => (
              <div 
                key={idx} 
                className="group bg-white p-8 md:p-10 rounded-[2rem] shadow-[0_4px_30px_rgb(0,0,0,0.03)] border border-stone-100 hover:border-[#606C38]/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)]"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-[#606C38]/10 flex items-center justify-center group-hover:bg-[#606C38] transition-colors duration-500">
                    <section.icon className="w-7 h-7 text-[#606C38] group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h2 className="font-headline text-3xl text-[#283618]">{section.title}</h2>
                </div>

                <div className="space-y-4">
                  {section.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex justify-between items-start gap-4 pb-4 border-b border-stone-50 last:border-0 last:pb-0">
                      <span className="text-xs font-bold uppercase tracking-widest text-stone-400 shrink-0 mt-1">{item.label}</span>
                      <span className="text-[#606C38] font-body text-right text-md font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Practicalities Section */}
          <div className="mt-20 grid md:grid-cols-2 gap-8">
             <div className="bg-[#606C38]/5 p-10 rounded-[2.5rem] border border-[#606C38]/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <ShieldCheck className="w-32 h-32 text-[#606C38]" />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="font-headline text-3xl text-[#283618]">Safety & Regulations</h3>
                    <ul className="space-y-3 text-muted-foreground font-body">
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#606C38]" />
                            Fire safety equipment in all chalets
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#606C38]" />
                            24-hour on-call security and staff
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#606C38]" />
                            First aid and emergency evacuation protocols
                        </li>
                        <li className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#606C38]" />
                            Plastic-free initiatives in effect
                        </li>
                    </ul>
                </div>
             </div>

             <div className="bg-[#DDA15E]/5 p-10 rounded-[2.5rem] border border-[#DDA15E]/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Clock className="w-32 h-32 text-[#DDA15E]" />
                </div>
                <div className="relative z-10 space-y-6">
                    <h3 className="font-headline text-3xl text-[#283618]">Guest Guidelines</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Check-in</p>
                            <p className="text-lg font-bold text-[#606C38]">14:00 PM</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Check-out</p>
                            <p className="text-lg font-bold text-[#606C38]">11:00 AM</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Breakfast</p>
                            <p className="text-lg font-bold text-[#606C38]">07:30 - 10:00</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Quiet Hours</p>
                            <p className="text-lg font-bold text-[#606C38]">From 22:00</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          <div className="mt-24 text-center">
            <div className="inline-flex flex-col items-center gap-6">
              <Sparkles className="w-8 h-8 text-[#DDA15E] animate-pulse" />
              <h2 className="font-headline text-4xl text-[#283618]">Plan Your Stay</h2>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild className="bg-[#606C38] hover:bg-[#283618] text-white rounded-xl h-14 px-10 text-md font-bold tracking-widest uppercase transition-all">
                  <Link href="/booking">Book a Chalet</Link>
                </Button>
                <Button 
                  variant="outline" 
                  className="rounded-xl border-stone-200 h-14 px-10 text-md font-bold tracking-widest uppercase hover:bg-stone-50 flex items-center gap-2 group"
                  onClick={() => window.print()}
                >
                  <Download className="w-5 h-5 transition-transform group-hover:-translate-y-1" />
                  Download PDF
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
