'use client'

import { Image as ImageIcon, MapPin, Loader2, Send, X } from 'lucide-react'
import { useState, useRef } from 'react'
import Image from 'next/image'
import { createPost } from '@/app/actions/post'

export function CreatePost() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim() && !imageFile) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('content', content)
      if (imageFile) {
        formData.append('image', imageFile)
      }
      
      await createPost(formData)
      
      setContent('')
      removeImage()
    } catch (error) {
      console.error(error)
      alert('Erro ao publicar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 mb-8 transition-shadow focus-within:shadow-md">
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
          <textarea 
            placeholder="Como foi o treino de hoje, atleta?" 
            className="flex-1 bg-transparent border-transparent focus:ring-0 resize-none outline-none text-gray-900 placeholder-gray-500 min-h-[60px] pt-2"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>
        
        {imagePreview && (
          <div className="relative w-full max-w-sm rounded-lg overflow-hidden ml-14">
            <Image 
              src={imagePreview} 
              alt="Preview" 
              width={400} 
              height={400} 
              className="object-cover w-full h-auto"
            />
            <button 
              type="button" 
              onClick={removeImage}
              className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-red-50 rounded-full transition-all flex items-center justify-center"
              aria-label="Adicionar foto"
              title="Adicionar Foto"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              type="button"
              className="p-2 text-gray-400 hover:text-[#DC2626] hover:bg-red-50 rounded-full transition-all flex items-center justify-center"
              aria-label="Adicionar local"
              title="Adicionar Local"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
          
          <button 
            type="submit"
            disabled={(!content.trim() && !imageFile) || loading}
            className="flex items-center space-x-2 bg-[#DC2626] text-white px-5 py-2 rounded-full font-medium hover:bg-[#B91C1C] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span>Publicar</span>
          </button>
        </div>
      </form>
    </div>
  )
}
