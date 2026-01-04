import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import BlogPostClient from './BlogPostClient'

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', params.slug)
    .eq('published', true)
    .single()

  if (!post) {
    return {
      title: 'Artigo não encontrado',
    }
  }

  const metaTitle = post.meta_title || post.title
  const metaDescription = post.meta_description || post.excerpt || ''
  const ogImage = post.og_image_url || post.featured_image_url
  const canonicalUrl = post.canonical_url || undefined

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: post.og_title || metaTitle,
      description: post.og_description || metaDescription,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : [],
      type: 'article',
      publishedTime: post.published_at || undefined,
      modifiedTime: post.updated_at || undefined,
      authors: post.author_name ? [post.author_name] : undefined,
      siteName: 'Clínica Freud',
      url: canonicalUrl || post.wordpress_url || undefined,
    },
    twitter: {
      card: (post.twitter_card_type || 'summary_large_image') as 'summary' | 'summary_large_image',
      title: post.twitter_title || post.og_title || metaTitle,
      description: post.twitter_description || post.og_description || metaDescription,
      images: post.twitter_image_url 
        ? [post.twitter_image_url]
        : (ogImage ? [ogImage] : []),
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: post.robots_meta 
      ? {
          index: !post.robots_meta.includes('noindex'),
          follow: !post.robots_meta.includes('nofollow'),
        }
      : undefined,
    keywords: post.meta_keywords || undefined,
  }
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  return <BlogPostClient slug={params.slug} />
}
