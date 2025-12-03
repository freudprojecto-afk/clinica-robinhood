import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clínica - Dashboard',
  description: 'Aplicação web estilo Robinhood',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt">
      <body>{children}</body>
    </html>
  )
}


