'use client'

import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import ProfessionalsCarousel from '../components/ProfessionalsCarousel'
import Services from '../components/Services'
import Specialties from '../components/Specialties'
import Footer from '../components/Footer'

interface Professional {
  id: string
  name: string
  title: string
  specialty: string
  photo_url?: string
  cv?: string
  order: number
}

export default function Home() {
  const [professionals, setProfessionals] = useState<Professional[]>([])

  useEffect(() => {
    // Buscar profissionais da API
    const fetchProfessionals = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
        const response = await fetch(`${backendUrl}/api/professionals`)
        if (response.ok) {
          const data = await response.json()
          setProfessionals(data)
        }
      } catch (error) {
        console.error('Erro ao buscar profissionais:', error)
      }
    }

    fetchProfessionals()
  }, [])

  return (
    <div className="min-h-screen bg-robinhood-dark">
      <Header />
      <Hero />
      <ProfessionalsCarousel professionals={professionals} />
      <Services />
      <Specialties />
      <Footer />
    </div>
  )
}
