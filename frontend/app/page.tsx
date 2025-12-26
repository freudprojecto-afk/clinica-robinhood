'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronDown, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Clock, Heart, Shield, MessageSquare, BookOpen, HelpCircle, Users, Stethoscope, Star, Building2, FileCheck, X } from 'lucide-react'
import { supabase } from '../lib/supabase'

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
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Corpo Clínico</h2>
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

// Página principal com todas as secções
export default function Home() {
  return (
    <div className="min-h-screen bg-clinica-bg text-clinica-text">
      {/* 1. HOME - Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-clinica-bg">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-clinica-primary">
              Clínica <span className="text-clinica-menu">Freud</span>
            </h1>
            
            {/* Mensagem principal para SEO */}
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-clinica-text leading-tight max-w-5xl mx-auto">
              Tratamento de <span className="text-clinica-primary">Burnout</span>, <span className="text-clinica-primary">Ansiedade</span>, <span className="text-clinica-primary">Bullying</span> e Problemas Relacionais em <span className="text-clinica-menu">Lisboa</span> e <span className="text-clinica-menu">Online</span>
            </h2>
            
            <p className="text-xl md:text-2xl text-clinica-text mb-6 max-w-4xl mx-auto font-medium">
              Na Clínica Freud, ajudamos adultos, jovens e casais a recuperar o equilíbrio emocional com psicólogos e psiquiatras experientes
            </p>
            
            <p className="text-lg md:text-xl text-clinica-primary font-semibold mb-8">
              Marque já consulta:
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a 
                href="tel:+351916649284"
                className="bg-clinica-cta text-clinica-text px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-colors shadow-lg hover:shadow-xl"
              >
                +351 916 649 284
              </a>
              <a 
                href="mailto:consulta@clinicafreud.pt"
                className="border-2 border-clinica-primary text-clinica-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-clinica-primary hover:text-clinica-bg transition-colors"
              >
                consulta@clinicafreud.pt
              </a>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-clinica-primary text-clinica-bg px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-colors shadow-md">
                Agendar Consulta
              </button>
              <button className="border-2 border-clinica-menu text-clinica-menu px-8 py-4 rounded-lg font-bold text-lg hover:bg-clinica-menu hover:text-clinica-bg transition-colors">
                Saber Mais
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. SOBRE/NÓS */}
      <section id="sobre" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Sobre Nós</h2>
            <p className="text-lg text-clinica-text max-w-3xl mx-auto font-medium">
              A Clínica Freud é uma clínica especializada em saúde mental, dedicada a proporcionar cuidados de excelência através de uma equipa multidisciplinar de psicólogos e psiquiatras experientes.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 text-center shadow-md"
            >
              <Users className="w-12 h-12 text-clinica-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-clinica-text">Equipa Experiente</h3>
              <p className="text-clinica-text">Profissionais altamente qualificados e certificados</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 text-center shadow-md"
            >
              <Heart className="w-12 h-12 text-clinica-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-clinica-text">Cuidado Personalizado</h3>
              <p className="text-clinica-text">Acompanhamento individualizado para cada paciente</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 text-center shadow-md"
            >
              <Shield className="w-12 h-12 text-clinica-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-clinica-text">Confidencialidade</h3>
              <p className="text-clinica-text">Total privacidade e sigilo profissional</p>
            </motion.div>
          </div>
        </div>
      </section>

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
            {[
              { title: 'Psicoterapia Individual', desc: 'Sessões individuais personalizadas' },
              { title: 'Psiquiatria', desc: 'Avaliação e tratamento psiquiátrico' },
              { title: 'Terapia de Casal', desc: 'Apoio especializado para casais' },
              { title: 'Terapia Familiar', desc: 'Intervenção com toda a família' },
              { title: 'Avaliação Psicológica', desc: 'Testes e avaliações completas' },
              { title: 'Grupos Terapêuticos', desc: 'Sessões em grupo para apoio mútuo' },
            ].map((servico, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-clinica-accent border border-clinica-primary rounded-xl p-6 hover:border-clinica-menu transition-colors shadow-md hover:shadow-lg"
              >
                <Stethoscope className="w-10 h-10 text-clinica-menu mb-4" />
                <h3 className="text-xl font-bold mb-2">{servico.title}</h3>
                <p className="text-clinica-text opacity-80">{servico.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORPO CLÍNICO */}
      <CorpoClinicoSection />

      {/* 5. DEPOIMENTOS */}
      <section id="depoimentos" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-accent">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Depoimentos</h2>
            <p className="text-lg text-clinica-text">O que os nossos pacientes dizem sobre nós</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { nome: 'Maria S.', texto: 'Excelente atendimento e profissionais muito competentes.', rating: 5 },
              { nome: 'João P.', texto: 'A terapia mudou a minha vida. Recomendo vivamente.', rating: 5 },
              { nome: 'Ana L.', texto: 'Ambiente acolhedor e tratamento de qualidade.', rating: 5 },
            ].map((depoimento, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 shadow-md"
              >
                <div className="flex mb-4">
                  {[...Array(depoimento.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-clinica-cta fill-clinica-cta" />
                  ))}
                </div>
                <p className="text-clinica-text mb-4 italic">"{depoimento.texto}"</p>
                <p className="text-clinica-text font-semibold">- {depoimento.nome}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BLOG */}
      <section id="blog" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-bg">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-clinica-primary">Blog</h2>
            <p className="text-lg text-clinica-text">Artigos e recursos sobre saúde mental</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: item * 0.1 }}
                className="bg-robinhood-card border border-clinica-primary rounded-xl p-6 hover:border-clinica-menu transition-colors cursor-pointer"
              >
                <BookOpen className="w-10 h-10 text-clinica-menu mb-4" />
                <h3 className="text-xl font-bold mb-2">Artigo de Blog {item}</h3>
                <p className="text-clinica-text opacity-80 mb-4">Descrição do artigo sobre saúde mental e bem-estar...</p>
                <button className="text-clinica-menu hover:underline">Ler mais →</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SEGURADORAS */}
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Medicare', 'AdvanceCare', 'Multicare', 'Allianz Care'].map((seguradora, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-clinica-bg border border-clinica-primary rounded-xl p-6 text-center hover:border-clinica-menu transition-colors"
              >
                <Building2 className="w-12 h-12 text-clinica-menu mx-auto mb-4" />
                <p className="font-semibold">{seguradora}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 bg-clinica-bg">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-lg text-clinica-text">Respostas às questões mais comuns</p>
          </motion.div>
          <div className="space-y-4">
            {[
              { pergunta: 'Como posso agendar uma consulta?', resposta: 'Pode agendar através do nosso site, por telefone ou email.' },
              { pergunta: 'Aceitam seguros de saúde?', resposta: 'Sim, aceitamos a maioria dos seguros de saúde nacionais.' },
              { pergunta: 'Qual a duração de uma sessão?', resposta: 'As sessões têm normalmente a duração de 50 minutos.' },
              { pergunta: 'As consultas são confidenciais?', resposta: 'Sim, garantimos total confidencialidade e sigilo profissional.' },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-clinica-accent border border-clinica-primary rounded-xl p-6 shadow-md"
              >
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-clinica-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold mb-2 text-clinica-primary">{faq.pergunta}</h3>
                    <p className="text-clinica-primary opacity-90">{faq.resposta}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Compromisso Ético</h2>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Contactos</h2>
            <p className="text-lg text-clinica-text">Entre em contacto connosco</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-clinica-accent border border-clinica-primary rounded-xl p-6 text-center shadow-md"
            >
              <MapPin className="w-10 h-10 text-clinica-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2 text-clinica-text">Morada</h3>
              <p className="text-clinica-text font-medium">Avenida 5 de Outubro, 122, 8º Esq., 1050-061 Lisboa</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 bg-clinica-accent border border-clinica-primary rounded-xl p-6 text-center shadow-md"
          >
            <Clock className="w-10 h-10 text-clinica-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2 text-clinica-text">Horário de Funcionamento</h3>
            <p className="text-clinica-text font-medium">Segunda a Sexta: 9h - 19h</p>
            <p className="text-clinica-text font-medium">Sábado: 9h - 13h</p>
          </motion.div>
        </div>
      </section>

      {/* 11. DIREITOS E AFINS */}
      <section id="direitos" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-card">
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
              <h3 className="text-2xl font-bold mb-4 text-clinica-primary">Direitos do Paciente</h3>
              <ul className="space-y-2 text-clinica-primary">
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
              <h3 className="text-2xl font-bold mb-4 text-clinica-primary">Política de Privacidade</h3>
              <p className="text-clinica-primary leading-relaxed mb-4">
                Respeitamos a sua privacidade e protegemos os seus dados pessoais de acordo com o RGPD.
              </p>
              <button className="text-clinica-menu hover:underline font-semibold">Ler política completa →</button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-clinica-primary border-t border-clinica-menu py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-clinica-bg">© {new Date().getFullYear()} Clínica Freud. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
