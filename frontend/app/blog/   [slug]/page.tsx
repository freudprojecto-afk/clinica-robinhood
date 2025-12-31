'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react'
import { supabase } from '../../../../lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  author_name: string | null
  author_email: string | null
  published_at: string | null
  views: number
  created_at: string
  schema_markup?: any
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return

      try {
        // Buscar artigo
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (error) {
          console.error('Erro ao buscar artigo:', error)
          if (error.code === 'PGRST116') {
            // Artigo não encontrado
            router.push('/blog')
          }
          return
        }

        if (data) {
          setPost(data)
          
          // Incrementar contador de visualizações
          await supabase
            .from('blog_posts')
            .update({ views: (data.views || 0) + 1 })
            .eq('id', data.id)

          // Buscar artigos relacionados (mesmo autor ou palavras-chave similares)
          const { data: related } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('published', true)
            .neq('id', data.id)
            .order('published_at', { ascending: false, nullsFirst: false })
            .limit(3)

          setRelatedPosts(related || [])
        }
      } catch (err) {
        console.error('Erro ao buscar artigo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [slug, router])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const estimateReadingTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '')
    const words = text.split(/\s+/).length
    const minutes = Math.ceil(words / 200) // Média de 200 palavras por minuto
    return minutes
  }

  const handleShare = async () => {
    if (navigator.share && post) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt || '',
          url: window.location.href,
        })
      } catch (err) {
        // Usuário cancelou ou erro
        console.log('Erro ao partilhar:', err)
      }
    } else {
      // Fallback: copiar URL para clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('URL copiada para a área de transferência!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-clinica-bg flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-clinica-primary"></div>
          <p className="mt-4 text-clinica-text/60">A carregar artigo...</p>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-clinica-bg flex items-center justify-center">
        <div className="text-center">
          <p className="text-clinica-text/60 text-lg mb-4">Artigo não encontrado.</p>
          <Link
            href="/blog"
            className="text-clinica-cta hover:text-clinica-primary transition-colors"
          >
            Voltar ao blog
          </Link>
        </div>
      </div>
    )
  }

  // Gerar JSON-LD structured data para SEO
  const schemaMarkup = post.schema_markup || {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || '',
    image: post.featured_image_url || '',
    datePublished: post.published_at || post.created_at,
    dateModified: post.published_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author_name || 'Clínica Freud',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Clínica Freud',
    },
  }

  return (
    <div className="min-h-screen bg-clinica-bg">
      {/* JSON-LD Structured Data para SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />
      
      {/* Hero Section com Imagem */}
      <section className="relative pt-32 pb-16">
        {post.featured_image_url && (
          <div className="absolute inset-0 z-0">
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover opacity-20"
              priority
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-clinica-bg/80"></div>
          </div>
        )}
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              href="/blog"
              className="inline-flex items-center text-clinica-cta hover:text-clinica-primary transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao blog
            </Link>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-clinica-primary mb-6">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-clinica-text/70 mb-6">
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at)}</span>
                </div>
              )}
              {post.author_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{estimateReadingTime(post.content)} min de leitura</span>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-clinica-cta hover:text-clinica-primary transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>Partilhar</span>
              </button>
            </div>
            {post.excerpt && (
              <p className="text-lg text-clinica-text/80 italic border-l-4 border-clinica-primary pl-4 mb-8">
                {post.excerpt}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Conteúdo do Artigo */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-none
            prose-headings:text-clinica-primary
            prose-p:text-clinica-text
            prose-a:text-clinica-cta
            prose-strong:text-clinica-primary
            prose-ul:text-clinica-text
            prose-ol:text-clinica-text
            prose-li:text-clinica-text
            prose-blockquote:border-clinica-primary
            prose-blockquote:text-clinica-text/80
            prose-code:text-clinica-cta
            prose-pre:bg-clinica-accent
            prose-img:rounded-lg
            prose-img:shadow-lg"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>

      {/* Artigos Relacionados */}
      {relatedPosts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="text-2xl font-bold text-clinica-primary mb-8">Artigos Relacionados</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((relatedPost) => (
              <Link
                key={relatedPost.id}
                href={`/blog/${relatedPost.slug}`}
                className="bg-clinica-accent border border-clinica-primary/20 rounded-xl overflow-hidden hover:shadow-xl transition-shadow group"
              >
                {relatedPost.featured_image_url && (
                  <div className="relative h-40 bg-clinica-primary/10 overflow-hidden">
                    <Image
                      src={relatedPost.featured_image_url}
                      alt={relatedPost.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-clinica-primary mb-2 group-hover:text-clinica-cta transition-colors line-clamp-2">
                    {relatedPost.title}
                  </h3>
                  {relatedPost.excerpt && (
                    <p className="text-sm text-clinica-text/70 line-clamp-2">
                      {relatedPost.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
