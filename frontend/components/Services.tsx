'use client'

import { motion } from 'framer-motion'
import { Heart, Users, Baby, Stethoscope, Brain, UtensilsCrossed } from 'lucide-react'

const services = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Psicoterapia e Psicologia Clínica',
    description: 'Apoio individual, avaliação psicológica completa e relatórios para escola e trabalho',
  },
  {
    icon: <Baby className="w-8 h-8" />,
    title: 'Psicologia Infantojuvenil (-16 anos)',
    description: 'Acompanhamento emocional e escolar, avaliação psicológica, orientação vocacional',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Terapia de Casal e de Família',
    description: 'Superar conflitos e crises conjugais, melhorar comunicação e confiança',
  },
  {
    icon: <Stethoscope className="w-8 h-8" />,
    title: 'Psiquiatria',
    description: 'Consultas, incluindo pedopsiquiatria, diagnóstico especializado e prescrição',
  },
  {
    icon: <Brain className="w-8 h-8" />,
    title: 'Supervisão e Intervisão Clínica',
    description: 'Supervisão individual e em grupo, discussão de casos clínicos',
  },
  {
    icon: <UtensilsCrossed className="w-8 h-8" />,
    title: 'Serviços Vários',
    description: 'Reabilitação cognitiva, terapia ocupacional, terapia da fala, nutrição clínica',
  },
]

export default function Services() {
  return (
    <section className="py-16 px-4 bg-robinhood-card">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nossos <span className="text-robinhood-green">Serviços</span>
          </h2>
          <p className="text-xl text-gray-300">
            Tratamento especializado para todas as suas necessidades
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-robinhood-dark border border-robinhood-border rounded-xl p-6 hover:border-robinhood-green transition-all cursor-pointer group"
            >
              <div className="text-robinhood-green mb-4 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-300">{service.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
