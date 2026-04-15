'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function VisitUs() {
    const pathname = usePathname();

    if (pathname === '/contact') return null;

    return (
        <section className="relative py-24 bg-primary/5 overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row items-stretch justify-between gap-12 bg-white border border-border/50 rounded-2xl p-8 md:p-12 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">

                    <div className="flex flex-col space-y-6 max-w-xl py-2">
                        <div className="space-y-2">
                            <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">Connect With Us</span>
                            <h2 className="font-headline text-4xl md:text-5xl text-foreground">Visit Us</h2>
                        </div>

                        <p className="text-muted-foreground text-lg leading-relaxed font-light">
                            Experience the aura of tranquility at Oruthota Chalets. Nestled in nature, waiting for your arrival.
                        </p>

                        <div className="space-y-4 pt-4 mt-auto">
                            <div className="flex items-start gap-4">
                                <MapPin className="w-5 h-5 text-primary mt-1 shrink-0" />
                                <div>
                                    <p className="font-semibold text-foreground">Oruthota Chalets</p>
                                    <p className="text-muted-foreground">Rajawella, Digana, Sri Lanka</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <a href="tel:0812375396" className="text-muted-foreground hover:text-primary transition-colors">
                                    0812 375 396
                                </a>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="w-5 h-5 text-primary shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                                        <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.47 14.38c-.2-.1-1.17-.58-1.35-.65-.18-.07-.31-.1-.44.1-.13.2-.51.65-.63.78-.12.13-.24.15-.44.05-.2-.1-.85-.31-1.62-.99-.6-.54-1-1.2-1.12-1.4-.12-.2-.02-.31.08-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.33.06-.13.03-.24-.01-.34-.05-.1-.44-1.06-.6-1.45-.16-.39-.32-.33-.44-.34h-.1c-.13 0-.26 0-.39.04-.13.04-.31.15-.47.31-.16.16-.62.61-.62 1.48 0 .87.64 1.72.73 1.85.09.13 1.25 1.91 3.03 2.66.42.18.75.28.99.36.43.14.83.12 1.14.07.35-.05 1.17-.48 1.33-.94.16-.46.16-.85.11-.94-.05-.09-.18-.14-.38-.24z" />
                                    </svg>
                                </div>
                                <a href="https://wa.me/94776347922" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                                    +94 77 634 7922 (WhatsApp)
                                </a>
                            </div>

                            <div className="flex items-center gap-4">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <a href="mailto:inquiries@oruthotachalets.com" className="text-muted-foreground hover:text-primary transition-colors">
                                    inquiries@oruthotachalets.com
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full md:w-auto min-w-[300px] lg:min-w-[400px]">
                        <div className="w-full flex-grow h-64 md:h-auto min-h-[300px] rounded-xl overflow-hidden shadow-lg border border-border/50 transition-all duration-500 relative">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3957.339444463042!2d80.7443626!3d7.3157123!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae360e9f6ed0591%3A0x6acee6f068cb586e!2sOruthota%20Chalets!5e0!3m2!1sen!2slk!4v1769342109059!5m2!1sen!2slk"
                                width="100%"
                                height="100%"
                                style={{ border: 0, position: 'absolute', inset: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
