'use client';

import { PageHero } from '@/components/page-hero';
import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

export default function ContactPage() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const data: Record<string, any> = {
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            subject: formData.get('subject') as string,
            message: formData.get('message') as string,
        };

        try {
            const { error } = await supabase.from('contact_messages').insert([data]);

            if (error) throw error;

            toast({
                title: "Message Sent!",
                description: "We'll get back to you shortly.",
            });
            (e.target as HTMLFormElement).reset();
        } catch (error: any) {
            console.warn('Error submitting form:', error);
            toast({
                variant: 'destructive',
                title: "Failed to Send",
                description: error?.message || "Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[#FAFAFA]">
            <PageHero
                title="Get in Touch"
                subtitle="Contact Us"
                description="We'd love to hear from you. Whether you have a question about our chalets or simply want to say hello, we're here to help."
                imageUrl="/Hero1.jpg"
                imageAlt="Oruthota Chalets Contact Hero"
                titleClassName="text-5xl md:text-6xl lg:text-7xl"
            />

            <section className="py-24 px-4 bg-background relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#606C38]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#DDA15E]/5 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="max-w-3xl mx-auto mb-20 text-center">
                        <h2 className="font-headline text-4xl md:text-5xl text-[#283618] mb-6">Our Sanctuary</h2>
                        <p className="text-muted-foreground font-body leading-relaxed text-lg border-y-2 border-[#606C38]/20 py-6 italic bg-[#606C38]/5 rounded-2xl px-8">
                            “Experience the unique concept of Oruthota Chalets surrounded amidst the rural ambiance of typical Sri Lankan culture”
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-16 items-start">
                        {/* Contact Info Side */}
                        <div className="lg:col-span-5">
                            <div className="grid gap-6">
                                {[
                                    {
                                        icon: MapPin,
                                        title: "Location",
                                        detail: "Oruthota Chalets, Rajawella, Digana, Sri Lanka",
                                        buttonText: "Open in Maps",
                                        link: "https://maps.app.goo.gl/TpzL2ciq5FgdUk6M9"
                                    },
                                    {
                                        icon: Phone,
                                        title: "Phone",
                                        detail: "+94 812 375 396, +94 812 376 985",
                                        link: "tel:+94812375396"

                                    },
                                    {
                                        icon: (props: any) => (
                                            <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.47 14.38c-.2-.1-1.17-.58-1.35-.65-.18-.07-.31-.1-.44.1-.13.2-.51.65-.63.78-.12.13-.24.15-.44.05-.2-.1-.85-.31-1.62-.99-.6-.54-1-1.2-1.12-1.4-.12-.2-.02-.31.08-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.33.06-.13.03-.24-.01-.34-.05-.1-.44-1.06-.6-1.45-.16-.39-.32-.33-.44-.34h-.1c-.13 0-.26 0-.39.04-.13.04-.31.15-.47.31-.16.16-.62.61-.62 1.48 0 .87.64 1.72.73 1.85.09.13 1.25 1.91 3.03 2.66.42.18.75.28.99.36.43.14.83.12 1.14.07.35-.05 1.17-.48 1.33-.94.16-.46.16-.85.11-.94-.05-.09-.18-.14-.38-.24z" />
                                            </svg>
                                        ),
                                        title: "WhatsApp",
                                        detail: "+94 77 634 7922",
                                        link: "https://wa.me/94776347922"
                                    },
                                    {
                                        icon: Mail,
                                        title: "Email",
                                        detail: "inquiries@oruthotachalets.com",
                                        link: "mailto:inquiries@oruthotachalets.com"
                                    },
                                    {
                                        icon: Clock,
                                        title: "Opening Hours",
                                        detail: "Always open, 24/7 service"
                                    }
                                ].map((item, idx) => (
                                    <div key={idx} className="group bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-stone-100 hover:border-[#606C38]/30 transition-all duration-300">
                                        <div className="flex gap-5">
                                            <div className="w-12 h-12 rounded-xl bg-[#606C38]/10 flex items-center justify-center shrink-0 group-hover:bg-[#606C38] transition-colors duration-300">
                                                <item.icon className="w-5 h-5 text-[#606C38] group-hover:text-white transition-colors duration-300" />
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-headline text-xl text-[#283618]">{item.title}</h3>
                                                {item.link ? (
                                                    <a href={item.link} target={item.buttonText ? "_blank" : "_self"} className="text-muted-foreground hover:text-[#606C38] transition-colors block">
                                                        {item.detail}
                                                    </a>
                                                ) : (
                                                    <p className="text-muted-foreground">{item.detail}</p>
                                                )}
                                                {item.buttonText && (
                                                    <Button 
                                                        variant="link" 
                                                        className="p-0 h-auto text-xs font-bold text-[#606C38] tracking-widest uppercase hover:text-[#283618] mt-2 group/btn"
                                                        onClick={() => window.open(item.link, '_blank')}
                                                    >
                                                        {item.buttonText} <ChevronRight className="ml-1 w-3 h-3 transition-transform group-hover/btn:translate-x-1" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Form Side */}
                        <div className="lg:col-span-7 bg-white p-8 md:p-12 rounded-3xl shadow-[0_10px_50px_rgb(0,0,0,0.05)] border border-stone-100">
                            <div className="mb-10">
                                <h2 className="font-headline text-3xl text-[#283618] mb-4">Send us a message</h2>
                                <p className="text-muted-foreground font-body">Fill out the form below and our team will get back to you as soon as possible.</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="text-sm font-semibold text-[#283618]">Your Name</Label>
                                        <Input id="name" name="name" placeholder="John Doe" required className="rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-semibold text-[#283618]">Email Address</Label>
                                        <Input id="email" name="email" type="email" placeholder="john@example.com" required className="rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-sm font-semibold text-[#283618]">Subject</Label>
                                    <Input id="subject" name="subject" placeholder="Reservation Inquiry" required className="rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-sm font-semibold text-[#283618]">Message</Label>
                                    <Textarea id="message" name="message" placeholder="How can we help you?" required className="min-h-[150px] rounded-xl border-stone-200 focus:ring-[#606C38] focus:border-[#606C38]" />
                                </div>
                                <Button 
                                    type="submit" 
                                    disabled={isSubmitting} 
                                    className="w-full h-14 bg-[#606C38] hover:bg-[#283618] text-white rounded-xl text-md font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-3"
                                >
                                    {isSubmitting ? "Sending..." : <>Send Message <Send className="w-4 h-4" /></>}
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full h-[60vh] min-h-[400px] border-t relative grayscale hover:grayscale-0 transition-all duration-700">
                <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.339444463042!2d80.7443626!3d7.3157123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae360e9f6ed0591%3A0x6acee6f068cb586e!2sOruthota%20Chalets!5e0!3m2!1sen!2slk!4v1769342109059!5m2!1sen!2slk"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="w-full h-full"
                />
            </section>
        </main>
    );
}
