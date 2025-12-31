'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, User, ArrowRight, Clock, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
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

        data?.forEach(post => {
          if (post.categories) {
            post.categories.forEach((cat: Category) => {
              if (!categoriesMap.has(cat.id)) {
                categoriesMap.set(cat.id, cat)
              }
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

  return (
    <div className="min-h-screen bg-clinica-bg">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-clinica-primary/10 via-clinica-accent/5 to-clinica-bg pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-clinica-primary mb-4"
          >
            Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-clinica-text/80 max-w-2xl mx-auto"
          >
            Artigos sobre psicologia, psiquiatria, bem-estar mental e saúde emocional
          </motion.p>
        </div>
      </section>

      {/* Search Bar e Filtros */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
          {/* Barra de Pesquisa */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-clinica-text/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Pesquisar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-clinica-accent border border-clinica-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinica-primary text-clinica-text placeholder-clinica-text/40"
            />
          </div>

          {/* Filtros por Categoria e Tag */}
          <div className="flex flex-wrap gap-4">
            {/* Filtro de Categoria */}
            {allCategories.length > 0 && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-clinica-text mb-2">
                  Categoria:
                </label>
                <select
                  value={selectedCategory || ''}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="w-full px-4 py-2 bg-clinica-accent border border-clinica-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinica-primary text-clinica-text"
                >
                  <option value="">Todas as categorias</option>
                  {allCategories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filtro de Tag */}
            {allTags.length > 0 && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-clinica-text mb-2">
                  Tag:
                </label>
                <select
                  value={selectedTag || ''}
                  onChange={(e) => setSelectedTag(e.target.value || null)}
                  className="w-full px-4 py-2 bg-clinica-accent border border-clinica-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-clinica-primary text-clinica-text"
                >
                  <option value="">Todas as tags</option>
                  {allTags.map(tag => (
                    <option key={tag.id} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Botão Limpar Filtros */}
            {(selectedCategory || selectedTag) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedCategory(null)
                    setSelectedTag(null)
                  }}
                  className="px-4 py-2 bg-clinica-primary/10 text-clinica-primary rounded-lg hover:bg-clinica-primary/20 transition-colors text-sm font-medium"
                >
                  Limpar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-clinica-accent border border-clinica-primary/20 rounded-xl overflow-hidden hover:shadow-xl transition-shadow group"
              >
                <Link href={`/blog/${post.slug}`}>
                  <div className="relative h-48 bg-clinica-primary/10 overflow-hidden">
                    {post.featured_image_url ? (
                      <Image
                        src={post.featured_image_url}
                        alt={post.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-clinica-primary/20 to-clinica-accent/20">
                        <span className="text-clinica-primary/40 text-4xl font-bold">CF</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-clinica-primary mb-3 group-hover:text-clinica-cta transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-clinica-text/70 mb-4 line-clamp-3">
                        {getExcerpt(post)}
                      </p>
                    )}
                    {/* Categorias e Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.primary_category && (
                        <span className="px-2 py-1 bg-clinica-primary/10 text-clinica-primary rounded text-xs font-medium">
                          {post.primary_category}
                        </span>
                      )}
                      {post.tags && post.tags.slice(0, 3).map((tag) => (
                        <span key={tag.id} className="px-2 py-1 bg-clinica-accent text-clinica-text/70 rounded text-xs">
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-sm text-clinica-text/60 mb-4">
                      <div className="flex items-center gap-4">
                        {post.published_at && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(post.published_at)}</span>
                          </div>
                        )}
                        {post.author_name && (
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{post.author_name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center text-clinica-cta font-semibold group-hover:gap-2 transition-all">
                      <span>Ler mais</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
