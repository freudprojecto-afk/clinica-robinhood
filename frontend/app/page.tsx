'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface Profissional {
  id: number
  name: string
  title?: string
  speciality: string
  description?: string
  photo?: string
}

export default function CorpoClinico() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([])
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>('Todas')
  const [profissionalAtual, setProfissionalAtual] = useState(0)
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
  const categorias = Array.from(new Set(profissionais.map((p: Profissional) => p.speciality).filter((s): s is string => Boolean(s))))

  // Filtrar profissionais baseado na categoria selecionada
  const profissionaisFiltrados = categoriaSelecionada === 'Todas'
    ? profissionais
    : profissionais.filter((p: Profissional) => p.speciality === categoriaSelecionada)

  // Ajustar índice do profissional atual após filtro
  const profissionalExibido = profissionaisFiltrados[profissionalAtual] || profissionaisFiltrados[0]

  const proximoProfissional = () => {
    setProfissionalAtual((prev: number) => (prev + 1) % profissionaisFiltrados.length)
  }

  const anteriorProfissional = () => {
    setProfissionalAtual((prev: number) => (prev - 1 + profissionaisFiltrados.length) % profissionaisFiltrados.length)
  }

  // Resetar índice quando a categoria muda
  const handleCategoriaChange = (categoria: string) => {
    setCategoriaSelecionada(categoria)
    setProfissionalAtual(0)
  }

  // Obter iniciais do nome
  const obterIniciais = (nome: string) => {
    return nome
      .split(' ')
      .filter(palavra => palavra.length > 0 && palavra[0] === palavra[0].toUpperCase())
      .map(palavra => palavra[0])
      .join('')
      .substring(0, 2)
  }

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen bg-robinhood-dark text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400 text-lg">A carregar profissionais...</p>
        </div>
      </div>
    )
  }

  // Mostrar erro
  if (error) {
    return (
      <div className="min-h-screen bg-robinhood-dark text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-red-400 text-lg">Erro: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-robinhood-dark text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Corpo Clínico</h1>
          <p className="text-lg text-gray-300">Conheça nossa equipa de psicólogos e psiquiatras experientes</p>
        </motion.div>

        {/* Filtro de Categorias */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => handleCategoriaChange('Todas')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                categoriaSelecionada === 'Todas'
                  ? 'bg-robinhood-green text-robinhood-dark'
                  : 'bg-robinhood-card border border-robinhood-border text-gray-300 hover:border-robinhood-green hover:text-robinhood-green'
              }`}
            >
              Todas
            </button>
            {categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => handleCategoriaChange(categoria)}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  categoriaSelecionada === categoria
                    ? 'bg-robinhood-green text-robinhood-dark'
                    : 'bg-robinhood-card border border-robinhood-border text-gray-300 hover:border-robinhood-green hover:text-robinhood-green'
                }`}
              >
                {categoria}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Card do Profissional */}
        {profissionalExibido && (
          <motion.div
            key={profissionalExibido.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="relative"
          >
            <div className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Foto do Profissional */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-robinhood-border border-2 border-robinhood-green flex items-center justify-center text-2xl md:text-3xl font-bold text-robinhood-green">
                    {profissionalExibido.photo ? (
                      <img
                        src={profissionalExibido.photo}
                        alt={profissionalExibido.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      obterIniciais(profissionalExibido.name)
                    )}
                  </div>
                </div>

                {/* Informações do Profissional */}
                <div className="flex-1">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">{profissionalExibido.name}</h2>
                  {profissionalExibido.title && (
                    <p className="text-robinhood-green mb-3">{profissionalExibido.title}</p>
                  )}
                  <p className="text-gray-300 mb-4 font-medium">{profissionalExibido.speciality}</p>
                  {profissionalExibido.description && (
                    <p className="text-gray-400 mb-6 leading-relaxed">{profissionalExibido.description}</p>
                  )}
                  
                  {/* Botão Ver CV Completo */}
                  <button className="inline-flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors">
                    <FileText className="w-4 h-4" />
                    Ver CV Completo
                  </button>
                </div>
              </div>
            </div>

            {/* Navegação */}
            {profissionaisFiltrados.length > 1 && (
              <div className="flex justify-between items-center mt-6">
                <button
                  onClick={anteriorProfissional}
                  className="w-12 h-12 rounded-full bg-robinhood-card border border-robinhood-border flex items-center justify-center hover:border-robinhood-green hover:text-robinhood-green transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <span className="text-gray-400 text-sm">
                  {profissionalAtual + 1} de {profissionaisFiltrados.length}
                </span>
                <button
                  onClick={proximoProfissional}
                  className="w-12 h-12 rounded-full bg-robinhood-card border border-robinhood-border flex items-center justify-center hover:border-robinhood-green hover:text-robinhood-green transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Mensagem quando não há profissionais */}
        {profissionais.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">Nenhum profissional encontrado.</p>
          </motion.div>
        )}

        {/* Mensagem quando não há profissionais na categoria selecionada */}
        {profissionais.length > 0 && profissionaisFiltrados.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-400 text-lg">Nenhum profissional encontrado nesta categoria.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
