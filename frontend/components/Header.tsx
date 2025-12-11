'use client'

import Link from 'next/link'
import { Calendar } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-robinhood-card/90 border-b border-robinhood-border backdrop-blur-md">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-white hover:text-robinhood-green transition-colors">
            Clínica Freud
          </Link>
          
          <Link
            href="/agendar"
            className="inline-flex items-center gap-2 bg-robinhood-green text-robinhood-dark px-6 py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-all"
          >
            <Calendar className="w-5 h-5" />
            Agendar Consulta
          </Link>
        </div>
      </div>
    </header>
  )
}
