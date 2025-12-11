'use client'

import { motion } from 'framer-motion'

const specialties = [
  'Perturbações do Humor',
  'Perturbações da Ansiedade',
  'Perturbações da Personalidade',
  'Perturbações Infantojuvenis',
  'LGBT+ Friendly',
  'Perturbações Sexuais',
  'Perturbações Alimentares',
  'Dificuldades Várias',
]

export default function Specialties() {
  return (
    <section className="py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-robinhood-green">Especialidades</span>
          </h2>
          <p className="text-xl text-gray-300">
            Áreas de atuação especializada
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {specialties.map((specialty, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-robinhood-card border border-robinhood-border rounded-lg p-6 text-center hover:border-robinhood-green transition-all cursor-pointer group"
            >
              <p className="text-white font-medium group-hover:text-robinhood-green transition-colors">
                {specialty}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
