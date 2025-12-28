'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { Upload, Check, X, Loader2 } from 'lucide-react'

export default function AdminLogoPage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setError(null)
      setSuccess(false)

      // Criar preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um ficheiro')
      return
    }

    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      // Não verificar se o bucket existe - tentar fazer upload diretamente
      // A verificação pode falhar por falta de permissões, mas o upload pode funcionar
      console.log('🚀 Tentando fazer upload do logo...')
      console.log('🔍 Verificando configuração do Supabase...')
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurado' : 'NÃO CONFIGURADO')
      console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurado' : 'NÃO CONFIGURADO')

      // Nome do ficheiro (sempre "logo" para substituir o anterior)
      const fileExt = file.name.split('.').pop()
      const fileName = `logo.${fileExt}`

      // Tentar remover TODOS os ficheiros antigos primeiro (para garantir substituição)
      // Isto evita problemas com upsert e diferentes extensões
      try {
        console.log('🗑️ A tentar remover ficheiros antigos...')
        
        // Primeiro, tentar listar ficheiros
        const { data: existingFiles, error: listError } = await supabase.storage
          .from('logos')
          .list('', {
            limit: 100,
            sortBy: { column: 'created_at', order: 'desc' }
          })

        if (listError) {
          console.warn('⚠️ Erro ao listar ficheiros:', listError)
          console.log('🔄 Tentando remover ficheiro específico diretamente...')
          
          // Se não conseguir listar, tentar remover o ficheiro específico diretamente
          // (pode ter extensões diferentes: .png, .jpg, .svg, .webp)
          const possibleExtensions = ['png', 'jpg', 'jpeg', 'svg', 'webp']
          const filesToTryRemove = possibleExtensions.map(ext => `logo.${ext}`)
          
          console.log('🗑️ Tentando remover possíveis ficheiros:', filesToTryRemove)
          const { error: directRemoveError } = await supabase.storage
            .from('logos')
            .remove(filesToTryRemove)
          
          if (directRemoveError) {
            console.warn('⚠️ Não foi possível remover ficheiros diretamente:', directRemoveError)
          } else {
            console.log('✅ Tentativa de remoção direta concluída')
          }
        } else if (existingFiles && existingFiles.length > 0) {
          // Remover TODOS os ficheiros que começam com "logo" (independente da extensão)
          const filesToRemove = existingFiles
            .filter((f: any) => f.name.toLowerCase().startsWith('logo.'))
            .map((f: any) => f.name)
          
          console.log('📋 Ficheiros encontrados no bucket:', existingFiles.map((f: any) => f.name))
          console.log('🗑️ Ficheiros a remover:', filesToRemove)
          
          if (filesToRemove.length > 0) {
            const { error: removeError, data: removeData } = await supabase.storage
              .from('logos')
              .remove(filesToRemove)
            
            if (removeError) {
              console.error('❌ Erro ao remover ficheiros antigos:', removeError)
              console.error('❌ Detalhes do erro:', JSON.stringify(removeError, null, 2))
              
              if (removeError.message.includes('permission') || 
                  removeError.message.includes('403') || 
                  removeError.message.includes('Forbidden') ||
                  removeError.message.includes('row-level security') ||
                  removeError.message.includes('RLS')) {
                throw new Error('❌ ERRO DE PERMISSÃO: A política DELETE não está a funcionar corretamente.\n\n📋 VERIFIQUE:\n\n1. Vá ao Supabase Dashboard → Storage → Policies\n2. Verifique se existe uma política DELETE para o bucket "logos"\n3. A política deve ter:\n   - Policy name: "Allow deletes from logos"\n   - Allowed operation: DELETE\n   - Target roles: anon, authenticated (ambas marcadas)\n   - USING expression: bucket_id = \'logos\'\n\n⚠️ Se a política não existe ou está incorreta, crie/edite-a conforme acima.')
              }
              // Continuar - tentar fazer upload mesmo assim
            } else {
              console.log('✅ Ficheiros antigos removidos com sucesso:', filesToRemove)
              console.log('📊 Dados da remoção:', removeData)
              
              // Verificar se foram realmente removidos
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              const { data: verifyFiles } = await supabase.storage
                .from('logos')
                .list('')
              
              const remainingLogos = verifyFiles?.filter((f: any) => 
                f.name.toLowerCase().startsWith('logo.')
              ) || []
              
              if (remainingLogos.length > 0) {
                console.warn('⚠️ Ainda existem ficheiros logo após remoção:', remainingLogos.map((f: any) => f.name))
              } else {
                console.log('✅ Confirmação: Todos os ficheiros logo foram removidos')
              }
            }
          } else {
            console.log('ℹ️ Nenhum ficheiro logo encontrado para remover')
          }
        } else {
          console.log('ℹ️ Bucket está vazio, não há ficheiros para remover')
        }
      } catch (err) {
        console.error('❌ Erro ao tentar remover ficheiros antigos:', err)
        if (err instanceof Error && err.message.includes('ERRO DE PERMISSÃO')) {
          throw err // Re-lançar erros de permissão
        }
        console.warn('⚠️ Continuando mesmo assim para tentar fazer upload...')
      }

      // Fazer upload do novo ficheiro
      console.log('📤 A fazer upload do ficheiro:', fileName)
      console.log('📦 Tamanho do ficheiro:', file.size, 'bytes')
      
      // Aguardar um pouco para garantir que qualquer remoção anterior foi processada
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '0', // Sem cache para forçar refresh
          upsert: true // Substituir se já existir
        })

      console.log('📊 Resultado do upload:', { uploadData, uploadError })

      if (uploadError) {
        console.error('❌ Erro detalhado do upload:', {
          message: uploadError.message,
          error: uploadError
        })
        
        // Mensagens de erro mais específicas
        if (uploadError.message.includes('new row violates row-level security') || 
            uploadError.message.includes('row-level security') ||
            uploadError.message.includes('RLS') ||
            uploadError.message.includes('permission denied') ||
            uploadError.message.includes('403') ||
            uploadError.message.includes('Forbidden')) {
          throw new Error('❌ ERRO DE PERMISSÃO: A política INSERT não está configurada corretamente.\n\n📋 PASSO A PASSO:\n\n1. Vá ao Supabase Dashboard → Storage → Policies\n2. Clique em "New policy" ao lado do bucket "logos"\n3. Configure:\n   - Policy name: "Allow uploads to logos"\n   - Allowed operation: INSERT\n   - Target roles: anon, authenticated (marque ambas)\n   - USING expression: bucket_id = \'logos\'\n   - WITH CHECK expression: bucket_id = \'logos\'\n4. Clique em "Save policy"\n\n⚠️ A política atual pode estar muito restritiva (só permite JPG numa pasta específica).\nCrie uma nova política INSERT simples como descrito acima.')
        } else if (uploadError.message.includes('Bucket not found') || 
                   uploadError.message.includes('does not exist') ||
                   uploadError.message.includes('not found')) {
          throw new Error('❌ Bucket "logos" não encontrado ou sem permissão de acesso.\n\nVerifique:\n1. Se o bucket "logos" existe no Supabase Dashboard (Storage > Buckets)\n2. Se o bucket está marcado como Público (PUBLIC)\n3. Se as políticas estão configuradas corretamente\n\nErro técnico: ' + uploadError.message)
        } else if (uploadError.message.includes('JWT') || 
                   uploadError.message.includes('token') ||
                   uploadError.message.includes('Unauthorized')) {
          throw new Error('Erro de autenticação. Verifique se as variáveis de ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY estão configuradas corretamente no Vercel.')
        } else if (uploadError.message.includes('duplicate') || 
                   uploadError.message.includes('already exists') ||
                   uploadError.message.includes('The resource already exists')) {
          // Se já existe, tentar remover e fazer upload novamente
          console.log('⚠️ Ficheiro já existe, tentando remover e fazer upload novamente...')
          try {
            // Remover o ficheiro existente
            const { error: removeError } = await supabase.storage
              .from('logos')
              .remove([fileName])
            
            if (removeError) {
              console.warn('⚠️ Não foi possível remover ficheiro existente:', removeError)
              throw new Error('Ficheiro já existe e não foi possível remover. Por favor, remova manualmente no Supabase Dashboard (Storage > logos) e tente novamente.')
            }
            
            // Tentar fazer upload novamente após remover
            console.log('🔄 A tentar fazer upload novamente após remover ficheiro antigo...')
            const { data: retryUploadData, error: retryUploadError } = await supabase.storage
              .from('logos')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true
              })
            
            if (retryUploadError) {
              throw retryUploadError
            }
            
            if (!retryUploadData) {
              throw new Error('Upload falhou após remover ficheiro antigo')
            }
            
            // Sucesso após retry
            console.log('✅ Upload bem-sucedido após remover ficheiro antigo')
            setSuccess(true)
            setFile(null)
            setPreview(null)
            const fileInput = document.getElementById('logo-upload') as HTMLInputElement
            if (fileInput) fileInput.value = ''
            setTimeout(() => window.open('/', '_blank'), 2000)
            setUploading(false)
            return
          } catch (retryErr) {
            throw new Error(`Erro ao substituir logo: ${retryErr instanceof Error ? retryErr.message : 'Erro desconhecido'}\n\nTente remover o ficheiro antigo manualmente no Supabase Dashboard.`)
          }
        } else {
          throw new Error(`Erro ao fazer upload: ${uploadError.message}\n\nVerifique:\n1. Se o bucket "logos" existe\n2. Se as políticas permitem INSERT\n3. Se as variáveis de ambiente estão configuradas`)
        }
      }

      if (!uploadData) {
        throw new Error('Upload falhou: nenhum dado retornado')
      }

      setSuccess(true)
      setFile(null)
      setPreview(null)
      
      // Limpar input
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }

      // Disparar evento de storage para forçar refresh em outras abas
      try {
        localStorage.setItem('logo-updated', Date.now().toString())
        localStorage.removeItem('logo-updated') // Remove imediatamente para não poluir
      } catch (e) {
        console.warn('Não foi possível disparar evento de storage:', e)
      }
      
      // Aguardar um pouco e recarregar a página principal para ver o logo atualizado
      setTimeout(() => {
        // Forçar refresh da página principal se estiver aberta
        if (window.opener) {
          window.opener.location.reload()
        }
        // Abrir a página principal numa nova aba com cache bust para verificar
        const timestamp = Date.now()
        window.open(`/?logo-refresh=${timestamp}`, '_blank')
      }, 2000)
    } catch (err) {
      console.error('Erro ao fazer upload:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao fazer upload')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-clinica-bg py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-clinica-accent border border-clinica-primary rounded-xl p-8 shadow-lg">
          <h1 className="text-3xl font-bold text-clinica-primary mb-6">Upload do Logo</h1>
          
          <div className="space-y-6">
            {/* Instruções */}
            <div className="bg-clinica-bg border border-clinica-primary rounded-lg p-4">
              <h2 className="text-lg font-semibold text-clinica-text mb-2">📋 Configuração Necessária no Supabase:</h2>
              <ol className="list-decimal list-inside space-y-2 text-clinica-text text-sm">
                <li>Verifique se o bucket <strong>"logos"</strong> existe e está marcado como <strong>Público</strong></li>
                <li><strong>Configure a política INSERT (CRÍTICO):</strong>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-xs text-clinica-text/80">
                    <li>Vá a: <strong>Supabase Dashboard → Storage → Policies</strong></li>
                    <li>Ou: <strong>Storage → Buckets → logos → Policies</strong></li>
                    <li>Clique em <strong>"New policy"</strong></li>
                    <li>Configure:
                      <div className="ml-4 mt-1 p-2 bg-clinica-accent/30 rounded text-xs font-mono">
                        <div>Policy name: <strong>"Allow uploads to logos"</strong></div>
                        <div>Allowed operation: <strong>INSERT</strong></div>
                        <div>Target roles: <strong>anon, authenticated</strong> (marque ambas)</div>
                        <div>USING expression: <code className="bg-clinica-accent px-1 rounded">bucket_id = 'logos'</code></div>
                        <div>WITH CHECK expression: <code className="bg-clinica-accent px-1 rounded">bucket_id = 'logos'</code></div>
                      </div>
                    </li>
                    <li>Clique em <strong>"Save policy"</strong></li>
                  </ul>
                </li>
                <li>Adicione também uma política para <strong>UPDATE</strong> (para substituir ficheiros):
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-xs text-clinica-text/80">
                    <li>Clique em <strong>"New policy"</strong> novamente</li>
                    <li>Configure:
                      <div className="ml-4 mt-1 p-2 bg-clinica-accent/30 rounded text-xs font-mono">
                        <div>Policy name: <strong>"Allow updates to logos"</strong></div>
                        <div>Allowed operation: <strong>UPDATE</strong></div>
                        <div>Target roles: <strong>anon, authenticated</strong> (marque ambas)</div>
                        <div>USING expression: <code className="bg-clinica-accent px-1 rounded">bucket_id = 'logos'</code></div>
                        <div>WITH CHECK expression: <code className="bg-clinica-accent px-1 rounded">bucket_id = 'logos'</code></div>
                      </div>
                    </li>
                    <li>Clique em <strong>"Save policy"</strong></li>
                  </ul>
                </li>
                <li>Adicione também uma política para <strong>DELETE</strong> (para remover ficheiros antigos):
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1 text-xs text-clinica-text/80">
                    <li>Clique em <strong>"New policy"</strong> novamente</li>
                    <li>Configure:
                      <div className="ml-4 mt-1 p-2 bg-clinica-accent/30 rounded text-xs font-mono">
                        <div>Policy name: <strong>"Allow deletes from logos"</strong></div>
                        <div>Allowed operation: <strong>DELETE</strong></div>
                        <div>Target roles: <strong>anon, authenticated</strong> (marque ambas)</div>
                        <div>USING expression: <code className="bg-clinica-accent px-1 rounded">bucket_id = 'logos'</code></div>
                      </div>
                    </li>
                    <li>Clique em <strong>"Save policy"</strong></li>
                  </ul>
                </li>
                <li>Verifique se já existe uma política <strong>SELECT</strong> para leitura (anon, authenticated)</li>
                <li>Tente fazer upload novamente abaixo</li>
              </ol>
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-xs text-red-200">
                ⚠️ <strong>Importante:</strong> Para poder substituir o logo, precisa de 3 políticas:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><strong>INSERT</strong> - para fazer upload</li>
                  <li><strong>UPDATE</strong> - para substituir ficheiros existentes</li>
                  <li><strong>DELETE</strong> - para remover ficheiros antigos</li>
                </ul>
                Se só tiver INSERT, não conseguirá substituir o logo quando fizer upload novamente.
              </div>
            </div>

            {/* Upload Area */}
            <div>
              <label
                htmlFor="logo-upload"
                className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-clinica-primary rounded-xl cursor-pointer bg-clinica-bg hover:bg-clinica-accent transition-colors"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 text-clinica-primary mb-4" />
                  <p className="mb-2 text-sm text-clinica-text">
                    <span className="font-semibold">Clique para fazer upload</span> ou arraste e solte
                  </p>
                  <p className="text-xs text-clinica-text/60">
                    PNG, JPG, SVG ou WEBP (máx. 5MB)
                  </p>
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {/* Preview */}
            {preview && (
              <div className="bg-clinica-bg border border-clinica-primary rounded-lg p-4">
                <h3 className="text-sm font-semibold text-clinica-text mb-2">Pré-visualização (como aparecerá no site):</h3>
                <div className="w-32 h-20 sm:w-40 sm:h-24 rounded-xl bg-clinica-bg flex items-center justify-center overflow-hidden">
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-full object-contain p-2"
                  />
                </div>
              </div>
            )}

            {/* Mensagens de Status */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
                <X className="w-5 h-5 text-red-600" />
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-green-600 text-sm">Logo carregado com sucesso!</p>
              </div>
            )}

            {/* Botão Upload */}
            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full bg-clinica-cta text-clinica-text px-6 py-3 rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A fazer upload...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Fazer Upload do Logo
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
