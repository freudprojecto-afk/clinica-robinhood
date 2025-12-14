'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, User, X, FileText } from 'lucide-react'
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
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)

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
    <section className="py-8 md:py-16 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
            Corpo <span className="text-robinhood-green">Clínico</span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-300 px-4">
            Conheça nossa equipa de psicólogos e psiquiatras experientes
          </p>
        </motion.div>

        <div className="relative">
          {/* Carousel container */}
          <div className="relative min-h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden rounded-xl md:rounded-2xl">
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
                    <div className="bg-robinhood-card border border-robinhood-border rounded-xl md:rounded-2xl p-4 md:p-8 lg:p-12 max-w-4xl w-full mx-2 md:mx-4 shadow-2xl">
                      <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-8 items-center">
                        {/* Photo */}
                        <div className="flex justify-center order-1">
                          <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden border-4 border-robinhood-green shadow-lg bg-robinhood-border">
                            {professional.photo_url ? (
                              <Image
                                src={professional.photo_url}
                                alt={professional.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, 320px"
                                style={{ 
                                  objectPosition: 'center center',
                                  objectFit: 'cover'
                                }}
                                priority={index === currentIndex}
                                unoptimized={true}
                                onError={(e) => {
                                  console.error('❌ Erro ao carregar imagem:', professional.photo_url)
                                  console.error('Erro detalhado:', e)
                                }}
                                onLoad={() => {
                                  console.log('✅ Imagem carregada com sucesso:', professional.photo_url)
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-robinhood-border flex items-center justify-center">
                                <User className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-gray-500" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Info */}
                        <div className="text-center md:text-left order-2 w-full">
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2">
                            {professional.name}
                          </h3>
                          <p className="text-base sm:text-lg md:text-xl text-robinhood-green mb-3 md:mb-4 break-words">
                            {professional.title}
                          </p>
                          <p className="text-sm sm:text-base md:text-lg text-gray-300 mb-4 md:mb-6">
                            {professional.specialty}
                          </p>
                          {professional.cv && (
                            <button
                              onClick={() => setSelectedProfessional(professional)}
                              className="inline-flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-4 md:px-6 py-2 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:bg-opacity-90 transition-all mt-2 md:mt-4 w-full md:w-auto justify-center"
                            >
                              <FileText className="w-4 h-4 md:w-5 md:h-5" />
                              Ver CV Completo
                            </button>
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
                className="absolute left-1 md:left-4 top-1/2 -translate-y-1/2 bg-robinhood-card border border-robinhood-border rounded-full p-2 md:p-3 hover:bg-robinhood-green hover:text-robinhood-dark transition-all z-10"
                aria-label="Anterior"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-1 md:right-4 top-1/2 -translate-y-1/2 bg-robinhood-card border border-robinhood-border rounded-full p-2 md:p-3 hover:bg-robinhood-green hover:text-robinhood-dark transition-all z-10"
                aria-label="Próximo"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* Dots indicator */}
          {sortedProfessionals.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 md:mt-8">
              {sortedProfessionals.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 md:h-3 rounded-full transition-all ${
                    index === currentIndex
                      ? 'bg-robinhood-green w-6 md:w-8'
                      : 'bg-gray-600 hover:bg-gray-500 w-2 md:w-3'
                  }`}
                  aria-label={`Ir para slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal para CV Completo */}
      <AnimatePresence>
        {selectedProfessional && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedProfessional(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-robinhood-card border border-robinhood-border rounded-xl md:rounded-2xl p-4 md:p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-2"
            >
              <div className="flex justify-between items-start mb-4 md:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2 break-words">
                    {selectedProfessional.name}
                  </h3>
                  <p className="text-sm md:text-base lg:text-xl text-robinhood-green mb-1 md:mb-2 break-words">
                    {selectedProfessional.title}
                  </p>
                  <p className="text-sm md:text-base lg:text-lg text-gray-300">
                    {selectedProfessional.specialty}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedProfessional(null)}
                  className="text-gray-400 hover:text-white transition-colors p-2 flex-shrink-0"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6" />
                </button>
              </div>

              {selectedProfessional.photo_url && (
                <div className="flex justify-center mb-4 md:mb-6">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-robinhood-green bg-robinhood-border">
                    <Image
                      src={selectedProfessional.photo_url}
                      alt={selectedProfessional.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, 192px"
                      style={{ 
                        objectPosition: 'center center',
                        objectFit: 'cover'
                      }}
                      unoptimized={true}
                      onError={(e) => {
                        console.error('Erro ao carregar imagem:', selectedProfessional.photo_url)
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}

              {selectedProfessional.cv && (
                <div className="bg-robinhood-dark rounded-lg p-4 md:p-6 border border-robinhood-border">
                  <h4 className="text-lg md:text-xl font-bold text-white mb-3 md:mb-4 flex items-center gap-2">
                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-robinhood-green flex-shrink-0" />
                    <span>Currículo Profissional</span>
                  </h4>
                  <div className="text-sm md:text-base text-gray-300 whitespace-pre-line leading-relaxed">
                    {selectedProfessional.cv}
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
