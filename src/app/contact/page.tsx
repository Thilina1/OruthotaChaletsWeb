'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function ContactPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <section className="relative h-[40vh] min-h-[300px] w-full flex flex-col justify-center items-center text-center text-white bg-secondary/20 pt-32">
                <div className="absolute inset-0 bg-primary/10" />
                <div className="relative z-10 px-4">
                    <p className="text-primary tracking-widest mb-2 font-medium">WE ARE READY TO SERVE</p>
                    <h1 className="font-headline text-5xl md:text-6xl text-foreground">Visit Us!</h1>
                </div>
            </section>

            <section className="py-20 bg-background">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-2 gap-12 items-start">
                        <div className="space-y-8">
                            <div>
                                <h2 className="font-headline text-3xl text-foreground mb-4">The Aura of Tranquility</h2>
                                <p className="text-muted-foreground italic text-lg leading-relaxed">
                                    “Experience the unique concept of Oruthota Chalets surrounded amidst the rural ambiance of typical Sri Lankan culture”
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <MapPin className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">Hotel Address</h3>
                                        <p className="text-muted-foreground">Oruthota Chalets, Rajawella, Digana, Sri Lanka</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Phone className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">Phone Number</h3>
                                        <a href="tel:+94812375396" className="text-muted-foreground hover:text-primary transition-colors">
                                            +94 81 2 375 396
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <Mail className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-foreground mb-1">Email Address</h3>
                                        <a href="mailto:inquiries@oruthotachalets.com" className="text-muted-foreground hover:text-primary transition-colors">
                                            inquiries@oruthotachalets.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-background border p-8 shadow-sm">
                            <form className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Your Name (required)</Label>
                                    <Input id="name" required placeholder="Enter your name" className="rounded-none border-primary/20 focus:border-primary" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Your Email (required)</Label>
                                    <Input id="email" type="email" required placeholder="Enter your email" className="rounded-none border-primary/20 focus:border-primary" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input id="subject" placeholder="Enter subject" className="rounded-none border-primary/20 focus:border-primary" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="message">Your Message</Label>
                                    <Textarea id="message" rows={4} placeholder="Enter your message" className="rounded-none border-primary/20 focus:border-primary resize-none" />
                                </div>

                                <Button type="submit" className="w-full rounded-none bg-primary text-primary-foreground font-semibold tracking-wider hover:bg-primary/90">
                                    SEND MESSAGE
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            <section className="w-full h-[800px] border-t">
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
