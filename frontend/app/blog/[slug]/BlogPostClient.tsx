'use client'

// ... (todo o seu código atual aqui, mas recebe slug como prop)

interface BlogPostClientProps {
  slug: string
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  // Remover esta linha: const slug = params?.slug as string
  // Usar o slug da prop diretamente
  
  const router = useRouter()
  // ... resto do código igual
