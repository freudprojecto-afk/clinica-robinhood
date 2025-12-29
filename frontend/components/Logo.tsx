'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

interface LogoProps {
  onClick?: () => void
}

export default function Logo({ onClick }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastFileTimestamp, setLastFileTimestamp] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    let intervalId: ReturnType<typeof setInterval> | null = null

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
            if (isMounted) {
              setLogoUrl(null)
              setLoading(false)
            }
            return
          }
          console.error('❌ Erro ao listar ficheiros:', error)
          throw error
        }

        if (data && data.length > 0) {
          // Procurar por ficheiro que começa com "logo"
          const logoFile = data.find(file => 
            file.name.toLowerCase().startsWith('logo.')
          )

          if (logoFile) {
            // Verificar se o ficheiro mudou comparando timestamps
            const currentTimestamp = logoFile.updated_at || logoFile.created_at || ''
            
            // Só atualizar se o timestamp mudou
            if (currentTimestamp === lastFileTimestamp && logoUrl) {
              console.log('ℹ️ Logo não mudou, mantendo cache')
              if (isMounted) {
                setLoading(false)
              }
              return
            }

            console.log('✅ Logo encontrado:', logoFile.name)
            
            // Obter URL pública do logo
            const { data: urlData } = supabase.storage
              .from('logos')
              .getPublicUrl(logoFile.name)

            if (urlData?.publicUrl) {
              // Usar apenas o timestamp do ficheiro para cache busting (sem Date.now() que muda sempre)
              const fileTimestamp = new Date(currentTimestamp).getTime()
              const urlWithCacheBuster = `${urlData.publicUrl}?v=${fileTimestamp}`
              
              console.log('🔗 URL do logo:', urlWithCacheBuster)
              if (isMounted) {
                setLogoUrl(urlWithCacheBuster)
                setLastFileTimestamp(currentTimestamp)
              }
            } else {
              console.warn('⚠️ URL pública não disponível')
              if (isMounted) {
                setLogoUrl(null)
              }
            }
          } else {
            console.log('⚠️ Nenhum ficheiro "logo.*" encontrado. Usando logo padrão.')
            if (isMounted) {
              setLogoUrl(null)
              setLastFileTimestamp(null)
            }
          }
        } else {
          console.log('⚠️ Bucket "logos" está vazio. Usando logo padrão.')
          if (isMounted) {
            setLogoUrl(null)
            setLastFileTimestamp(null)
          }
        }
      } catch (err) {
        console.error('❌ Erro ao buscar logo:', err)
        if (isMounted) {
          setLogoUrl(null)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    // Carregar logo inicial
    fetchLogo()
    
    // Verificar mudanças apenas a cada 30 segundos (em vez de 3 segundos)
    intervalId = setInterval(() => {
      if (isMounted) {
        fetchLogo()
      }
    }, 30000)
    
    // Listener para eventos de storage (quando há novo upload noutra aba)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'logo-updated' && isMounted) {
        console.log('📦 Evento de storage detectado (logo atualizado), a recarregar logo...')
        setLastFileTimestamp(null) // Forçar verificação
        fetchLogo()
      }
    }
    
    // Verificar se há parâmetro de refresh na URL (apenas uma vez no carregamento)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.has('logo-refresh')) {
      console.log('🔄 Parâmetro logo-refresh na URL, a forçar refresh...')
      setLastFileTimestamp(null) // Forçar verificação
      fetchLogo()
    }
    
    window.addEventListener('storage', handleStorageChange)
    // Verificar quando a página ganha foco (apenas se passou algum tempo)
    let lastFocusCheck = Date.now()
    window.addEventListener('focus', () => {
      const now = Date.now()
      // Só verificar se passou pelo menos 5 segundos desde a última verificação
      if (now - lastFocusCheck > 5000 && isMounted) {
        console.log('👁️ Página ganhou foco, a verificar logo...')
        lastFocusCheck = now
        fetchLogo()
      }
    })
    
    return () => {
      isMounted = false
      if (intervalId) {
        clearInterval(intervalId)
      }
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('focus', fetchLogo)
    }
  }, []) // Sem dependências - só executa uma vez no mount

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
              key={logoUrl} // Key baseada apenas na URL (sem refreshKey que muda constantemente)
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
