/**
 * COMPONENTE: Últimos Artigos do Blog na Homepage
 * 
 * Este componente exibe os 3 artigos mais recentes do blog
 * com imagens de destaque na página principal
 * 
 * LOCALIZAÇÃO: frontend/components/UltimosArtigosHomepage.tsx
 * 
 * COMO USAR:
 * 1. Importe este componente na sua página principal (app/page.tsx)
 * 2. Adicione a secção onde quiser (recomendado: depois de "O que oferecemos" e antes de "Quem Somos")
 */

import { supabase } from '@/lib/supabase'
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

export default async function UltimosArtigosHomepage() {
  // Buscar os 3 artigos mais recentes
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, featured_image_url, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .limit(3)

  // Se houver erro ou não houver artigos, não exibir a secção
  if (error || !posts || posts.length === 0) {
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
    <section className="bg-clinica-bg py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título da Secção */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-clinica-primary mb-4">
            Últimos Artigos
          </h2>
          <p className="text-lg text-clinica-text/70 max-w-2xl mx-auto">
            Mantenha-se atualizado com os nossos artigos mais recentes sobre saúde mental e bem-estar
          </p>
        </div>

        {/* Grid de Artigos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="bg-clinica-bg border border-clinica-primary/10 rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-300 group hover:border-clinica-primary/30"
            >
              {/* Imagem de Destaque */}
              {post.featured_image_url ? (
                <div className="relative h-56 bg-clinica-primary/10 overflow-hidden">
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <div className="relative h-56 bg-clinica-primary/10 flex items-center justify-center">
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

              {/* Conteúdo do Card */}
              <div className="p-6">
                {/* Data */}
                {post.published_at && (
                  <p className="text-sm text-clinica-text/50 mb-3">
                    {formatDate(post.published_at)}
                  </p>
                )}

                {/* Título */}
                <h3 className="text-xl font-bold text-clinica-primary mb-3 group-hover:text-clinica-cta transition-colors line-clamp-2 leading-tight">
                  {post.title}
                </h3>

                {/* Excerto */}
                {post.excerpt && (
                  <p className="text-clinica-text/70 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>
                )}

                {/* Link "Ler mais" */}
                <span className="inline-flex items-center text-clinica-cta font-semibold group-hover:text-clinica-primary transition-colors">
                  Ler mais →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Botão "Ver Todos os Artigos" */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center px-8 py-4 bg-clinica-cta text-clinica-text rounded-lg hover:bg-clinica-cta/90 transition-colors font-semibold shadow-md hover:shadow-lg"
          >
            Ver Todos os Artigos
          </Link>
        </div>
      </div>
    </section>
  )
}
