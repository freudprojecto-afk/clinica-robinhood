'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
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

export default function CorpoClinico() {
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
        .filter((s: string | undefined): s is string => Boolean(s) && s.trim() !== '')
    )
  ).sort()

  // Filtrar profissionais baseado na categoria selecionada
  const profissionaisFiltrados = categoriaSelecionada === 'Todas'
    ? profissionais
    : profissionais.filter((p: Profissional) => p.speciality === categoriaSelecionada)

  // Obter URL da imagem (tenta vários campos possíveis)
  const obterImagem = (profissional: Profissional) => {
    return profissional.photo || profissional.image || profissional.foto || null
  }

  // Obter iniciais do nome
  const obterIniciais = (nome: string) => {
    const palavras = nome.split(' ').filter(p => p.length > 0)
    if (palavras.length === 0) return '??'
    
    // Tenta pegar as primeiras letras maiúsculas
    const iniciais = palavras
      .filter(palavra => palavra[0] === palavra[0].toUpperCase())
      .map(palavra => palavra[0])
      .join('')
    
    if (iniciais.length >= 2) {
      return iniciais.substring(0, 2)
    }
    
    // Se não encontrou, pega as primeiras duas letras do nome completo
    return nome.substring(0, 2).toUpperCase()
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
              onClick={() => setCategoriaSelecionada('Todas')}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                categoriaSelecionada === 'Todas'
                  ? 'bg-robinhood-green text-robinhood-dark'
                  : 'bg-robinhood-card border border-robinhood-border text-gray-300 hover:border-robinhood-green hover:text-robinhood-green'
              }`}
            >
              Todas
            </button>
            {categorias.length > 0 && categorias.map((categoria) => (
              <button
                key={categoria}
                onClick={() => setCategoriaSelecionada(categoria)}
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

        {/* Grid de Profissionais */}
        {profissionaisFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {profissionaisFiltrados.map((profissional: Profissional, index: number) => {
              const imagemUrl = obterImagem(profissional)
              
              return (
                <motion.div
                  key={profissional.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 hover:border-robinhood-green transition-colors"
                >
                  <div className="flex flex-col items-center md:items-start">
                    {/* Foto do Profissional */}
                    <div className="mb-4">
                      <div className="w-32 h-32 md:w-28 md:h-28 rounded-full bg-robinhood-border border-2 border-robinhood-green flex items-center justify-center text-2xl font-bold text-robinhood-green overflow-hidden">
                        {imagemUrl ? (
                          <img
                            src={imagemUrl}
                            alt={profissional.name}
                            className="w-full h-full rounded-full object-cover"
                            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                              // Se a imagem falhar ao carregar, mostra as iniciais
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                              const parent = target.parentElement
                              if (parent) {
                                parent.innerHTML = obterIniciais(profissional.name)
                              }
                            }}
                          />
                        ) : (
                          obterIniciais(profissional.name)
                        )}
                      </div>
                    </div>

                    {/* Informações do Profissional */}
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
                      
                      {/* Botão Ver CV Completo */}
                      <button className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-robinhood-green text-robinhood-dark px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors text-sm">
                        <FileText className="w-4 h-4" />
                        Ver CV Completo
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
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
    </div>
  )
}
