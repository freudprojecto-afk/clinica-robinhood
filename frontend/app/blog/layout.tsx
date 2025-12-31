import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Clínica Freud | Tratamento de Burnout, Ansiedade, Bullying e Problemas Relacionais em Lisboa e Online',
  description: 'Na Clínica Freud, ajudamos adultos, jovens e casais a recuperar o equilíbrio emocional com psicólogos e psiquiatras experientes. Tratamento de Burnout, Ansiedade, Bullying e Problemas Relacionais em Lisboa e Online.',
  keywords: 'psicologia, psiquiatria, psicoterapia, burnout, ansiedade, bullying, problemas relacionais, terapia de casal, Lisboa, consultas online, saúde mental',
  openGraph: {
    title: 'Clínica Freud | Tratamento de Burnout, Ansiedade, Bullying e Problemas Relacionais',
    description: 'Ajudamos adultos, jovens e casais a recuperar o equilíbrio emocional com psicólogos e psiquiatras experientes em Lisboa e Online',
    type: 'website',
    locale: 'pt_PT',
  },
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
