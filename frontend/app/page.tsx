'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronDown, ChevronLeft, ChevronRight, Phone, Mail, MapPin, Clock, Heart, Shield, MessageSquare, BookOpen, HelpCircle, Users, Stethoscope, Star, Building2, FileCheck } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Profissional {
  id: number
  name: string
  title?: string
  speciality: string
  description?: string
  photo?: string
  image?: string
  foto?: string
}

// Componente da secção Corpo Clínico
function CorpoClinicoSection() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Todas')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(3)

  // Buscar profissionais da base de dados
  useEffect(() => {
    async function fetchProfissionais() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('professionals')
          .select('*')
          .order('id', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        if (data) {
          setProfissionais(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar profissionais')
        console.error('Erro ao buscar profissionais:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchProfissionais()
  }, [])

  // Extrair categorias únicas do campo speciality
  const categorias = useMemo(() => {
    const cats = Array.from(
      new Set(
        profissionais
          .map((p: Profissional) => p.speciality)
          .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
      )
    ).sort()
    console.log('Categorias extraídas:', cats)
    return cats
  }, [profissionais])

  // Filtrar profissionais baseado na categoria selecionada
  const profissionaisFiltrados = categoriaSelecionada === 'Todas'
    ? profissionais
    : profissionais.filter((p: Profissional) => p.speciality === categoriaSelecionada)

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
    const url = profissional.photo || profissional.image || profissional.foto || null
    if (!url) return null
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return url
    return url
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
        const img = new Image()
        img.onload = () => {
          setImagemCarregando(false)
          setImagemErro(false)
        }
        img.onerror = () => {
          setImagemCarregando(false)
          setImagemErro(true)
        }
        img.src = imagemUrl
      } else {
        setImagemCarregando(false)
        setImagemErro(true)
      }
    }, [imagemUrl])

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
        className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 hover:border-robinhood-green transition-colors"
      >
        <div className="flex flex-col items-center md:items-start">
          <div className="mb-4">
            <div className="w-32 h-32 md:w-28 md:h-28 rounded-full bg-robinhood-border border-2 border-robinhood-green flex items-center justify-center text-2xl font-bold text-robinhood-green overflow-hidden relative">
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
            <h2 className="text-xl md:text-2xl font-bold mb-2">{profissional.name}</h2>
            {profissional.title && (
              <p className="text-robinhood-green text-sm mb-2">{profissional.title}</p>
            )}
            <p className="text-gray-300 text-sm mb-3 font-medium">{profissional.speciality}</p>
            {profissional.description && (
              <p className="text-gray-400 text-sm mb-4 leading-relaxed line-clamp-3">
                {profissional.description}
              </p>
            )}
            
            <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-robinhood-green text-robinhood-dark px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm">
              <FileText className="w-4 h-4" />
              Ver CV Completo
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <section id="corpo-clinico" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-dark">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Corpo Clínico</h2>
          <p className="text-lg text-gray-300">Conheça nossa equipa de psicólogos e psiquiatras experientes</p>
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
                console.log('Categoria selecionada:', e.target.value)
                setCategoriaSelecionada(e.target.value)
              }}
              className="appearance-none bg-robinhood-card border border-robinhood-border text-white px-6 py-2 pr-10 rounded-lg font-medium transition-all duration-200 hover:border-robinhood-green focus:outline-none focus:border-robinhood-green cursor-pointer min-w-[250px]"
            >
              <option value="Todas">Todas</option>
              {categorias.map((categoria) => (
                <option 
                  key={categoria} 
                  value={categoria}
                >
                  {categoria}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400 z-0">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Carrossel de Profissionais */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">A carregar profissionais...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">Erro: {error}</p>
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 bg-robinhood-green text-robinhood-dark p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 bg-robinhood-green text-robinhood-dark p-3 rounded-full shadow-lg hover:bg-opacity-90 transition-all z-10"
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
                        ? 'bg-robinhood-green w-8'
                        : 'bg-gray-600 w-2 hover:bg-gray-500'
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
            <p className="text-gray-400 text-lg">
              {profissionais.length === 0 
                ? 'Nenhum profissional encontrado.' 
                : 'Nenhum profissional encontrado nesta categoria.'}
            </p>
          </motion.div>
        )}
      </div>
    </section>
  )
}

