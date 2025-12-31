'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowLeft, Clock, Share2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
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

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    async function fetchPost() {
      if (!slug) {
        console.log('❌ Slug vazio')
        return
      }

      console.log('🔍 A buscar artigo com slug:', slug)

      try {
        // Buscar artigo
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('published', true)
          .single()

        if (error) {
          console.error('❌ Erro ao buscar artigo:', error)
          console.error('❌ Código do erro:', error.code)
          console.error('❌ Mensagem:', error.message)
          if (error.code === 'PGRST116') {
            // Artigo não encontrado
            console.log('⚠️ Artigo não encontrado, a redirecionar para /blog')
            router.push('/blog')
          }
          return
        }

        if (data) {
          console.log('✅ Artigo encontrado:', data.title)
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
        } else {
          console.log('⚠️ Nenhum dado retornado')
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
      
      {/* Breadcrumbs */}
      <section className="bg-clinica-bg border-b border-clinica-primary/10 pt-24 pb-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-clinica-text/60 mb-4">
            <Link href="/" className="hover:text-clinica-primary transition-colors">Início</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-clinica-primary transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-clinica-text/40">{post.title}</span>
          </nav>
        </div>
      </section>

      {/* Hero Section - Estilo Mercado Bitcoin */}
      <section className="bg-clinica-bg pt-8 pb-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-clinica-primary mb-8 leading-[1.2] tracking-tight">
              {post.title}
            </h1>
            
            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-4 text-clinica-text/70 mb-8 text-sm">
              {post.author_name && (
                <div className="flex items-center gap-2">
                  <span className="text-clinica-text/50">Por</span>
                  <span className="font-semibold text-clinica-text">{post.author_name}</span>
                </div>
              )}
              {post.published_at && (
                <>
                  <span className="text-clinica-text/30">•</span>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.published_at)}</span>
                  </div>
                </>
              )}
              <span className="text-clinica-text/30">•</span>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{estimateReadingTime(post.content)} min</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conteúdo do Artigo - Estilo Mercado Bitcoin (leitura fácil) */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-none
            prose-headings:text-clinica-primary prose-headings:font-bold
            prose-headings:leading-tight prose-headings:tracking-tight
            prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-12 prose-h1:font-extrabold prose-h1:leading-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-5 prose-h2:font-bold prose-h2:leading-tight
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:font-bold prose-h3:leading-tight
            prose-h4:text-lg prose-h4:mt-6 prose-h4:mb-3 prose-h4:font-semibold
            prose-p:text-clinica-text prose-p:text-[19px] prose-p:leading-[1.9] prose-p:mb-8
            prose-p:font-normal prose-p:tracking-wide
            prose-a:text-clinica-cta prose-a:font-semibold prose-a:no-underline
            prose-a:hover:text-clinica-primary prose-a:hover:underline prose-a:transition-colors
            prose-strong:text-clinica-primary prose-strong:font-bold
            prose-ul:text-clinica-text prose-ul:my-8 prose-ul:pl-8 prose-ul:list-disc prose-ul:list-outside
            prose-ol:text-clinica-text prose-ol:my-8 prose-ol:pl-8 prose-ol:list-decimal prose-ol:list-outside
            prose-li:text-clinica-text prose-li:my-3 prose-li:leading-[1.9] prose-li:text-[19px] prose-li:pl-2
            prose-li:marker:text-clinica-primary prose-li:marker:font-bold
            prose-blockquote:border-l-4 prose-blockquote:border-clinica-primary
            prose-blockquote:bg-clinica-accent/30 prose-blockquote:py-5 prose-blockquote:px-6
            prose-blockquote:rounded-r-lg prose-blockquote:my-8 prose-blockquote:not-italic
            prose-blockquote:text-clinica-text prose-blockquote:text-[19px] prose-blockquote:leading-relaxed
            prose-code:text-clinica-cta prose-code:bg-clinica-accent/50 prose-code:px-2 prose-code:py-1
            prose-code:rounded prose-code:text-sm prose-code:font-mono prose-code:font-semibold
            prose-pre:bg-clinica-accent/30 prose-pre:border prose-pre:border-clinica-primary/10
            prose-pre:rounded-lg prose-pre:p-6 prose-pre:overflow-x-auto prose-pre:my-8
            prose-img:rounded-xl prose-img:shadow-xl prose-img:my-14 prose-img:w-full prose-img:mx-auto
            prose-img:object-cover prose-img:border prose-img:border-clinica-primary/10
            prose-figure:my-14 prose-figure:mx-auto
            prose-figcaption:text-clinica-text/60 prose-figcaption:text-sm prose-figcaption:italic
            prose-figcaption:mt-3 prose-figcaption:text-center
            prose-table:w-full prose-table:my-10 prose-table:border-collapse prose-table:shadow-lg
            prose-table:rounded-lg prose-table:overflow-hidden prose-table:border prose-table:border-clinica-primary/20
            prose-th:bg-clinica-primary prose-th:text-white prose-th:font-bold prose-th:p-3 prose-th:text-[16px]
            prose-th:border prose-th:border-clinica-primary/30 prose-th:text-left
            prose-th:first:rounded-tl-lg prose-th:last:rounded-tr-lg
            prose-td:p-3 prose-td:border prose-td:border-clinica-primary/20 prose-td:bg-clinica-bg
            prose-td:text-clinica-text prose-td:text-[16px] prose-td:leading-relaxed
            prose-td:align-top
            prose-tr:border-b prose-tr:border-clinica-primary/10 prose-tr:last:border-b-0
            prose-hr:border-clinica-primary/20 prose-hr:my-12 prose-hr:border-t-2"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Botão Partilhar no final */}
        <div className="mt-12 pt-8 border-t border-clinica-primary/10">
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-6 py-3 bg-clinica-cta text-clinica-text rounded-lg hover:bg-clinica-cta/90 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            <span>Partilhar</span>
          </button>
        </div>
      </article>

      {/* Navegação entre Artigos */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 border-t border-clinica-primary/10 pt-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-clinica-cta hover:text-clinica-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          ← Voltar ao blog
        </Link>
      </section>

      {/* Artigos Relacionados - Estilo Quantoma */}
      {relatedPosts.length > 0 && (
        <section className="bg-clinica-accent/30 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-clinica-primary mb-12 text-center">Artigos Relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <Link
                  key={relatedPost.id}
                  href={`/blog/${relatedPost.slug}`}
                  className="bg-clinica-bg border border-clinica-primary/10 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:border-clinica-primary/30"
                >
                  {relatedPost.featured_image_url && (
                    <div className="relative h-48 bg-clinica-primary/10 overflow-hidden">
                      <Image
                        src={relatedPost.featured_image_url}
                        alt={relatedPost.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-clinica-primary mb-3 group-hover:text-clinica-cta transition-colors line-clamp-2 leading-tight">
                      {relatedPost.title}
                    </h3>
                    {relatedPost.excerpt && (
                      <p className="text-clinica-text/70 line-clamp-3 leading-relaxed text-base">
                        {relatedPost.excerpt}
                      </p>
                    )}
                    {relatedPost.published_at && (
                      <p className="text-sm text-clinica-text/50 mt-4">
                        {formatDate(relatedPost.published_at)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
