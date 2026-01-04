'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Search, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface Category {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
}

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  author_name: string | null
  published_at: string | null
  views: number
  created_at: string
  categories: Category[] | null
  tags: Tag[] | null
  primary_category: string | null
  primary_category_slug: string | null
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [allTags, setAllTags] = useState<Tag[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('published', true)
          .order('published_at', { ascending: false, nullsFirst: false })
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Erro ao buscar artigos:', error)
          return
        }

        setPosts(data || [])

        // Extrair todas as categorias e tags únicas
        const categoriesMap = new Map<number, Category>()
        const tagsMap = new Map<number, Tag>()
        const counts = new Map<string, number>()

        data?.forEach(post => {
          if (post.categories) {
            post.categories.forEach((cat: Category) => {
              if (!categoriesMap.has(cat.id)) {
                categoriesMap.set(cat.id, cat)
              }
              const currentCount = counts.get(cat.name) || 0
              counts.set(cat.name, currentCount + 1)
            })
          }
          if (post.tags) {
            post.tags.forEach((tag: Tag) => {
              if (!tagsMap.has(tag.id)) {
                tagsMap.set(tag.id, tag)
              }
            })
          }
        })

        setAllCategories(Array.from(categoriesMap.values()))
        setAllTags(Array.from(tagsMap.values()))
        setCategoryCounts(counts)
      } catch (err) {
        console.error('Erro ao buscar artigos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  const filteredPosts = posts.filter(post => {
    // Filtro de pesquisa
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))

    // Filtro de categoria
    const matchesCategory = !selectedCategory || 
      (post.categories && post.categories.some(cat => cat.slug === selectedCategory)) ||
      post.primary_category_slug === selectedCategory

    // Filtro de tag
    const matchesTag = !selectedTag ||
      (post.tags && post.tags.some(tag => tag.slug === selectedTag))

    return matchesSearch && matchesCategory && matchesTag
  })

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const stripHtml = (html: string) => {
    if (typeof window === 'undefined') return html
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const getExcerpt = (post: BlogPost) => {
    if (post.excerpt) return post.excerpt
    const text = stripHtml(post.content)
    return text.length > 150 ? text.substring(0, 150) + '...' : text
  }

  const estimateReadingTime = (content: string) => {
    const text = content.replace(/<[^>]*>/g, '')
    const words = text.split(/\s+/).length
    const minutes = Math.ceil(words / 200)
    return minutes
  }

  // Top 5 categorias mais populares
  const popularCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name]) => allCategories.find(cat => cat.name === name))
    .filter(Boolean) as Category[]

  return (
    <div className="min-h-screen bg-clinica-bg">
      {/* Hero Section - Estilo Quantoma */}
      <section className="bg-clinica-bg pt-32 pb-16 px-4 sm:px-6 lg:px-8 border-b border-clinica-primary/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold text-clinica-primary mb-4 tracking-tight">
              Blog Clínica Freud
            </h1>
            <p className="text-xl sm:text-2xl text-clinica-text/70 max-w-3xl mx-auto">
              Reflexões, orientações e descobertas sobre saúde mental, bem-estar e psicologia no dia a dia
            </p>
          </motion.div>

          {/* Barra de Pesquisa - Estilo Quantoma */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-clinica-text/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Pesquisar artigos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-clinica-accent border border-clinica-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinica-primary text-clinica-text placeholder-clinica-text/40 text-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Estilo Quantoma */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Artigos - Coluna Principal */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-clinica-primary"></div>
                <p className="mt-4 text-clinica-text/60">A carregar artigos...</p>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-clinica-text/60 text-lg">
                  {searchTerm ? 'Nenhum artigo encontrado com essa pesquisa.' : 'Ainda não há artigos publicados.'}
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {filteredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-clinica-bg border-b border-clinica-primary/10 pb-8 hover:border-clinica-primary/30 transition-colors"
                  >
                    <Link href={`/blog/${post.slug}`} className="block group">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Imagem */}
                        {post.featured_image_url && (
                          <div className="md:w-64 md:flex-shrink-0">
                            <div className="relative h-48 md:h-40 w-full bg-clinica-primary/10 rounded-xl overflow-hidden">
                              <Image
                                src={post.featured_image_url}
                                alt={post.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 768px) 100vw, 256px"
                              />
                            </div>
                          </div>
                        )}
                        
                        {/* Conteúdo */}
                        <div className="flex-1">
                          {/* Categoria */}
                          {post.primary_category && (
                            <span className="inline-block mb-3 text-sm font-semibold text-clinica-primary uppercase tracking-wide">
                              {post.primary_category}
                            </span>
                          )}
                          
                          {/* Título */}
                          <h2 className="text-2xl sm:text-3xl font-bold text-clinica-primary mb-3 group-hover:text-clinica-cta transition-colors leading-tight">
                            {post.title}
                          </h2>
                          
                          {/* Excerpt */}
                          {post.excerpt && (
                            <p className="text-clinica-text/80 text-lg mb-4 leading-relaxed line-clamp-2">
                              {getExcerpt(post)}
                            </p>
                          )}
                          
                          {/* Metadata */}
                          <div className="flex flex-wrap items-center gap-4 text-clinica-text/60 text-sm">
                            {post.published_at && (
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(post.published_at)}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{estimateReadingTime(post.content)} min</span>
                            </div>
                            <Link
                              href={`/blog/${post.slug}`}
                              className="inline-flex items-center gap-2 text-clinica-cta font-semibold hover:text-clinica-primary transition-colors ml-auto"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Ler mais
                              <ArrowRight className="w-4 h-4" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.article>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar - Estilo Quantoma */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-8">
              {/* Categorias Populares */}
              {popularCategories.length > 0 && (
                <div className="bg-clinica-accent/50 rounded-xl p-6 border border-clinica-primary/10">
                  <h3 className="text-lg font-bold text-clinica-primary mb-4">Categorias Populares</h3>
                  <ul className="space-y-2">
                    {popularCategories.map((category) => {
                      const count = categoryCounts.get(category.name) || 0
                      return (
                        <li key={category.id}>
                          <button
                            onClick={() => setSelectedCategory(selectedCategory === category.slug ? null : category.slug)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition-colors text-sm ${
                              selectedCategory === category.slug
                                ? 'bg-clinica-primary text-white'
                                : 'text-clinica-text hover:bg-clinica-primary/10'
                            }`}
                          >
                            <span className="font-medium">{category.name}</span>
                            <span className="ml-2 text-clinica-text/50">({count})</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              {/* Sobre a Clínica Freud */}
              <div className="bg-clinica-accent/50 rounded-xl p-6 border border-clinica-primary/10">
                <h3 className="text-lg font-bold text-clinica-primary mb-3">Sobre a Clínica Freud</h3>
                <p className="text-clinica-text/80 text-sm leading-relaxed mb-4">
                  A Clínica Freud é uma plataforma especializada em psicologia, psiquiatria e bem-estar mental. Combinamos experiência clínica com conhecimento científico para ajudar pessoas a recuperar o equilíbrio emocional.
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center text-clinica-cta font-semibold hover:text-clinica-primary transition-colors text-sm"
                >
                  Saber mais →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
