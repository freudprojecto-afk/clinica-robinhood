'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, User } from 'lucide-react'
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

interface ProfessionalsCarouselProps {
  professionals: Professional[]
}

export default function ProfessionalsCarousel({ professionals }: ProfessionalsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Ordenar profissionais por ordem
  const sortedProfessionals = [...professionals].sort((a, b) => a.order - b.order)

  useEffect(() => {
    if (!isAutoPlaying || sortedProfessionals.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedProfessionals.length)
    }, 5000) // Muda a cada 5 segundos

    return () => clearInterval(interval)
  }, [isAutoPlaying, sortedProfessionals.length])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + sortedProfessionals.length) % sortedProfessionals.length)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % sortedProfessionals.length)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  if (sortedProfessionals.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Nenhum profissional cadastrado ainda.</p>
      </div>
    )
  }

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
            Corpo <span className="text-robinhood-green">Clínico</span>
          </h2>
          <p className="text-xl text-gray-300">
            Conheça nossa equipa de psicólogos e psiquiatras experientes
          </p>
        </motion.div>

        <div className="relative">
          {/* Carousel container */}
          <div className="relative h-[600px] md:h-[700px] overflow-hidden rounded-2xl">
            <AnimatePresence mode="wait">
              {sortedProfessionals.map((professional, index) => {
                if (index !== currentIndex) return null

                return (
                  <motion.div
                    key={professional.id}
                    initial={{ opacity: 0, x: 300 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -300 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <div className="bg-robinhood-card border border-robinhood-border rounded-2xl p-8 md:p-12 max-w-4xl w-full mx-4 shadow-2xl">
                      <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Photo */}
                        <div className="flex justify-center">
                          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-robinhood-green shadow-lg">
                            {professional.photo_url ? (
                              <Image
                                src={professional.photo_url}
                                alt={professional.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-robinhood-border flex items-center justify-center">
                                <User className="w-32 h-32 text-gray-500" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left">
                          <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {professional.name}
                          </h3>
                          <p className="text-xl text-robinhood-green mb-4">
                            {professional.title}
                          </p>
                          <p className="text-lg text-gray-300 mb-6">
                            {professional.specialty}
                          </p>
                          {professional.cv && (
                            <div className="mt-6 p-4 bg-robinhood-dark rounded-lg border border-robinhood-border">
                              <p className="text-gray-300 text-sm whitespace-pre-line">
                                {professional.cv}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Navigation buttons */}
          {sortedProfessionals.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-robinhood-card border border-robinhood-border rounded-full p-3 hover:bg-robinhood-green hover:text-robinhood-dark transition-all z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-robinhood-card border border-robinhood-border rounded-full p-3 hover:bg-robinhood-green hover:text-robinhood-dark transition-all z-10"
                aria-label="Próximo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {sortedProfessionals.length > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {sortedProfessionals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-robinhood-green w-8'
                      : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
