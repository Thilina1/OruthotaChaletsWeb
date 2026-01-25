
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
    <footer className="bg-background text-foreground">
      <div className="container mx-auto px-4 pt-16 pb-8">
        <div className="flex flex-col items-center text-center mb-12">
          <h2 className="font-headline text-5xl text-primary">O</h2>
          <p className="tracking-[0.2em] text-sm">ORUTHOTA</p>
          <p className="tracking-[0.3em] text-xs font-light">Chalets</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div className="md:col-span-1">
            <h3 className="font-semibold mb-4 after:block after:w-10 after:h-0.5 after:bg-primary after:mt-2">Oruthota Chalets</h3>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-2">
                {footerNav.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <ul className="space-y-2">
                {footerNavRight.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-primary transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 after:block after:w-10 after:h-0.5 after:bg-primary after:mt-2">Get in Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-primary" />
                <span>Oruthota Chalets,<br />Rajawella, Digana,<br />Sri Lanka</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-primary" />
                <a href="mailto:inquiries@oruthotachalets.com" className="hover:text-primary transition-colors">inquiries@oruthotachalets.com</a>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-primary" />
                <a href="tel:+94812375396" className="hover:text-primary transition-colors">+94 81 2 375 396</a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 after:block after:w-10 after:h-0.5 after:bg-primary after:mt-2">Stay Connected with Oruthota Chalets</h3>
            <div className="relative">
              <Input type="email" placeholder="Enter your email" className="bg-transparent border-primary rounded-full pr-10" />
              <Button type="submit" size="icon" variant="ghost" className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full h-8 w-8 hover:bg-primary/20">
                <ArrowRight className="h-4 w-4 text-primary" />
              </Button>
            </div>
            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="icon" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full border-primary text-primary hover:bg-primary hover:text-white">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-primary/20" />

        <div className="flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground">
          <div className="flex gap-4 mb-4 md:mb-0">
            <Link href="#" className="hover:text-primary">GDPR Compliance</Link>
            <Link href="#" className="hover:text-primary">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary">Terms & Condition</Link>
            <Link href="#" className="hover:text-primary">Sitemap</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Oruthota Chalets. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
