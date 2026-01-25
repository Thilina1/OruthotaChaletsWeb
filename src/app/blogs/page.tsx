'use client';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { BookingForm } from '@/components/booking-form';
import { useCollection, useFirestore } from '@/firebase';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';
import type { Blog } from '@/types/blog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { format } from 'date-fns';

export default function BlogsPage() {
  const heroImage = PlaceHolderImages.find((p) => p.id === 'blog-hero');

  const firestore = useFirestore();
  const blogsCollectionRef = useMemo(
    () => (firestore ? collection(firestore, 'blogs') : null),
    [firestore]
  );
  const { data: blogs, isLoading } = useCollection<Blog>(blogsCollectionRef);

  // Helper to safely truncate content and strip HTML for display
  const createSnippet = (htmlContent: string, length: number = 150) => {
    if (!htmlContent) return '';
    const text = htmlContent.replace(/<[^>]+>/g, '');
    if (text.length <= length) return text;
    return text.substring(0, length) + '...';
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date not available';
    // Firestore Timestamps have a toDate() method
    if (timestamp.toDate) {
      return format(timestamp.toDate(), 'MMMM d, yyyy');
    }
    // Handle string dates
    try {
      return format(new Date(timestamp), 'MMMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  return (
    <div className="flex flex-col">
      <section className="relative h-[50vh] min-h-[400px] w-full">
        {heroImage && (
          <Image
            src={heroImage.imageUrl}
            alt={heroImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 w-full px-4 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <h1 className="font-headline text-5xl md:text-7xl tracking-wider font-normal text-white/90">
              Our Blog
            </h1>
          </div>
        </div>
      </section>

      <div className="bg-background">
        <div className="py-8">
          <BookingForm />
        </div>
      </div>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-sm tracking-[0.2em] text-muted-foreground">LATEST STORIES</p>
            <h2 className="font-headline text-4xl text-foreground mt-2">FROM OUR BLOG</h2>
          </div>
          
          {isLoading && (
            <div className="text-center col-span-full">
                <p>Loading blog posts...</p>
            </div>
           )}

          {!isLoading && !blogs?.length && (
            <div className="text-center col-span-full">
                <p>No blog posts found.</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs?.map((post) => (
              <div key={post.id} className="bg-secondary rounded-lg overflow-hidden shadow-lg flex flex-col">
                <div className="relative h-64 w-full">
                    {post.contentImage ? (
                        <Image
                        src={post.contentImage.replace('dl=1', 'raw=1')}
                        alt={post.header1}
                        fill
                        className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                            <span className="text-muted-foreground">No Image</span>
                        </div>
                    )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <p className="text-sm text-muted-foreground mb-2">
                    {formatDate(post.createdAt)}
                  </p>
                  <h3 className="font-headline text-2xl text-foreground mb-4 flex-grow">{post.header1 || 'Untitled Post'}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                    {createSnippet(post.content1)}
                  </p>
                  <div className="mt-auto">
                    <Button asChild variant="link" className="p-0 text-primary hover:text-primary/80">
                       <Link href={`/blogs/${post.id}`}>
                        Read More
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
