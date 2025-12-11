'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, User, Mail, Phone, MessageSquare, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Header from '../../components/Header'

export default function AgendarPage() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipoConsulta: '',
    preferenciaData: '',
    preferenciaHora: '',
    mensagem: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await fetch(`${backendUrl}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({
          nome: '',
          email: '',
          telefone: '',
          tipoConsulta: '',
          preferenciaData: '',
          preferenciaHora: '',
          mensagem: '',
        })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Erro ao agendar consulta:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen bg-robinhood-dark">
      <Header />
      
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-300 hover:text-robinhood-green transition-colors mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-robinhood-card border border-robinhood-border rounded-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-robinhood-green/20 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-robinhood-green" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Agendar <span className="text-robinhood-green">Consulta</span>
            </h1>
            <p className="text-xl text-gray-300">
              Preencha o formulário abaixo e entraremos em contacto consigo
            </p>
          </div>

          {submitStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-400"
            >
              Pedido enviado com sucesso! Entraremos em contacto em breve.
            </motion.div>
          )}

          {submitStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-400"
            >
              Erro ao enviar pedido. Por favor, tente novamente ou contacte-nos diretamente.
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="nome" className="block text-white font-medium mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Nome Completo *
              </label>
              <input
                type="text"
                id="nome"
                name="nome"
                required
                value={formData.nome}
                onChange={handleChange}
                className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-robinhood-green transition-colors"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-white font-medium mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-robinhood-green transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label htmlFor="telefone" className="block text-white font-medium mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Telefone *
                </label>
                <input
                  type="tel"
                  id="telefone"
                  name="telefone"
                  required
                  value={formData.telefone}
                  onChange={handleChange}
                  className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-robinhood-green transition-colors"
                  placeholder="+351 912 345 678"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tipoConsulta" className="block text-white font-medium mb-2">
                Tipo de Consulta *
              </label>
              <select
                id="tipoConsulta"
                name="tipoConsulta"
                required
                value={formData.tipoConsulta}
                onChange={handleChange}
                className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-robinhood-green transition-colors"
              >
                <option value="">Selecione o tipo de consulta</option>
                <option value="psicoterapia">Psicoterapia Individual</option>
                <option value="psicologia-infantil">Psicologia Infantojuvenil</option>
                <option value="terapia-casal">Terapia de Casal</option>
                <option value="terapia-familia">Terapia de Família</option>
                <option value="psiquiatria">Psiquiatria</option>
                <option value="nutricao">Nutrição</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="preferenciaData" className="block text-white font-medium mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Preferência de Data
                </label>
                <input
                  type="date"
                  id="preferenciaData"
                  name="preferenciaData"
                  value={formData.preferenciaData}
                  onChange={handleChange}
                  className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-robinhood-green transition-colors"
                />
              </div>

              <div>
                <label htmlFor="preferenciaHora" className="block text-white font-medium mb-2">
                  <Clock className="w-4 h-4 inline mr-2" />
                  Preferência de Hora
                </label>
                <input
                  type="time"
                  id="preferenciaHora"
                  name="preferenciaHora"
                  value={formData.preferenciaHora}
                  onChange={handleChange}
                  className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-robinhood-green transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="mensagem" className="block text-white font-medium mb-2">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Mensagem (opcional)
              </label>
              <textarea
                id="mensagem"
                name="mensagem"
                rows={4}
                value={formData.mensagem}
                onChange={handleChange}
                className="w-full bg-robinhood-dark border border-robinhood-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-robinhood-green transition-colors resize-none"
                placeholder="Conte-nos mais sobre o que procura..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-robinhood-green text-robinhood-dark px-8 py-4 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'A enviar...' : 'Enviar Pedido de Consulta'}
            </button>

            <p className="text-center text-gray-400 text-sm">
              * Campos obrigatórios. As marcações são feitas com pelo menos 24h de antecedência.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
