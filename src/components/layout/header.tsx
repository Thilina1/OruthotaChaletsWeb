
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button, buttonVariants } from '@/components/ui/button';
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
  { href: '/about', label: 'ABOUT US' },
  { href: '/contact', label: 'CONTACT' },
];




export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [time, setTime] = useState('');
  const [weather, setWeather] = useState('21');
  const [hasMounted, setHasMounted] = useState(false);

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

    setHasMounted(true);
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
      isScrolled ? 'fixed top-0 bg-[#283618]/80 backdrop-blur-sm text-white shadow-md' : 'absolute top-0 bg-[#283618] text-white'
    )}>
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className={cn(
          "flex justify-end items-center h-10 text-xs font-light gap-3 md:gap-6 border-b transition-all duration-300",
          isScrolled ? 'border-border/50 hidden' : 'border-white/10'
        )}>
          <div className='flex items-center gap-2'>
            <Thermometer size={14} />
            <span suppressHydrationWarning>{weather} °C</span>
          </div>
          <div className='hidden md:flex items-center gap-2' suppressHydrationWarning>
            {time}
          </div>
          <a
            href="https://www.instagram.com/kandychalets/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-2 hover:text-primary transition-colors"
          >
            <span>@KandyChalets</span>
          </a>
          <div className='flex items-center gap-2'><Phone className="w-4 h-4" /><span>+94 812 375 396</span></div>
          <div className='flex md:hidden items-center gap-2' suppressHydrationWarning>{time}</div>
        </div>

        <div className={cn(
          "flex h-20 items-center justify-between transition-all duration-300",
          !isScrolled && "mt-4"
        )}>
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-[150px] h-[40px] md:w-[200px] md:h-[54px] -ml-2 -mt-4">
              <Image
                src="/logo_white.png"
                alt="Oruthota Chalets Logo"
                fill
                className="object-contain"
                priority
              />
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
                  'text-white/80 hover:text-white',
                  pathname === link.href && 'text-white after:scale-x-100'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>


          <div className="flex items-center gap-4">
            {/* <Link
              href="/accommodations"
              className={cn(
                buttonVariants({
                  variant: isScrolled ? 'default' : 'outline',
                  size: 'default'
                }),
                "hidden md:inline-flex rounded-none font-semibold tracking-wider",
                isScrolled
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-transparent text-white border-white hover:bg-white hover:text-black'
              )}
            >
              CHECK RATES
            </Link> */}

            {/* Mobile Nav */}
            <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Open Menu" className={cn("hover:bg-transparent", 'text-white hover:text-white')}>
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
