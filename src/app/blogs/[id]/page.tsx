'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Blog } from '@/types/blog';
import Image from 'next/image';
import { format } from 'date-fns';

export default function BlogPostPage() {
  const params = useParams();
  const { id } = params;

  const [post, setPost] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) setPost(data as Blog);
      } catch (e: any) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchPost();
  }, [id]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Date not available';
    // Supabase returns string, handle simple date parsing
    try {
      return format(new Date(timestamp), 'MMMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return <div className="container  mx-auto py-20 px-4 text-center">Loading post...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-20 px-4 text-center text-destructive">Error loading post: {error.message}</div>;
  }

  if (!post) {
    return <div className="container mx-auto py-20 px-4 text-center">Blog post not found.</div>;
  }

  const modifiedImageUrl = post.contentImage ? post.contentImage.replace('dl=1', 'raw=1') : '';

  return (
    <div className="bg-background py-20 pt-32">
      <br></br>
      <div className="container mx-auto px-4 max-w-4xl">
        <article className="prose prose-lg dark:prose-invert mx-auto">
          <header className="mb-12 border-b pb-8">
            <h1 className="font-headline text-5xl text-foreground mb-4">{post.header1}</h1>
            <p className="text-muted-foreground">
              Published on {formatDate(post.createdAt)}
            </p>
          </header>

          {modifiedImageUrl && (
            <div className="relative h-96 w-full mb-12 rounded-lg overflow-hidden">
              <Image
                src={modifiedImageUrl}
                alt={post.header1}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {post.content1 && (
            <div dangerouslySetInnerHTML={{ __html: post.content1 }} className="mb-8" />
          )}

          {post.content2 && (
            <div dangerouslySetInnerHTML={{ __html: post.content2 }} />
          )}
        </article>
      </div>
    </div>
  );
}
