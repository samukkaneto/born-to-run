'use client'

import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { ImagePlus, X, Loader2, MapPin, Clock, Zap } from 'lucide-react'
import { createPost } from '@/lib/actions/feed'

export default function NewPostForm({ avatarUrl, fullName }: {
  avatarUrl?: string | null
  fullName:   string
}) {
  const [expanded, setExpanded]   = useState(false)
  const [preview, setPreview]     = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await createPost(new FormData(e.currentTarget))
      if (result?.error) {
        setError(result.error)
      } else {
        formRef.current?.reset()
        setPreview(null)
        setExpanded(false)
      }
    } catch {
      setError('Não foi possível publicar agora. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const initials = fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="card p-4">
      {/* Linha inicial */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
          {avatarUrl
            ? <Image src={avatarUrl} alt="Avatar" width={40} height={40} className="object-cover w-full h-full" />
            : <span className="text-[var(--color-red)] font-bold text-sm">{initials}</span>
          }
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="flex-1 text-left bg-stone-50 hover:bg-stone-100 transition-colors
                     rounded-xl px-4 py-2.5 text-stone-400 text-sm cursor-text"
        >
          Compartilhe sua corrida de hoje...
        </button>
      </div>

      {/* Formulário expandido */}
      {expanded && (
        <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-4 animate-slide-up">
          {/* Legenda */}
          <textarea
            id="post-caption"
            name="caption"
            aria-label="Legenda da publicação"
            placeholder="Conte como foi o treino..."
            rows={3}
            maxLength={500}
            className="input-base resize-none"
          />

          {/* Dados do treino */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="post-distance" className="text-xs text-stone-500 font-semibold flex items-center gap-1 mb-1">
                <MapPin size={11} /> Distância (km)
              </label>
              <input id="post-distance" name="distance" type="number" step="0.01" min="0.01" max="999.99"
                     placeholder="Ex: 5.2" className="input-base text-sm" />
            </div>
            <div>
              <label htmlFor="post-duration" className="text-xs text-stone-500 font-semibold flex items-center gap-1 mb-1">
                <Clock size={11} /> Duração (min)
              </label>
              <input id="post-duration" name="duration" type="number" min="1" max="10080"
                     placeholder="Ex: 30" className="input-base text-sm" />
            </div>
            <div>
              <label htmlFor="post-pace" className="text-xs text-stone-500 font-semibold flex items-center gap-1 mb-1">
                <Zap size={11} /> Pace (min/km)
              </label>
              <input id="post-pace" name="pace" type="text" inputMode="numeric" pattern="[0-9]{1,2}:[0-5][0-9]" placeholder="Ex: 05:30"
                     className="input-base text-sm" />
            </div>
          </div>

          {/* Preview foto */}
          {preview && (
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <Image src={preview} alt="Preview" fill style={{ objectFit: 'cover' }} />
              <button type="button" onClick={() => { setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80" aria-label="Remover foto selecionada">
                <X size={14} />
              </button>
            </div>
          )}

          <input ref={fileRef} name="photo" type="file"
                 accept="image/jpeg,image/jpg,image/png,image/webp"
                 onChange={handleFile} className="hidden" id="post-photo-input" />

          {error && (
            <p role="alert" className="text-red-700 text-sm bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-1">
            <label htmlFor="post-photo-input"
                   className="flex items-center gap-1.5 text-stone-500 hover:text-[var(--color-red)]
                              transition-colors text-sm font-medium cursor-pointer">
              <ImagePlus size={18} />
              Foto
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setExpanded(false); setPreview(null); if (fileRef.current) fileRef.current.value = '' }}
                      className="btn-outline py-1.5 px-4 text-sm">
                Cancelar
              </button>
              <button type="submit" id="post-submit-btn" disabled={loading}
                      className="btn-primary py-1.5 px-4 text-sm">
                {loading ? <Loader2 size={15} className="animate-spin" /> : 'Publicar'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}
