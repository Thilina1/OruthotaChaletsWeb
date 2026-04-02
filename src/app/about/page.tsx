import { PageHero } from '@/components/page-hero';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PageHero
                title="About Us"
                description="The story of our picturesque, family-oriented retreat by the Victoria Reservoir."
                imageUrl="/DSCN1986.jpg"
                imageAlt="Beautiful view of Oruthota Chalets"
                subtitle="OUR STORY"
                titleClassName="text-5xl md:text-6xl lg:text-7xl"
            />

            <section id="location" className="py-24 px-4 bg-background relative overflow-hidden">
                <div className="container mx-auto max-w-6xl">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        
                        {/* Text Content */}
                        <div className="lg:w-1/2 space-y-8">
                            <h2 className="font-headline text-4xl lg:text-5xl text-foreground leading-tight">
                                About the Hotel
                            </h2>
                            <div className="w-20 h-1 bg-primary rounded-full" />
                            
                            <div className="text-muted-foreground text-lg leading-relaxed space-y-6">
                                <p>
                                    <strong className="text-foreground">Oruthota Chalets</strong>… a beautiful family-oriented holiday resort overlooking the waters of the Victoria Reservoir is located approximately 18 kilometers from the city of Kandy. This eco-friendly resort is nestled amidst a picturesque, tranquil and rural setting, well away from the busyness of a city life.
                                </p>
                                <p>
                                    Access to Oruthota Chalets is through a typical rural road of about a kilometre, off the main road. Experience the rural lifestyles of a little hamlet, with multi-religious influences whilst driving to this unique concept of a beautiful eco-friendly holiday resort.
                                </p>
                                <p>
                                    Enjoy the perfect ambiance for a well-deserved, relaxed holiday in the Hill Country of Sri Lanka. Here is the ideal destination to unwind yourself from your busy lifestyle and enjoy the nature that surrounds Oruthota Chalets – a stay to be remembered always!!!!
                                </p>
                            </div>
                            
                            <div className="pt-4">
                                <Link href="/contact" passHref>
                                    <Button className="rounded-none bg-primary text-primary-foreground font-semibold tracking-wider hover:bg-primary/90 px-8 py-6">
                                        GET IN TOUCH
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Image Layout */}
                        <div className="lg:w-1/2 relative min-h-[500px] w-full">
                            <div className="absolute top-0 right-0 w-3/4 h-[400px] rounded-2xl overflow-hidden shadow-2xl z-10 transition-transform duration-700 hover:scale-[1.02]">
                                <Image
                                    src="/IMG_3197-Edit.jpg"
                                    alt="Oruthota Chalets Resort View"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="absolute bottom-0 left-0 w-2/3 h-[300px] rounded-2xl overflow-hidden shadow-xl z-20 border-8 border-background transition-transform duration-700 hover:-translate-y-2">
                                <Image
                                    src="/Hero1.jpg"
                                    alt="Relaxing ambiance at Oruthota Chalets"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary rounded-full -z-10" />
                            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/10 rounded-full -z-10 blur-xl" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
