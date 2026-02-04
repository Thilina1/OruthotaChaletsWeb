'use client';

import Image from 'next/image';

interface PageHeroProps {
    title: string;
    description?: string;
    imageUrl: string;
    imageAlt: string;
    subtitle?: string;
    imageHint?: string;
}

export function PageHero({
    title,
    description,
    imageUrl,
    imageAlt,
    subtitle,
    imageHint,
}: PageHeroProps) {
    return (
        <section className="relative h-[60vh] min-h-[500px] w-full flex items-center justify-center overflow-hidden">
            <Image
                src={imageUrl}
                alt={imageAlt}
                fill
                className="object-cover transition-transform duration-1000 hover:scale-105"
                priority
                data-ai-hint={imageHint}
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background/90" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center z-10 p-4">
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                    {subtitle && (
                        <div className="inline-block animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <span className="py-1 px-4 rounded-full bg-white/10 backdrop-blur-md text-white text-xs md:text-sm font-bold tracking-[0.2em] uppercase border border-white/20">
                                {subtitle}
                            </span>
                        </div>
                    )}

                    <h1 className="font-headline text-5xl md:text-7xl lg:text-8xl tracking-tight text-white drop-shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
                        {title}
                    </h1>

                    {description && (
                        <p className="text-lg md:text-xl text-white/90 font-light tracking-wide max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 leading-relaxed">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
