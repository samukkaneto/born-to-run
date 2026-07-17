'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Loader2, Save } from 'lucide-react'
import { updateProfile } from '@/app/actions/profile'

type ProfileFormProps = {
  initialData: any
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.avatar_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      if (initialData?.avatar_url) {
        formData.append('current_avatar', initialData.avatar_url)
      }
      
      await updateProfile(formData)
      alert('Perfil atualizado com sucesso!')
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 pb-6 border-b border-gray-100">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md relative">
            {imagePreview ? (
              <Image src={imagePreview} alt="Avatar" fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-red-100 text-[#DC2626] font-bold text-2xl">
                {(initialData?.full_name || 'AT').substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 p-2 bg-[#DC2626] text-white rounded-full hover:bg-[#B91C1C] transition-colors shadow-sm"
          >
            <Camera className="w-4 h-4" />
          </button>
          <input 
            type="file" 
            name="avatar" 
            accept="image/*" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>
        
        <div className="text-center sm:text-left flex-1 pt-2">
          <h3 className="text-lg font-bold text-gray-900">Foto de Perfil</h3>
          <p className="text-sm text-gray-500 mb-2">Recomendado: 500x500px (JPG ou PNG). Máx 5MB.</p>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
          <input 
            type="text" 
            name="full_name"
            defaultValue={initialData?.full_name || ''}
            required
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none transition-all"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sua Biografia</label>
          <textarea 
            name="bio"
            defaultValue={initialData?.bio || ''}
            rows={3}
            placeholder="Conte um pouco sobre você e sua história na corrida..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
            <input 
              type="text" 
              name="cidade"
              defaultValue={initialData?.cidade || ''}
              placeholder="Ex: São Paulo, SP"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Seu Maior Objetivo</label>
            <select 
              name="objetivo" 
              defaultValue={initialData?.objetivo || ''}
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#DC2626] outline-none transition-all"
            >
              <option value="">Selecione...</option>
              <option value="Emagrecimento">Emagrecimento</option>
              <option value="Condicionamento">Condicionamento Físico</option>
              <option value="5k">Completar 5k / 10k</option>
              <option value="Meia Maratona">Meia Maratona (21k)</option>
              <option value="Maratona">Maratona (42k)</option>
              <option value="Ultramaratona">Ultramaratona</option>
            </select>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button 
          type="submit"
          disabled={loading}
          className="bg-[#DC2626] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#B91C1C] transition-all flex items-center space-x-2 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Salvar Alterações</span>
        </button>
      </div>
    </form>
  )
}
