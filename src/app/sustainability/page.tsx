import { PageHero } from '@/components/page-hero';
import { Leaf, Sun, Recycle, Droplets, HeartHandshake, TreePine } from 'lucide-react';
import Image from 'next/image';

const initiatives = [
    {
        id: 'energy',
        title: 'Renewable Energy',
        description: 'We harness the abundant sunshine of the Sri Lankan hill country with solar panels that power a significant portion of our resort, drastically reducing our carbon footprint.',
        icon: Sun,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10'
    },
    {
        id: 'water',
        title: 'Water Conservation',
        description: 'Through advanced rainwater harvesting systems and water-efficient fixtures, we ensure every drop from the heavens is respected and utilized responsibly across our lush gardens.',
        icon: Droplets,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10'
    },
    {
        id: 'waste',
        title: 'Zero Waste & Recycling',
        description: 'Our comprehensive waste management program ensures minimal landfill contribution. Organic waste is composted to nourish our gardens, and all plastics and glass are responsibly recycled.',
        icon: Recycle,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10'
    },
    {
        id: 'community',
        title: 'Community Empowerment',
        description: 'We believe in growing together. We source over 80% of our fresh produce from local farmers and actively provide employment and training opportunities for the surrounding hamlet.',
        icon: HeartHandshake,
        color: 'text-rose-500',
        bgColor: 'bg-rose-500/10'
    },
    {
        id: 'biodiversity',
        title: 'Biodiversity Protection',
        description: 'Settled by the Victoria Reservoir, our grounds act as a sanctuary. We plant endemic flora to support local wildlife, preserving the delicate balance of this pristine ecosystem.',
        icon: TreePine,
        color: 'text-[#606C38]',
        bgColor: 'bg-[#606C38]/10'
    },
    {
        id: 'materials',
        title: 'Eco-Friendly Materials',
        description: 'From biodegradable amenities in our chalets to natural cleaning products, we prioritize materials that are kind to the earth without compromising on your luxurious comfort.',
        icon: Leaf,
        color: 'text-teal-500',
        bgColor: 'bg-teal-500/10'
    }
];

export default function SustainabilityPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <PageHero
                title="Our Commitment to Nature"
                description="Preserving the enchanting beauty of the Victoria Reservoir for generations to come."
                imageUrl="/High-Knuckles-Glamping-in-Sri-Lanka.avif"
                imageAlt="Lush green nature surrounding Oruthota Chalets"
                subtitle="SUSTAINABILITY"
                titleClassName="text-4xl md:text-5xl lg:text-6xl"
            />

            {/* Intro statement */}
            <section className="py-24 px-4 bg-background relative overflow-hidden">
                {/* Decorative background circle */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0" />
                <div className="container mx-auto max-w-4xl text-center relative z-10">
                    <Leaf className="w-12 h-12 text-primary mx-auto mb-8 animate-bounce-slow" />
                    <h2 className="font-headline text-4xl md:text-5xl text-foreground mb-8">
                        Harmony with the Environment
                    </h2>
                    <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                        At Oruthota Chalets, we recognize that true hospitality extends beyond our guests—it includes caring for the magnificent environment that hosts us. 
                        Our philosophy is deeply rooted in sustainable practices that harmonise with the idyllic setting of the Sri Lankan hill country. We strive every day 
                        to ensure that your luxurious escape leaves a positive imprint on our planet and local communities.
                    </p>
                </div>
            </section>

            {/* Initiatives Grid */}
            <section className="py-24 bg-secondary">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-xs tracking-[0.3em] font-semibold text-primary uppercase">Our Practices</span>
                        <h3 className="font-headline text-4xl text-foreground mt-4">Key Sustainability Initiatives</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {initiatives.map((initiative, index) => {
                            const Icon = initiative.icon;
                            return (
                                <div 
                                    key={initiative.id}
                                    className="group relative bg-background/50 backdrop-blur-sm border border-border/50 p-8 rounded-2xl hover:bg-background hover:shadow-xl transition-all duration-500 overflow-hidden"
                                >
                                    <div className={`w-14 h-14 rounded-xl ${initiative.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                                        <Icon className={`w-7 h-7 ${initiative.color}`} />
                                    </div>
                                    <h4 className="font-headline text-2xl text-foreground mb-4">{initiative.title}</h4>
                                    <p className="text-muted-foreground leading-relaxed text-sm">
                                        {initiative.description}
                                    </p>
                                    
                                    {/* Subtle decorative gradient on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Split Section / Image Feature */}
            <section className="py-24 bg-background">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row items-center gap-16 max-w-7xl mx-auto">
                        <div className="lg:w-1/2 relative">
                            <div className="relative h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl">
                                <Image
                                    src="/DSCN1986.jpg"
                                    alt="Resort landscaping and sustainable architecture"
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-black/10" />
                            </div>
                            {/* Floating decorative card */}
                            <div className="absolute -bottom-10 -right-10 bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-xl max-w-xs hidden md:block border border-border">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Leaf className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="font-headline text-2xl text-primary">100%</div>
                                </div>
                                <p className="text-sm text-primary">Committed to protecting our natural reservoirs and lush habitats.</p>
                            </div>
                        </div>
                        
                        <div className="lg:w-1/2 space-y-8">
                            <span className="py-1 px-4 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-[0.2em] uppercase border border-primary/20">
                                JOIN US
                            </span>
                            <h3 className="font-headline text-4xl lg:text-5xl text-foreground leading-tight">
                                Be a Part of the Solution
                            </h3>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                When you choose to stay at Oruthota Chalets, you are actively supporting eco-friendly tourism. We invite our guests to participate in our green initiatives during their stay.
                            </p>
                            <ul className="space-y-4">
                                {[
                                    'Participate in our local tree-planting excursions.',
                                    'Enjoy farm-to-table dining with 100% organic local produce.',
                                    'Opt-in for our linen reuse program to save water.',
                                    'Explore the reservoir via non-motorized environmental tours.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="mt-1 bg-primary/20 p-1 rounded-full shrink-0">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                        </div>
                                        <span className="text-foreground">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
