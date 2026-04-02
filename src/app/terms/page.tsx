import React from 'react';
import { PageHero } from '@/components/page-hero';
import { BookOpen, CalendarCheck, Info, ShieldAlert, Edit2 } from 'lucide-react';

export default function TermsAndConditionsPage() {
    const sections = [
        {
            icon: BookOpen,
            title: "1. General Terms and Acceptance",
            content: "Welcome to Oruthota Chalets. These Terms and Conditions govern your use of our website and your stay at our resort. By making a reservation or using our services, you agree to be bound by these Terms."
        },
        {
            icon: CalendarCheck,
            title: "2. Booking & Cancellation Policy",
            content: "All reservations are subject to availability. Check-in is from 2:00 PM onwards, and Check-out is before 11:00 AM. Cancellations made less than 7 days prior to arrival are subject to a cancellation fee equivalent to one night's stay."
        },
        {
            icon: Info,
            title: "3. Resort Policies",
            content: "To ensure a peaceful stay: Quiet hours are strictly maintained between 10:00 PM and 7:00 AM. Pets are not permitted. Smoking is strictly forbidden inside the chalets. Guests are responsible for any damages caused during their stay."
        },
        {
            icon: ShieldAlert,
            title: "4. Liability Disclaimer",
            content: "While Oruthota Chalets takes all reasonable precautions to ensure the safety of our guests, we do not accept liability for any personal injury, loss, or damage to personal property that may occur during your stay, unless caused by our direct negligence."
        },
        {
            icon: Edit2,
            title: "5. Amendments to Terms",
            content: "Oruthota Chalets reserves the right to modify these Terms and Conditions at any time. Any changes will be updated on this page. Your continued use of our services constitutes acceptance of the amended terms."
        }
    ];

    return (
        <main className="min-h-screen bg-[#FAFAFA]">
            <PageHero 
                title="Terms & Conditions" 
                subtitle="Guidelines and regulations for your stay"
                imageUrl="/Hero1_new.jpg"
                imageAlt="Terms and Conditions Hero Image"
                titleClassName="text-5xl md:text-6xl lg:text-7xl"
            />
            
            <section className="py-24 px-4 bg-background relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#606C38]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="flex flex-col gap-6">
                        {sections.map((section, idx) => (
                            <div 
                                key={idx} 
                                className="group bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 hover:border-[#606C38]/30 transition-all duration-300 flex flex-col md:flex-row items-start gap-6"
                            >
                                <div className="w-14 h-14 rounded-full bg-[#606C38]/10 flex items-center justify-center shrink-0 group-hover:bg-[#606C38] transition-colors duration-300">
                                    <section.icon className="w-6 h-6 text-[#606C38] group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-[#283618] font-headline text-2xl md:text-3xl mb-3">{section.title}</h2>
                                    <p className="text-muted-foreground font-body leading-relaxed max-w-3xl">
                                        {section.content}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center border-t border-stone-200 pt-8">
                        <p className="text-sm font-semibold tracking-widest text-[#606C38] uppercase">Last Updated: October 2023</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
