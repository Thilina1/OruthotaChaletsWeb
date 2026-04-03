import React from 'react';
import Link from 'next/link';
import { PageHero } from '@/components/page-hero';
import { ChevronRight, Map, Compass, ShieldCheck } from 'lucide-react';

export default function SitemapPage() {
    const sitemapLinks = [
        {
            category: "Main Navigation",
            icon: Map,
            links: [
                { name: "Home", href: "/" },
                { name: "About Us", href: "/about" },
                { name: "Accommodations", href: "/accommodations" },
                { name: "Dining", href: "/dining" },
                { name: "Experiences", href: "/experiences" },
                { name: "Gallery", href: "/gallery" },
                { name: "Contact Us", href: "/contact" },
            ]
        },
        {
            category: "Discover More",
            icon: Compass,
            links: [
                { name: "Sustainability", href: "/sustainability" },
                { name: "Location & Directions", href: "/about#location" },
                { name: "Make a Reservation", href: "/booking" },
            ]
        },
        {
            category: "Information & Policies",
            icon: ShieldCheck,
            links: [
                { name: "Terms & Conditions", href: "/terms" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "GDPR Compliance", href: "/gdpr" },
            ]
        }
    ];

    return (
        <main className="min-h-screen bg-[#FAFAFA]">
            <PageHero 
                title="Sitemap" 
                subtitle="Explore our sanctuary by the Victoria Reservoir"
                imageUrl="/meetings.jpg"
                imageAlt="Sitemap Hero Image"
                titleClassName="text-5xl md:text-6xl lg:text-7xl"
            />
            
            <section className="py-24 px-4 bg-background relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#606C38]/5 rounded-full blur-[120px] -translate-y-1/3 translate-x-1/4 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#DDA15E]/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />
                
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {sitemapLinks.map((section, index) => (
                            <div 
                                key={index}
                                className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100 hover:border-[#606C38]/20 transition-all duration-300"
                            >
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-lg bg-[#606C38]/10 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-[#606C38]" />
                                    </div>
                                    <h2 className="text-[#283618] font-headline text-2xl">
                                        {section.category}
                                    </h2>
                                </div>
                                <ul className="space-y-4">
                                    {section.links.map((link, linkIndex) => (
                                        <li key={linkIndex}>
                                            <Link 
                                                href={link.href}
                                                className="group flex items-center text-muted-foreground hover:text-[#606C38] transition-all duration-200 py-1"
                                            >
                                                <div className="w-2 h-2 rounded-full bg-[#606C38]/20 mr-3 group-hover:bg-[#606C38] group-hover:scale-125 transition-all duration-200" />
                                                <span className="font-body text-base group-hover:translate-x-1 transition-transform duration-200">{link.name}</span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 text-center text-sm text-stone-400 font-body">
                        <p>© {new Date().getFullYear()} Oruthota Chalets. All paths lead to serenity.</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
