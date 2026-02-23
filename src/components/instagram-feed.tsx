import Image from 'next/image';
import Link from 'next/link';
import { Instagram } from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';

export function InstagramFeed() {
    const instagramImage1 = PlaceHolderImages.find((p) => p.id === 'instagram-1');
    const instagramImage2 = PlaceHolderImages.find((p) => p.id === 'instagram-2');
    const instagramImage3 = PlaceHolderImages.find((p) => p.id === 'instagram-3');
    const instagramImage4 = PlaceHolderImages.find((p) => p.id === 'instagram-4');

    return (
        <section className="py-20 bg-background border-t">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl tracking-[0.2em] font-light text-muted-foreground uppercase mb-6">
                    #ORUTHOTACHALETS
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto mb-16 text-sm leading-relaxed">
                    Visit <Link href="#" className="font-bold text-foreground border-b border-transparent hover:border-foreground transition-all">@oruthotachalets</Link> and <Link href="#" className="font-bold text-foreground border-b border-transparent hover:border-foreground transition-all">#oruthotachalets</Link> to discover unforgettable experiences at Oruthota Chalets, Kandy - Official Site.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {/* Post 1 */}
                    <div className="flex flex-col group cursor-pointer">
                        <div className="relative aspect-square w-full overflow-hidden">
                            {instagramImage1 ? (
                                <Image src={instagramImage1.imageUrl} alt={instagramImage1.description} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">Image</div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                            <Instagram className="w-4 h-4" />
                            <span>@ORUTHOTACHALETS</span>
                        </div>
                    </div>

                    {/* Post 2 */}
                    <div className="flex flex-col group cursor-pointer">
                        <div className="relative aspect-square w-full overflow-hidden">
                            {instagramImage2 ? (
                                <Image src={instagramImage2.imageUrl} alt={instagramImage2.description} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">Image</div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                            <Instagram className="w-4 h-4" />
                            <span>@ORUTHOTACHALETS</span>
                        </div>
                    </div>

                    {/* Post 3 */}
                    <div className="flex flex-col group cursor-pointer">
                        <div className="relative aspect-square w-full overflow-hidden">
                            {instagramImage3 ? (
                                <Image src={instagramImage3.imageUrl} alt={instagramImage3.description} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">Image</div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                            <Instagram className="w-4 h-4" />
                            <span>@ORUTHOTACHALETS</span>
                        </div>
                    </div>

                    {/* Post 4 */}
                    <div className="flex flex-col group cursor-pointer">
                        <div className="relative aspect-square w-full overflow-hidden">
                            {instagramImage4 ? (
                                <Image src={instagramImage4.imageUrl} alt={instagramImage4.description} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">Image</div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-xs tracking-widest text-muted-foreground group-hover:text-foreground transition-colors uppercase">
                            <Instagram className="w-4 h-4" />
                            <span>@ORUTHOTACHALETS</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
