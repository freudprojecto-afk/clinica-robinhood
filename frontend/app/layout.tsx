import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clínica Freud - Saúde Mental e Bem-Estar',
  description: 'Clínica especializada em saúde mental, dedicada a proporcionar cuidados de excelência através de uma equipa multidisciplinar de psicólogos e psiquiatras experientes.',
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
