'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Clock, Heart, Shield, MessageSquare, BookOpen, HelpCircle, Users, Stethoscope, Star, Building2, FileCheck, X, Menu, Globe, Navigation2, ExternalLink, Facebook, Instagram, Youtube } from 'lucide-react'
import { supabase } from '../lib/supabase'
import UltimosArtigosWrapper from '@/components/UltimosArtigosWrapper'
import Logo from '../components/Logo'

interface Profissional {
  id: number
  name: string
  title?: string
  speciality?: string
  specialty?: string  // Pode ser speciality ou specialty
  description?: string
  cv?: string  // Campo para CV completo
  photo?: string
  photo_url?: string  // Campo usado no Supabase
  image?: string
  foto?: string
  order?: number  // Campo para ordenação
}

interface Testimonial {
  id: string  // UUID no Supabase
  name: string
  text: string
  rating: number  // 1-5 estrelas
  order?: number  // Campo para ordenação
}

interface AboutSection {
  id: string
  main_text: string
}

interface AboutFeature {
  id: string
  title: string
  description: string
  icon_name?: string  // Nome do ícone do Lucide React
  icon_url?: string  // URL de imagem alternativa
  order?: number
}

interface FAQ {
  id: string
  question: string
  answer: string
  order?: number
}

interface Insurer {
  id: string
  name: string
  logo_url?: string
  order?: number
  box_number: number  // 1, 2 ou 3
}

