'use client';

import { PageHero } from '@/components/page-hero';
import { useState } from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
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
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message'),
            created_at: new Date().toISOString(),
        };

        try {
            // Basic Supabase insertion - requires a 'contact_messages' table
            const { error } = await supabase.from('contact_messages').insert([data]);

            if (error) throw error;

            toast({
                title: "Message Sent!",
                description: "We'll get back to you shortly.",
            });
            (e.target as HTMLFormElement).reset();
        } catch (error) {
            console.error('Error submitting form:', error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to send message. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    return (
        <div className="flex flex-col min-h-screen">
            <PageHero
                title="Visit Us!"
                description="We'd love to hear from you. Get in touch with us for any inquiries."
                imageUrl="/contact-hero-bg.png"
                imageAlt="Oruthota Chalets Scenery"
            />

            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                        <div className="space-y-12">
                            <div className="space-y-6">
                                <h2 className="font-headline text-4xl text-foreground">The Aura of Tranquility</h2>
                                <p className="text-muted-foreground italic text-xl leading-relaxed font-light border-l-4 border-primary pl-6 py-2">
                                    “Experience the unique concept of Oruthota Chalets surrounded amidst the rural ambiance of typical Sri Lankan culture”
                                </p>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-start gap-6 group">
                                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <MapPin className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-xl text-foreground">Hotel Address</h3>
                                        <p className="text-muted-foreground leading-relaxed">Oruthota Chalets, Rajawella,<br />Digana, Sri Lanka</p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 px-4 text-xs border-primary/30 text-primary hover:bg-primary hover:text-white mt-1 transition-all"
                                            onClick={() => window.open('https://www.google.com/maps/search/?api=1&query=Oruthota+Chalets,+Rajawella,+Digana,+Sri+Lanka', '_blank')}
                                        >
                                            Location on Map <MapPin className="ml-2 w-3 h-3" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <Phone className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-xl text-foreground">Phone Number</h3>
                                        <a href="tel:+94812375396" className="text-muted-foreground hover:text-primary transition-colors text-lg block">
                                            +94 81 2 375 396
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-6 group">
                                    <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                                        <Mail className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-xl text-foreground">Email Address</h3>
                                        <a href="mailto:inquiries@oruthotachalets.com" className="text-muted-foreground hover:text-primary transition-colors text-lg block">
                                            inquiries@oruthotachalets.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card border border-border/50 p-8 md:p-10 rounded-2xl shadow-xl">
                            <div className="mb-8">
                                <h3 className="font-headline text-2xl text-foreground mb-2">Send us a Message</h3>
                                <p className="text-muted-foreground text-sm">We'll get back to you as soon as possible.</p>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-sm font-medium text-foreground/80">Your Name <span className="text-destructive">*</span></Label>
                                    <Input id="name" name="name" required placeholder="John Doe" className="h-12 bg-secondary/50 border-input/50 focus:border-primary focus:ring-primary/20" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-foreground/80">Your Email <span className="text-destructive">*</span></Label>
                                    <Input id="email" name="email" type="email" required placeholder="john@example.com" className="h-12 bg-secondary/50 border-input/50 focus:border-primary focus:ring-primary/20" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-sm font-medium text-foreground/80">Subject</Label>
                                    <Input id="subject" name="subject" placeholder="Inquiry about..." className="h-12 bg-secondary/50 border-input/50 focus:border-primary focus:ring-primary/20" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message" className="text-sm font-medium text-foreground/80">Your Message</Label>
                                    <Textarea id="message" name="message" rows={5} placeholder="How can we help you?" className="bg-secondary/50 border-input/50 focus:border-primary focus:ring-primary/20 resize-none" />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full h-12 text-base rounded-lg bg-primary text-primary-foreground font-semibold tracking-wide hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all"
                                >
                                    {isSubmitting ? 'Sending...' : 'SEND MESSAGE'}
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
        </div>
    );
}
