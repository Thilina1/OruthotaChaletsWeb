
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from '@/components/ui/sheet';
import { Menu, Phone, RefreshCw, Thermometer } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import React, { useState, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'HOME' },
  { href: '/accommodations', label: 'ACCOMMODATIONS' },
  { href: '/dining', label: 'DINING' },
  { href: '/experiences', label: 'EXPERIENCES' },
  { href: '/gallery', label: 'GALLERY' },
  { href: '/blogs', label: 'BLOGS' },
  { href: '/contact', label: 'CONTACT' },
];

const MessengerIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.85 0 3.58-.5 5.07-1.38a.5.5 0 0 0 .19-.53l-.62-2.19a.5.5 0 0 0-.45-.39c-.58-.1-1.16-.1-1.69-.1-4.42 0-8-3.13-8-7s3.58-7 8-7 8 3.13 8 7c0 2.21-1.21 4.16-3.06 5.39a.5.5 0 0 0-.19.53l.62 2.19a.5.5 0 0 0 .45.39c.58.1 1.16.1 1.69.1 1.25 0 2.45-.2 3.58-.57a.5.5 0 0 0 .34-.63l-.01-.01C21.49 15.58 22 13.85 22 12c0-5.52-4.48-10-10-10zm-1.5 10.5L8 10l5.5-3.5L16 10l-2.5 2.5z" />
  </svg>
);

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0.0 24 24" fill="currentColor">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.47 14.38c-.2-.1-1.17-.58-1.35-.65-.18-.07-.31-.1-.44.1-.13.2-.51.65-.63.78-.12.13-.24.15-.44.05-.2-.1-.85-.31-1.62-.99-.6-.54-1-1.2-1.12-1.4-.12-.2-.02-.31.08-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.33.06-.13.03-.24-.01-.34-.05-.1-.44-1.06-.6-1.45-.16-.39-.32-.33-.44-.34h-.1c-.13 0-.26 0-.39.04-.13.04-.31.15-.47.31-.16.16-.62.61-.62 1.48 0 .87.64 1.72.73 1.85.09.13 1.25 1.91 3.03 2.66.42.18.75.28.99.36.43.14.83.12 1.14.07.35-.05 1.17-.48 1.33-.94.16-.46.16-.85.11-.94-.05-.09-.18-.14-.38-.24z" />
  </svg>
);

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [time, setTime] = useState('');
  const [weather, setWeather] = useState('21');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const updateTime = () => {
      const sriLankaTime = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Colombo',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setTime(sriLankaTime);
    };

    const fetchWeather = async () => {
      try {
        // Use a timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch('https://wttr.in/Kandy?format=j1', {
          signal: controller.signal,
          next: { revalidate: 3600 } // Cache for 1 hour if possible in Next.js
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          // Silent failure, keep default
          return;
        }

        const data = await response.json();
        if (data && data.current_condition && data.current_condition[0]) {
          setWeather(data.current_condition[0].temp_C);
        }
      } catch (error) {
        // Silent failure specifically for fetch errors
        // console.error("Weather fetch failed", error); 
        // Keep default weather '21'
      }
    };

    window.addEventListener('scroll', handleScroll);
    updateTime();
    fetchWeather();
    const timerId = setInterval(updateTime, 60000); // Update every minute
    const weatherTimerId = setInterval(fetchWeather, 30 * 60 * 1000); // Update weather every 30 mins

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timerId);
      clearInterval(weatherTimerId);
    };
  }, []);

  return (
    <header className={cn(
      "w-full z-50 transition-all duration-300",
      isScrolled ? 'fixed top-0 bg-background/80 backdrop-blur-sm text-foreground shadow-md' : 'absolute top-0 bg-black/50 text-white'
    )}>
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className={cn(
          "flex justify-end items-center h-10 text-xs font-light gap-3 md:gap-6 border-b transition-all duration-300",
          isScrolled ? 'border-border/50 hidden' : 'border-white/20'
        )}>
          <div className='flex items-center gap-2'><Thermometer size={14} /><span>{weather} °C</span></div>
          <div className='hidden md:flex items-center gap-2'>{time}</div>
          <div className='hidden md:flex items-center gap-2'><MessengerIcon className="w-4 h-4" /><span>@OruthotaChalets</span></div>
          <div className='flex items-center gap-2'><WhatsAppIcon className="w-4 h-4" /><span>+94 81 2 375 396</span></div>
          <div className='flex md:hidden items-center gap-2'>{time}</div>
        </div>

        <div className={cn(
          "flex h-20 items-center justify-between transition-all duration-300",
          !isScrolled && "mt-4"
        )}>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex flex-col items-start">
              <span className={cn("text-lg tracking-widest -mb-1", isScrolled ? 'text-foreground' : 'text-white')}>Oruthota Chalets</span>
              <span className={cn("text-xs tracking-[0.3em] font-light", isScrolled ? 'text-foreground/80' : 'text-white/80')}>KANDY</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wider">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'relative transition-colors after:absolute after:bottom-[-4px] after:left-0 after:h-[1px] after:w-full after:scale-x-0 after:bg-primary after:origin-left after:transition-transform after:duration-300 hover:after:scale-x-100',
                  isScrolled
                    ? 'text-foreground/80 hover:text-foreground'
                    : 'text-white/80 hover:text-white',
                  pathname === link.href && (isScrolled ? 'text-foreground after:scale-x-100' : 'text-white after:scale-x-100')
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button variant={isScrolled ? 'default' : 'outline'} className={cn(
              "hidden md:inline-flex rounded-none font-semibold tracking-wider",
              isScrolled
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-transparent text-white border-white hover:bg-white hover:text-black'
            )}>
              CHECK RATES
            </Button>

            {/* Mobile Nav */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open Menu" className={cn("hover:bg-transparent", isScrolled ? 'text-foreground hover:text-foreground' : 'text-white hover:text-white')}>
                    <Menu className="h-8 w-8" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80vw] bg-background">
                  <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                  <nav className="flex flex-col gap-6 mt-10">
                    {navLinks.map((link) => (
                      <SheetClose asChild key={link.href}>
                        <Link
                          href={link.href}
                          className={cn("text-xl font-medium",
                            pathname === link.href ? 'text-primary' : 'text-foreground/80 hover:text-primary transition-colors'
                          )}
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    ))}
                    <Button variant="default" className="rounded-none bg-primary text-white font-semibold tracking-wider mt-4">
                      CHECK RATES
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
