'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface LogoProps {
  onClick?: () => void
}

export default function Logo({ onClick }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0) // Para forçar refresh

  useEffect(() => {
    async function fetchLogo() {
      try {
        console.log('🔍 A buscar logo do Supabase...')
        
        // Listar ficheiros no bucket 'logos'
        const { data, error } = await supabase.storage
          .from('logos')
          .list('', {
            limit: 100,
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
          console.error('❌ Erro ao listar ficheiros:', error)
          throw error
        }

        console.log('📋 Ficheiros encontrados:', data?.map(f => f.name) || [])

        if (data && data.length > 0) {
          // Procurar por ficheiro que começa com "logo"
          const logoFile = data.find(file => 
            file.name.toLowerCase().startsWith('logo.')
          )

          if (logoFile) {
            console.log('✅ Logo encontrado:', logoFile.name)
            console.log('📅 Data de criação:', logoFile.created_at)
            console.log('📅 Última modificação:', logoFile.updated_at || logoFile.created_at)
            
            // Obter URL pública do logo
            const { data: urlData } = supabase.storage
              .from('logos')
              .getPublicUrl(logoFile.name)

            if (urlData?.publicUrl) {
              // Adicionar timestamp e versão baseada na data de modificação para forçar refresh
              const fileTimestamp = logoFile.updated_at || logoFile.created_at || Date.now()
              const timestamp = new Date(fileTimestamp).getTime()
              const urlWithCacheBuster = `${urlData.publicUrl}?v=${timestamp}&t=${Date.now()}`
              
              console.log('🔗 URL do logo:', urlWithCacheBuster)
              setLogoUrl(urlWithCacheBuster)
            } else {
              console.warn('⚠️ URL pública não disponível')
              setLogoUrl(null)
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
    
    // Recarregar logo a cada 3 segundos (para atualizar quando houver novo upload)
    const interval = setInterval(() => {
      console.log('🔄 A recarregar logo...')
      fetchLogo()
    }, 3000)
    
    // Listener para eventos de storage (quando há novo upload noutra aba)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logo-updated') {
        console.log('📦 Evento de storage detectado (logo atualizado), a recarregar logo...')
        setRefreshKey(prev => prev + 1)
        fetchLogo()
      }
    }
    
    // Verificar se há parâmetro de refresh na URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('logo-refresh')) {
      console.log('🔄 Parâmetro logo-refresh na URL, a forçar refresh...')
      setRefreshKey(prev => prev + 1)
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Também verificar quando a página ganha foco (pode ter sido atualizada noutra aba)
    window.addEventListener('focus', () => {
      console.log('👁️ Página ganhou foco, a verificar logo...')
      fetchLogo()
    })
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', fetchLogo)
    }
  }, [refreshKey])

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 hover:opacity-80 transition-opacity cursor-pointer"
    >
      {/* Container do logo - completamente integrado no header, sem retângulo visível */}
      <div className="relative flex items-center justify-center h-10 sm:h-12 md:h-12">
        {loading ? (
          // Placeholder enquanto carrega
          <div className="flex flex-col items-center justify-center">
            <span className="text-[8px] sm:text-[9px] font-light uppercase tracking-wider text-clinica-text/60 leading-none">
              CLÍNICA
            </span>
            <span className="text-sm sm:text-base md:text-lg font-bold lowercase text-clinica-text leading-none">
              Freud
            </span>
          </div>
        ) : logoUrl ? (
          // Logo carregado do Supabase - com fundo igual ao header para ocultar transparência
          <div className="relative h-full inline-flex items-center justify-center" style={{ backgroundColor: 'rgba(242, 242, 240, 0.95)', backdropFilter: 'blur(4px)' }}>
            <img
              key={`${logoUrl}-${refreshKey}`} // Key única com refreshKey para forçar re-render
              src={logoUrl}
              alt="Clínica Freud Logo"
              className="w-auto h-full max-h-full object-contain"
              loading="eager" // Carregar imediatamente, sem lazy loading
              style={{ 
                objectFit: 'contain',
                height: '100%',
                width: 'auto',
                filter: 'contrast(1.05) brightness(1.02)',
                display: 'block'
              }}
            onError={(e) => {
              // Se a imagem falhar, mostrar placeholder
              console.error('❌ Erro ao carregar imagem do logo:', e)
              setLogoUrl(null)
            }}
            onLoad={() => {
              console.log('✅ Logo carregado com sucesso')
            }}
            />
          </div>
        ) : (
          // Logo padrão (texto) se não houver imagem
          <div className="flex flex-col items-center justify-center px-4">
            <span className="text-[8px] sm:text-[9px] font-light uppercase tracking-wider text-clinica-text leading-none">
              CLÍNICA
            </span>
            <span className="text-sm sm:text-base md:text-lg font-bold lowercase text-clinica-text leading-none">
              Freud
            </span>
            {/* Texto vertical à direita */}
            <div className="hidden sm:flex flex-col justify-center gap-0.5 text-clinica-text/60 text-[7px] sm:text-[8px] font-light lowercase absolute right-2 top-1/2 -translate-y-1/2">
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
