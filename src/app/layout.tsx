import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { VisitUs } from '@/components/visit-us';
import { InstagramFeed } from '@/components/instagram-feed';
import { Toaster } from '@/components/ui/toaster';


export const metadata: Metadata = {
  metadataBase: new URL('https://oruthotachalets.com'),
  title: {
    default: 'Oruthota Chalets | Luxury Hotel in Kandy',
    template: '%s | Oruthota Chalets',
  },
  description: 'Experience The Aura of Tranquility at Oruthota Chalets. A luxury eco-friendly resort overlooking Victoria Reservoir in Kandy, Sri Lanka.',
  keywords: ['Kandy Hotel', 'Luxury Resort Code', 'Sri Lanka Holiday', 'Victoria Reservoir', 'Oruthota Chalets', 'Digana Hotel', 'Knuckles Mountain Range'],
  authors: [{ name: 'Oruthota Chalets' }],
  creator: 'Oruthota Chalets',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://oruthotachalets.com',
    title: 'Oruthota Chalets | The Aura of Tranquility',
    description: 'Review our luxury chalets overlooking the Victoria Reservoir. Perfect for nature lovers and family getaways.',
    siteName: 'Oruthota Chalets',
    images: [
      {
        url: '/og-image.jpg', // You should add an actual OG image to your public folder
        width: 1200,
        height: 630,
        alt: 'Oruthota Chalets - Victoria Reservoir View',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Oruthota Chalets | Luxury Hotel in Kandy',
    description: 'Experience The Aura of Tranquility at Oruthota Chalets.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Marcellus&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Mulish:wght@400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body bg-background text-foreground antialiased min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Hotel',
              name: 'Oruthota Chalets',
              description: 'The Aura of Tranquility - A luxury eco-friendly resort overlooking the Victoria Reservoir.',
              image: [
                'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6', // Hero image
              ],
              address: {
                '@type': 'PostalAddress',
                streetAddress: 'Rajawella',
                addressLocality: 'Digana',
                addressRegion: 'Central Province',
                postalCode: '20180',
                addressCountry: 'LK',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 7.3157,
                longitude: 80.7444,
              },
              telephone: '+94812375396',
              email: 'inquiries@oruthotachalets.com',
              url: 'https://oruthotachalets.com',
              priceRange: '$$$',
            }),
          }}
        />
        <Header />
        <main className="flex-grow">{children}</main>
        <InstagramFeed />
        <VisitUs />
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
