import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clínica Freud - Saúde Mental e Bem-Estar',
  description: 'Clínica especializada em saúde mental. Oferecemos psicoterapia, psiquiatria e cuidados personalizados com uma equipa experiente de psicólogos e psiquiatras.',
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