// Página principal com todas as secções
export default function Home() {
  return (
    <div className="min-h-screen bg-robinhood-dark text-white">
      {/* 1. HOME - Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Clínica <span className="text-robinhood-green">Freud</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Cuidamos da sua saúde mental com profissionais experientes e dedicados
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-robinhood-green text-robinhood-dark px-8 py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 transition-colors">
                Agendar Consulta
              </button>
              <button className="border-2 border-robinhood-green text-robinhood-green px-8 py-4 rounded-lg font-bold text-lg hover:bg-robinhood-green hover:text-robinhood-dark transition-colors">
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Sobre Nós</h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              A Clínica Freud é uma clínica especializada em saúde mental, dedicada a proporcionar cuidados de excelência através de uma equipa multidisciplinar de psicólogos e psiquiatras experientes.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-robinhood-dark border border-robinhood-border rounded-xl p-6 text-center"
            >
              <Users className="w-12 h-12 text-robinhood-green mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Equipa Experiente</h3>
              <p className="text-gray-400">Profissionais altamente qualificados e certificados</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-robinhood-dark border border-robinhood-border rounded-xl p-6 text-center"
            >
              <Heart className="w-12 h-12 text-robinhood-green mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Cuidado Personalizado</h3>
              <p className="text-gray-400">Acompanhamento individualizado para cada paciente</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-robinhood-dark border border-robinhood-border rounded-xl p-6 text-center"
            >
              <Shield className="w-12 h-12 text-robinhood-green mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Confidencialidade</h3>
              <p className="text-gray-400">Total privacidade e sigilo profissional</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. SERVIÇOS */}
      <section id="servicos" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Serviços</h2>
            <p className="text-lg text-gray-300">Oferecemos uma gama completa de serviços de saúde mental</p>
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
                className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 hover:border-robinhood-green transition-colors"
              >
                <Stethoscope className="w-10 h-10 text-robinhood-green mb-4" />
                <h3 className="text-xl font-bold mb-2">{servico.title}</h3>
                <p className="text-gray-400">{servico.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CORPO CLÍNICO */}
      <CorpoClinicoSection />

      {/* 5. DEPOIMENTOS */}
      <section id="depoimentos" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Depoimentos</h2>
            <p className="text-lg text-gray-300">O que os nossos pacientes dizem sobre nós</p>
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
                className="bg-robinhood-dark border border-robinhood-border rounded-xl p-6"
              >
                <div className="flex mb-4">
                  {[...Array(depoimento.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{depoimento.texto}"</p>
                <p className="text-robinhood-green font-semibold">- {depoimento.nome}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. BLOG */}
      <section id="blog" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Blog</h2>
            <p className="text-lg text-gray-300">Artigos e recursos sobre saúde mental</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: item * 0.1 }}
                className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 hover:border-robinhood-green transition-colors cursor-pointer"
              >
                <BookOpen className="w-10 h-10 text-robinhood-green mb-4" />
                <h3 className="text-xl font-bold mb-2">Artigo de Blog {item}</h3>
                <p className="text-gray-400 mb-4">Descrição do artigo sobre saúde mental e bem-estar...</p>
                <button className="text-robinhood-green hover:underline">Ler mais →</button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. SEGURADORAS */}
      <section id="seguradoras" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Seguradoras</h2>
            <p className="text-lg text-gray-300">Aceitamos os principais seguros de saúde</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {['Medicare', 'AdvanceCare', 'Multicare', 'Allianz Care'].map((seguradora, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-robinhood-dark border border-robinhood-border rounded-xl p-6 text-center hover:border-robinhood-green transition-colors"
              >
                <Building2 className="w-12 h-12 text-robinhood-green mx-auto mb-4" />
                <p className="font-semibold">{seguradora}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-dark">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Perguntas Frequentes</h2>
            <p className="text-lg text-gray-300">Respostas às questões mais comuns</p>
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
                className="bg-robinhood-card border border-robinhood-border rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-robinhood-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold mb-2">{faq.pergunta}</h3>
                    <p className="text-gray-400">{faq.resposta}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. COMPROMISSO ÉTICO */}
      <section id="compromisso-etico" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Compromisso Ético</h2>
            <p className="text-lg text-gray-300">Os nossos valores e princípios</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-robinhood-dark border border-robinhood-border rounded-xl p-8"
            >
              <FileCheck className="w-12 h-12 text-robinhood-green mb-4" />
              <h3 className="text-2xl font-bold mb-4">Código de Ética</h3>
              <p className="text-gray-400 leading-relaxed">
                Seguimos rigorosamente o código de ética profissional, garantindo o mais alto padrão de cuidados e respeito pelos nossos pacientes.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-robinhood-dark border border-robinhood-border rounded-xl p-8"
            >
              <Shield className="w-12 h-12 text-robinhood-green mb-4" />
              <h3 className="text-2xl font-bold mb-4">Confidencialidade</h3>
              <p className="text-gray-400 leading-relaxed">
                Todos os dados e informações dos pacientes são tratados com absoluta confidencialidade, em conformidade com a legislação em vigor.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 10. CONTACTOS */}
      <section id="contactos" className="py-16 px-4 sm:px-6 lg:px-8 bg-robinhood-dark">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Contactos</h2>
            <p className="text-lg text-gray-300">Entre em contacto connosco</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 text-center"
            >
              <Phone className="w-10 h-10 text-robinhood-green mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Telefone</h3>
              <p className="text-gray-400">+351 XXX XXX XXX</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 text-center"
            >
              <Mail className="w-10 h-10 text-robinhood-green mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Email</h3>
              <p className="text-gray-400">geral@clinicafreud.pt</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 text-center"
            >
              <MapPin className="w-10 h-10 text-robinhood-green mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Morada</h3>
              <p className="text-gray-400">Lisboa, Portugal</p>
            </motion.div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 bg-robinhood-card border border-robinhood-border rounded-xl p-6 text-center"
          >
            <Clock className="w-10 h-10 text-robinhood-green mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Horário de Funcionamento</h3>
            <p className="text-gray-400">Segunda a Sexta: 9h - 19h</p>
            <p className="text-gray-400">Sábado: 9h - 13h</p>
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Direitos e Afins</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-robinhood-dark border border-robinhood-border rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold mb-4">Direitos do Paciente</h3>
              <ul className="space-y-2 text-gray-400">
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
              className="bg-robinhood-dark border border-robinhood-border rounded-xl p-6"
            >
              <h3 className="text-2xl font-bold mb-4">Política de Privacidade</h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Respeitamos a sua privacidade e protegemos os seus dados pessoais de acordo com o RGPD.
              </p>
              <button className="text-robinhood-green hover:underline">Ler política completa →</button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-robinhood-dark border-t border-robinhood-border py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© {new Date().getFullYear()} Clínica Freud. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}
