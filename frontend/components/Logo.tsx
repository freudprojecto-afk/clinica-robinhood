'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface LogoProps {
  onClick?: () => void
}

export default function Logo({ onClick }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLogo() {
      try {
        // Listar ficheiros no bucket 'logos'
        const { data, error } = await supabase.storage
          .from('logos')
          .list('', {
            limit: 10,
            sortBy: { column: 'created_at', order: 'desc' }
          })

        if (error) {
          // Se o bucket não existir, usar logo padrão
          if (error.message.includes('not found') || error.message.includes('does not exist') || error.message.includes('Bucket')) {
            console.log('⚠️ Bucket "logos" não existe ainda. Usando logo padrão.')
            setLogoUrl(null)
            setLoading(false)
            return
          }
          throw error
        }

        if (data && data.length > 0) {
          // Procurar por ficheiro que começa com "logo"
          const logoFile = data.find(file => 
            file.name.toLowerCase().startsWith('logo.')
          )

          if (logoFile) {
            // Obter URL pública do logo
            const { data: urlData } = supabase.storage
              .from('logos')
              .getPublicUrl(logoFile.name)

            if (urlData?.publicUrl) {
              setLogoUrl(urlData.publicUrl)
            }
          } else {
            console.log('⚠️ Nenhum ficheiro "logo.*" encontrado. Usando logo padrão.')
            setLogoUrl(null)
          }
        } else {
          console.log('⚠️ Bucket "logos" está vazio. Usando logo padrão.')
          setLogoUrl(null)
        }
      } catch (err) {
        console.error('❌ Erro ao buscar logo:', err)
        setLogoUrl(null)
      } finally {
        setLoading(false)
      }
    }

    fetchLogo()
  }, [])

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
    >
      {/* Retângulo arredondado para o logo - SEM BORDA */}
      <div className="relative w-32 h-20 sm:w-40 sm:h-24 md:w-48 md:h-28 rounded-xl bg-clinica-bg flex items-center justify-center overflow-hidden">
        {loading ? (
          // Placeholder enquanto carrega
          <div className="flex flex-col items-center justify-center">
            <span className="text-[10px] sm:text-xs font-light uppercase tracking-wider text-clinica-text/60">
              CLÍNICA
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold lowercase text-clinica-text">
              Freud
            </span>
          </div>
        ) : logoUrl ? (
          // Logo carregado do Supabase
          <img
            src={logoUrl}
            alt="Clínica Freud Logo"
            className="w-full h-full object-contain p-2"
            onError={() => {
              // Se a imagem falhar, mostrar placeholder
              setLogoUrl(null)
            }}
          />
        ) : (
          // Logo padrão (texto) se não houver imagem
          <div className="flex flex-col items-center justify-center px-4">
            <span className="text-[10px] sm:text-xs font-light uppercase tracking-wider text-clinica-text leading-none">
              CLÍNICA
            </span>
            <span className="text-xl sm:text-2xl md:text-3xl font-bold lowercase text-clinica-text leading-none mt-[-2px]">
              Freud
            </span>
            {/* Texto vertical à direita */}
            <div className="hidden sm:flex flex-col justify-center gap-0.5 text-clinica-text/60 text-[8px] sm:text-[9px] font-light lowercase absolute right-2 top-1/2 -translate-y-1/2">
              <span>psicoterapia</span>
              <span>psiquiatria</span>
              <span>psicologia</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
