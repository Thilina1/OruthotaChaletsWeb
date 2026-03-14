'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Mail, Phone, X, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ConciergeDesk() {
    const [isOpen, setIsOpen] = useState(false);

    // Toggle the desk
    const toggleDesk = () => setIsOpen(!isOpen);

    // Close desk on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={toggleDesk}
                className={cn(
                    "fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform",
                    isOpen ? "bg-white text-black rotate-90 scale-0" : "bg-[#BC6C25] text-white hover:scale-110 active:scale-95"
                )}
                aria-label="Contact Concierge"
            >
                <MessageCircle className="w-8 h-8" />
            </button>

            {/* Floating Close Button (when open) */}
            <button
                onClick={toggleDesk}
                className={cn(
                    "fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform bg-[#DDA15E] text-black hover:scale-110 active:scale-95",
                    isOpen ? "scale-100 rotate-0" : "scale-0 -rotate-90"
                )}
                aria-label="Close Concierge"
            >
                <X className="w-8 h-8" />
            </button>

            {/* Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsOpen(false)}
            />

            {/* Concierge Desk Modal */}
            <div
                className={cn(
                    "fixed bottom-32 right-8 z-[100] w-[90vw] max-w-[450px] bg-[#283618] text-[#FEFAE0] rounded-3xl p-10 shadow-2xl transition-all duration-500 transform border border-[#FEFAE0]/10",
                    isOpen ? "translate-y-0 opacity-100 scale-100" : "translate-y-10 opacity-0 scale-95 pointer-events-none"
                )}
            >
                <div className="relative">
                    {/* Header */}
                    <div className="mb-10 text-center">
                        <p className="text-[#DDA15E] uppercase font-body tracking-[0.3em] text-[10px] font-bold mb-4">CONCIERGE DESK</p>
                        <h2 className="font-headline text-3xl md:text-4xl text-[#FEFAE0]">How may we assist?</h2>
                    </div>

                    {/* Contact Options */}
                    <div className="space-y-4">
                        {/* WhatsApp */}
                        <a
                            href="https://wa.me/94812375396"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#25D366]/30 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#FEFAE0]/5 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                                <MessageCircle className="w-7 h-7 text-[#25D366]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-medium font-body tracking-wide text-[#FEFAE0]">WhatsApp Business</span>
                                <span className="text-xs text-[#FEFAE0]/60 font-body">Direct artisan access</span>
                            </div>
                        </a>

                        {/* Email */}
                        <a
                            href="mailto:inquiries@oruthotachalets.com"
                            className="group flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#DDA15E]/30 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#FEFAE0]/5 flex items-center justify-center group-hover:bg-[#DDA15E]/20 transition-colors">
                                <Mail className="w-7 h-7 text-[#DDA15E]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-medium font-body tracking-wide text-[#FEFAE0]">Direct Email</span>
                                <span className="text-xs text-[#FEFAE0]/60 font-body line-clamp-1">concierge@oruthotachalets.com</span>
                            </div>
                        </a>

                        {/* Phone */}
                        <a
                            href="tel:+94812375396"
                            className="group flex items-center gap-6 p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#DDA15E]/30 transition-all duration-300"
                        >
                            <div className="w-14 h-14 rounded-xl bg-[#FEFAE0]/5 flex items-center justify-center group-hover:bg-[#DDA15E]/20 transition-colors">
                                <Phone className="w-7 h-7 text-[#DDA15E]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-medium font-body tracking-wide text-[#FEFAE0]">Direct Protocol</span>
                                <span className="text-xs text-[#FEFAE0]/60 font-body">+94 81 2 375 396</span>
                            </div>
                        </a>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-10 text-center font-body">
                        <p className="text-[#FEFAE0]/60 text-[11px] tracking-wide">
                            Standard response time: <span className="text-[#DDA15E] font-medium">Within 2 hours</span>
                        </p>
                    </div>

                    {/* Background Quote Icon Decoration */}
                    <div className="absolute top-2 right-0 opacity-[0.05] pointer-events-none">
                        <Quote className="h-32 w-32 text-[#FEFAE0] rotate-180" />
                    </div>
                </div>
            </div>
        </>
    );
}
