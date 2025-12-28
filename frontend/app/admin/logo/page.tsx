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
      // Verificar se o bucket existe, se não criar
      const { data: buckets, error: listError } = await supabase.storage.listBuckets()
      
      if (!buckets?.find(b => b.name === 'logos')) {
        // Criar bucket se não existir (requer permissões admin)
        console.log('⚠️ Bucket "logos" não existe. Precisa ser criado no Supabase Dashboard.')
        setError('Bucket "logos" não existe. Por favor, crie-o no Supabase Dashboard primeiro.')
        setUploading(false)
        return
      }

      // Nome do ficheiro (sempre "logo" para substituir o anterior)
      const fileExt = file.name.split('.').pop()
      const fileName = `logo.${fileExt}`

      // Fazer upload do ficheiro
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true // Substituir se já existir
        })

      if (uploadError) {
        throw uploadError
      }

      setSuccess(true)
      setFile(null)
      setPreview(null)
      
      // Limpar input
      const fileInput = document.getElementById('logo-upload') as HTMLInputElement
      if (fileInput) {
        fileInput.value = ''
      }
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
              <h2 className="text-lg font-semibold text-clinica-text mb-2">Instruções:</h2>
              <ol className="list-decimal list-inside space-y-1 text-clinica-text text-sm">
                <li>No Supabase Dashboard, vá a <strong>Storage</strong></li>
                <li>Crie um bucket chamado <strong>"logos"</strong> (se ainda não existir)</li>
                <li>Configure as políticas do bucket para permitir leitura pública</li>
                <li>Selecione uma imagem abaixo e faça upload</li>
              </ol>
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
                <h3 className="text-sm font-semibold text-clinica-text mb-2">Pré-visualização:</h3>
                <div className="w-32 h-20 sm:w-40 sm:h-24 rounded-xl bg-clinica-bg border-2 border-clinica-primary flex items-center justify-center overflow-hidden">
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
