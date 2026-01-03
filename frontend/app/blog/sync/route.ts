import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Função para limpar HTML
function cleanHtml(html: string): string {
  if (!html) return ''
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
}

// Função para criar slug
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Sincronizar um artigo específico do WordPress
async function syncWordPressPost(wordpressId: number) {
  try {
    // Buscar artigo do WordPress via REST API
    const response = await fetch(
      `https://clinicafreud.pt/wp-json/wp/v2/posts/${wordpressId}?_embed=true`
    )

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const wpPost = await response.json()

    if (!wpPost || wpPost.status !== 'publish') {
      return { success: false, message: 'Artigo não está publicado' }
    }

    // Extrair dados
    const title = wpPost.title?.rendered || ''
    const slug = wpPost.slug || createSlug(title)
    const content = cleanHtml(wpPost.content?.rendered || '')
    const excerpt = wpPost.excerpt?.rendered
      ? cleanHtml(wpPost.excerpt.rendered).replace(/<[^>]*>/g, '').trim()
      : null

    // Extrair imagem destacada
    let featuredImageUrl = null
    if (wpPost._embedded?.['wp:featuredmedia']?.[0]) {
      featuredImageUrl = wpPost._embedded['wp:featuredmedia'][0].source_url
    }

    // Extrair autor
    let authorName = null
    let authorEmail = null
    if (wpPost._embedded?.author?.[0]) {
      authorName = wpPost._embedded.author[0].name
      authorEmail = wpPost._embedded.author[0].email
    }

    // Extrair dados SEO do Rank Math (via meta fields)
    // Rank Math armazena SEO em wpPost.meta ou wpPost.yoast_meta
    const metaTitle = wpPost.meta?.['rank_math_title'] || 
                     wpPost.meta?.['_rank_math_title'] ||
                     wpPost.yoast_meta?.['yoast_wpseo_title'] ||
                     null
    const metaDescription = wpPost.meta?.['rank_math_description'] || 
                           wpPost.meta?.['_rank_math_description'] ||
                           wpPost.yoast_meta?.['yoast_wpseo_metadesc'] ||
                           null
    const metaKeywords = wpPost.meta?.['rank_math_focus_keyword'] ||
                        wpPost.meta?.['_rank_math_focus_keyword'] ||
                        wpPost.yoast_meta?.['yoast_wpseo_focuskw'] ||
                        null
    const ogImage = wpPost.meta?.['rank_math_facebook_image'] ||
                   wpPost.meta?.['_rank_math_facebook_image'] ||
                   wpPost.meta?.['rank_math_og_image'] ||
                   wpPost.meta?.['_rank_math_og_image'] ||
                   null
    const ogTitle = wpPost.meta?.['rank_math_facebook_title'] ||
                   wpPost.meta?.['_rank_math_facebook_title'] ||
                   null
    const ogDescription = wpPost.meta?.['rank_math_facebook_description'] ||
                         wpPost.meta?.['_rank_math_facebook_description'] ||
                         null

    // Buscar dados SEO completos via Rank Math API (se disponível)
    // Nota: Pode ser necessário ajustar conforme a estrutura do Rank Math
    let seoData: any = {}
    try {
      // Tentar buscar via endpoint específico do Rank Math
      const seoResponse = await fetch(
        `https://clinicafreud.pt/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(wpPost.link)}`
      )
      if (seoResponse.ok) {
        const seoInfo = await seoResponse.json()
        seoData = seoInfo
      }
    } catch (e) {
      // Se não conseguir, usar dados dos meta fields
    }

    // Verificar se já existe
    const { data: existing } = await supabase
      .from('blog_posts')
      .select('id')
      .eq('wordpress_id', wpPost.id)
      .single()

    // Construir schema markup (JSON-LD) para Article
    const schemaMarkup = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: metaTitle || title,
      description: metaDescription || excerpt || '',
      image: ogImage || featuredImageUrl || '',
      datePublished: wpPost.date || null,
      dateModified: wpPost.modified || wpPost.date || null,
      author: {
        '@type': 'Person',
        name: authorName || 'Clínica Freud',
        ...(authorEmail ? { email: authorEmail } : {})
      },
      publisher: {
        '@type': 'Organization',
        name: 'Clínica Freud',
        logo: {
          '@type': 'ImageObject',
          url: 'https://clinicafreud.pt/logo.png' // Ajustar URL do logo
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': wpPost.link
      }
    }

    const postData = {
      title,
      slug,
      excerpt,
      content,
      featured_image_url: featuredImageUrl,
      author_name: authorName,
      author_email: authorEmail,
      published: true,
      published_at: wpPost.date || null,
      wordpress_id: wpPost.id,
      wordpress_url: wpPost.link,
      // Campos SEO
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      meta_keywords: metaKeywords || null,
      og_title: ogTitle || metaTitle || null,
      og_description: ogDescription || metaDescription || null,
      og_image_url: ogImage || featuredImageUrl || null,
      twitter_card_type: 'summary_large_image',
      canonical_url: wpPost.link, // URL original do WordPress
      schema_markup: schemaMarkup,
      updated_at: new Date().toISOString(),
    }

    if (existing) {
      // Atualizar artigo existente
      const { data, error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('wordpress_id', wpPost.id)
        .select()
        .single()

      if (error) throw error

      return { success: true, action: 'updated', data }
    } else {
      // Criar novo artigo
      const { data, error } = await supabase
        .from('blog_posts')
        .insert(postData)
        .select()
        .single()

      if (error) {
        // Se slug duplicado, adicionar ID
        if (error.code === '23505' && error.message.includes('slug')) {
          const newSlug = `${slug}-${wpPost.id}`
          const { data: retryData, error: retryError } = await supabase
            .from('blog_posts')
            .insert({ ...postData, slug: newSlug })
            .select()
            .single()

          if (retryError) throw retryError
          return { success: true, action: 'created', data: retryData }
        }
        throw error
      }

      return { success: true, action: 'created', data }
    }
  } catch (error: any) {
    console.error('Erro ao sincronizar artigo:', error)
    return { success: false, error: error.message }
  }
}

// POST: Sincronizar artigo específico (via webhook ou manual)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { wordpress_id, secret } = body

    // Verificar secret (opcional, para segurança)
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!wordpress_id) {
      return NextResponse.json(
        { error: 'wordpress_id é obrigatório' },
        { status: 400 }
      )
    }

    const result = await syncWordPressPost(Number(wordpress_id))

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Artigo ${result.action === 'created' ? 'criado' : 'atualizado'} com sucesso`,
        action: result.action,
        data: result.data,
      })
    } else {
      return NextResponse.json(
        { error: result.error || result.message || 'Erro desconhecido' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Erro no webhook:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET: Sincronizar todos os artigos (útil para sincronização manual)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const secret = searchParams.get('secret')
    const force = searchParams.get('force') === 'true'

    // Verificar secret (opcional, para segurança)
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET
    if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Buscar todos os artigos do WordPress
    let allPosts: any[] = []
    let page = 1
    const perPage = 100

    while (true) {
      const response = await fetch(
        `https://clinicafreud.pt/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed=true&status=publish`
      )

      if (!response.ok) {
        if (response.status === 400) break
        throw new Error(`HTTP ${response.status}`)
      }

      const posts = await response.json()
      if (!posts || posts.length === 0) break

      allPosts = allPosts.concat(posts)
      if (posts.length < perPage) break
      page++
    }

    // Sincronizar cada artigo
    let successCount = 0
    let errorCount = 0
    const results: any[] = []

    for (const wpPost of allPosts) {
      const result = await syncWordPressPost(wpPost.id)
      if (result.success) {
        successCount++
      } else {
        errorCount++
      }
      results.push({ id: wpPost.id, title: wpPost.title?.rendered, ...result })
    }

    return NextResponse.json({
      success: true,
      message: `Sincronização concluída: ${successCount} sucessos, ${errorCount} erros`,
      total: allPosts.length,
      successCount,
      errorCount,
      results,
    })
  } catch (error: any) {
    console.error('Erro na sincronização completa:', error)
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
