
'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, MapPin, Mail, Phone, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

const footerNav = [
  { name: 'Home', href: '/' },
  { name: 'Experiences', href: '/experiences' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Accommodations', href: '/accommodations' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'About Us', href: '/about' },
];

const footerNavRight = [
  { name: 'Dining', href: '/dining' },
  { name: 'Events', href: '/events' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Location', href: '/about#location' },
  { name: 'Reviews', href: '/reviews' },
  { name: 'Sustainability', href: '/sustainability' },
]

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.03 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.59-5.71-.29-2.63.85-5.21 2.87-6.9 1.47-1.21 3.39-1.84 5.3-1.74v4.02c-1.22-.06-2.45.36-3.33 1.25-.97.94-1.38 2.37-1.05 3.68.32 1.48 1.62 2.65 3.12 2.8 1.2.14 2.44-.24 3.34-1.03.74-.7 1.11-1.74 1.09-2.74-.01-4.8.01-9.6-.01-14.4z" />
  </svg>
);

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-[#606C38] text-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="relative w-[200px] h-[54px]">
            <Image
              src="/logo_white.png"
              alt="Oruthota Chalets Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div className="md:col-span-1">
            <h2 className="font-bold mb-4 after:block after:w-10 after:h-0.5 after:bg-white/40 after:mt-2">Oruthota Chalets</h2>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-2">
                {footerNav.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-secondary transition-colors text-white/80">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {footerNavRight.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-secondary transition-colors text-white/80">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h2 className="font-bold mb-4 after:block after:w-10 after:h-0.5 after:bg-white/40 after:mt-2">Get in Touch</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-white/70" />
                <span>Oruthota Chalets,<br />Rajawella, Digana,<br />Sri Lanka</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-white/70" />
                <a href="mailto:inquiries@oruthotachalets.com" className="hover:text-secondary transition-colors text-white/90">inquiries@oruthotachalets.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-white/70" />
                <a href="tel:+94812375396" className="hover:text-secondary transition-colors text-white/90">+94 812 375 396, +94 812 376 985</a>
              </li>
              <li className="flex items-start gap-3">
                <div className="h-5 w-5 mt-0.5 text-white/70">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM17.47 14.38c-.2-.1-1.17-.58-1.35-.65-.18-.07-.31-.1-.44.1-.13.2-.51.65-.63.78-.12.13-.24.15-.44.05-.2-.1-.85-.31-1.62-.99-.6-.54-1-1.2-1.12-1.4-.12-.2-.02-.31.08-.41.09-.09.2-.24.3-.36.1-.12.13-.2.2-.33.06-.13.03-.24-.01-.34-.05-.1-.44-1.06-.6-1.45-.16-.39-.32-.33-.44-.34h-.1c-.13 0-.26 0-.39.04-.13.04-.31.15-.47.31-.16.16-.62.61-.62 1.48 0 .87.64 1.72.73 1.85.09.13 1.25 1.91 3.03 2.66.42.18.75.28.99.36.43.14.83.12 1.14.07.35-.05 1.17-.48 1.33-.94.16-.46.16-.85.11-.94-.05-.09-.18-.14-.38-.24z" />
                  </svg>
                </div>
                <a href="https://wa.me/94776347922" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors text-white/90">+94 77 634 7922</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold mb-4 after:block after:w-10 after:h-0.5 after:bg-white/40 after:mt-2">Stay Connected with Oruthota Chalets</h2>

            <div className="flex gap-2 mt-4">
              <Link href="https://web.facebook.com/OruthotaChaletsKandy/?_rdc=1&_rdr#" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full border-white/30 bg-background text-[#283618] hover:bg-white hover:text-[#606C38]">
                  <Facebook className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://www.instagram.com/kandychalets/" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full border-white/30 bg-background text-[#283618] hover:bg-white hover:text-[#606C38]">
                  <Instagram className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="https://www.tiktok.com/@oruthota_chalets?is_from_webapp=1&sender_device=pc" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="rounded-full border-white/30 bg-background text-[#283618] hover:bg-white hover:text-[#606C38]">
                  <TikTokIcon className="h-5 w-5" />
                </Button>
              </Link>
            </div>

          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-white/60">
          <div className="flex gap-4 mb-4 md:mb-0">
            <Link href="/gdpr" className="hover:text-white transition-colors">GDPR Compliance</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Condition</Link>
            <Link href="/site-map" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Oruthota Chalets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
