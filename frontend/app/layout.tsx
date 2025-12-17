import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clínica - Sistema de Gestão',
  description: 'Sistema de gestão e informações da clínica. Conheça nossa equipa de psicólogos e psiquiatras experientes.',
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
