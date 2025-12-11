'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Upload, ArrowUp, ArrowDown, Save, X } from 'lucide-react'
import Image from 'next/image'

interface Professional {
  id: string
  name: string
  title: string
  specialty: string
  photo_url?: string
  cv?: string
  order: number
}

export default function AdminPage() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [formData, setFormData] = useState<Partial<Professional>>({
    name: '',
    title: '',
    specialty: '',
    cv: '',
    order: 0,
  })
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null)

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchProfessionals()
  }, [])

  const fetchProfessionals = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/professionals`)
      if (response.ok) {
        const data = await response.json()
        setProfessionals(data)
      }
    } catch (error) {
      console.error('Erro ao buscar profissionais:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/professionals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProfessionals()
        setIsCreating(false)
        setFormData({ name: '', title: '', specialty: '', cv: '', order: 0 })
      }
    } catch (error) {
      console.error('Erro ao criar profissional:', error)
      alert('Erro ao criar profissional')
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/professionals/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        await fetchProfessionals()
        setEditingId(null)
        setFormData({ name: '', title: '', specialty: '', cv: '', order: 0 })
      }
    } catch (error) {
      console.error('Erro ao atualizar profissional:', error)
      alert('Erro ao atualizar profissional')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este profissional?')) return

    try {
      const response = await fetch(`${backendUrl}/api/professionals/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchProfessionals()
      }
    } catch (error) {
      console.error('Erro ao excluir profissional:', error)
      alert('Erro ao excluir profissional')
    }
  }

  const handlePhotoUpload = async (id: string, file: File) => {
    setUploadingPhoto(id)
    try {
      const formData = new FormData()
      formData.append('photo', file)

      const response = await fetch(`${backendUrl}/api/professionals/${id}/photo`, {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        await fetchProfessionals()
      } else {
        alert('Erro ao fazer upload da foto')
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
      alert('Erro ao fazer upload da foto')
    } finally {
      setUploadingPhoto(null)
    }
  }

  const handleOrderChange = async (id: string, direction: 'up' | 'down') => {
    const professional = professionals.find((p) => p.id === id)
    if (!professional) return

    const currentIndex = professionals.findIndex((p) => p.id === id)
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

    if (targetIndex < 0 || targetIndex >= professionals.length) return

    const targetProfessional = professionals[targetIndex]
    const newOrder = professional.order
    const targetNewOrder = targetProfessional.order

    try {
      const response = await fetch(`${backendUrl}/api/professionals/order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orders: [
            { id, order: targetNewOrder },
            { id: targetProfessional.id, order: newOrder },
          ],
        }),
      })

      if (response.ok) {
        await fetchProfessionals()
      }
    } catch (error) {
      console.error('Erro ao alterar ordem:', error)
    }
  }

  const startEdit = (professional: Professional) => {
    setEditingId(professional.id)
    setFormData(professional)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsCreating(false)
    setFormData({ name: '', title: '', specialty: '', cv: '', order: 0 })
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                />
                <input
                  type="text"
                  placeholder="Título"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Especialidade"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
              />
              <textarea
                placeholder="CV"
                value={formData.cv}
                onChange={(e) => setFormData({ ...formData, cv: e.target.value })}
                rows={4}
                className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
              />
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
          {professionals.map((professional, index) => (
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
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                    />
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                  />
                  <textarea
                    value={formData.cv}
                    onChange={(e) => setFormData({ ...formData, cv: e.target.value })}
                    rows={4}
                    className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-2 text-white"
                  />
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
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-robinhood-green flex-shrink-0">
                    {professional.photo_url ? (
                      <Image
                        src={professional.photo_url}
                        alt={professional.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-robinhood-border flex items-center justify-center text-gray-500">
                        Sem foto
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-1">{professional.name}</h3>
                    <p className="text-robinhood-green mb-2">{professional.title}</p>
                    <p className="text-gray-300 mb-2">{professional.specialty}</p>
                    {professional.cv && (
                      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{professional.cv}</p>
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
                              Foto
                            </>
                          )}
                        </span>
                      </label>
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
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOrderChange(professional.id, 'up')}
                          disabled={index === 0}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOrderChange(professional.id, 'down')}
                          disabled={index === professionals.length - 1}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {professionals.length === 0 && !isCreating && (
          <div className="text-center py-12">
            <p className="text-gray-400">Nenhum profissional cadastrado ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
