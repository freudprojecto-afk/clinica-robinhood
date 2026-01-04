'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string | null
}

export default function UltimosArtigosWrapper() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { data, error } = await supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, featured_image_url, published_at')
          .eq('published', true)
          .order('published_at', { ascending: false, nullsFirst: false })
          .limit(3)

        if (!error && data) {
          setPosts(data)
        }
      } catch (err) {
        console.error('Erro ao buscar artigos:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  if (loading) {
    return (
      <section id="blog" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-clinica-text opacity-70">A carregar artigos...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!posts || posts.length === 0) {
    return null
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <section id="blog" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Blog</h2>
          <p className="text-lg text-clinica-text">Artigos e recursos sobre saúde mental</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-clinica-accent border border-clinica-primary rounded-xl overflow-hidden hover:border-clinica-menu transition-all cursor-pointer shadow-md hover:shadow-lg group"
            >
              {post.featured_image_url ? (
                <div className="relative h-48 bg-clinica-primary/10 overflow-hidden">
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="relative h-48 bg-clinica-primary/10 flex items-center justify-center">
                  <div className="text-clinica-primary/30">
                    <svg
                      className="w-16 h-16"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
              )}

              <div className="p-6">
                {post.published_at && (
                  <p className="text-sm text-clinica-text/50 mb-3">
                    {formatDate(post.published_at)}
                  </p>
                )}

                <h3 className="text-xl font-bold mb-2 text-clinica-text line-clamp-2">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-clinica-text mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                )}
                <button className="text-clinica-menu hover:underline">
                  Ler mais →
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
