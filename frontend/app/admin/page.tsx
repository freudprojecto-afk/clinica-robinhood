'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Upload, ArrowUp, ArrowDown, Save, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Professional {
  id: number
  name: string
  title?: string
  speciality: string
  description?: string
  photo?: string
  image?: string
  foto?: string
  order?: number  // Campo para ordenação
}

export default function AdminPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Partial<Professional>>({
    name: '',
    title: '',
    speciality: '',
    description: '',
    photo: '',
  })
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null)

  useEffect(() => {
    // Verificar se o Supabase está configurado
    console.log('🔧 Verificando configuração do Supabase...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO CONFIGURADO')
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'NÃO CONFIGURADO')
    
    fetchProfessionals()
  }, [])

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 A buscar profissionais do Supabase...')
      
      const { data, error } = await supabase
        .from('professionals')
        .select('*')
        .order('order', { ascending: true, nullsFirst: false })
        .order('id', { ascending: true })

      console.log('📊 Resposta do Supabase:', { data, error })

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        alert(`Erro ao carregar profissionais: ${error.message}`)
        throw error
      }

      if (data) {
        console.log(`✅ ${data.length} profissionais encontrados:`, data)
        setProfessionals(data)
      } else {
        console.warn('⚠️ Nenhum dado retornado do Supabase')
        setProfessionals([])
      }
    } catch (error) {
      console.error('❌ Erro ao buscar profissionais:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao carregar profissionais: ${errorMessage}`)
      setProfessionals([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      // Obter o maior order atual ou usar o número de profissionais + 1
      const maxOrder = professionals.length > 0 
        ? Math.max(...professionals.map(p => p.order ?? p.id), 0)
        : 0
      
      const newOrder = maxOrder + 1

      const { error } = await supabase
        .from('professionals')
        .insert([{ ...formData, order: newOrder }])

      if (error) {
        throw error
      }

      await fetchProfessionals()
      setIsCreating(false)
      setFormData({ name: '', title: '', speciality: '', description: '', photo: '' })
      alert('Profissional criado com sucesso!')
    } catch (error) {
      console.error('Erro ao criar profissional:', error)
      alert('Erro ao criar profissional')
    }
  }

  const handleUpdate = async (id: number) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update(formData)
        .eq('id', id)

      if (error) {
        throw error
      }

      await fetchProfessionals()
      setEditingId(null)
      setFormData({ name: '', title: '', speciality: '', description: '', photo: '' })
      alert('Profissional atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      alert('Erro ao atualizar profissional')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return

    try {
      const { error } = await supabase
        .from('professionals')
        .delete()
        .eq('id', id)

      if (error) {
        throw error
      }

      await fetchProfessionals()
      alert('Profissional excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir profissional:', error)
      alert('Erro ao excluir profissional')
    }
  }

  // Função para mover profissional para cima
  const moveUp = async (index: number) => {
    if (index === 0) return // Já está no topo

    const current = professionals[index]
    const previous = professionals[index - 1]

    try {
      // Trocar as ordens
      const currentOrder = current.order ?? current.id
      const previousOrder = previous.order ?? previous.id

      // Atualizar ambos os profissionais
      const { error: error1 } = await supabase
        .from('professionals')
        .update({ order: previousOrder })
        .eq('id', current.id)

      if (error1) throw error1

      const { error: error2 } = await supabase
        .from('professionals')
        .update({ order: currentOrder })
        .eq('id', previous.id)

      if (error2) throw error2

      await fetchProfessionals()
    } catch (error) {
      console.error('Erro ao mover profissional:', error)
      alert('Erro ao alterar ordem do profissional')
    }
  }

  // Função para mover profissional para baixo
  const moveDown = async (index: number) => {
    if (index === professionals.length - 1) return // Já está no final

    const current = professionals[index]
    const next = professionals[index + 1]

    try {
      // Trocar as ordens
      const currentOrder = current.order ?? current.id
      const nextOrder = next.order ?? next.id

      // Atualizar ambos os profissionais
      const { error: error1 } = await supabase
        .from('professionals')
        .update({ order: nextOrder })
        .eq('id', current.id)

      if (error1) throw error1

      const { error: error2 } = await supabase
        .from('professionals')
        .update({ order: currentOrder })
        .eq('id', next.id)

      if (error2) throw error2

      await fetchProfessionals()
    } catch (error) {
      console.error('Erro ao mover profissional:', error)
      alert('Erro ao alterar ordem do profissional')
    }
  }

  const handlePhotoUpload = async (id: number, file: File) => {
    setUploadingPhoto(id)
    try {
      // Tentar upload para Supabase Storage (se o bucket existir)
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}-${Math.random()}.${fileExt}`
      const filePath = `professionals/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)

      if (uploadError) {
        // Se o bucket não existir, mostrar mensagem clara
        alert(
          '⚠️ Upload não disponível\n\n' +
          'O bucket "photos" não está configurado no Supabase Storage.\n\n' +
          '✅ Solução mais fácil:\n' +
          '1. Clique no botão "Colar URL" (verde)\n' +
          '2. Cole a URL da imagem no campo "URL da Foto"\n' +
          '3. Clique em "Salvar"\n\n' +
          '💡 Pode usar URLs de:\n' +
          '• Imgur (imgur.com)\n' +
          '• Google Drive (público)\n' +
          '• Qualquer site com imagem pública'
        )
        throw uploadError
      }

      // Obter URL pública
      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      // Atualizar profissional com a URL da foto
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ photo: data.publicUrl })
        .eq('id', id)

      if (updateError) {
        throw updateError
      }

      await fetchProfessionals()
      alert('Foto atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      // A mensagem já foi mostrada acima se for erro de bucket
      if (error && typeof error === 'object' && 'message' in error && !String(error.message).includes('bucket')) {
        alert('Erro ao fazer upload da foto. Use o botão "Colar URL" (verde) para adicionar uma URL de imagem diretamente.')
      }
    } finally {
      setUploadingPhoto(null)
    }
  }

  const startEdit = (professional: Professional) => {
    setEditingId(professional.id)
    setFormData(professional)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: '', title: '', speciality: '', description: '', photo: '' })
  }

  // Obter URL da imagem
  const obterImagem = (profissional: Professional) => {
    return profissional.photo || profissional.image || profissional.foto || null
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-robinhood-dark flex items-center justify-center">
        <p className="text-white">A carregar...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-robinhood-dark py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">
            Gestão de <span className="text-robinhood-green">Profissionais</span>
          </h1>
          {!isCreating && (
            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" />
              Adicionar Profissional
            </button>
          )}
        </div>

        {/* Create Form */}
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 mb-6"
          >
            <h2 className="text-2xl font-bold text-white mb-4">Novo Profissional</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Nome"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Título (opcional)"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Especialidade"
                value={formData.speciality || ''}
                onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                required
              />
              <textarea
                placeholder="Descrição/CV (opcional)"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
              />
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  URL da Foto (opcional) - Cole aqui a URL da imagem
                </label>
                <input
                  type="text"
                  placeholder="https://exemplo.com/imagem.jpg"
                  value={formData.photo || ''}
                  onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                  className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  💡 Pode usar URLs de imagens de qualquer site (ex: Imgur, Google Drive público, etc.)
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreate}
                  className="flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-4 py-2 rounded-lg font-semibold"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                >
                  <X className="w-4 h-4" />
                  Cancelar
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Professionals List */}
        <div className="space-y-4">
          {professionals.map((professional, index) => {
            const imagemUrl = obterImagem(professional)
            return (
              <motion.div
                key={professional.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-robinhood-card border border-robinhood-border rounded-xl p-6"
              >
                {editingId === professional.id ? (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                      />
                      <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                      />
                    </div>
                    <input
                      type="text"
                      value={formData.speciality || ''}
                      onChange={(e) => setFormData({ ...formData, speciality: e.target.value })}
                      className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                    />
                    <textarea
                      value={formData.description || ''}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                    />
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        URL da Foto - Cole aqui a URL da imagem
                      </label>
                      <input
                        type="text"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={formData.photo || ''}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        💡 Pode usar URLs de imagens de qualquer site (ex: Imgur, Google Drive público, etc.)
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(professional.id)}
                        className="flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-4 py-2 rounded-lg font-semibold"
                      >
                        <Save className="w-4 h-4" />
                        Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-6">
                    {/* Botões de Ordenação */}
                    <div className="flex flex-col gap-2 justify-center">
                      <button
                        onClick={() => moveUp(index)}
                        disabled={index === 0}
                        className={`p-2 rounded-lg transition-colors ${
                          index === 0
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-600 text-white hover:bg-gray-500'
                        }`}
                        title="Mover para cima"
                        aria-label="Mover para cima"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveDown(index)}
                        disabled={index === professionals.length - 1}
                        className={`p-2 rounded-lg transition-colors ${
                          index === professionals.length - 1
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-600 text-white hover:bg-gray-500'
                        }`}
                        title="Mover para baixo"
                        aria-label="Mover para baixo"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-robinhood-green flex-shrink-0 bg-robinhood-border flex items-center justify-center">
                      {imagemUrl ? (
                        <img
                          src={imagemUrl}
                          alt={professional.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `<span class="text-robinhood-green text-xl font-bold">${obterIniciais(professional.name)}</span>`
                            }
                          }}
                        />
                      ) : (
                        <span className="text-robinhood-green text-xl font-bold">
                          {obterIniciais(professional.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">{professional.name}</h3>
                      {professional.title && (
                        <p className="text-robinhood-green mb-2">{professional.title}</p>
                      )}
                      <p className="text-gray-300 mb-2">{professional.speciality}</p>
                      {professional.description && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{professional.description}</p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        <label className="cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handlePhotoUpload(professional.id, file)
                            }}
                            disabled={uploadingPhoto === professional.id}
                          />
                          <span className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                            {uploadingPhoto === professional.id ? (
                              'A fazer upload...'
                            ) : (
                              <>
                                <Upload className="w-4 h-4" />
                                Upload Foto
                              </>
                            )}
                          </span>
                        </label>
                        <button
                          onClick={() => {
                            startEdit(professional)
                            alert('💡 Dica: Cole a URL da imagem no campo "URL da Foto" e clique em "Salvar"')
                          }}
                          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                          title="Colar URL da imagem diretamente"
                        >
                          <Upload className="w-4 h-4" />
                          Colar URL
                        </button>
                        <button
                          onClick={() => startEdit(professional)}
                          className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(professional.id)}
                          className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {professionals.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <p className="text-gray-400 mb-4">Nenhum profissional cadastrado ainda.</p>
            <p className="text-gray-500 text-sm">
              Abra a consola do navegador (F12) para ver os logs de debug.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
