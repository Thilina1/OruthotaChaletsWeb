
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Facebook, Instagram, Youtube, Twitter, MapPin, Mail, Phone, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

const footerNav = [
  { name: 'Home', href: '/' },
  { name: 'Experiences', href: '/experiences' },
  { name: 'Gallery', href: '/gallery' },
  { name: 'Accommodations', href: '/rooms' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'About Us', href: '/about' },
];

const footerNavRight = [
  { name: 'Dining', href: '/dining' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Location', href: '#' },
  { name: 'Reviews', href: '#' },
  { name: 'Sustainability', href: '#' },
  { name: 'Blog', href: '/blogs' },
]

export function Footer() {
  const pathname = usePathname();

  return (
    <footer className="bg-[#606C38] text-white">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="font-headline text-5xl text-white">O</h2>
          <p className="tracking-[0.2em] text-sm">ORUTHOTA</p>
          <p className="tracking-[0.3em] text-xs font-light">Chalets</p>
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
                <a href="tel:+94812375396" className="hover:text-secondary transition-colors text-white/90">+94 81 2 375 396</a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold mb-4 after:block after:w-10 after:h-0.5 after:bg-white/40 after:mt-2">Stay Connected with Oruthota Chalets</h2>
            <div className="relative">
              <Input type="email" placeholder="Enter your email" className="bg-transparent border-white/30 rounded-full pr-10 text-white placeholder:text-white/50" />
              <Button type="submit" size="icon" variant="ghost" className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full h-8 w-8 hover:bg-white/10">
                <ArrowRight className="h-4 w-4 text-white" />
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="icon" className="rounded-full border-white/30 bg-background text-[#283618] hover:bg-white hover:text-[#606C38]">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-white/30 bg-background text-[#283618] hover:bg-white hover:text-[#606C38]">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-white/30 bg-background text-[#283618] hover:bg-white hover:text-[#606C38]">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-white/30 bg-background text-[#283618] hover:bg-white hover:text-[#606C38]">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-white/60">
          <div className="flex gap-4 mb-4 md:mb-0">
            <Link href="#" className="hover:text-white transition-colors">GDPR Compliance</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms & Condition</Link>
            <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Oruthota Chalets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
