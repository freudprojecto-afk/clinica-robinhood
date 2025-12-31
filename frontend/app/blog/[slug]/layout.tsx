import { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  author_name: string | null
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  og_title: string | null
  og_description: string | null
  og_image_url: string | null
  canonical_url: string | null
  schema_markup: any
}

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !data) return null
    return data
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = await getPost(params.slug)

  if (!post) {
    return {
      title: 'Artigo não encontrado | Clínica Freud',
      description: 'O artigo que procura não foi encontrado.',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clinicafreud.pt'
  const postUrl = `${siteUrl}/blog/${post.slug}`
  
  // Usar dados SEO do WordPress (Rank Math) se disponíveis
  const title = post.meta_title || post.title
  const description = post.meta_description || post.excerpt || 'Artigo da Clínica Freud'
  const ogTitle = post.og_title || post.meta_title || post.title
  const ogDescription = post.og_description || post.meta_description || post.excerpt || description
  const ogImage = post.og_image_url || post.featured_image_url || `${siteUrl}/logo.png`
  const keywords = post.meta_keywords || 'psicologia, psiquiatria, psicoterapia, saúde mental'

  return {
    title: `${title} | Clínica Freud`,
    description,
    keywords: keywords.split(',').map(k => k.trim()),
    authors: post.author_name ? [{ name: post.author_name }] : undefined,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: postUrl,
      siteName: 'Clínica Freud',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'pt_PT',
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: post.author_name ? [post.author_name] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: post.canonical_url || postUrl,
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
  }
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
