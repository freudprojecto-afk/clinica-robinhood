import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Validação de variáveis de ambiente
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
if (!SUPABASE_URL) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL não está definida nas variáveis de ambiente')
}

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY ou NEXT_PUBLIC_SUPABASE_ANON_KEY não está definida')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

// Configurações
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL || 'https://clinicafreud.pt'
const WORDPRESS_API_TIMEOUT = 30000 // 30 segundos
const SYNC_DELAY_MS = 100 // Delay entre sincronizações no GET
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || WORDPRESS_API_URL

// Função para fetch com timeout
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeout: number = WORDPRESS_API_TIMEOUT): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    clearTimeout(timeoutId)
    return response
  } catch (error: any) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout após ${timeout}ms`)
    }
    throw error
  }
}

// Função para limpar HTML (melhorada)
function cleanHtml(html: string): string {
  if (!html) return ''
  
  // Remove scripts e styles
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
  
  // Remove eventos inline (onclick, onerror, etc)
  cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
  
  // Remove javascript: URLs
  cleaned = cleaned.replace(/javascript:/gi, '')
  
  return cleaned
}

// Função para criar slug
function createSlug(title: string): string {
  if (!title) return ''
  
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Função para validar wordpress_id
function validateWordPressId(id: any): number | null {
  if (id === null || id === undefined) return null
  
  const numId = Number(id)
  if (isNaN(numId) || numId <= 0 || !Number.isInteger(numId)) {
    return null
  }
  
  return numId
}

// Função para tratar erros HTTP do WordPress
function handleWordPressError(status: number, statusText: string): { success: false; message: string } {
  switch (status) {
    case 404:
      return { success: false, message: 'Artigo não encontrado no WordPress' }
    case 401:
      return { success: false, message: 'Acesso não autorizado ao WordPress' }
    case 403:
      return { success: false, message: 'Acesso negado ao WordPress' }
    case 500:
      return { success: false, message: 'Erro interno do servidor WordPress' }
    default:
      return { success: false, message: `Erro HTTP ${status}: ${statusText}` }
  }
}

// Sincronizar um artigo específico do WordPress
async function syncWordPressPost(wordpressId: number) {
  try {
    // Buscar artigo do WordPress via REST API
    const response = await fetchWithTimeout(
      `${WORDPRESS_API_URL}/wp-json/wp/v2/posts/${wordpressId}?_embed=true`
    )

    if (!response.ok) {
      return handleWordPressError(response.status, response.statusText)
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
    // Função auxiliar para extrair meta field (tenta com e sem underscore)
const getMetaField = (fieldName: string): any => {
  return wpPost[fieldName] ||                          // Nível raiz (register_rest_field)
         wpPost[`_${fieldName}`] ||                    // Nível raiz com underscore
         wpPost.meta?.[fieldName] ||                   // Dentro de meta
         wpPost.meta?.[`_${fieldName}`] ||            // Dentro de meta com underscore
         wpPost.yoast_meta?.[fieldName] ||            // Yoast SEO (fallback)
         null
}

    // Extrair TODOS os dados SEO do Rank Math
    let metaTitle = getMetaField('rank_math_title') || getMetaField('yoast_wpseo_title')
    let metaDescription = getMetaField('rank_math_description') || getMetaField('yoast_wpseo_metadesc')
    
    // Keywords (focus keyword principal e secundários)
    const metaKeywords = getMetaField('rank_math_focus_keyword') || getMetaField('yoast_wpseo_focuskw')
    const secondaryKeywords = getMetaField('rank_math_secondary_focus_keyword')
    const tertiaryKeywords = getMetaField('rank_math_tertiary_focus_keyword')
    
    // Canonical URL (usar do Rank Math se disponível, senão usar link original)
    const canonicalUrl = getMetaField('rank_math_canonical_url') || wpPost.link
    
    // Robots Meta
    const robotsMeta = getMetaField('rank_math_robots')
    const advancedRobots = getMetaField('rank_math_advanced_robots')
    
    // Facebook/Open Graph
    const ogTitle = getMetaField('rank_math_facebook_title')
    const ogDescription = getMetaField('rank_math_facebook_description')
    const ogImage = getMetaField('rank_math_facebook_image') || 
                   getMetaField('rank_math_og_image')
    
    // Twitter Card
    const twitterTitle = getMetaField('rank_math_twitter_title')
    const twitterDescription = getMetaField('rank_math_twitter_description')
    const twitterImage = getMetaField('rank_math_twitter_image')
    const twitterCardType = getMetaField('rank_math_twitter_card_type') || 'summary_large_image'
    
    // Schema/Rich Snippets
    const schemaType = getMetaField('rank_math_schema_type')
    const articleSchemaType = getMetaField('rank_math_schema_article_type')
    const richSnippetType = getMetaField('rank_math_rich_snippet')
    
    // Primary Category
    const primaryCategory = getMetaField('rank_math_primary_category')
    
    // SEO Score (para referência)
    const seoScore = getMetaField('rank_math_seo_score')

    // Buscar dados SEO completos via Rank Math API (se disponível)
    let seoApiData: any = {}
    try {
      const seoResponse = await fetchWithTimeout(
        `${WORDPRESS_API_URL}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(wpPost.link)}`
      )
      if (seoResponse.ok) {
        const seoInfo = await seoResponse.json()
        seoApiData = seoInfo
        
        // Se a API retornar dados, usar como fallback para campos vazios
        if (!metaTitle && seoInfo.title) metaTitle = seoInfo.title
        if (!metaDescription && seoInfo.description) metaDescription = seoInfo.description
      }
    } catch (e) {
      // Se não conseguir, usar dados dos meta fields (já extraídos acima)
    }

    // Construir schema markup (JSON-LD) completo e otimizado para Google
    // Usar o tipo de schema definido no Rank Math, ou Article por padrão
    const finalSchemaType = schemaType || articleSchemaType || 'Article'
    
    const schemaMarkup: any = {
      '@context': 'https://schema.org',
      '@type': finalSchemaType,
      headline: metaTitle || title,
      name: metaTitle || title,
      description: metaDescription || excerpt || '',
      image: (ogImage || featuredImageUrl) ? [ogImage || featuredImageUrl] : [],
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
          url: `${SITE_URL}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl || wpPost.link
      },
      url: canonicalUrl || wpPost.link,
      ...(primaryCategory ? { articleSection: primaryCategory } : {})
    }

    // Adicionar campos específicos para Article
    if (finalSchemaType === 'Article' || finalSchemaType === 'BlogPosting' || finalSchemaType === 'NewsArticle') {
      schemaMarkup.articleBody = content.substring(0, 5000) // Primeiros 5000 chars
      if (wpPost.categories && wpPost.categories.length > 0) {
        schemaMarkup.keywords = [
          ...(metaKeywords ? [metaKeywords] : []),
          ...(secondaryKeywords ? [secondaryKeywords] : []),
          ...(tertiaryKeywords ? [tertiaryKeywords] : [])
        ].filter(Boolean).join(', ')
      }
    }

    // Adicionar BreadcrumbList se disponível (melhora SEO)
    if (wpPost.link) {
      const urlParts = new URL(wpPost.link).pathname.split('/').filter(Boolean)
      if (urlParts.length > 0) {
        schemaMarkup.breadcrumb = {
          '@type': 'BreadcrumbList',
          itemListElement: urlParts.map((part, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: part.replace(/-/g, ' '),
            item: `${SITE_URL}/${urlParts.slice(0, index + 1).join('/')}`
          }))
        }
      }
    }

    const postData: any = {
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
      
      // Campos SEO Básicos
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      meta_keywords: metaKeywords || null,
      canonical_url: canonicalUrl || wpPost.link,
      robots_meta: robotsMeta || null,
      advanced_robots_meta: advancedRobots || null,
      
      // Open Graph / Facebook
      og_title: ogTitle || metaTitle || null,
      og_description: ogDescription || metaDescription || null,
      og_image_url: ogImage || featuredImageUrl || null,
      
      // Twitter Card
      twitter_title: twitterTitle || ogTitle || metaTitle || null,
      twitter_description: twitterDescription || ogDescription || metaDescription || null,
      twitter_image_url: twitterImage || ogImage || featuredImageUrl || null,
      twitter_card_type: twitterCardType || 'summary_large_image',
      
      // Schema Markup / Rich Snippets
      schema_type: finalSchemaType,
      schema_markup: schemaMarkup,
      rich_snippet_type: richSnippetType || null,
      article_schema_type: articleSchemaType || null,
      
      // Keywords Adicionais
      secondary_keywords: secondaryKeywords || null,
      tertiary_keywords: tertiaryKeywords || null,
      
      // Categoria Primária
      primary_category: primaryCategory || null,
      
      // SEO Score (referência)
      seo_score: seoScore || null,
      
      // Timestamp
      updated_at: new Date().toISOString(),
    }

    // Usar upsert para criar ou atualizar
    const { data, error } = await supabase
      .from('blog_posts')
      .upsert(postData, {
        onConflict: 'wordpress_id',
        ignoreDuplicates: false
      })
      .select()
      .single()

    if (error) {
      // Se erro de slug duplicado, tentar com ID
      if (error.code === '23505' && error.message.includes('slug')) {
        const newSlug = `${slug}-${wpPost.id}`
        const { data: retryData, error: retryError } = await supabase
          .from('blog_posts')
          .upsert(
            { ...postData, slug: newSlug },
            {
              onConflict: 'wordpress_id',
              ignoreDuplicates: false
            }
          )
          .select()
          .single()

        if (retryError) {
          console.error('Erro ao sincronizar artigo (tentativa com slug modificado):', {
            wordpress_id: wpPost.id,
            title,
            error: retryError.message,
            code: retryError.code
          })
          throw retryError
        }

        return { success: true, action: 'created', data: retryData }
      }

      console.error('Erro ao sincronizar artigo:', {
        wordpress_id: wpPost.id,
        title,
        error: error.message,
        code: error.code
      })
      throw error
    }

    // Verificar se foi criação ou atualização verificando se updated_at mudou significativamente
    // (Método simples: assumir que se data existe, foi atualização, senão foi criação)
    // Nota: O Supabase upsert não retorna essa informação diretamente
    const action = data ? 'updated' : 'created'

    return { success: true, action, data }
  } catch (error: any) {
    console.error('Erro ao sincronizar artigo:', {
      wordpress_id: wordpressId,
      error: error.message,
      stack: error.stack
    })
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

    // Validar wordpress_id
    const validatedId = validateWordPressId(wordpress_id)
    if (!validatedId) {
      return NextResponse.json(
        { error: 'wordpress_id é obrigatório e deve ser um número inteiro positivo' },
        { status: 400 }
      )
    }

    const result = await syncWordPressPost(validatedId)

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
    console.error('Erro no webhook POST:', {
      error: error.message,
      stack: error.stack
    })
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
      const response = await fetchWithTimeout(
        `${WORDPRESS_API_URL}/wp-json/wp/v2/posts?per_page=${perPage}&page=${page}&_embed=true&status=publish`
      )

      if (!response.ok) {
        if (response.status === 400) break
        const errorResult = handleWordPressError(response.status, response.statusText)
        throw new Error(errorResult.message)
      }

      const posts = await response.json()
      if (!posts || posts.length === 0) break

      allPosts = allPosts.concat(posts)
      if (posts.length < perPage) break
      page++
    }

    // Sincronizar cada artigo com delay para evitar sobrecarga
    let successCount = 0
    let errorCount = 0
    const results: any[] = []

    for (const wpPost of allPosts) {
      // Adicionar delay entre requisições (exceto na primeira)
      if (results.length > 0) {
        await new Promise(resolve => setTimeout(resolve, SYNC_DELAY_MS))
      }

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
    console.error('Erro na sincronização completa:', {
      error: error.message,
      stack: error.stack
    })
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
