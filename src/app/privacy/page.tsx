import React from 'react';
import { PageHero } from '@/components/page-hero';
import { Shield, Lock, Eye, Database, PhoneCall } from 'lucide-react';

export default function PrivacyPolicyPage() {
    const sections = [
        {
            icon: Eye,
            title: "1. Introduction",
            content: "Welcome to Oruthota Chalets. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) or stay at our resort, and tell you about your privacy rights and how the law protects you."
        },
        {
            icon: Database,
            title: "2. The Data We Collect About You",
            content: "Personal data means any information about an individual from which that person can be identified. We may collect, use, store and transfer different kinds of personal data about you such as Identity Data (names, DOB), Contact Data (address, email, phone), Financial Data (payment details), and Transaction Data."
        },
        {
            icon: Shield,
            title: "3. How We Use Your Personal Data",
            content: "We will only use your personal data when the law allows us to. Most commonly, we will use your personal data to perform the contract we entered into with you (e.g., fulfilling your reservation), or where it is necessary for our legitimate interests without overriding your fundamental rights."
        },
        {
            icon: Lock,
            title: "4. Data Security",
            content: "We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed. In addition, we limit access to your personal data to those employees and agents who have a business need to know."
        },
        {
            icon: PhoneCall,
            title: "5. Contact Us",
            content: "If you have any questions about this privacy policy, please contact us at: inquiries@oruthotachalets.com | +94 81 2 375 396 | Rajawella, Digana, Sri Lanka."
        }
    ];

    return (
        <main className="min-h-screen bg-[#FAFAFA]">
            <PageHero 
                title="Privacy Policy" 
                subtitle="How we protect your data and privacy"
                imageUrl="/DSCN1986.jpg"
                imageAlt="Privacy Policy Hero Image"
                titleClassName="text-5xl md:text-6xl lg:text-7xl"
            />
            
            <section className="py-24 px-4 bg-background relative overflow-hidden">
                {/* Background decorative element */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#606C38]/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                
                <div className="container mx-auto max-w-5xl relative z-10">
                    <div className="flex flex-col gap-8">
                        {sections.map((section, idx) => (
                            <div 
                                key={idx} 
                                className="group bg-white p-8 md:p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 hover:border-[#606C38]/30 transition-all duration-300"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-full bg-[#606C38]/10 flex items-center justify-center shrink-0 group-hover:bg-[#606C38] transition-colors duration-300">
                                        <section.icon className="w-6 h-6 text-[#606C38] group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h2 className="text-[#283618] font-headline text-2xl md:text-3xl mb-4">{section.title}</h2>
                                        <p className="text-muted-foreground font-body leading-relaxed max-w-4xl">
                                            {section.content}
                                        </p>
                                    </div>
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
