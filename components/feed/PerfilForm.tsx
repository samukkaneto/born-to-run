'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Camera, Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'

export default function PerfilForm({ profile, userId }: {
  profile: Profile
  userId:  string
}) {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [fullName,   setFullName]   = useState(profile.full_name   || '')
  const [bio,        setBio]        = useState(profile.bio         || '')
  const [cidade,     setCidade]     = useState(profile.cidade      || '')
  const [objetivo,   setObjetivo]   = useState(profile.objetivo    || '')
  const [avatarUrl,  setAvatarUrl]  = useState(profile.avatar_url  || '')
  const [preview,    setPreview]    = useState<string | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [msg,        setMsg]        = useState<{ type: 'success'|'error'; text: string } | null>(null)

  const supabase = createClient()
  const initials = fullName.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase() || 'A'

  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'A foto deve ter no máximo 5 MB.' })
      return
    }

    setPreview(URL.createObjectURL(file))
    setMsg(null)

    const ext  = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) {
      setPreview(null)
      setMsg({ type: 'error', text: 'Erro ao enviar a foto. Tente novamente.' })
    } else {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setMsg(null)

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, bio, cidade, objetivo, avatar_url: avatarUrl || null })
      .eq('user_id', userId)

    if (error) {
      setMsg({ type: 'error', text: 'Erro ao salvar. Tente novamente.' })
    } else {
      setMsg({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-lg">
      {/* Avatar */}
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center overflow-hidden">
            {preview || avatarUrl ? (
              <Image src={preview || avatarUrl} alt="Avatar" width={80} height={80}
                     className="w-full h-full object-cover" />
            ) : (
              <span className="text-[var(--color-red)] font-black text-2xl">{initials}</span>
            )}
          </div>
          <button type="button" onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-[var(--color-red)] rounded-full
                             flex items-center justify-center text-white hover:bg-red-700 transition-colors"
                  aria-label="Alterar foto">
            <Camera size={13} />
          </button>
        </div>
        <div>
          <p className="font-semibold text-stone-800">{fullName || 'Seu nome'}</p>
          <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-sm text-[var(--color-red)] hover:underline mt-0.5">
            Alterar foto de perfil
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
      </div>

      {/* Campos */}
      <div className="grid gap-4">
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">Nome completo</label>
          <input value={fullName} onChange={e => setFullName(e.target.value)}
                 className="input-base" placeholder="Seu nome completo" required />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">Cidade</label>
          <input value={cidade} onChange={e => setCidade(e.target.value)}
                 className="input-base" placeholder="Ex: Descalvado - SP" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">Objetivo</label>
          <input value={objetivo} onChange={e => setObjetivo(e.target.value)}
                 className="input-base" placeholder="Ex: Completar minha primeira corrida de 10km" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-stone-700 mb-1.5">Bio</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)}
                    rows={3} maxLength={300}
                    className="input-base resize-none"
                    placeholder="Conte um pouco sobre você..." />
          <p className="text-xs text-stone-400 mt-1">{bio.length}/300</p>
        </div>
      </div>

      {/* Feedback */}
      {msg && (
        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
          msg.type === 'success'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      <button type="submit" id="profile-save-btn" disabled={loading}
              className="btn-primary py-3">
        {loading ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
        {loading ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </form>
  )
}
