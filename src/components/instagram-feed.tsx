import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';

const instagramPosts = [
    { src: '/instagram-1.png', alt: 'A view of the mountains from the hotel' },
    { src: '/instagram-2.png', alt: 'A couple enjoying a swing with a mountain view' },
    { src: '/instagram-3.png', alt: 'A woman sitting by the pool overlooking the mountains' },
    { src: '/instagram-4.png', alt: 'A view of an elephant walking in a lush jungle area' },
];

export function InstagramFeed() {
    return (
        <section className="py-20 bg-background border-t">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl tracking-[0.2em] font-light text-muted-foreground uppercase mb-6">
                    #KANDYCHALETS
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-sm leading-relaxed">
                    Visit <Link href="https://www.instagram.com/kandychalets/" className="font-bold text-foreground border-b border-transparent hover:border-foreground transition-all">@KANDYCHALETS</Link> to discover unforgettable experiences at Oruthota Chalets, Kandy - Official Site.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {instagramPosts.map((post, index) => (
                        <Link
                            key={index}
                            href="https://www.instagram.com/kandychalets/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex flex-col group cursor-pointer"
                        >
                            <div className="relative aspect-square w-full overflow-hidden">
                                <Image
                                    src={post.src}
                                    alt={post.alt}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-4 text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                                <Instagram className="w-4 h-4" />
                                <span>@KANDYCHALETS</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