// Componente da secção Corpo Clínico
function CorpoClinicoSection() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Todas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)
  const [profissionalSelecionado, setProfissionalSelecionado] = useState<Profissional | null>(null)

  // Buscar profissionais da base de dados
  useEffect(() => {
    async function fetchProfissionais() {
      try {
        setLoading(true)
        console.log('🔍 A buscar profissionais do Supabase...')
        const { data, error: fetchError } = await supabase
          .from('professionals')
          .select('*')
          .order('order', { ascending: true, nullsFirst: false })
          .order('id', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        if (data) {
          console.log(`✅ ${data.length} profissionais encontrados:`, data)
          // Log de cada profissional para debug
          data.forEach((p: Profissional) => {
            console.log(`📋 ${p.name}:`, {
              photo_url: p.photo_url,
              photo: p.photo,
              image: p.image,
              foto: p.foto
            })
          })
          setProfissionais(data)
        } else {
          console.warn('⚠️ Nenhum dado retornado')
          setProfissionais([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais')
        console.error('❌ Erro ao buscar profissionais:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfissionais()
  }, [])

  // Extrair categorias únicas do campo speciality
  const categorias = useMemo(() => {
    if (!profissionais || profissionais.length === 0) {
      console.log('⚠️ Nenhum profissional para extrair categorias')
      return []
    }

    // Extrair todas as especialidades, verificando tanto speciality quanto specialty
    const todasEspecialidades = profissionais
      .map((p: Profissional) => {
        // Tentar speciality primeiro, depois specialty
        const especialidade = p.speciality || p.specialty || null
        if (!especialidade) {
          console.warn(`⚠️ Profissional ${p.name} (ID: ${p.id}) não tem especialidade definida`)
          console.warn('   Campos disponíveis:', Object.keys(p))
          console.warn('   Dados completos:', p)
        }
        return especialidade
      })
      .filter((s): s is string => {
        const isValid = s !== null && s !== undefined && typeof s === 'string' && s.trim() !== ''
        return isValid
      })

    // Remover duplicados e ordenar
    const cats = Array.from(new Set(todasEspecialidades)).sort()
    
    console.log('📊 Profissionais analisados:', profissionais.length)
    console.log('📊 Especialidades encontradas (antes de remover duplicados):', todasEspecialidades)
    console.log('✅ Categorias únicas extraídas:', cats)
    console.log('✅ Total de categorias:', cats.length)
    
    return cats
  }, [profissionais])

  // Filtrar profissionais baseado na categoria selecionada
  const profissionaisFiltrados = useMemo(() => {
    if (categoriaSelecionada === 'Todas') {
      return profissionais
    }
    return profissionais.filter((p: Profissional) => {
      const especialidade = p.speciality || p.specialty
      return especialidade === categoriaSelecionada
    })
  }, [profissionais, categoriaSelecionada])

  // Ajustar items por view baseado no tamanho da tela
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  // Resetar índice quando a categoria muda
  useEffect(() => {
    setCurrentIndex(0)
  }, [categoriaSelecionada])

  // Calcular total de slides
  const totalSlides = Math.ceil(profissionaisFiltrados.length / itemsPerView)

  // Navegação do carrossel
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // Obter profissionais visíveis no slide atual
  const profissionaisVisiveis = profissionaisFiltrados.slice(
    currentIndex * itemsPerView,
    currentIndex * itemsPerView + itemsPerView
  )

  // Obter URL da imagem
  const obterImagem = (profissional: Profissional) => {
    // Tentar todos os campos possíveis (photo_url é o campo usado no Supabase)
    const url = profissional.photo_url || profissional.photo || profissional.image || profissional.foto || null
    if (!url) {
      console.log(`📷 Sem imagem para ${profissional.name}`)
      console.log('   Campos disponíveis:', Object.keys(profissional))
      return null
    }
    
    // Validar URL
    let finalUrl = url.trim()
    if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
      finalUrl = finalUrl
    } else if (finalUrl.startsWith('/')) {
      finalUrl = finalUrl
    } else {
      // Se não começar com http ou /, assumir que é uma URL completa
      finalUrl = finalUrl
    }
    
    console.log(`📷 Imagem para ${profissional.name}:`, finalUrl)
    return finalUrl
  }

  // Obter iniciais do nome
  const obterIniciais = (nome: string) => {
    const palavras = nome.split(' ').filter(p => p.length > 0)
    if (palavras.length === 0) return '??'
    const iniciais = palavras
      .filter(palavra => palavra[0] === palavra[0].toUpperCase())
      .map(palavra => palavra[0])
      .join('')
    if (iniciais.length >= 2) return iniciais.substring(0, 2)
    return nome.substring(0, 2).toUpperCase()
  }

  // Componente para o card do profissional
  const ProfissionalCard = ({ profissional, index }: { profissional: Profissional; index: number }) => {
    const [imagemErro, setImagemErro] = useState(false)
    const [imagemCarregando, setImagemCarregando] = useState(true)
    const imagemUrl = obterImagem(profissional)

    useEffect(() => {
      if (imagemUrl) {
        console.log(`🖼️ A tentar carregar imagem para ${profissional.name}:`, imagemUrl)
        const img = new Image()
        img.crossOrigin = 'anonymous' // Permitir CORS se necessário
        img.onload = () => {
          console.log(`✅ Imagem carregada com sucesso para ${profissional.name}`)
          setImagemCarregando(false)
          setImagemErro(false)
        }
        img.onerror = (err) => {
          console.error(`❌ Erro ao carregar imagem para ${profissional.name}:`, imagemUrl, err)
          setImagemCarregando(false)
          setImagemErro(true)
        }
        img.src = imagemUrl
      } else {
        console.log(`⚠️ Sem URL de imagem para ${profissional.name}, usando iniciais`)
        setImagemCarregando(false)
        setImagemErro(true)
      }
    }, [imagemUrl, profissional.name])

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-clinica-accent border border-clinica-primary rounded-xl p-6 hover:border-clinica-menu transition-colors shadow-md hover:shadow-lg"
      >
        <div className="flex flex-col items-center md:items-start">
          <div className="mb-4">
            <div className="w-32 h-32 md:w-28 md:h-28 rounded-full bg-clinica-primary border-2 border-clinica-menu flex items-center justify-center text-2xl font-bold text-clinica-bg overflow-hidden relative">
              {imagemUrl && !imagemErro && !imagemCarregando ? (
                <img
                  src={imagemUrl}
                  alt={profissional.name}
                  className="w-full h-full rounded-full object-cover"
                  onError={() => setImagemErro(true)}
                  loading="lazy"
                />
              ) : (
                obterIniciais(profissional.name)
              )}
            </div>
          </div>

          <div className="text-center md:text-left w-full">
            <h2 className="text-xl md:text-2xl font-bold mb-2 text-clinica-text">{profissional.name}</h2>
            {profissional.title && (
              <p className="text-clinica-text text-sm mb-2 font-semibold">{profissional.title}</p>
            )}
            <p className="text-clinica-text text-sm mb-3 font-medium">{profissional.speciality || profissional.specialty || 'Sem especialidade'}</p>
            {profissional.description && (
              <p className="text-clinica-text text-sm mb-4 leading-relaxed line-clamp-3">
                {profissional.description}
              </p>
            )}
            
            <button 
              onClick={() => setProfissionalSelecionado(profissional)}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-clinica-cta text-clinica-text px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm shadow-md hover:shadow-lg"
            >
              <FileText className="w-4 h-4" />
              Ver CV Completo
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <section id="corpo-clinico" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-bg">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Corpo Clínico</h2>
          <p className="text-lg text-clinica-text mb-3">Conheça nossa equipa de psicólogos e psiquiatras experientes</p>
          <p className="text-lg font-semibold text-clinica-menu">Seleccione a especialidade</p>
        </motion.div>

        {/* Filtro de Categorias - DROPDOWN */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <select
              value={categoriaSelecionada}
              onChange={(e) => {
                console.log('📋 Categoria selecionada:', e.target.value)
                setCategoriaSelecionada(e.target.value)
              }}
              className="appearance-none bg-clinica-accent border border-clinica-primary text-clinica-text px-6 py-2 pr-10 rounded-lg font-medium transition-all duration-200 hover:border-clinica-menu focus:outline-none focus:border-clinica-menu cursor-pointer min-w-[250px] shadow-md"
            >
              <option value="Todas">Todas</option>
              {categorias.length > 0 ? (
                categorias.map((categoria) => (
                  <option 
                    key={categoria} 
                    value={categoria}
                  >
                    {categoria}
                  </option>
                ))
              ) : (
                <option disabled>Nenhuma categoria disponível</option>
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-clinica-text opacity-60 z-0">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Carrossel de Profissionais */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-clinica-text opacity-70 text-lg">A carregar profissionais...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">Erro: {error}</p>
          </div>
        ) : profissionaisFiltrados.length > 0 ? (
          <div className="relative">
            {/* Container do Carrossel */}
            <div className="overflow-hidden">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {profissionaisVisiveis.map((profissional: Profissional, index: number) => (
                  <ProfissionalCard 
                    key={profissional.id} 
                    profissional={profissional} 
                    index={index} 
                  />
                ))}
              </motion.div>
            </div>

            {/* Botões de Navegação */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-clinica-cta text-clinica-text p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-clinica-cta text-clinica-text p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10"
                  aria-label="Próximo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Indicadores de Slide */}
            {totalSlides > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-clinica-cta w-8'
                        : 'bg-clinica-primary opacity-40 w-2 hover:opacity-60'
                    }`}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-clinica-text opacity-70 text-lg">
              {profissionais.length === 0 
                ? 'Nenhum profissional encontrado.' 
                : 'Nenhum profissional encontrado nesta categoria.'}
            </p>
          </motion.div>
        )}
      </div>

      {/* Modal do CV Completo */}
      {profissionalSelecionado && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setProfissionalSelecionado(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl md:text-4xl font-bold text-clinica-text">
                {profissionalSelecionado.name}
              </h2>
              <button
                onClick={() => setProfissionalSelecionado(null)}
                className="text-clinica-text opacity-60 hover:opacity-100 transition-colors p-2"
                aria-label="Fechar"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Foto e Informações Básicas */}
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-32 h-32 rounded-full bg-clinica-primary border-2 border-clinica-menu flex items-center justify-center text-3xl font-bold text-clinica-bg overflow-hidden flex-shrink-0">
                  {obterImagem(profissionalSelecionado) ? (
                    <img
                      src={obterImagem(profissionalSelecionado)!}
                      alt={profissionalSelecionado.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    obterIniciais(profissionalSelecionado.name)
                  )}
                </div>
                <div className="flex-1">
                  {profissionalSelecionado.title && (
                    <p className="text-clinica-text text-lg mb-2 font-semibold">
                      {profissionalSelecionado.title}
                    </p>
                  )}
                  <p className="text-clinica-text text-base mb-2 font-medium">
                    {profissionalSelecionado.speciality || profissionalSelecionado.specialty || 'Sem especialidade'}
                  </p>
                </div>
              </div>

              {/* Descrição/CV Completo */}
              {(profissionalSelecionado.cv || profissionalSelecionado.description) ? (
                <div>
                  <h3 className="text-xl font-bold text-clinica-text mb-3">Currículo</h3>
                  <div className="text-clinica-text leading-relaxed whitespace-pre-line">
                    {profissionalSelecionado.cv || profissionalSelecionado.description}
                  </div>
                </div>
              ) : (
                <div className="text-clinica-text opacity-60 italic">
                  Informação adicional não disponível.
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </section>
  )
}

// Componente da secção Depoimentos
function DepoimentosSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  // Buscar depoimentos da base de dados
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        setLoading(true)
        console.log('🔍 A buscar depoimentos do Supabase...')
        const { data, error: fetchError } = await supabase
          .from('testimonials')
          .select('*')
          .order('order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: false })

        if (fetchError) {
          // Se a tabela não existir, usar depoimentos padrão
          if (fetchError.message.includes('does not exist') || fetchError.message.includes('relation')) {
            console.warn('⚠️ Tabela "testimonials" não existe ainda. Usando depoimentos padrão.')
            setTestimonials([
              { id: '1', name: 'Maria S.', text: 'Excelente atendimento e profissionais muito competentes.', rating: 5, order: 1 },
              { id: '2', name: 'João P.', text: 'A terapia mudou a minha vida. Recomendo vivamente.', rating: 5, order: 2 },
              { id: '3', name: 'Ana L.', text: 'Ambiente acolhedor e tratamento de qualidade.', rating: 5, order: 3 },
            ])
            setLoading(false)
            return
          }
          throw fetchError
        }

        if (data) {
          console.log(`✅ ${data.length} depoimentos encontrados:`, data)
          setTestimonials(data)
        } else {
          console.warn('⚠️ Nenhum dado retornado')
          setTestimonials([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar depoimentos')
        console.error('❌ Erro ao buscar depoimentos:', err)
        // Usar depoimentos padrão em caso de erro
        setTestimonials([
          { id: '1', name: 'Maria S.', text: 'Excelente atendimento e profissionais muito competentes.', rating: 5, order: 1 },
          { id: '2', name: 'João P.', text: 'A terapia mudou a minha vida. Recomendo vivamente.', rating: 5, order: 2 },
          { id: '3', name: 'Ana L.', text: 'Ambiente acolhedor e tratamento de qualidade.', rating: 5, order: 3 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  // Ajustar items por view baseado no tamanho da tela
  useEffect(() => {
    const updateItemsPerView = () => {
      if (window.innerWidth < 768) {
        setItemsPerView(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerView(2)
      } else {
        setItemsPerView(3)
      }
    }

    updateItemsPerView()
    window.addEventListener('resize', updateItemsPerView)
    return () => window.removeEventListener('resize', updateItemsPerView)
  }, [])

  // Calcular total de slides
  const totalSlides = Math.ceil(testimonials.length / itemsPerView)

  // Navegação do carrossel
  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // Obter depoimentos visíveis no slide atual
  const testimonialsVisiveis = testimonials.slice(
    currentIndex * itemsPerView,
    currentIndex * itemsPerView + itemsPerView
  )

  // Componente para o card do depoimento
  const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 shadow-md hover:shadow-lg transition-all h-full flex flex-col"
      >
        <div className="flex mb-4">
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className="w-5 h-5 text-clinica-cta fill-clinica-cta" />
          ))}
        </div>
        <p className="text-clinica-text mb-4 italic flex-grow">"{testimonial.text}"</p>
        <p className="text-clinica-text font-semibold">- {testimonial.name}</p>
      </motion.div>
    )
  }

  return (
    <section id="depoimentos" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-accent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Depoimentos</h2>
          <p className="text-lg text-clinica-text">O que os nossos pacientes dizem sobre nós</p>
        </motion.div>

        {/* Carrossel de Depoimentos */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-clinica-text opacity-70 text-lg">A carregar depoimentos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">Erro: {error}</p>
          </div>
        ) : testimonials.length > 0 ? (
          <div className="relative">
            {/* Container do Carrossel */}
            <div className="overflow-hidden">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {testimonialsVisiveis.map((testimonial: Testimonial, index: number) => (
                  <TestimonialCard 
                    key={testimonial.id} 
                    testimonial={testimonial} 
                    index={index} 
                  />
                ))}
              </motion.div>
            </div>

            {/* Botões de Navegação */}
            {totalSlides > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-clinica-cta text-clinica-text p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-clinica-cta text-clinica-text p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10"
                  aria-label="Próximo"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Indicadores de Slide */}
            {totalSlides > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalSlides }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === currentIndex
                        ? 'bg-clinica-cta w-8'
                        : 'bg-clinica-primary opacity-40 w-2 hover:opacity-60'
                    }`}
                    aria-label={`Ir para slide ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-clinica-text opacity-70 text-lg">
              Nenhum depoimento encontrado.
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}

// Componente da secção FAQ
function FAQSection() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  useEffect(() => {
    async function fetchFAQs() {
      try {
        setLoading(true)
        console.log('🔍 A buscar FAQs do Supabase...')
        const { data, error } = await supabase
          .from('faqs')
          .select('*')
          .order('order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true })

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('relation')) {
            console.warn('⚠️ Tabela "faqs" não existe ainda. Usando FAQs padrão.')
            setFaqs([
              { id: '1', question: 'Como posso agendar uma consulta?', answer: 'Pode agendar através do nosso site, por telefone ou email.', order: 1 },
              { id: '2', question: 'Aceitam seguros de saúde?', answer: 'Sim, aceitamos a maioria dos seguros de saúde nacionais.', order: 2 },
              { id: '3', question: 'Qual a duração de uma sessão?', answer: 'As sessões têm normalmente a duração de 50 minutos.', order: 3 },
              { id: '4', question: 'As consultas são confidenciais?', answer: 'Sim, garantimos total confidencialidade e sigilo profissional.', order: 4 },
            ])
            setLoading(false)
            return
          }
          throw error
        }

        if (data && data.length > 0) {
          console.log(`✅ ${data.length} FAQs encontrados:`, data)
          setFaqs(data)
        } else {
          console.warn('⚠️ Nenhum FAQ encontrado')
          setFaqs([
            { id: '1', question: 'Como posso agendar uma consulta?', answer: 'Pode agendar através do nosso site, por telefone ou email.', order: 1 },
            { id: '2', question: 'Aceitam seguros de saúde?', answer: 'Sim, aceitamos a maioria dos seguros de saúde nacionais.', order: 2 },
            { id: '3', question: 'Qual a duração de uma sessão?', answer: 'As sessões têm normalmente a duração de 50 minutos.', order: 3 },
            { id: '4', question: 'As consultas são confidenciais?', answer: 'Sim, garantimos total confidencialidade e sigilo profissional.', order: 4 },
          ])
        }
      } catch (err) {
        console.error('❌ Erro ao buscar FAQs:', err)
        setFaqs([
          { id: '1', question: 'Como posso agendar uma consulta?', answer: 'Pode agendar através do nosso site, por telefone ou email.', order: 1 },
          { id: '2', question: 'Aceitam seguros de saúde?', answer: 'Sim, aceitamos a maioria dos seguros de saúde nacionais.', order: 2 },
          { id: '3', question: 'Qual a duração de uma sessão?', answer: 'As sessões têm normalmente a duração de 50 minutos.', order: 3 },
          { id: '4', question: 'As consultas são confidenciais?', answer: 'Sim, garantimos total confidencialidade e sigilo profissional.', order: 4 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-bg">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Perguntas Frequentes</h2>
          <p className="text-lg text-clinica-text">Respostas às questões mais comuns</p>
        </motion.div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-clinica-text opacity-70">A carregar...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-clinica-accent border border-clinica-primary rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-clinica-primary/5 transition-colors"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-clinica-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <HelpCircle className="w-5 h-5 text-clinica-primary" />
                    </div>
                    <h3 className="text-lg md:text-xl font-bold text-clinica-text pr-4">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-6 h-6 text-clinica-primary transition-transform" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-clinica-primary transition-transform" />
                    )}
                  </div>
                </button>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 pt-0">
                      <div className="pl-14 border-l-2 border-clinica-primary/30">
                        <p className="text-clinica-text leading-relaxed text-base md:text-lg">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Componente da secção Seguradoras
function SeguradorasSection() {
  const [insurers, setInsurers] = useState<Insurer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsurers() {
      try {
        setLoading(true)
        console.log('🔍 A buscar seguradoras do Supabase...')
        const { data, error } = await supabase
          .from('insurers')
          .select('*')
          .order('box_number', { ascending: true })
          .order('order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true })

        if (error) {
          if (error.message.includes('does not exist') || error.message.includes('relation')) {
            console.warn('⚠️ Tabela "insurers" não existe ainda. Usando seguradoras padrão.')
            setInsurers([
              { id: '1', name: 'Medicare', logo_url: '', box_number: 1, order: 1 },
              { id: '2', name: 'AdvanceCare', logo_url: '', box_number: 1, order: 2 },
              { id: '3', name: 'Multicare', logo_url: '', box_number: 1, order: 3 },
              { id: '4', name: 'Allianz Care', logo_url: '', box_number: 1, order: 4 },
            ])
            setLoading(false)
            return
          }
          throw error
        }

        if (data && data.length > 0) {
          console.log(`✅ ${data.length} seguradoras encontradas:`, data)
          setInsurers(data)
        } else {
          console.warn('⚠️ Nenhuma seguradora encontrada')
          setInsurers([
            { id: '1', name: 'Medicare', logo_url: '', box_number: 1, order: 1 },
            { id: '2', name: 'AdvanceCare', logo_url: '', box_number: 1, order: 2 },
            { id: '3', name: 'Multicare', logo_url: '', box_number: 1, order: 3 },
            { id: '4', name: 'Allianz Care', logo_url: '', box_number: 1, order: 4 },
          ])
        }
      } catch (err) {
        console.error('❌ Erro ao buscar seguradoras:', err)
        setInsurers([
          { id: '1', name: 'Medicare', logo_url: '', box_number: 1, order: 1 },
          { id: '2', name: 'AdvanceCare', logo_url: '', box_number: 1, order: 2 },
          { id: '3', name: 'Multicare', logo_url: '', box_number: 1, order: 3 },
          { id: '4', name: 'Allianz Care', logo_url: '', box_number: 1, order: 4 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchInsurers()
  }, [])

  // Agrupar seguradoras por caixa (box_number)
  const insurersByBox = useMemo(() => {
    const boxes: { [key: number]: Insurer[] } = { 1: [], 2: [], 3: [] }
    insurers.forEach(insurer => {
      if (insurer.box_number >= 1 && insurer.box_number <= 3) {
        boxes[insurer.box_number].push(insurer)
      }
    })
    return boxes
  }, [insurers])

  return (
    <section id="seguradoras" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-accent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Seguradoras</h2>
          <p className="text-lg text-clinica-text font-medium">Aceitamos os principais seguros de saúde</p>
        </motion.div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-clinica-text opacity-70">A carregar seguradoras...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((boxNum) => {
              const boxInsurers = insurersByBox[boxNum] || []
              // Limitar a 4 imagens por caixa
              const displayInsurers = boxInsurers.slice(0, 4)
              
              return (
                <motion.div
                  key={boxNum}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: boxNum * 0.1 }}
                  className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 hover:border-clinica-menu transition-colors"
                >
                  {/* Grid de imagens redondas - ajusta automaticamente se tiver menos de 4 */}
                  <div className={`grid gap-4 ${
                    displayInsurers.length === 1 ? 'grid-cols-1' :
                    displayInsurers.length === 2 ? 'grid-cols-2' :
                    displayInsurers.length === 3 ? 'grid-cols-3' :
                    'grid-cols-2' // 4 imagens: 2x2
                  }`}>
                    {displayInsurers.map((insurer, index) => (
                      <motion.div
                        key={insurer.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="flex flex-col items-center"
                      >
                        {/* Imagem redonda */}
                        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-white border-2 border-clinica-primary flex items-center justify-center overflow-hidden mb-2 shadow-md hover:shadow-lg transition-shadow">
                          {insurer.logo_url && insurer.logo_url.trim() !== '' ? (
                            <img
                              src={insurer.logo_url}
                              alt={insurer.name}
                              className="w-full h-full rounded-full object-contain p-2"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                                const parent = target.parentElement
                                if (parent && !parent.querySelector('.fallback-initials')) {
                                  const fallback = document.createElement('div')
                                  fallback.className = 'w-full h-full rounded-full bg-clinica-primary/10 flex items-center justify-center fallback-initials'
                                  fallback.innerHTML = `<span class="text-clinica-primary font-bold text-xs md:text-sm">${insurer.name.substring(0, 2).toUpperCase()}</span>`
                                  parent.appendChild(fallback)
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full rounded-full bg-clinica-primary/10 flex items-center justify-center">
                              <span className="text-clinica-primary font-bold text-xs md:text-sm">
                                {insurer.name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Label */}
                        <p className="text-clinica-text text-xs md:text-sm font-semibold text-center mt-1">
                          {insurer.name}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Mensagem se não houver seguradoras nesta caixa */}
                  {displayInsurers.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-clinica-text opacity-50 text-sm">Nenhuma seguradora nesta caixa</p>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

// Componente da secção Sobre Nós
function SobreNosSection() {
  const [mainText, setMainText] = useState<string>('')
  const [features, setFeatures] = useState<AboutFeature[]>([])
  const [loading, setLoading] = useState(true)

  // Mapeamento de nomes de ícones para componentes
  const iconMap: { [key: string]: any } = {
    Users,
    Heart,
    Shield,
    MessageSquare,
    BookOpen,
    HelpCircle,
    Building2,
    FileCheck,
    Stethoscope,
    Clock,
    Mail,
    MapPin,
  }

  // Buscar dados da base de dados
  useEffect(() => {
    async function fetchAboutData() {
      try {
        setLoading(true)
        console.log('🔍 A buscar dados da secção Sobre Nós do Supabase...')

        // Buscar texto principal
        const { data: aboutData, error: aboutError } = await supabase
          .from('about_section')
          .select('*')
          .limit(1)
          .single()

        // Buscar features (cards)
        const { data: featuresData, error: featuresError } = await supabase
          .from('about_features')
          .select('*')
          .order('order', { ascending: true, nullsFirst: false })
          .order('created_at', { ascending: true })

        if (aboutError && !aboutError.message.includes('does not exist') && !aboutError.message.includes('relation')) {
          console.error('❌ Erro ao buscar texto principal:', aboutError)
        }

        if (featuresError && !featuresError.message.includes('does not exist') && !featuresError.message.includes('relation')) {
          console.error('❌ Erro ao buscar features:', featuresError)
        }

        // Se as tabelas não existirem, usar dados padrão
        if (aboutError && (aboutError.message.includes('does not exist') || aboutError.message.includes('relation'))) {
          console.warn('⚠️ Tabela "about_section" não existe ainda. Usando texto padrão.')
          setMainText('A Clínica Freud é uma clínica especializada em saúde mental, dedicada a proporcionar cuidados de excelência através de uma equipa multidisciplinar de psicólogos e psiquiatras experientes.')
        } else if (aboutData) {
          setMainText(aboutData.main_text || '')
        }

        if (featuresError && (featuresError.message.includes('does not exist') || featuresError.message.includes('relation'))) {
          console.warn('⚠️ Tabela "about_features" não existe ainda. Usando features padrão.')
          setFeatures([
            { id: '1', title: 'Equipa Experiente', description: 'Profissionais altamente qualificados e certificados', icon_name: 'Users', order: 1 },
            { id: '2', title: 'Cuidado Personalizado', description: 'Acompanhamento individualizado para cada paciente', icon_name: 'Heart', order: 2 },
            { id: '3', title: 'Confidencialidade', description: 'Total privacidade e sigilo profissional', icon_name: 'Shield', order: 3 },
          ])
        } else if (featuresData && featuresData.length > 0) {
          setFeatures(featuresData)
        } else {
          // Fallback para dados padrão se não houver dados
          setFeatures([
            { id: '1', title: 'Equipa Experiente', description: 'Profissionais altamente qualificados e certificados', icon_name: 'Users', order: 1 },
            { id: '2', title: 'Cuidado Personalizado', description: 'Acompanhamento individualizado para cada paciente', icon_name: 'Heart', order: 2 },
            { id: '3', title: 'Confidencialidade', description: 'Total privacidade e sigilo profissional', icon_name: 'Shield', order: 3 },
          ])
        }
      } catch (err) {
        console.error('❌ Erro ao buscar dados da secção Sobre Nós:', err)
        // Usar dados padrão em caso de erro
        setMainText('A Clínica Freud é uma clínica especializada em saúde mental, dedicada a proporcionar cuidados de excelência através de uma equipa multidisciplinar de psicólogos e psiquiatras experientes.')
        setFeatures([
          { id: '1', title: 'Equipa Experiente', description: 'Profissionais altamente qualificados e certificados', icon_name: 'Users', order: 1 },
          { id: '2', title: 'Cuidado Personalizado', description: 'Acompanhamento individualizado para cada paciente', icon_name: 'Heart', order: 2 },
          { id: '3', title: 'Confidencialidade', description: 'Total privacidade e sigilo profissional', icon_name: 'Shield', order: 3 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchAboutData()
  }, [])

  // Função para renderizar o ícone ou imagem
  const renderIcon = (feature: AboutFeature) => {
    if (feature.icon_url) {
      // Imagem carregada - formato distinto: maior, circular com borda
      return (
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <img
              src={feature.icon_url}
              alt={feature.title}
              className="w-24 h-24 rounded-full object-cover border-4 border-clinica-primary shadow-lg"
            />
            <div className="absolute inset-0 rounded-full border-2 border-clinica-menu opacity-20"></div>
          </div>
        </div>
      )
    }

    if (feature.icon_name && iconMap[feature.icon_name]) {
      const IconComponent = iconMap[feature.icon_name]
      return (
        <div className="mb-6 flex justify-center">
          <div className="w-24 h-24 rounded-full bg-clinica-primary/10 flex items-center justify-center border-2 border-clinica-primary">
            <IconComponent className="w-12 h-12 text-clinica-primary" />
          </div>
        </div>
      )
    }

    // Fallback: ícone padrão
    return (
      <div className="mb-6 flex justify-center">
        <div className="w-24 h-24 rounded-full bg-clinica-primary/10 flex items-center justify-center border-2 border-clinica-primary">
          <HelpCircle className="w-12 h-12 text-clinica-primary" />
        </div>
      </div>
    )
  }

  return (
    <section id="sobre" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-accent">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Sobre Nós</h2>
          {loading ? (
            <p className="text-lg text-clinica-text max-w-3xl mx-auto font-medium">
              A carregar...
            </p>
          ) : (
            <p className="text-lg text-clinica-text max-w-3xl mx-auto font-medium">
              {mainText || 'A Clínica Freud é uma clínica especializada em saúde mental, dedicada a proporcionar cuidados de excelência através de uma equipa multidisciplinar de psicólogos e psiquiatras experientes.'}
            </p>
          )}
        </motion.div>
        {loading ? (
          <div className="text-center py-12">
            <p className="text-clinica-text opacity-70">A carregar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-clinica-bg border border-clinica-primary rounded-xl p-8 text-center shadow-lg hover:shadow-xl transition-shadow"
              >
                {renderIcon(feature)}
                <h3 className="text-xl font-bold mb-3 text-clinica-text">{feature.title}</h3>
                <p className="text-clinica-text opacity-90 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

// Página principal com todas as secções
export default function Home() {
  const [menuAberto, setMenuAberto] = useState(false)
  const [idiomaAberto, setIdiomaAberto] = useState(false)
  const [idioma, setIdioma] = useState<'pt' | 'en'>('pt') // Por agora só português
  const [services, setServices] = useState<Array<{ title: string; desc: string; image: string }>>([])

  // Secções disponíveis para o menu "O que oferecemos?"
  const seccoes = [
    { id: 'sobre', nome: 'Sobre Nós' },
    { id: 'servicos', nome: 'Serviços' },
    { id: 'corpo-clinico', nome: 'Corpo Clínico' },
    { id: 'depoimentos', nome: 'Depoimentos' },
    { id: 'blog', nome: 'Blog' },
    { id: 'seguradoras', nome: 'Seguradoras' },
    { id: 'faq', nome: 'FAQ' },
    { id: 'compromisso-etico', nome: 'Compromisso Ético' },
    { id: 'contactos', nome: 'Contactos' },
  ]

  const scrollParaSecao = (id: string) => {
    const elemento = document.getElementById(id)
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setMenuAberto(false)
    }
  }

  // Buscar serviços da base de dados
  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('id, title, description, image_url, order')
          .order('order', { ascending: true, nullsFirst: true })
          .order('title', { ascending: true })

        if (error) {
          // Se a tabela não existir, usar serviços padrão
          if (error.message.includes('does not exist') || error.message.includes('relation')) {
            console.warn('⚠️ Tabela "services" não existe ainda. Usando serviços padrão.')
            setServices([
              { title: 'Psicoterapia Individual', desc: 'Sessões individuais personalizadas', image: '' },
              { title: 'Psiquiatria', desc: 'Avaliação e tratamento psiquiátrico', image: '' },
              { title: 'Terapia de Casal', desc: 'Apoio especializado para casais', image: '' },
              { title: 'Terapia Familiar', desc: 'Intervenção com toda a família', image: '' },
              { title: 'Avaliação Psicológica', desc: 'Testes e avaliações completas', image: '' },
              { title: 'Grupos Terapêuticos', desc: 'Sessões em grupo para apoio mútuo', image: '' },
            ])
            return
          }
          console.error('Erro ao buscar serviços:', error)
          throw error
        }

        if (data && data.length > 0) {
          const formattedServices = data.map((s: any) => ({
            title: s.title || '',
            desc: s.description || '',
            image: s.image_url || '',
          }))
          setServices(formattedServices)
        } else {
          // Se não houver serviços, usar padrão
          setServices([
            { title: 'Psicoterapia Individual', desc: 'Sessões individuais personalizadas', image: '' },
            { title: 'Psiquiatria', desc: 'Avaliação e tratamento psiquiátrico', image: '' },
            { title: 'Terapia de Casal', desc: 'Apoio especializado para casais', image: '' },
            { title: 'Terapia Familiar', desc: 'Intervenção com toda a família', image: '' },
            { title: 'Avaliação Psicológica', desc: 'Testes e avaliações completas', image: '' },
            { title: 'Grupos Terapêuticos', desc: 'Sessões em grupo para apoio mútuo', image: '' },
          ])
        }
      } catch (error) {
        console.error('Erro ao buscar serviços:', error)
        // Usar serviços padrão em caso de erro
        setServices([
          { title: 'Psicoterapia Individual', desc: 'Sessões individuais personalizadas', image: '' },
          { title: 'Psiquiatria', desc: 'Avaliação e tratamento psiquiátrico', image: '' },
          { title: 'Terapia de Casal', desc: 'Apoio especializado para casais', image: '' },
          { title: 'Terapia Familiar', desc: 'Intervenção com toda a família', image: '' },
          { title: 'Avaliação Psicológica', desc: 'Testes e avaliações completas', image: '' },
          { title: 'Grupos Terapêuticos', desc: 'Sessões em grupo para apoio mútuo', image: '' },
        ])
      }
    }

    fetchServices()
  }, [])

  // Fechar dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement
      // Não fechar se clicar dentro do menu mobile ou nos botões do menu
      if (
        !target.closest('.menu-dropdown') && 
        !target.closest('.idioma-dropdown') &&
        !target.closest('[class*="md:hidden"]') &&
        !target.closest('button') &&
        !target.closest('a')
      ) {
        setMenuAberto(false)
        setIdiomaAberto(false)
      }
    }

    if (menuAberto || idiomaAberto) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('touchstart', handleClickOutside)
      }
    }
  }, [menuAberto, idiomaAberto])

  return (
    <div className="min-h-screen bg-clinica-bg text-clinica-text">
      {/* 1. HOME - Hero Section Estilo Robinhood */}
      <section id="home" className="relative min-h-screen flex flex-col bg-clinica-bg overflow-hidden">
        {/* Vídeo de Fundo do YouTube - Esbatido e Wide Screen */}
        <div className="absolute inset-0 w-full h-full z-0">
          <iframe
            className="absolute inset-0 w-full h-full"
            src="https://www.youtube.com/embed/3-3bGeqCqs8?autoplay=1&loop=1&mute=1&controls=0&showinfo=0&rel=0&iv_load_policy=3&playlist=3-3bGeqCqs8&modestbranding=1"
            title="Background Video"
            allow="autoplay; encrypted-media"
            allowFullScreen
            style={{
              opacity: 0.9, // Esbatido (90% de opacidade - aumentado para mais visibilidade)
              filter: 'brightness(0.91) contrast(1.1)', // Mais brilho e contraste para melhor visibilidade
              pointerEvents: 'none', // Não interferir com cliques
            }}
          />
          {/* Overlay escuro adicional para garantir legibilidade do texto */}
          <div className="absolute inset-0 bg-clinica-bg/30"></div>
        </div>

        {/* Header Fixo - Logo à esquerda, Menus no meio, Botão à direita */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-clinica-bg/95 backdrop-blur-sm border-b border-clinica-accent/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              {/* Logo Clínica Freud */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Logo onClick={() => scrollParaSecao('home')} />
              </motion.div>

              {/* Menu Desktop - Centro */}
              <nav className="hidden md:flex items-center gap-6">
                {/* Menu "O que oferecemos?" */}
                <div className="relative menu-dropdown">
                  <button
                    onClick={() => {
                      setMenuAberto(!menuAberto)
                      setIdiomaAberto(false)
                    }}
                    className="flex items-center gap-1 text-clinica-text hover:text-clinica-primary transition-colors font-medium"
                  >
                    O que oferecemos?
                    <ChevronDown className={`w-4 h-4 transition-transform ${menuAberto ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {menuAberto && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-clinica-bg border border-clinica-primary rounded-lg shadow-xl py-2 z-50"
                    >
                      {seccoes.map((seccao) => (
                        <button
                          key={seccao.id}
                          onClick={() => scrollParaSecao(seccao.id)}
                          className="w-full text-left px-4 py-2 text-clinica-text hover:bg-clinica-accent hover:text-clinica-primary transition-colors"
                        >
                          {seccao.nome}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>

                {/* Seletor de Idioma */}
                <div className="relative idioma-dropdown">
                  <button
                    onClick={() => {
                      setIdiomaAberto(!idiomaAberto)
                      setMenuAberto(false)
                    }}
                    className="flex items-center gap-1 text-clinica-text hover:text-clinica-primary transition-colors font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    <span>{idioma === 'pt' ? 'PT' : 'EN'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${idiomaAberto ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* Dropdown Idioma */}
                  {idiomaAberto && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full right-0 mt-2 w-32 bg-clinica-bg border border-clinica-primary rounded-lg shadow-xl py-2 z-50"
                    >
                      <button
                        onClick={() => {
                          setIdioma('pt')
                          setIdiomaAberto(false)
                        }}
                        className={`w-full text-left px-4 py-2 transition-colors ${
                          idioma === 'pt' 
                            ? 'bg-clinica-accent text-clinica-primary font-semibold' 
                            : 'text-clinica-text hover:bg-clinica-accent'
                        }`}
                      >
                        Português
                      </button>
                      <button
                        onClick={() => {
                          setIdioma('en')
                          setIdiomaAberto(false)
                          // Por agora só mostra alerta - tradução será implementada depois
                          alert('Tradução para inglês será implementada em breve.')
                        }}
                        className={`w-full text-left px-4 py-2 transition-colors ${
                          idioma === 'en' 
                            ? 'bg-clinica-accent text-clinica-primary font-semibold' 
                            : 'text-clinica-text hover:bg-clinica-accent'
                        }`}
                      >
                        English
                      </button>
                    </motion.div>
                  )}
                </div>
              </nav>

              {/* Menu Mobile - Hamburger */}
              <div className="md:hidden flex items-center gap-3">
                <button
                  onClick={() => {
                    setMenuAberto(!menuAberto)
                    setIdiomaAberto(false)
                  }}
                  className="text-clinica-text hover:text-clinica-primary transition-colors"
                  aria-label="Menu"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>

              {/* Botão Ligue-nos - sempre visível */}
              <motion.a
                href="tel:+351916649284"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex items-center gap-2 bg-clinica-cta text-clinica-text px-3 py-2 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Ligue-nos</span>
              </motion.a>
            </div>

            {/* Menu Mobile Expandido */}
            {menuAberto && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden mt-4 pb-4 border-t border-clinica-accent/20 pt-4"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                {/* Menu "O que oferecemos?" Mobile */}
                <div className="mb-4">
                  <button
                    onClick={() => setMenuAberto(!menuAberto)}
                    className="flex items-center gap-2 text-clinica-text font-semibold mb-2"
                  >
                    O que oferecemos?
                  </button>
                  <div className="pl-4 space-y-1">
                    {seccoes.map((seccao) => (
                      <button
                        key={seccao.id}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          scrollParaSecao(seccao.id)
                        }}
                        onTouchStart={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          scrollParaSecao(seccao.id)
                        }}
                        className="block w-full text-left px-3 py-2 text-sm text-clinica-text hover:bg-clinica-accent hover:text-clinica-primary active:bg-clinica-accent rounded transition-colors touch-manipulation"
                        style={{ WebkitTapHighlightColor: 'transparent' }}
                      >
                        {seccao.nome}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Seletor de Idioma Mobile */}
                <div>
                  <button
                    onClick={() => setIdiomaAberto(!idiomaAberto)}
                    className="flex items-center gap-2 text-clinica-text font-semibold mb-2"
                  >
                    <Globe className="w-4 h-4" />
                    Idioma: {idioma === 'pt' ? 'Português' : 'English'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${idiomaAberto ? 'rotate-180' : ''}`} />
                  </button>
                  {idiomaAberto && (
                    <div className="pl-4 space-y-1">
                      <button
                        onClick={() => {
                          setIdioma('pt')
                          setIdiomaAberto(false)
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                          idioma === 'pt' 
                            ? 'bg-clinica-accent text-clinica-primary font-semibold' 
                            : 'text-clinica-text hover:bg-clinica-accent'
                        }`}
                      >
                        Português
                      </button>
                      <button
                        onClick={() => {
                          setIdioma('en')
                          setIdiomaAberto(false)
                          alert('Tradução para inglês será implementada em breve.')
                        }}
                        className={`block w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                          idioma === 'en' 
                            ? 'bg-clinica-accent text-clinica-primary font-semibold' 
                            : 'text-clinica-text hover:bg-clinica-accent'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </header>

        {/* Conteúdo Principal - Centralizado */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-32 md:pt-24 pb-16">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="space-y-8"
            >
              {/* Mensagem Principal - Grande e Impactante */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-clinica-text leading-tight">
                Tratamento de{' '}
                <span className="text-clinica-cta">Burnout</span>,{' '}
                <span className="text-clinica-cta">Ansiedade</span>,{' '}
                <span className="text-clinica-cta">Bullying</span> , Problemas Relacionais e outros...
              </h1>

              {/* Botão Agendar Consulta - Estilo Robinhood */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="pt-8"
              >
                <button className="bg-clinica-cta text-clinica-text px-10 py-5 rounded-full font-bold text-lg sm:text-xl hover:bg-opacity-90 transition-all shadow-2xl hover:shadow-3xl hover:scale-105 active:scale-95">
                  Agendar Consulta
                </button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. SOBRE/NÓS */}
      <SobreNosSection />

      {/* 3. SERVIÇOS */}
      <section id="servicos" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Serviços</h2>
            <p className="text-lg text-clinica-text">Oferecemos uma gama completa de serviços de saúde mental</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.length > 0 ? services.map((servico, index) => (
              <motion.div
                key={`servico-${index}-${servico.title}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-clinica-bg border border-clinica-primary rounded-xl overflow-hidden hover:border-clinica-menu transition-all shadow-md hover:shadow-lg group"
              >
                {/* Imagem separada - parte superior */}
                {servico.image && (
                  <div 
                    className="w-full h-32 bg-clinica-accent"
                    style={{
                      backgroundImage: `url(${servico.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                )}
                
                {/* Texto com fundo sólido - parte inferior */}
                <div className="p-6 bg-clinica-bg">
                  <div className="flex items-center gap-3 mb-3">
                    <Stethoscope className="w-8 h-8 text-clinica-primary flex-shrink-0" />
                    <h3 className="text-xl font-bold text-clinica-text">
                      {servico.title}
                    </h3>
                  </div>
                  <p className="text-clinica-text opacity-90 leading-relaxed">
                    {servico.desc}
                  </p>
                </div>
              </motion.div>
            )) : (
              <div className="col-span-full text-center py-12">
                <p className="text-clinica-text">A carregar serviços...</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. CORPO CLÍNICO */}
      <CorpoClinicoSection />

      {/* 5. DEPOIMENTOS */}
      <DepoimentosSection />

      {/* 6. BLOG - Temporariamente comentado para debug */}
{/* <UltimosArtigosWrapper /> */}

      {/* 7. SEGURADORAS */}
      <SeguradorasSection />

      {/* 8. FAQ */}
      <FAQSection />

      {/* 9. COMPROMISSO ÉTICO */}
      <section id="compromisso-etico" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-accent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Compromisso Ético</h2>
            <p className="text-lg text-clinica-text">Os nossos valores e princípios</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-clinica-bg border border-clinica-primary rounded-xl p-8 shadow-md"
            >
              <FileCheck className="w-12 h-12 text-clinica-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-clinica-text">Código de Ética</h3>
              <p className="text-clinica-text leading-relaxed">
                Seguimos rigorosamente o código de ética profissional, garantindo o mais alto padrão de cuidados e respeito pelos nossos pacientes.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-clinica-bg border border-clinica-primary rounded-xl p-8 shadow-md"
            >
              <Shield className="w-12 h-12 text-clinica-primary mb-4" />
              <h3 className="text-2xl font-bold mb-4 text-clinica-text">Confidencialidade</h3>
              <p className="text-clinica-text leading-relaxed">
                Todos os dados e informações dos pacientes são tratados com absoluta confidencialidade, em conformidade com a legislação em vigor.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 10. CONTACTOS */}
      <section id="contactos" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Contactos</h2>
            <p className="text-lg text-clinica-text">Entre em contacto connosco</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-clinica-accent border border-clinica-primary rounded-xl p-6 text-center shadow-md"
            >
              <Phone className="w-10 h-10 text-clinica-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-clinica-text">Telefone</h3>
              <p className="text-clinica-text font-medium">+351 916 649 284</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-clinica-accent border border-clinica-primary rounded-xl p-6 text-center shadow-md"
            >
              <Mail className="w-10 h-10 text-clinica-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-clinica-text">Email</h3>
              <p className="text-clinica-text font-medium">consulta@clinicafreud.pt</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 bg-clinica-accent border border-clinica-primary rounded-xl p-6 text-center shadow-md"
          >
            <Clock className="w-10 h-10 text-clinica-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-clinica-text">Horário de Funcionamento</h3>
            <p className="text-clinica-text font-medium mb-4">Segunda a Sexta: 9h - 19h</p>
            <p className="text-clinica-text font-medium mb-4">Sábado: 9h - 13h</p>
            <div className="mt-6 pt-6 border-t border-clinica-primary/20">
              <div className="text-left">
                <h4 className="text-2xl font-bold mb-2 text-clinica-text">Clínica Freud</h4>
                <p className="text-clinica-text font-medium mb-4">
                  Avenida 5 de Outubro, 122, 8º Esq., 1050-061 Lisboa
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://maps.app.goo.gl/MMgb3FuxSeLLemSA6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-clinica-primary text-white rounded-lg hover:bg-clinica-menu transition-colors font-medium"
                  >
                    <Navigation2 className="w-5 h-5" />
                    Direções
                  </a>
                  <a
                    href="https://maps.app.goo.gl/MMgb3FuxSeLLemSA6"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-clinica-primary text-clinica-primary rounded-lg hover:bg-clinica-primary/10 transition-colors font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver mapa maior
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 11. DIREITOS E AFINS */}
      <section id="direitos" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-accent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Direitos e Afins</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 shadow-md"
            >
              <h3 className="text-2xl font-bold mb-4 text-clinica-text">Direitos do Paciente</h3>
              <ul className="space-y-2 text-clinica-text">
                <li>• Direito à informação</li>
                <li>• Direito à confidencialidade</li>
                <li>• Direito ao consentimento informado</li>
                <li>• Direito à qualidade dos cuidados</li>
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 shadow-md"
            >
              <h3 className="text-2xl font-bold mb-4 text-clinica-text">Política de Privacidade</h3>
              <p className="text-clinica-text leading-relaxed mb-4">
                Respeitamos a sua privacidade e protegemos os seus dados pessoais de acordo com o RGPD.
              </p>
              <button className="text-clinica-menu hover:underline font-semibold">Ler política completa →</button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-clinica-primary border-t border-clinica-menu py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Páginas */}
            <div>
              <h3 className="text-xl font-bold text-clinica-bg mb-4">Páginas</h3>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => scrollParaSecao('home')} className="text-clinica-bg/80 hover:text-clinica-bg transition-colors text-left">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollParaSecao('servicos')} className="text-clinica-bg/80 hover:text-clinica-bg transition-colors text-left">
                    Serviços
                  </button>
                </li>
                <li>
                  <a href="#little-freud" className="text-clinica-bg/80 hover:text-clinica-bg transition-colors">
                    Little Freud
                  </a>
                </li>
                <li>
                  <button onClick={() => scrollParaSecao('corpo-clinico')} className="text-clinica-bg/80 hover:text-clinica-bg transition-colors text-left">
                    Corpo Clínico
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollParaSecao('depoimentos')} className="text-clinica-bg/80 hover:text-clinica-bg transition-colors text-left">
                    Depoimentos
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollParaSecao('blog')} className="text-clinica-bg/80 hover:text-clinica-bg transition-colors text-left">
                    Blog
                  </button>
                </li>
                <li>
                  <a href="#publicacoes" className="text-clinica-bg/80 hover:text-clinica-bg transition-colors">
                    Publicações
                  </a>
                </li>
                <li>
                  <button onClick={() => scrollParaSecao('faq')} className="text-clinica-bg/80 hover:text-clinica-bg transition-colors text-left">
                    FAQ
                  </button>
                </li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="text-xl font-bold text-clinica-bg mb-4">Contacto</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-clinica-bg/80" />
                  <a href="tel:+351916649284" className="text-clinica-bg/80 hover:text-clinica-bg transition-colors">
                    +351 916 649 284
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-clinica-bg/80" />
                  <a href="https://wa.me/351916649284" className="text-clinica-bg/80 hover:text-clinica-bg transition-colors">
                    +351 916 649 284
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-clinica-bg/80" />
                  <a href="mailto:consulta@clinicafreud.pt" className="text-clinica-bg/80 hover:text-clinica-bg transition-colors">
                    consulta@clinicafreud.pt
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-clinica-bg/80" />
                  <a href="mailto:direcao@clinicafreud.pt" className="text-clinica-bg/80 hover:text-clinica-bg transition-colors">
                    direcao@clinicafreud.pt
                  </a>
                </li>
              </ul>
            </div>

            {/* Localização */}
            <div>
              <h3 className="text-xl font-bold text-clinica-bg mb-4">Localização</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-clinica-bg/80 mt-1 flex-shrink-0" />
                  <span className="text-clinica-bg/80">
                    Avenida 5 de Outubro, 122, 8º Esq., 1050-061 Lisboa
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="w-5 h-5 text-clinica-bg/80 mt-1 flex-shrink-0" />
                  <span className="text-clinica-bg/80">
                    De segunda a sábado, entre as 08-21h (contacte-nos para saber os horários vagos)
                  </span>
                </li>
              </ul>
            </div>

            {/* Transportes e Estacionamento */}
            <div>
              <h3 className="text-xl font-bold text-clinica-bg mb-4">Transportes</h3>
              <ul className="space-y-3 text-clinica-bg/80 text-sm">
                <li>
                  <strong className="text-clinica-bg">Metro:</strong> Campo Pequeno (linha amarela) e São Sebastião (linha azul)
                </li>
                <li>
                  <strong className="text-clinica-bg">Autocarro:</strong> 207, 701, 727, 732, 736, 738, 744, 749, 754, 783
                </li>
                <li>
                  <strong className="text-clinica-bg">Comboio:</strong> Estação de Entrecampos
                </li>
              </ul>
              <h3 className="text-xl font-bold text-clinica-bg mb-4 mt-6">Estacionamento</h3>
              <ul className="space-y-2 text-clinica-bg/80 text-sm">
                <li>Parking (Av. 5 de Outubro 209)</li>
                <li>Autocentro (Av. 5 de Outubro 75)</li>
                <li>Barbosa du Bocage (Barbosa du Bocage 85)</li>
              </ul>
            </div>
          </div>

          {/* Secção Inferior - Mensagem e Redes Sociais */}
          <div className="border-t border-clinica-menu/30 pt-8 mt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <p className="text-clinica-bg/90 mb-4">
                  Se tem dúvidas sobre qual o profissional escolher, nós podemos orientá-lo.
                </p>
                <button 
                  onClick={() => scrollParaSecao('contactos')}
                  className="bg-clinica-cta text-clinica-text px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl"
                >
                  Fale connosco
                </button>
              </div>
              
              {/* Redes Sociais */}
              <div className="flex items-center gap-4">
                <a
                  href="https://www.facebook.com/profile.php?id=61575649983080"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-clinica-bg/20 hover:bg-clinica-bg/30 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <Facebook className="w-6 h-6 text-clinica-bg" />
                </a>
                <a
                  href="https://www.instagram.com/clinicafreud/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-clinica-bg/20 hover:bg-clinica-bg/30 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6 text-clinica-bg" />
                </a>
                <a
                  href="https://www.youtube.com/@Cl%C3%ADnicaFreud"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-clinica-bg/20 hover:bg-clinica-bg/30 flex items-center justify-center transition-all hover:scale-110"
                  aria-label="YouTube"
                >
                  <Youtube className="w-6 h-6 text-clinica-bg" />
                </a>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-clinica-menu/30 pt-6 mt-6 text-center">
            <p className="text-clinica-bg/80">
              © {new Date().getFullYear()} Clínica Freud. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}


