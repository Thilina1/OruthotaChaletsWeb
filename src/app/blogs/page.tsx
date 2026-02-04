'use client';

import { PageHero } from '@/components/page-hero';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import Image from 'next/image';
import { useSupabaseCollection } from '@/hooks/use-supabase';
import type { Blog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

export default function BlogsPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'blog-hero');

  const { data: blogs, isLoading } = useSupabaseCollection<Blog>('blogs');

  // Helper to safely truncate content and strip HTML for display
  const createSnippet = (htmlContent: string, length: number = 150) => {
    if (!htmlContent) return '';
    const text = htmlContent.replace(/<[^>]+>/g, '');
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    // Firestore Timestamps have a toDate() method
    if (timestamp.toDate) {
      return format(timestamp.toDate(), 'MMMM d, yyyy');
    }
    // Handle string dates
    try {
      return format(new Date(timestamp), 'MMM d, yyyy');
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <PageHero
        title="Our Blog"
        description="Stories, updates, and insights from our little slice of paradise."
        imageUrl={heroImage?.imageUrl || ''}
        imageAlt={heroImage?.description || 'Oruthota Chalets Blog'}
        imageHint={heroImage?.imageHint}
      />

      {/* Booking Form Integration */}
      <div className="relative z-20 -mt-16 container mx-auto px-4 mb-12">
        <div className="bg-card rounded-xl shadow-2xl border border-border/50 backdrop-blur-sm overflow-hidden">
          <BookingForm />
        </div>
      </div>

      <section className="pb-20 pt-8 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <div className="inline-block">
              <span className="py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase">
                Latest Stories
              </span>
            </div>
            <h2 className="font-headline text-4xl md:text-5xl text-foreground mt-2">From Our Journal</h2>
            <p className="text-muted-foreground text-lg leading-relaxed font-light max-w-2xl mx-auto">
              Discover the latest news, events, and experiences at Oruthota Chalets.
            </p>
          </div>

          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          )}

          {!isLoading && !blogs?.length && (
            <div className="text-center py-20 bg-secondary/30 rounded-xl border border-dashed border-muted-foreground/20">
              <p className="text-muted-foreground text-lg">No blog posts found.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs?.map((post) => (
              <div key={post.id} className="group bg-card rounded-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-border/50 flex flex-col h-full hover:-translate-y-1">
                <div className="relative h-64 w-full overflow-hidden">
                  {post.contentImage ? (
                    <Image
                      src={post.contentImage.replace('dl=1', 'raw=1')}
                      alt={post.header1}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <span className="text-muted-foreground/50 text-sm">No Image Available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                </div>

                <div className="p-8 flex flex-col flex-grow relative">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider text-primary bg-primary/5 px-2 py-1 rounded-sm uppercase">
                      Article
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>

                  <h3 className="font-headline text-2xl text-foreground mb-4 group-hover:text-primary transition-colors line-clamp-2">
                    {post.header1 || 'Untitled Post'}
                  </h3>

                  <p className="text-muted-foreground text-base leading-relaxed mb-6 line-clamp-3">
                    {createSnippet(post.content1)}
                  </p>

                  <div className="mt-auto pt-6 border-t border-border/40 flex items-center justify-between">
                    <Button asChild variant="link" className="p-0 text-primary hover:text-primary/80 font-semibold tracking-wide text-sm h-auto">
                      <Link href={`/blogs/${post.id}`} className="group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                        Read Story <span aria-hidden="true">&rarr;</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
