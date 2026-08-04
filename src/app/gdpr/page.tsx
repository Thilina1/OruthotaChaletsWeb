import React from 'react';
import { PageHero } from '@/components/page-hero';
import { FileCheck, Edit3, Trash2, ShieldBan, Share2, PhoneCall } from 'lucide-react';

export default function GDPRCompliancePage() {
    const sections = [
        {
            icon: FileCheck,
            title: "Right of Access",
            content: "You can request a copy of the personal data we hold about you to verify its accuracy and lawfulness."
        },
        {
            icon: Edit3,
            title: "Right to Rectification",
            content: "You can request that we correct any inaccurate or incomplete personal data we hold about you without undue delay."
        },
        {
            icon: Trash2,
            title: "Right to Erasure",
            content: "Also known as the 'Right to be Forgotten', you can request the deletion of your personal data when it is no longer necessary for the purposes for which it was collected."
        },
        {
            icon: ShieldBan,
            title: "Right to Restrict Processing",
            content: "You can request that we temporarily or permanently stop processing all or some of your personal data under certain conditions."
        },
        {
            icon: Share2,
            title: "Right to Data Portability",
            content: "You can request a copy of your personal data in an electronic, machine-readable format and the right to transmit that personal data to another party."
        },
        {
            icon: PhoneCall,
            title: "Exercising Your Rights",
            content: "To exercise any of the rights set out above, or regarding Data Transfers outside the EEA, please contact our Data Protection Officer at: inquiries@oruthotachalets.com. Include 'GDPR Request' in your subject line."
        }
    ];

    return (
        <main className="min-h-screen bg-[#FAFAFA]">
            <PageHero 
                title="GDPR Compliance" 
                subtitle="Your data rights and our obligations"
                imageUrl="/For Gallery/DSC09515.jpg"
                imageAlt="GDPR Compliance Hero Image"
                titleClassName="text-5xl md:text-6xl lg:text-7xl"
            />
            
            <section className="py-24 px-4 bg-background relative overflow-hidden">
                <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-[#DDA15E]/5 rounded-full blur-[100px] -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
                
                <div className="container mx-auto max-w-6xl relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-headline text-[#283618] mb-6">Our Commitment to GDPR</h2>
                        <p className="text-muted-foreground font-body leading-relaxed">
                            At Oruthota Chalets, we are fully committed to complying with the General Data Protection Regulation (GDPR) to ensure the privacy and security of the personal data of our guests. This page outlines your rights under GDPR.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {sections.map((section, idx) => (
                            <div 
                                key={idx} 
                                className="group bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100 hover:border-[#DDA15E]/40 transition-all duration-300"
                            >
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 rounded-xl bg-[#DDA15E]/10 flex items-center justify-center shrink-0 group-hover:bg-[#DDA15E] transition-colors duration-300 transform group-hover:scale-110">
                                        <section.icon className="w-5 h-5 text-[#BC6C25] group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-[#283618] font-bold text-xl mb-2 font-headline">{section.title}</h3>
                                        <p className="text-muted-foreground text-sm font-body leading-relaxed">
                                            {section.content}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-16 text-center border-t border-stone-200 pt-8">
                        <p className="text-sm font-semibold tracking-widest text-[#DDA15E] uppercase">Last Updated: October 2023</p>
                    </div>
                </div>
            </section>
        </main>
    );
}
