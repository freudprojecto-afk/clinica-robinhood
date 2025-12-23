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
  photo_url?: string  // Campo usado no Supabase
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
  const [movingProfessional, setMovingProfessional] = useState<number | null>(null)

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
      console.log('💾 Atualizando profissional ID:', id, 'com dados:', formData)
      
      // Preparar dados para atualização (incluir photo_url se photo estiver preenchido)
      const updateData: any = {
        name: formData.name,
        title: formData.title,
        speciality: formData.speciality,
        description: formData.description,
      }
      
      // Atualizar photo_url se photo estiver preenchido
      if (formData.photo) {
        updateData.photo_url = formData.photo
        updateData.photo = formData.photo  // Manter compatibilidade
      }

      console.log('📤 Dados a enviar:', updateData)

      const { error } = await supabase
        .from('professionals')
        .update(updateData)
        .eq('id', id)

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        throw error
      }

      console.log('✅ Profissional atualizado com sucesso!')
      await fetchProfessionals()
      setEditingId(null)
      setFormData({ name: '', title: '', speciality: '', description: '', photo: '' })
      alert('Profissional atualizado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao atualizar profissional:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao atualizar profissional: ${errorMsg}\n\nVerifique a consola (F12) para mais detalhes.`)
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

  // Função para inicializar ordem se não existir
  const inicializarOrdem = async () => {
    try {
      // Verificar se algum profissional tem order null ou undefined
      const precisaInicializar = professionals.some(p => p.order === null || p.order === undefined)
      
      if (precisaInicializar) {
        console.log('🔄 Inicializando ordem dos profissionais...')
        // Atualizar todos os profissionais com ordem baseada no índice atual
        for (let i = 0; i < professionals.length; i++) {
          const order = i + 1
          const { error } = await supabase
            .from('professionals')
            .update({ order })
            .eq('id', professionals[i].id)
          
          if (error) {
            console.warn(`⚠️ Erro ao inicializar ordem para ${professionals[i].name}:`, error)
            // Se o campo order não existir, continuar sem erro
            if (!error.message.includes('column') && !error.message.includes('order')) {
              throw error
            }
          }
        }
        await fetchProfessionals()
      }
    } catch (error) {
      console.error('Erro ao inicializar ordem:', error)
    }
  }

  // Função para mover profissional para cima (alternativa sem campo order)
  const moveUp = async (index: number) => {
    if (index === 0) {
      console.log('⚠️ Já está no topo')
      return
    }

    const current = professionals[index]
    const previous = professionals[index - 1]

    console.log(`⬆️ Movendo ${current.name} para cima (posição ${index} -> ${index - 1})`)
    setMovingProfessional(current.id)

    try {
      // Estratégia: Trocar os IDs temporariamente ou usar uma coluna auxiliar
      // Como alternativa, vamos tentar atualizar o campo order primeiro
      // Se falhar, vamos usar uma estratégia diferente
      
      const currentOrder = current.order ?? (index + 1)
      const previousOrder = previous.order ?? index

      console.log(`📊 Tentando atualizar ordem: ${current.name} (${currentOrder} -> ${previousOrder})`)

      // Tentar atualizar com campo order
      const { error: error1 } = await supabase
        .from('professionals')
        .update({ order: previousOrder })
        .eq('id', current.id)

      if (error1) {
        // Se o campo order não existir, usar estratégia alternativa
        if (error1.message.includes('column') || error1.message.includes('order') || error1.message.includes('does not exist')) {
          console.warn('⚠️ Campo order não existe, usando estratégia alternativa')
          
          // Estratégia alternativa: Reordenar usando uma atualização em lote
          // Criar um array com a nova ordem
          const novaOrdem = [...professionals]
          const temp = novaOrdem[index]
          novaOrdem[index] = novaOrdem[index - 1]
          novaOrdem[index - 1] = temp

          // Atualizar todos os profissionais com uma nova ordem sequencial
          for (let i = 0; i < novaOrdem.length; i++) {
            const { error: updateError } = await supabase
              .from('professionals')
              .update({ order: i + 1 })
              .eq('id', novaOrdem[i].id)

            if (updateError && !updateError.message.includes('column') && !updateError.message.includes('order')) {
              throw updateError
            }
          }

          alert(
            '⚠️ Campo "order" não encontrado na base de dados!\n\n' +
            'A ordenação foi aplicada localmente, mas precisa adicionar a coluna "order" no Supabase para persistir.\n\n' +
            'Passos:\n' +
            '1. Vá ao Supabase Dashboard\n' +
            '2. Table Editor > professionals\n' +
            '3. Clique em "Add Column"\n' +
            '4. Nome: "order", Tipo: "int8", Nullable: Sim\n' +
            '5. Clique em "Save"'
          )
        } else {
          alert(`Erro ao atualizar ordem: ${error1.message}`)
          throw error1
        }
      } else {
        // Se o update funcionou, atualizar o outro profissional
        const { error: error2 } = await supabase
          .from('professionals')
          .update({ order: currentOrder })
          .eq('id', previous.id)

        if (error2) {
          console.error('❌ Erro ao atualizar profissional anterior:', error2)
          throw error2
        }

        console.log('✅ Ordem atualizada com sucesso!')
      }

      await fetchProfessionals()
    } catch (error) {
      console.error('❌ Erro ao mover profissional:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao alterar ordem: ${errorMsg}\n\nVerifique a consola (F12) para mais detalhes.`)
    } finally {
      setMovingProfessional(null)
    }
  }

  // Função para mover profissional para baixo (alternativa sem campo order)
  const moveDown = async (index: number) => {
    if (index === professionals.length - 1) {
      console.log('⚠️ Já está no final')
      return
    }

    const current = professionals[index]
    const next = professionals[index + 1]

    console.log(`⬇️ Movendo ${current.name} para baixo (posição ${index} -> ${index + 1})`)
    setMovingProfessional(current.id)

    try {
      const currentOrder = current.order ?? (index + 1)
      const nextOrder = next.order ?? (index + 2)

      console.log(`📊 Tentando atualizar ordem: ${current.name} (${currentOrder} -> ${nextOrder})`)

      // Tentar atualizar com campo order
      const { error: error1 } = await supabase
        .from('professionals')
        .update({ order: nextOrder })
        .eq('id', current.id)

      if (error1) {
        // Se o campo order não existir, usar estratégia alternativa
        if (error1.message.includes('column') || error1.message.includes('order') || error1.message.includes('does not exist')) {
          console.warn('⚠️ Campo order não existe, usando estratégia alternativa')
          
          // Estratégia alternativa: Reordenar usando uma atualização em lote
          const novaOrdem = [...professionals]
          const temp = novaOrdem[index]
          novaOrdem[index] = novaOrdem[index + 1]
          novaOrdem[index + 1] = temp

          // Atualizar todos os profissionais com uma nova ordem sequencial
          for (let i = 0; i < novaOrdem.length; i++) {
            const { error: updateError } = await supabase
              .from('professionals')
              .update({ order: i + 1 })
              .eq('id', novaOrdem[i].id)

            if (updateError && !updateError.message.includes('column') && !updateError.message.includes('order')) {
              throw updateError
            }
          }

          alert(
            '⚠️ Campo "order" não encontrado na base de dados!\n\n' +
            'A ordenação foi aplicada localmente, mas precisa adicionar a coluna "order" no Supabase para persistir.\n\n' +
            'Passos:\n' +
            '1. Vá ao Supabase Dashboard\n' +
            '2. Table Editor > professionals\n' +
            '3. Clique em "Add Column"\n' +
            '4. Nome: "order", Tipo: "int8", Nullable: Sim\n' +
            '5. Clique em "Save"'
          )
        } else {
          alert(`Erro ao atualizar ordem: ${error1.message}`)
          throw error1
        }
      } else {
        // Se o update funcionou, atualizar o outro profissional
        const { error: error2 } = await supabase
          .from('professionals')
          .update({ order: currentOrder })
          .eq('id', next.id)

        if (error2) {
          console.error('❌ Erro ao atualizar próximo profissional:', error2)
          throw error2
        }

        console.log('✅ Ordem atualizada com sucesso!')
      }

      await fetchProfessionals()
    } catch (error) {
      console.error('❌ Erro ao mover profissional:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao alterar ordem: ${errorMsg}\n\nVerifique a consola (F12) para mais detalhes.`)
    } finally {
      setMovingProfessional(null)
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
    console.log('✏️ Iniciando edição de:', professional)
    setEditingId(professional.id)
    const photoUrl = professional.photo_url || professional.photo || professional.image || professional.foto || ''
    setFormData({
      name: professional.name || '',
      title: professional.title || '',
      speciality: professional.speciality || '',
      description: professional.description || '',
      photo: photoUrl,
    })
    console.log('📝 FormData definido:', {
      name: professional.name || '',
      title: professional.title || '',
      speciality: professional.speciality || '',
      description: professional.description || '',
      photo: photoUrl,
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: '', title: '', speciality: '', description: '', photo: '' })
  }

  // Obter URL da imagem
  const obterImagem = (profissional: Professional) => {
    return profissional.photo_url || profissional.photo || profissional.image || profissional.foto || null
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
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Nome</label>
                        <input
                          type="text"
                          value={formData.name || ''}
                          onChange={(e) => {
                            console.log('✏️ Nome alterado:', e.target.value)
                            setFormData({ ...formData, name: e.target.value })
                          }}
                          className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green"
                          placeholder="Nome completo"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Título (opcional)</label>
                        <input
                          type="text"
                          value={formData.title || ''}
                          onChange={(e) => {
                            console.log('✏️ Título alterado:', e.target.value)
                            setFormData({ ...formData, title: e.target.value })
                          }}
                          className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green"
                          placeholder="Ex: Médica Psiquiatra"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Especialidade</label>
                      <input
                        type="text"
                        value={formData.speciality || ''}
                        onChange={(e) => {
                          console.log('✏️ Especialidade alterada:', e.target.value)
                          setFormData({ ...formData, speciality: e.target.value })
                        }}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green"
                        placeholder="Ex: Psiquiatria"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Descrição/CV (opcional)</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => {
                          console.log('✏️ Descrição alterada:', e.target.value)
                          setFormData({ ...formData, description: e.target.value })
                        }}
                        rows={4}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green resize-y"
                        placeholder="Descrição ou currículo completo do profissional..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">
                        URL da Foto - Cole aqui a URL da imagem
                      </label>
                      <input
                        type="text"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={formData.photo || ''}
                        onChange={(e) => {
                          console.log('✏️ URL da foto alterada:', e.target.value)
                          setFormData({ ...formData, photo: e.target.value })
                        }}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green"
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
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('🔼 Botão mover para cima clicado para índice:', index)
                          moveUp(index)
                        }}
                        disabled={index === 0 || movingProfessional === professional.id}
                        className={`p-2 rounded-lg transition-colors ${
                          index === 0 || movingProfessional === professional.id
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-600 text-white hover:bg-gray-500 active:bg-gray-400'
                        }`}
                        title="Mover para cima"
                        aria-label="Mover para cima"
                      >
                        {movingProfessional === professional.id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <ArrowUp className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('🔽 Botão mover para baixo clicado para índice:', index)
                          moveDown(index)
                        }}
                        disabled={index === professionals.length - 1 || movingProfessional === professional.id}
                        className={`p-2 rounded-lg transition-colors ${
                          index === professionals.length - 1 || movingProfessional === professional.id
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gray-600 text-white hover:bg-gray-500 active:bg-gray-400'
                        }`}
                        title="Mover para baixo"
                        aria-label="Mover para baixo"
                      >
                        {movingProfessional === professional.id ? (
                          <span className="text-xs">...</span>
                        ) : (
                          <ArrowDown className="w-4 h-4" />
                        )}
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
