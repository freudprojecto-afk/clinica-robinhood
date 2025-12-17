'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, ChevronDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import ChartCard from '../components/ChartCard'
import StatsCard from '../components/StatsCard'
import ListCard from '../components/ListCard'
import { Users, Calendar, DollarSign, Activity } from 'lucide-react'

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
  const categorias = Array.from(
    new Set(
      profissionais
        .map((p: Profissional) => p.speciality)
        .filter((s): s is string => typeof s === 'string' && s.trim() !== '')
    )
  ).sort()

  // Filtrar profissionais baseado na categoria selecionada
  const profissionaisFiltrados = categoriaSelecionada === 'Todas'
    ? profissionais
    : profissionais.filter((p: Profissional) => p.speciality === categoriaSelecionada)

  // Obter URL da imagem (tenta vários campos possíveis e verifica se é uma URL válida)
  const obterImagem = (profissional: Profissional) => {
    const url = profissional.photo || profissional.image || profissional.foto || null
    if (!url) return null
    
    // Se já é uma URL completa, retorna
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    
    // Se começa com /, assume que é relativo ao domínio
    if (url.startsWith('/')) {
      return url
    }
    
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
    
    if (iniciais.length >= 2) {
      return iniciais.substring(0, 2)
    }
    
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
    <section id="corpo-clinico" className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
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
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="appearance-none bg-robinhood-card border border-robinhood-border text-white px-6 py-2 pr-10 rounded-lg font-medium transition-all duration-200 hover:border-robinhood-green focus:outline-none focus:border-robinhood-green cursor-pointer min-w-[200px]"
            >
              <option value="Todas" className="bg-robinhood-card text-white">Todas</option>
              {categorias.map((categoria) => (
                <option 
                  key={categoria} 
                  value={categoria}
                  className="bg-robinhood-card text-white"
                >
                  {categoria}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </motion.div>

        {/* Grid de Profissionais */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">A carregar profissionais...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-400 text-lg">Erro: {error}</p>
          </div>
        ) : profissionaisFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profissionaisFiltrados.map((profissional: Profissional, index: number) => (
              <ProfissionalCard key={profissional.id} profissional={profissional} index={index} />
            ))}
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

// Página principal
export default function Home() {
  return (
    <div className="min-h-screen bg-robinhood-dark text-white">
      {/* Hero Section ou Dashboard */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Bem-vindo à Clínica</h1>
            <p className="text-lg text-gray-300">Sistema de gestão e informações</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Pacientes"
              value="1,234"
              change={12.5}
              icon={<Users className="w-6 h-6 text-robinhood-green" />}
              trend="up"
            />
            <StatsCard
              title="Consultas"
              value="456"
              change={8.2}
              icon={<Calendar className="w-6 h-6 text-robinhood-green" />}
              trend="up"
            />
            <StatsCard
              title="Receita"
              value="€12.5k"
              change={-2.1}
              icon={<DollarSign className="w-6 h-6 text-robinhood-green" />}
              trend="down"
            />
            <StatsCard
              title="Atividade"
              value="89%"
              change={5.3}
              icon={<Activity className="w-6 h-6 text-robinhood-green" />}
              trend="up"
            />
          </div>

          {/* Charts and Lists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <ChartCard />
            <ListCard />
          </div>
        </div>
      </div>

      {/* Secção Corpo Clínico */}
      <CorpoClinicoSection />
    </div>
  )
}
