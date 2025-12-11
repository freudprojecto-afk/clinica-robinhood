'use client'

import { motion } from 'framer-motion'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-robinhood-dark via-robinhood-card to-robinhood-dark" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-robinhood-green opacity-5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-robinhood-green opacity-5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 max-w-6xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tratamento de{' '}
            <span className="text-robinhood-green">Burnout</span>,{' '}
            <span className="text-robinhood-green">Ansiedade</span> e{' '}
            <span className="text-robinhood-green">Problemas Relacionais</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Na Clínica Freud, ajudamos adultos, jovens e casais a recuperar o equilíbrio emocional 
            com psicólogos e psiquiatras experientes
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/agendar"
              className="inline-flex items-center gap-3 bg-robinhood-green text-robinhood-dark px-8 py-4 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 shadow-lg shadow-robinhood-green/50"
            >
              <Calendar className="w-6 h-6" />
              Agendar Consulta
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gray-400 rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  )
}
