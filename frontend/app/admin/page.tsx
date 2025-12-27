'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Upload, ArrowUp, ArrowDown, Save, X, Star, FileText } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Professional {
  id: string  // UUID no Supabase
  name: string
  title?: string
  speciality?: string  // Pode ser speciality ou specialty
  specialty?: string  // Campo usado no Supabase
  description?: string
  cv?: string  // Campo usado no Supabase (em vez de description)
  photo?: string
  photo_url?: string  // Campo usado no Supabase
  image?: string
  foto?: string
  order?: number  // Campo para ordenação
}

interface Service {
  id: string  // UUID no Supabase
  title: string
  description: string
  image_url?: string  // URL da imagem de fundo
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

export default function AdminPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)  // UUID é string
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Partial<Professional>>({
    name: '',
    title: '',
    speciality: '',
    description: '',
    photo: '',
  })
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)  // UUID é string
  const [movingProfessional, setMovingProfessional] = useState<string | null>(null)  // UUID é string

  // Estados para gestão de serviços
  const [activeTab, setActiveTab] = useState<'profissionais' | 'servicos' | 'depoimentos'>('profissionais')
  const [services, setServices] = useState<Service[]>([])
  const [isLoadingServices, setIsLoadingServices] = useState(true)
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null)
  const [isCreatingService, setIsCreatingService] = useState(false)
  const [serviceFormData, setServiceFormData] = useState<Partial<Service>>({
    title: '',
    description: '',
    image_url: '',
  })
  const [uploadingServiceImage, setUploadingServiceImage] = useState<string | null>(null)
  const [movingService, setMovingService] = useState<string | null>(null)

  // Estados para gestão de depoimentos
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoadingTestimonials, setIsLoadingTestimonials] = useState(true)
  const [editingTestimonialId, setEditingTestimonialId] = useState<string | null>(null)
  const [isCreatingTestimonial, setIsCreatingTestimonial] = useState(false)
  const [testimonialFormData, setTestimonialFormData] = useState<Partial<Testimonial>>({
    name: '',
    text: '',
    rating: 5,
  })
  const [movingTestimonial, setMovingTestimonial] = useState<string | null>(null)

  // Estados para gestão de Sobre Nós
  const [aboutSection, setAboutSection] = useState<AboutSection | null>(null)
  const [isLoadingAbout, setIsLoadingAbout] = useState(true)
  const [aboutFeatures, setAboutFeatures] = useState<AboutFeature[]>([])
  const [isLoadingFeatures, setIsLoadingFeatures] = useState(true)
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null)
  const [isCreatingFeature, setIsCreatingFeature] = useState(false)
  const [featureFormData, setFeatureFormData] = useState<Partial<AboutFeature>>({
    title: '',
    description: '',
    icon_name: '',
    icon_url: '',
  })
  const [movingFeature, setMovingFeature] = useState<string | null>(null)

  useEffect(() => {
    // Verificar se o Supabase está configurado
    console.log('🔧 Verificando configuração do Supabase...')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL || 'NÃO CONFIGURADO')
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'NÃO CONFIGURADO')
    
    fetchProfessionals()
    fetchServices()
    fetchTestimonials()
    fetchAboutSection()
    fetchAboutFeatures()
  }, [])

  const fetchProfessionals = async () => {
    try {
      setIsLoading(true)
      console.log('🔍 A buscar profissionais do Supabase...')
      
      // IMPORTANTE: Especificar explicitamente as colunas (sem 'description')
      const { data, error } = await supabase
        .from('professionals')
        .select('id, name, title, specialty, cv, photo_url, order, created_at, updated_at')
        // Ordenar por order se existir, senão por name
        .order('order', { ascending: true, nullsFirst: true })
        .order('name', { ascending: true })

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
        ? Math.max(...professionals.map(p => p.order ?? 0), 0)
        : 0
      
      const newOrder = maxOrder + 1

      // IMPORTANTE: A base de dados usa 'specialty' e 'cv', não 'speciality' e 'description'
      const insertData: any = {
        name: formData.name || '',
        title: formData.title || null,
        specialty: formData.speciality || '',  // Usar specialty (nome correto na BD)
        cv: formData.description || null,  // Usar cv (nome correto na BD)
        order: newOrder,
      }
      
      // Adicionar photo_url se existir
      if (formData.photo && formData.photo.trim() !== '') {
        insertData.photo_url = formData.photo.trim()
      }

      console.log('📤 Dados a inserir:', insertData)
      
      // IMPORTANTE: Especificar explicitamente as colunas a retornar (sem 'description')
      const { data, error } = await supabase
        .from('professionals')
        .insert([insertData])
        .select('id, name, title, specialty, cv, photo_url, order, created_at, updated_at')

      if (error) {
        console.error('❌ Erro do Supabase ao criar:', error)
        alert(`Erro ao criar profissional: ${error.message}\n\nVerifique a consola (F12) para mais detalhes.`)
        throw error
      }

      console.log('✅ Profissional criado com sucesso! Dados retornados:', data)
      
      await fetchProfessionals()
      setIsCreating(false)
      setFormData({ name: '', title: '', speciality: '', description: '', photo: '' })
      alert('✅ Profissional criado com sucesso!')
    } catch (error) {
      console.error('❌ Erro ao criar profissional:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao criar profissional: ${errorMsg}\n\nVerifique a consola (F12) para mais detalhes.`)
    }
  }

  const handleUpdate = async (id: string) => {  // UUID é string
    try {
      console.log('💾 Atualizando profissional ID:', id, 'com dados:', formData)
      
      // Preparar dados para atualização (incluir photo_url se photo estiver preenchido)
      // IMPORTANTE: A base de dados usa 'specialty' e 'cv', não 'speciality' e 'description'
      const updateData: any = {
        name: formData.name || '',
        title: formData.title || null,
        specialty: formData.speciality || formData.specialty || '',  // Usar specialty (nome correto na BD)
        cv: formData.description || formData.cv || null,  // Usar cv (nome correto na BD)
      }
      
      // Atualizar photo_url se photo estiver preenchido
      // IMPORTANTE: A base de dados usa 'photo_url', não 'photo'
      if (formData.photo && formData.photo.trim() !== '') {
        updateData.photo_url = formData.photo.trim()
      }

      console.log('📤 Dados a enviar:', updateData)

      // IMPORTANTE: Especificar explicitamente as colunas a retornar (sem 'description' e sem 'photo')
      const { data, error } = await supabase
        .from('professionals')
        .update(updateData)
        .eq('id', id)
        .select('id, name, title, specialty, cv, photo_url, order, created_at, updated_at')

      if (error) {
        console.error('❌ Erro do Supabase:', error)
        alert(`Erro ao atualizar: ${error.message}\n\nVerifique a consola (F12) para mais detalhes.`)
        throw error
      }

      console.log('✅ Profissional atualizado com sucesso! Dados retornados:', data)
      
      // Recarregar os dados
      await fetchProfessionals()
      
      // Limpar o formulário
      setEditingId(null)
      setFormData({ name: '', title: '', speciality: '', description: '', photo: '' })
      
      alert('✅ Profissional atualizado com sucesso!\n\nAs alterações foram salvas na base de dados.')
    } catch (error) {
      console.error('❌ Erro ao atualizar profissional:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao atualizar profissional: ${errorMsg}\n\nVerifique a consola (F12) para mais detalhes.`)
    }
  }

  const handleDelete = async (id: string) => {  // UUID é string
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
      // Verificar se algum profissional tem order null, undefined ou 0
      const precisaInicializar = professionals.some(p => p.order === null || p.order === undefined || p.order === 0)
      
      if (precisaInicializar) {
        console.log('🔄 Inicializando ordem dos profissionais...')
        // Atualizar todos os profissionais com ordem baseada no índice atual
        for (let i = 0; i < professionals.length; i++) {
          const order = i + 1
          const { error } = await supabase
            .from('professionals')
            .update({ order })
            .eq('id', professionals[i].id)
            .select('id, name, order')
          
          if (error) {
            console.warn(`⚠️ Erro ao inicializar ordem para ${professionals[i].name}:`, error)
            // Se o campo order não existir, continuar sem erro
            if (!error.message.includes('column') && !error.message.includes('order')) {
              throw error
            }
          }
        }
        // Recarregar após inicializar
        await fetchProfessionals()
      }
    } catch (error) {
      console.error('Erro ao inicializar ordem:', error)
    }
  }

  // Função para mover profissional para cima
  const moveUp = async (index: number) => {
    if (index === 0) {
      alert('Este profissional já está no topo da lista!')
      return
    }

    const current = professionals[index]
    const previous = professionals[index - 1]

    console.log(`⬆️ Movendo ${current.name} para cima (posição ${index} -> ${index - 1})`)
    console.log('📋 Profissional atual:', current)
    console.log('📋 Profissional anterior:', previous)
    setMovingProfessional(current.id)

    try {
      // Primeiro, tentar inicializar ordem se necessário
      await inicializarOrdem()
      
      // Recarregar profissionais para obter valores atualizados
      const { data: refreshedData } = await supabase
        .from('professionals')
        .select('id, name, order')
        .order('order', { ascending: true, nullsFirst: true })
        .order('name', { ascending: true })
      
      if (!refreshedData) {
        throw new Error('Não foi possível recarregar os profissionais')
      }
      
      // Encontrar os profissionais atualizados pelo ID
      const updatedCurrent = refreshedData.find(p => p.id === current.id)
      const updatedPrevious = refreshedData.find(p => p.id === previous.id)
      
      if (!updatedCurrent || !updatedPrevious) {
        throw new Error('Não foi possível encontrar os profissionais atualizados')
      }
      
      // Obter ordens atuais (usar valores atualizados)
      const currentOrder = updatedCurrent.order ?? (index + 1)
      const previousOrder = updatedPrevious.order ?? index

      console.log(`📊 Ordens: atual=${currentOrder}, anterior=${previousOrder}`)
      console.log(`🔄 Atualizando ${updatedCurrent.name} (ID: ${updatedCurrent.id}) para order=${previousOrder}`)
      console.log(`🔄 Atualizando ${updatedPrevious.name} (ID: ${updatedPrevious.id}) para order=${currentOrder}`)

      // Trocar as ordens
      const { data: data1, error: error1 } = await supabase
        .from('professionals')
        .update({ order: previousOrder })
        .eq('id', updatedCurrent.id)
        .select('id, name, order')

      if (error1) {
        console.error('❌ Erro ao atualizar ordem:', error1)
        if (error1.message.includes('column') || error1.message.includes('order') || error1.message.includes('does not exist')) {
          alert(
            '⚠️ Campo "order" não encontrado na base de dados!\n\n' +
            'Por favor, adicione a coluna "order" na tabela "professionals" no Supabase.\n\n' +
            'Passos:\n' +
            '1. Vá ao Supabase Dashboard (https://supabase.com)\n' +
            '2. Selecione o seu projeto\n' +
            '3. Vá a "Table Editor" > "professionals"\n' +
            '4. Clique em "Add Column"\n' +
            '5. Nome: "order"\n' +
            '6. Tipo: "int8" ou "integer"\n' +
            '7. Nullable: Sim (marcar)\n' +
            '8. Clique em "Save"\n\n' +
            'Depois disso, recarregue a página e tente novamente!'
          )
        } else {
          alert(`Erro: ${error1.message}\n\nVerifique a consola (F12) para mais detalhes.`)
        }
        throw error1
      }

      console.log('✅ Primeira atualização bem-sucedida:', data1)

      const { data: data2, error: error2 } = await supabase
        .from('professionals')
        .update({ order: currentOrder })
        .eq('id', updatedPrevious.id)
        .select('id, name, order')

      if (error2) {
        console.error('❌ Erro ao atualizar profissional anterior:', error2)
        // Reverter a primeira atualização
        await supabase
          .from('professionals')
          .update({ order: currentOrder })
          .eq('id', updatedCurrent.id)
        throw error2
      }

      console.log('✅ Segunda atualização bem-sucedida:', data2)
      console.log('✅ Ordem atualizada com sucesso!')
      
      // Recarregar os dados antes de mostrar o alert
      await fetchProfessionals()
      
      // Verificar se a ordenação foi aplicada
      const { data: verifyData } = await supabase
        .from('professionals')
        .select('id, name, order')
        .order('order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true })
      
      console.log('🔍 Verificação da ordem após atualização:', verifyData)
      
      alert(`✅ ${updatedCurrent.name} movido para cima com sucesso!\n\nA ordem foi atualizada na base de dados.`)
    } catch (error) {
      console.error('❌ Erro ao mover profissional:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao alterar ordem: ${errorMsg}\n\nVerifique a consola (F12) para mais detalhes.`)
    } finally {
      setMovingProfessional(null)
    }
  }

  // Função para mover profissional para baixo
  const moveDown = async (index: number) => {
    if (index === professionals.length - 1) {
      alert('Este profissional já está no final da lista!')
      return
    }

    const current = professionals[index]
    const next = professionals[index + 1]

    console.log(`⬇️ Movendo ${current.name} para baixo (posição ${index} -> ${index + 1})`)
    console.log('📋 Profissional atual:', current)
    console.log('📋 Profissional próximo:', next)
    setMovingProfessional(current.id)

    try {
      // Primeiro, tentar inicializar ordem se necessário
      await inicializarOrdem()
      
      // Recarregar profissionais para obter valores atualizados
      const { data: refreshedData } = await supabase
        .from('professionals')
        .select('id, name, order')
        .order('order', { ascending: true, nullsFirst: true })
        .order('name', { ascending: true })
      
      if (!refreshedData) {
        throw new Error('Não foi possível recarregar os profissionais')
      }
      
      // Encontrar os profissionais atualizados pelo ID
      const updatedCurrent = refreshedData.find(p => p.id === current.id)
      const updatedNext = refreshedData.find(p => p.id === next.id)
      
      if (!updatedCurrent || !updatedNext) {
        throw new Error('Não foi possível encontrar os profissionais atualizados')
      }
      
      // Obter ordens atuais (usar valores atualizados)
      const currentOrder = updatedCurrent.order ?? (index + 1)
      const nextOrder = updatedNext.order ?? (index + 2)

      console.log(`📊 Ordens: atual=${currentOrder}, próximo=${nextOrder}`)
      console.log(`🔄 Atualizando ${updatedCurrent.name} (ID: ${updatedCurrent.id}) para order=${nextOrder}`)
      console.log(`🔄 Atualizando ${updatedNext.name} (ID: ${updatedNext.id}) para order=${currentOrder}`)

      // Trocar as ordens
      const { data: data1, error: error1 } = await supabase
        .from('professionals')
        .update({ order: nextOrder })
        .eq('id', updatedCurrent.id)
        .select('id, name, order')

      if (error1) {
        console.error('❌ Erro ao atualizar ordem:', error1)
        if (error1.message.includes('column') || error1.message.includes('order') || error1.message.includes('does not exist')) {
          alert(
            '⚠️ Campo "order" não encontrado na base de dados!\n\n' +
            'Por favor, adicione a coluna "order" na tabela "professionals" no Supabase.\n\n' +
            'Passos:\n' +
            '1. Vá ao Supabase Dashboard (https://supabase.com)\n' +
            '2. Selecione o seu projeto\n' +
            '3. Vá a "Table Editor" > "professionals"\n' +
            '4. Clique em "Add Column"\n' +
            '5. Nome: "order"\n' +
            '6. Tipo: "int8" ou "integer"\n' +
            '7. Nullable: Sim (marcar)\n' +
            '8. Clique em "Save"\n\n' +
            'Depois disso, recarregue a página e tente novamente!'
          )
        } else {
          alert(`Erro: ${error1.message}\n\nVerifique a consola (F12) para mais detalhes.`)
        }
        throw error1
      }

      console.log('✅ Primeira atualização bem-sucedida:', data1)

      const { data: data2, error: error2 } = await supabase
        .from('professionals')
        .update({ order: currentOrder })
        .eq('id', updatedNext.id)
        .select('id, name, order')

      if (error2) {
        console.error('❌ Erro ao atualizar próximo profissional:', error2)
        // Reverter a primeira atualização
        await supabase
          .from('professionals')
          .update({ order: currentOrder })
          .eq('id', updatedCurrent.id)
        throw error2
      }

      console.log('✅ Segunda atualização bem-sucedida:', data2)
      console.log('✅ Ordem atualizada com sucesso!')
      
      // Recarregar os dados antes de mostrar o alert
      await fetchProfessionals()
      
      // Verificar se a ordenação foi aplicada
      const { data: verifyData } = await supabase
        .from('professionals')
        .select('id, name, order')
        .order('order', { ascending: true, nullsFirst: false })
        .order('name', { ascending: true })
      
      console.log('🔍 Verificação da ordem após atualização:', verifyData)
      
      alert(`✅ ${updatedCurrent.name} movido para baixo com sucesso!\n\nA ordem foi atualizada na base de dados.`)
    } catch (error) {
      console.error('❌ Erro ao mover profissional:', error)
      const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`❌ Erro ao alterar ordem: ${errorMsg}\n\nVerifique a consola (F12) para mais detalhes.`)
    } finally {
      setMovingProfessional(null)
    }
  }

  const handlePhotoUpload = async (id: string, file: File) => {  // UUID é string
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
      // IMPORTANTE: A base de dados usa 'photo_url', não 'photo'
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ photo_url: data.publicUrl })
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

  // ========== FUNÇÕES PARA SERVIÇOS ==========
  
  const fetchServices = async () => {
    try {
      setIsLoadingServices(true)
      console.log('🔍 A buscar serviços do Supabase...')
      
      const { data, error } = await supabase
        .from('services')
        .select('id, title, description, image_url, order')
        .order('order', { ascending: true, nullsFirst: true })
        .order('title', { ascending: true })

      console.log('📊 Resposta do Supabase (serviços):', { data, error })

      if (error) {
        // Se a tabela não existir, criar array vazio
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          console.warn('⚠️ Tabela "services" não existe ainda. Será criada quando adicionar o primeiro serviço.')
          setServices([])
          return
        }
        console.error('❌ Erro do Supabase:', error)
        alert(`Erro ao carregar serviços: ${error.message}`)
        throw error
      }

      if (data) {
        console.log(`✅ ${data.length} serviços encontrados:`, data)
        setServices(data)
      } else {
        console.warn('⚠️ Nenhum dado retornado do Supabase')
        setServices([])
      }
    } catch (error) {
      console.error('❌ Erro ao buscar serviços:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      // Não mostrar alerta se for apenas porque a tabela não existe
      if (!errorMessage.includes('does not exist') && !errorMessage.includes('relation')) {
        alert(`Erro ao carregar serviços: ${errorMessage}`)
      }
      setServices([])
    } finally {
      setIsLoadingServices(false)
    }
  }

  const handleCreateService = async () => {
    try {
      const maxOrder = services.length > 0 
        ? Math.max(...services.map(s => s.order ?? 0), 0)
        : 0
      
      const newOrder = maxOrder + 1

      const insertData: any = {
        title: serviceFormData.title || '',
        description: serviceFormData.description || '',
        image_url: serviceFormData.image_url || null,
        order: newOrder,
      }

      const { data, error } = await supabase
        .from('services')
        .insert(insertData)
        .select('id, title, description, image_url, order')

      if (error) {
        console.error('Erro ao criar serviço:', error)
        alert(`Erro ao criar serviço: ${error.message}`)
        throw error
      }

      if (data && data[0]) {
        setServices([...services, data[0]])
        setServiceFormData({ title: '', description: '', image_url: '' })
        setIsCreatingService(false)
        alert('Serviço criado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao criar serviço:', error)
    }
  }

  const handleUpdateService = async (id: string) => {
    try {
      const updateData: any = {
        title: serviceFormData.title || '',
        description: serviceFormData.description || '',
        image_url: serviceFormData.image_url || null,
      }

      const { data, error } = await supabase
        .from('services')
        .update(updateData)
        .eq('id', id)
        .select('id, title, description, image_url, order')

      if (error) {
        console.error('Erro ao atualizar serviço:', error)
        alert(`Erro ao atualizar serviço: ${error.message}`)
        throw error
      }

      if (data && data[0]) {
        setServices(services.map(s => s.id === id ? data[0] : s))
        setEditingServiceId(null)
        setServiceFormData({ title: '', description: '', image_url: '' })
        alert('Serviço atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir serviço:', error)
        alert(`Erro ao excluir serviço: ${error.message}`)
        throw error
      }

      setServices(services.filter(s => s.id !== id))
      alert('Serviço excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir serviço:', error)
    }
  }

  const handleServiceImageUpload = async (id: string, file: File) => {
    setUploadingServiceImage(id)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${id}-${Math.random()}.${fileExt}`
      const filePath = `services/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, file)

      if (uploadError) {
        alert(
          '⚠️ Upload não disponível\n\n' +
          'O bucket "photos" não está configurado no Supabase Storage.\n\n' +
          '✅ Solução mais fácil:\n' +
          '1. Clique no botão "Colar URL" (verde)\n' +
          '2. Cole a URL da imagem no campo "URL da Imagem"\n' +
          '3. Clique em "Salvar"\n\n' +
          '💡 Pode usar URLs de:\n' +
          '• Imgur (imgur.com)\n' +
          '• Google Drive (público)\n' +
          '• Qualquer site com imagem pública'
        )
        throw uploadError
      }

      const { data } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      const { error: updateError } = await supabase
        .from('services')
        .update({ image_url: data.publicUrl })
        .eq('id', id)

      if (updateError) {
        console.error('Erro ao atualizar imagem do serviço:', updateError)
        alert(`Erro ao atualizar imagem: ${updateError.message}`)
        throw updateError
      }

      await fetchServices()
      alert('Imagem do serviço atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao fazer upload da imagem do serviço:', error)
    } finally {
      setUploadingServiceImage(null)
    }
  }

  const startEditService = (service: Service) => {
    setEditingServiceId(service.id)
    setServiceFormData({
      title: service.title,
      description: service.description,
      image_url: service.image_url || '',
    })
  }

  const cancelEditService = () => {
    setEditingServiceId(null)
    setServiceFormData({ title: '', description: '', image_url: '' })
  }

  // ========== FUNÇÕES PARA DEPOIMENTOS ==========
  
  const fetchTestimonials = async () => {
    try {
      setIsLoadingTestimonials(true)
      console.log('🔍 A buscar depoimentos do Supabase...')
      
      const { data, error } = await supabase
        .from('testimonials')
        .select('id, name, text, rating, order')
        .order('order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: false })

      console.log('📊 Resposta do Supabase (depoimentos):', { data, error })

      if (error) {
        // Se a tabela não existir, criar array vazio
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          console.warn('⚠️ Tabela "testimonials" não existe ainda. Será criada quando adicionar o primeiro depoimento.')
          setTestimonials([])
          setIsLoadingTestimonials(false)
          return
        }
        console.error('❌ Erro do Supabase:', error)
        alert(`Erro ao carregar depoimentos: ${error.message}`)
        throw error
      }

      if (data) {
        console.log(`✅ ${data.length} depoimentos encontrados:`, data)
        setTestimonials(data)
      } else {
        console.warn('⚠️ Nenhum dado retornado do Supabase')
        setTestimonials([])
      }
    } catch (error) {
      console.error('❌ Erro ao buscar depoimentos:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      // Não mostrar alerta se for apenas porque a tabela não existe
      if (!errorMessage.includes('does not exist') && !errorMessage.includes('relation')) {
        alert(`Erro ao carregar depoimentos: ${errorMessage}`)
      }
      setTestimonials([])
    } finally {
      setIsLoadingTestimonials(false)
    }
  }

  const handleCreateTestimonial = async () => {
    try {
      const maxOrder = testimonials.length > 0 
        ? Math.max(...testimonials.map(t => t.order ?? 0), 0)
        : 0
      
      const newOrder = maxOrder + 1

      const insertData: any = {
        name: testimonialFormData.name || '',
        text: testimonialFormData.text || '',
        rating: testimonialFormData.rating || 5,
        order: newOrder,
      }

      const { data, error } = await supabase
        .from('testimonials')
        .insert(insertData)
        .select('id, name, text, rating, order')

      if (error) {
        console.error('Erro ao criar depoimento:', error)
        alert(`Erro ao criar depoimento: ${error.message}`)
        throw error
      }

      if (data && data[0]) {
        setTestimonials([...testimonials, data[0]])
        setTestimonialFormData({ name: '', text: '', rating: 5 })
        setIsCreatingTestimonial(false)
        alert('Depoimento criado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao criar depoimento:', error)
    }
  }

  const handleUpdateTestimonial = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .update({
          name: testimonialFormData.name || '',
          text: testimonialFormData.text || '',
          rating: testimonialFormData.rating || 5,
        })
        .eq('id', id)
        .select('id, name, text, rating, order')

      if (error) {
        console.error('Erro ao atualizar depoimento:', error)
        alert(`Erro ao atualizar depoimento: ${error.message}`)
        throw error
      }

      if (data && data[0]) {
        setTestimonials(testimonials.map(t => t.id === id ? data[0] : t))
        setEditingTestimonialId(null)
        setTestimonialFormData({ name: '', text: '', rating: 5 })
        alert('Depoimento atualizado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar depoimento:', error)
    }
  }

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este depoimento?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir depoimento:', error)
        alert(`Erro ao excluir depoimento: ${error.message}`)
        throw error
      }

      setTestimonials(testimonials.filter(t => t.id !== id))
      alert('Depoimento excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir depoimento:', error)
    }
  }

  const startEditTestimonial = (testimonial: Testimonial) => {
    setEditingTestimonialId(testimonial.id)
    setTestimonialFormData({
      name: testimonial.name,
      text: testimonial.text,
      rating: testimonial.rating,
    })
  }

  const cancelEditTestimonial = () => {
    setEditingTestimonialId(null)
    setTestimonialFormData({ name: '', text: '', rating: 5 })
  }

  const moveTestimonial = async (id: string, direction: 'up' | 'down') => {
    const index = testimonials.findIndex(t => t.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= testimonials.length) return

    const testimonial = testimonials[index]
    const otherTestimonial = testimonials[newIndex]

    setMovingTestimonial(id)

    try {
      // Trocar os valores de order
      const tempOrder = testimonial.order ?? 0
      const otherOrder = otherTestimonial.order ?? 0

      await supabase
        .from('testimonials')
        .update({ order: otherOrder })
        .eq('id', id)

      await supabase
        .from('testimonials')
        .update({ order: tempOrder })
        .eq('id', otherTestimonial.id)

      // Atualizar estado local
      const newTestimonials = [...testimonials]
      ;[newTestimonials[index], newTestimonials[newIndex]] = [newTestimonials[newIndex], newTestimonials[index]]
      setTestimonials(newTestimonials)
    } catch (error) {
      console.error('Erro ao mover depoimento:', error)
      alert('Erro ao mover depoimento. Tente novamente.')
    } finally {
      setMovingTestimonial(null)
    }
  }

  // ========== FUNÇÕES PARA SOBRE NÓS ==========
  
  const fetchAboutSection = async () => {
    try {
      setIsLoadingAbout(true)
      console.log('🔍 A buscar texto principal da secção Sobre Nós...')
      
      const { data, error } = await supabase
        .from('about_section')
        .select('*')
        .limit(1)
        .maybeSingle()

      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          console.warn('⚠️ Tabela "about_section" não existe ainda.')
          setAboutSection(null)
          setIsLoadingAbout(false)
          return
        }
        console.error('❌ Erro do Supabase:', error)
        throw error
      }

      if (data) {
        console.log('✅ Texto principal encontrado:', data)
        setAboutSection(data)
      } else {
        console.warn('⚠️ Nenhum texto principal encontrado')
        setAboutSection(null)
      }
    } catch (error) {
      console.error('❌ Erro ao buscar texto principal:', error)
      setAboutSection(null)
    } finally {
      setIsLoadingAbout(false)
    }
  }

  const updateAboutSection = async (text: string) => {
    try {
      if (aboutSection) {
        // Atualizar existente
        const { data, error } = await supabase
          .from('about_section')
          .update({ main_text: text })
          .eq('id', aboutSection.id)
          .select()
          .single()

        if (error) throw error
        if (data) setAboutSection(data)
        alert('Texto principal atualizado com sucesso!')
      } else {
        // Criar novo
        const { data, error } = await supabase
          .from('about_section')
          .insert({ main_text: text })
          .select()
          .single()

        if (error) throw error
        if (data) setAboutSection(data)
        alert('Texto principal criado com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar texto principal:', error)
      alert(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  const fetchAboutFeatures = async () => {
    try {
      setIsLoadingFeatures(true)
      console.log('🔍 A buscar features da secção Sobre Nós...')
      
      const { data, error } = await supabase
        .from('about_features')
        .select('*')
        .order('order', { ascending: true, nullsFirst: true })
        .order('created_at', { ascending: true })

      if (error) {
        if (error.message.includes('does not exist') || error.message.includes('relation')) {
          console.warn('⚠️ Tabela "about_features" não existe ainda.')
          setAboutFeatures([])
          setIsLoadingFeatures(false)
          return
        }
        console.error('❌ Erro do Supabase:', error)
        throw error
      }

      if (data) {
        console.log(`✅ ${data.length} features encontradas:`, data)
        setAboutFeatures(data)
      } else {
        setAboutFeatures([])
      }
    } catch (error) {
      console.error('❌ Erro ao buscar features:', error)
      setAboutFeatures([])
    } finally {
      setIsLoadingFeatures(false)
    }
  }

  const handleCreateFeature = async () => {
    try {
      const maxOrder = aboutFeatures.length > 0 
        ? Math.max(...aboutFeatures.map(f => f.order ?? 0), 0)
        : 0
      
      const newOrder = maxOrder + 1

      const insertData: any = {
        title: featureFormData.title || '',
        description: featureFormData.description || '',
        icon_name: featureFormData.icon_name || null,
        icon_url: featureFormData.icon_url || null,
        order: newOrder,
      }

      const { data, error } = await supabase
        .from('about_features')
        .insert(insertData)
        .select()

      if (error) {
        console.error('Erro ao criar feature:', error)
        alert(`Erro ao criar feature: ${error.message}`)
        throw error
      }

      if (data && data[0]) {
        setAboutFeatures([...aboutFeatures, data[0]])
        setFeatureFormData({ title: '', description: '', icon_name: '', icon_url: '' })
        setIsCreatingFeature(false)
        alert('Feature criada com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao criar feature:', error)
    }
  }

  const handleUpdateFeature = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('about_features')
        .update({
          title: featureFormData.title || '',
          description: featureFormData.description || '',
          icon_name: featureFormData.icon_name || null,
          icon_url: featureFormData.icon_url || null,
        })
        .eq('id', id)
        .select()

      if (error) {
        console.error('Erro ao atualizar feature:', error)
        alert(`Erro ao atualizar feature: ${error.message}`)
        throw error
      }

      if (data && data[0]) {
        setAboutFeatures(aboutFeatures.map(f => f.id === id ? data[0] : f))
        setEditingFeatureId(null)
        setFeatureFormData({ title: '', description: '', icon_name: '', icon_url: '' })
        alert('Feature atualizada com sucesso!')
      }
    } catch (error) {
      console.error('Erro ao atualizar feature:', error)
    }
  }

  const handleDeleteFeature = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta feature?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('about_features')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao excluir feature:', error)
        alert(`Erro ao excluir feature: ${error.message}`)
        throw error
      }

      setAboutFeatures(aboutFeatures.filter(f => f.id !== id))
      alert('Feature excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir feature:', error)
    }
  }

  const startEditFeature = (feature: AboutFeature) => {
    setEditingFeatureId(feature.id)
    setFeatureFormData({
      title: feature.title,
      description: feature.description,
      icon_name: feature.icon_name || '',
      icon_url: feature.icon_url || '',
    })
  }

  const cancelEditFeature = () => {
    setEditingFeatureId(null)
    setFeatureFormData({ title: '', description: '', icon_name: '', icon_url: '' })
  }

  const moveFeature = async (id: string, direction: 'up' | 'down') => {
    const index = aboutFeatures.findIndex(f => f.id === id)
    if (index === -1) return

    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= aboutFeatures.length) return

    const feature = aboutFeatures[index]
    const otherFeature = aboutFeatures[newIndex]

    setMovingFeature(id)

    try {
      const tempOrder = feature.order ?? 0
      const otherOrder = otherFeature.order ?? 0

      await supabase
        .from('about_features')
        .update({ order: otherOrder })
        .eq('id', id)

      await supabase
        .from('about_features')
        .update({ order: tempOrder })
        .eq('id', otherFeature.id)

      const newFeatures = [...aboutFeatures]
      ;[newFeatures[index], newFeatures[newIndex]] = [newFeatures[newIndex], newFeatures[index]]
      setAboutFeatures(newFeatures)
    } catch (error) {
      console.error('Erro ao mover feature:', error)
      alert('Erro ao mover feature. Tente novamente.')
    } finally {
      setMovingFeature(null)
    }
  }

  const startEdit = (professional: Professional) => {
    console.log('✏️ Iniciando edição de:', professional)
    setEditingId(professional.id)
    const photoUrl = professional.photo_url || professional.photo || professional.image || professional.foto || ''
    // IMPORTANTE: A base de dados usa 'specialty' e 'cv', não 'speciality' e 'description'
    const specialty = professional.specialty || professional.speciality || ''
    const description = professional.cv || professional.description || ''
    setFormData({
      name: professional.name || '',
      title: professional.title || '',
      speciality: specialty,  // Mapear specialty para speciality no form
      description: description,  // Mapear cv para description no form
      photo: photoUrl,
    })
    console.log('📝 FormData definido:', {
      name: professional.name || '',
      title: professional.title || '',
      speciality: specialty,
      description: description,
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

  if (isLoading && activeTab === 'profissionais') {
    return (
      <div className="min-h-screen bg-robinhood-dark flex items-center justify-center">
        <p className="text-white">A carregar...</p>
      </div>
    )
  }

  if (isLoadingServices && activeTab === 'servicos') {
    return (
      <div className="min-h-screen bg-robinhood-dark flex items-center justify-center">
        <p className="text-white">A carregar serviços...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-robinhood-dark py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Tabs para alternar entre Profissionais, Serviços e Depoimentos */}
        <div className="mb-8">
          <div className="flex gap-4 border-b border-robinhood-border">
            <button
              onClick={() => setActiveTab('profissionais')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'profissionais'
                  ? 'text-robinhood-green border-b-2 border-robinhood-green'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Profissionais
            </button>
            <button
              onClick={() => setActiveTab('servicos')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'servicos'
                  ? 'text-robinhood-green border-b-2 border-robinhood-green'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Serviços
            </button>
            <button
              onClick={() => setActiveTab('depoimentos')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'depoimentos'
                  ? 'text-robinhood-green border-b-2 border-robinhood-green'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Depoimentos
            </button>
            <button
              onClick={() => setActiveTab('sobre-nos')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'sobre-nos'
                  ? 'text-robinhood-green border-b-2 border-robinhood-green'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sobre Nós
            </button>
          </div>
        </div>

        {/* SECÇÃO PROFISSIONAIS */}
        {activeTab === 'profissionais' && (
          <>
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
                            e.stopPropagation()
                            const newValue = e.target.value
                            console.log('✏️ Nome alterado:', newValue)
                            setFormData(prev => ({ ...prev, name: newValue }))
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                          }}
                          onKeyUp={(e) => {
                            e.stopPropagation()
                          }}
                          onFocus={(e) => {
                            e.stopPropagation()
                            console.log('🔵 Campo Nome focado')
                            e.target.select()
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green focus:ring-2 focus:ring-robinhood-green"
                          placeholder="Nome completo"
                          autoComplete="off"
                          style={{ pointerEvents: 'auto', userSelect: 'text' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-1">Título (opcional)</label>
                        <input
                          type="text"
                          value={formData.title || ''}
                          onChange={(e) => {
                            e.stopPropagation()
                            const newValue = e.target.value
                            console.log('✏️ Título alterado:', newValue)
                            setFormData(prev => ({ ...prev, title: newValue }))
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation()
                          }}
                          onKeyUp={(e) => {
                            e.stopPropagation()
                          }}
                          onFocus={(e) => {
                            e.stopPropagation()
                            console.log('🔵 Campo Título focado')
                            e.target.select()
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                          className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green focus:ring-2 focus:ring-robinhood-green"
                          placeholder="Ex: Médica Psiquiatra"
                          autoComplete="off"
                          style={{ pointerEvents: 'auto', userSelect: 'text' }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Especialidade</label>
                      <input
                        type="text"
                        value={formData.speciality || ''}
                        onChange={(e) => {
                          e.stopPropagation()
                          const newValue = e.target.value
                          console.log('✏️ Especialidade alterada:', newValue)
                          setFormData(prev => ({ ...prev, speciality: newValue }))
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                        }}
                        onKeyUp={(e) => {
                          e.stopPropagation()
                        }}
                        onFocus={(e) => {
                          e.stopPropagation()
                          console.log('🔵 Campo Especialidade focado')
                          e.target.select()
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green focus:ring-2 focus:ring-robinhood-green"
                        placeholder="Ex: Psiquiatria"
                        autoComplete="off"
                        style={{ pointerEvents: 'auto', userSelect: 'text' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Descrição/CV (opcional)</label>
                      <textarea
                        value={formData.description || ''}
                        onChange={(e) => {
                          e.stopPropagation()
                          const newValue = e.target.value
                          console.log('✏️ Descrição alterada:', newValue)
                          setFormData(prev => ({ ...prev, description: newValue }))
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                        }}
                        onKeyUp={(e) => {
                          e.stopPropagation()
                        }}
                        onFocus={(e) => {
                          e.stopPropagation()
                          console.log('🔵 Campo Descrição focado')
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        rows={4}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green focus:ring-2 focus:ring-robinhood-green resize-y"
                        placeholder="Descrição ou currículo completo do profissional..."
                        style={{ pointerEvents: 'auto', userSelect: 'text' }}
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
                          e.stopPropagation()
                          const newValue = e.target.value
                          console.log('✏️ URL da foto alterada:', newValue)
                          setFormData(prev => ({ ...prev, photo: newValue }))
                        }}
                        onKeyDown={(e) => {
                          e.stopPropagation()
                        }}
                        onKeyUp={(e) => {
                          e.stopPropagation()
                        }}
                        onFocus={(e) => {
                          e.stopPropagation()
                          console.log('🔵 Campo URL da Foto focado')
                          e.target.select()
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-robinhood-green focus:ring-2 focus:ring-robinhood-green"
                        autoComplete="off"
                        style={{ pointerEvents: 'auto', userSelect: 'text' }}
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
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('🔼 Botão mover para cima clicado para índice:', index, 'Profissional:', professional.name)
                          if (index === 0) {
                            alert('Este profissional já está no topo!')
                            return
                          }
                          if (movingProfessional === professional.id) {
                            console.log('⚠️ Já está a mover este profissional')
                            return
                          }
                          try {
                            await moveUp(index)
                          } catch (error) {
                            console.error('Erro ao mover:', error)
                          }
                        }}
                        disabled={index === 0 || movingProfessional === professional.id}
                        className={`p-2 rounded-lg transition-all ${
                          index === 0 || movingProfessional === professional.id
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                            : 'bg-gray-600 text-white hover:bg-gray-500 active:bg-gray-400 hover:scale-110'
                        }`}
                        style={{ 
                          pointerEvents: index === 0 || movingProfessional === professional.id ? 'none' : 'auto',
                          cursor: index === 0 || movingProfessional === professional.id ? 'not-allowed' : 'pointer'
                        }}
                        title={index === 0 ? 'Já está no topo' : 'Mover para cima'}
                        aria-label="Mover para cima"
                      >
                        {movingProfessional === professional.id ? (
                          <span className="text-xs animate-pulse">...</span>
                        ) : (
                          <ArrowUp className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          console.log('🔽 Botão mover para baixo clicado para índice:', index, 'Profissional:', professional.name)
                          if (index === professionals.length - 1) {
                            alert('Este profissional já está no final!')
                            return
                          }
                          if (movingProfessional === professional.id) {
                            console.log('⚠️ Já está a mover este profissional')
                            return
                          }
                          try {
                            await moveDown(index)
                          } catch (error) {
                            console.error('Erro ao mover:', error)
                          }
                        }}
                        disabled={index === professionals.length - 1 || movingProfessional === professional.id}
                        className={`p-2 rounded-lg transition-all ${
                          index === professionals.length - 1 || movingProfessional === professional.id
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                            : 'bg-gray-600 text-white hover:bg-gray-500 active:bg-gray-400 hover:scale-110'
                        }`}
                        style={{ 
                          pointerEvents: index === professionals.length - 1 || movingProfessional === professional.id ? 'none' : 'auto',
                          cursor: index === professionals.length - 1 || movingProfessional === professional.id ? 'not-allowed' : 'pointer'
                        }}
                        title={index === professionals.length - 1 ? 'Já está no final' : 'Mover para baixo'}
                        aria-label="Mover para baixo"
                      >
                        {movingProfessional === professional.id ? (
                          <span className="text-xs animate-pulse">...</span>
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
                      <p className="text-gray-300 mb-2">{professional.specialty || professional.speciality}</p>
                      {(professional.cv || professional.description) && (
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{professional.cv || professional.description}</p>
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
          </>
        )}

        {/* SECÇÃO SERVIÇOS */}
        {activeTab === 'servicos' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-white">
                Gestão de <span className="text-robinhood-green">Serviços</span>
              </h1>
              {!isCreatingService && (
                <button
                  onClick={() => setIsCreatingService(true)}
                  className="flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Serviço
                </button>
              )}
            </div>

            {/* Formulário de Criação de Serviço */}
            {isCreatingService && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-robinhood-card border border-robinhood-border rounded-xl p-6 mb-6"
              >
                <h2 className="text-2xl font-bold text-white mb-4">Novo Serviço</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Título do Serviço"
                    value={serviceFormData.title || ''}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                    className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                  />
                  <textarea
                    placeholder="Descrição do Serviço"
                    value={serviceFormData.description || ''}
                    onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                    rows={3}
                    className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                  />
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      URL da Imagem de Fundo - Cole aqui a URL da imagem
                    </label>
                    <input
                      type="text"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={serviceFormData.image_url || ''}
                      onChange={(e) => setServiceFormData({ ...serviceFormData, image_url: e.target.value })}
                      className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Pode usar URLs de imagens de qualquer site (ex: Imgur, Google Drive público, etc.)
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateService}
                      className="flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-4 py-2 rounded-lg font-semibold"
                    >
                      <Save className="w-4 h-4" />
                      Criar Serviço
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingService(false)
                        setServiceFormData({ title: '', description: '', image_url: '' })
                      }}
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                    >
                      <X className="w-4 h-4" />
                      Cancelar
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Lista de Serviços */}
            <div className="space-y-4">
              {services.map((service, index) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-robinhood-card border border-robinhood-border rounded-xl p-6"
                >
                  {editingServiceId === service.id ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={serviceFormData.title || ''}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, title: e.target.value })}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                        placeholder="Título"
                      />
                      <textarea
                        value={serviceFormData.description || ''}
                        onChange={(e) => setServiceFormData({ ...serviceFormData, description: e.target.value })}
                        rows={3}
                        className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                        placeholder="Descrição"
                      />
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">
                          URL da Imagem de Fundo
                        </label>
                        <input
                          type="text"
                          placeholder="https://exemplo.com/imagem.jpg"
                          value={serviceFormData.image_url || ''}
                          onChange={(e) => setServiceFormData({ ...serviceFormData, image_url: e.target.value })}
                          className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateService(service.id)}
                          className="flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-4 py-2 rounded-lg font-semibold"
                        >
                          <Save className="w-4 h-4" />
                          Salvar
                        </button>
                        <button
                          onClick={cancelEditService}
                          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{service.title}</h3>
                        <p className="text-gray-300 mb-4">{service.description}</p>
                        {service.image_url && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-2">Imagem de fundo:</p>
                            <img
                              src={service.image_url}
                              alt={service.title}
                              className="w-full h-32 object-cover rounded-lg"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        <div className="flex gap-2 flex-wrap">
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleServiceImageUpload(service.id, file)
                              }}
                              disabled={uploadingServiceImage === service.id}
                            />
                            <span className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors">
                              {uploadingServiceImage === service.id ? (
                                'A fazer upload...'
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Upload Imagem
                                </>
                              )}
                            </span>
                          </label>
                          <button
                            onClick={() => {
                              startEditService(service)
                              alert('💡 Dica: Cole a URL da imagem no campo "URL da Imagem" e clique em "Salvar"')
                            }}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
                            title="Colar URL da imagem diretamente"
                          >
                            <Upload className="w-4 h-4" />
                            Colar URL
                          </button>
                          <button
                            onClick={() => startEditService(service)}
                            className="flex items-center gap-2 bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
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
              ))}
            </div>

            {services.length === 0 && !isCreatingService && (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">Nenhum serviço cadastrado ainda.</p>
                <p className="text-gray-500 text-sm mb-4">
                  Clique em "Adicionar Serviço" para começar.
                </p>
                <p className="text-gray-500 text-xs">
                  💡 Nota: A tabela "services" será criada automaticamente no Supabase quando adicionar o primeiro serviço.
                </p>
              </div>
            )}
          </>
        )}

        {/* SECÇÃO DEPOIMENTOS */}
        {activeTab === 'depoimentos' && (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold text-white">
                Gestão de <span className="text-robinhood-green">Depoimentos</span>
              </h1>
              {!isCreatingTestimonial && (
                <button
                  onClick={() => setIsCreatingTestimonial(true)}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Adicionar Depoimento
                </button>
              )}
            </div>

            {isLoadingTestimonials ? (
              <div className="text-center py-12">
                <p className="text-gray-400">A carregar depoimentos...</p>
              </div>
            ) : (
              <>
                {/* Formulário de Criação */}
                {isCreatingTestimonial && (
                  <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold text-white mb-4">Novo Depoimento</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Nome do Paciente
                        </label>
                        <input
                          type="text"
                          value={testimonialFormData.name || ''}
                          onChange={(e) =>
                            setTestimonialFormData({ ...testimonialFormData, name: e.target.value })
                          }
                          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-robinhood-green"
                          placeholder="Ex: Maria S."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Depoimento
                        </label>
                        <textarea
                          value={testimonialFormData.text || ''}
                          onChange={(e) =>
                            setTestimonialFormData({ ...testimonialFormData, text: e.target.value })
                          }
                          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-robinhood-green min-h-[100px]"
                          placeholder="Ex: Excelente atendimento e profissionais muito competentes."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Avaliação (Estrelas: 1-5)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="5"
                          value={testimonialFormData.rating || 5}
                          onChange={(e) =>
                            setTestimonialFormData({ ...testimonialFormData, rating: parseInt(e.target.value) || 5 })
                          }
                          className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-robinhood-green"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateTestimonial}
                          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          <Save className="w-5 h-5" />
                          Guardar
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingTestimonial(false)
                            setTestimonialFormData({ name: '', text: '', rating: 5 })
                          }}
                          className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          <X className="w-5 h-5" />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Depoimentos */}
                {testimonials.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">Nenhum depoimento encontrado. Adicione o primeiro!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {testimonials.map((testimonial, index) => (
                      <div
                        key={testimonial.id}
                        className="bg-gray-800 border border-gray-700 rounded-lg p-6"
                      >
                        {editingTestimonialId === testimonial.id ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Nome do Paciente
                              </label>
                              <input
                                type="text"
                                value={testimonialFormData.name || ''}
                                onChange={(e) =>
                                  setTestimonialFormData({ ...testimonialFormData, name: e.target.value })
                                }
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-robinhood-green"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Depoimento
                              </label>
                              <textarea
                                value={testimonialFormData.text || ''}
                                onChange={(e) =>
                                  setTestimonialFormData({ ...testimonialFormData, text: e.target.value })
                                }
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-robinhood-green min-h-[100px]"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Avaliação (Estrelas: 1-5)
                              </label>
                              <input
                                type="number"
                                min="1"
                                max="5"
                                value={testimonialFormData.rating || 5}
                                onChange={(e) =>
                                  setTestimonialFormData({ ...testimonialFormData, rating: parseInt(e.target.value) || 5 })
                                }
                                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:border-robinhood-green"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleUpdateTestimonial(testimonial.id)}
                                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <Save className="w-5 h-5" />
                                Guardar
                              </button>
                              <button
                                onClick={cancelEditTestimonial}
                                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <X className="w-5 h-5" />
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-4 flex-1">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => moveTestimonial(testimonial.id, 'up')}
                                    disabled={index === 0 || movingTestimonial === testimonial.id}
                                    className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ArrowUp className="w-5 h-5" />
                                  </button>
                                  <button
                                    onClick={() => moveTestimonial(testimonial.id, 'down')}
                                    disabled={index === testimonials.length - 1 || movingTestimonial === testimonial.id}
                                    className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                  >
                                    <ArrowDown className="w-5 h-5" />
                                  </button>
                                </div>
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-white mb-2">{testimonial.name}</h3>
                                  <div className="flex gap-1 mb-2">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    ))}
                                  </div>
                                  <p className="text-gray-300 italic">"{testimonial.text}"</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => startEditTestimonial(testimonial)}
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <Edit className="w-5 h-5" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteTestimonial(testimonial.id)}
                                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* SECÇÃO SOBRE NÓS - Design Distinto (Layout em Duas Colunas) */}
        {activeTab === 'sobre-nos' && (
          <>
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">
                Gestão de <span className="text-robinhood-green">Sobre Nós</span>
              </h1>
              <p className="text-gray-400 text-sm">Gerir o texto principal e os cards de características</p>
            </div>

            {isLoadingAbout || isLoadingFeatures ? (
              <div className="text-center py-12">
                <p className="text-gray-400">A carregar...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* COLUNA ESQUERDA - Texto Principal */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-robinhood-green" />
                    Texto Principal
                  </h2>
                  <textarea
                    value={aboutSection?.main_text || ''}
                    onChange={(e) => {
                      if (aboutSection) {
                        setAboutSection({ ...aboutSection, main_text: e.target.value })
                      } else {
                        setAboutSection({ id: '', main_text: e.target.value })
                      }
                    }}
                    className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-robinhood-green min-h-[150px] mb-4"
                    placeholder="Texto principal da secção Sobre Nós..."
                  />
                  <button
                    onClick={() => updateAboutSection(aboutSection?.main_text || '')}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    Guardar Texto Principal
                  </button>
                </div>

                {/* COLUNA DIREITA - Features (Cards) */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Star className="w-6 h-6 text-robinhood-green" />
                      Características
                    </h2>
                    {!isCreatingFeature && (
                      <button
                        onClick={() => setIsCreatingFeature(true)}
                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        Adicionar
                      </button>
                    )}
                  </div>

                  {/* Formulário de Criação */}
                  {isCreatingFeature && (
                    <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-bold text-white mb-3">Nova Característica</h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Título"
                          value={featureFormData.title || ''}
                          onChange={(e) => setFeatureFormData({ ...featureFormData, title: e.target.value })}
                          className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-robinhood-green text-sm"
                        />
                        <textarea
                          placeholder="Descrição"
                          value={featureFormData.description || ''}
                          onChange={(e) => setFeatureFormData({ ...featureFormData, description: e.target.value })}
                          className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-robinhood-green min-h-[80px] text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="Nome do Ícone (ex: Users)"
                            value={featureFormData.icon_name || ''}
                            onChange={(e) => setFeatureFormData({ ...featureFormData, icon_name: e.target.value })}
                            className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-robinhood-green text-sm"
                          />
                          <input
                            type="text"
                            placeholder="OU URL da Imagem"
                            value={featureFormData.icon_url || ''}
                            onChange={(e) => setFeatureFormData({ ...featureFormData, icon_url: e.target.value })}
                            className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-robinhood-green text-sm"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCreateFeature}
                            className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                          >
                            <Save className="w-4 h-4" />
                            Guardar
                          </button>
                          <button
                            onClick={() => {
                              setIsCreatingFeature(false)
                              setFeatureFormData({ title: '', description: '', icon_name: '', icon_url: '' })
                            }}
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                          >
                            <X className="w-4 h-4" />
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lista de Features */}
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {aboutFeatures.length === 0 ? (
                      <p className="text-gray-400 text-sm text-center py-4">Nenhuma característica adicionada ainda.</p>
                    ) : (
                      aboutFeatures.map((feature, index) => (
                        <div
                          key={feature.id}
                          className="bg-gray-700 border border-gray-600 rounded-lg p-4"
                        >
                          {editingFeatureId === feature.id ? (
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={featureFormData.title || ''}
                                onChange={(e) => setFeatureFormData({ ...featureFormData, title: e.target.value })}
                                className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-robinhood-green text-sm"
                              />
                              <textarea
                                value={featureFormData.description || ''}
                                onChange={(e) => setFeatureFormData({ ...featureFormData, description: e.target.value })}
                                className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-robinhood-green min-h-[60px] text-sm"
                              />
                              <div className="grid grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  placeholder="Nome do Ícone"
                                  value={featureFormData.icon_name || ''}
                                  onChange={(e) => setFeatureFormData({ ...featureFormData, icon_name: e.target.value })}
                                  className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-robinhood-green text-sm"
                                />
                                <input
                                  type="text"
                                  placeholder="OU URL da Imagem"
                                  value={featureFormData.icon_url || ''}
                                  onChange={(e) => setFeatureFormData({ ...featureFormData, icon_url: e.target.value })}
                                  className="w-full bg-gray-600 text-white border border-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:border-robinhood-green text-sm"
                                />
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdateFeature(feature.id)}
                                  className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                                >
                                  <Save className="w-4 h-4" />
                                  Guardar
                                </button>
                                <button
                                  onClick={cancelEditFeature}
                                  className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                                >
                                  <X className="w-4 h-4" />
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                  <div className="flex flex-col gap-1">
                                    <button
                                      onClick={() => moveFeature(feature.id, 'up')}
                                      disabled={index === 0 || movingFeature === feature.id}
                                      className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => moveFeature(feature.id, 'down')}
                                      disabled={index === aboutFeatures.length - 1 || movingFeature === feature.id}
                                      className="text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                                    >
                                      <ArrowDown className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="flex-1">
                                    <h3 className="text-white font-semibold mb-1">{feature.title}</h3>
                                    <p className="text-gray-300 text-sm">{feature.description}</p>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                                      {feature.icon_name && (
                                        <span className="bg-gray-600 px-2 py-1 rounded">Ícone: {feature.icon_name}</span>
                                      )}
                                      {feature.icon_url && (
                                        <span className="bg-gray-600 px-2 py-1 rounded">Imagem URL</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => startEditFeature(feature)}
                                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                                >
                                  <Edit className="w-4 h-4" />
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteFeature(feature.id)}
                                  className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Excluir
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
