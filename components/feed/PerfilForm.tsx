'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Camera, Loader2, Save } from 'lucide-react'
import { updateProfile } from '@/lib/actions/profile'
import type { MemberHealthProfile, MemberProfile } from '@/types'

export default function PerfilForm({
  profile,
  personalGoal,
  healthProfile,
}: {
  profile: MemberProfile
  personalGoal: string
  healthProfile: MemberHealthProfile | null
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [bio, setBio] = useState(profile.bio || '')
  const [cidade, setCidade] = useState(profile.cidade || '')
  const [personalGoalValue, setPersonalGoalValue] = useState(personalGoal)
  const [sex, setSex] = useState(healthProfile?.sex || '')
  const [age, setAge] = useState(healthProfile?.age?.toString() || '')
  const [weightKg, setWeightKg] = useState(healthProfile?.weight_kg?.toString() || '')
  const [heightCm, setHeightCm] = useState(healthProfile?.height_cm?.toString() || '')
  const [showAge, setShowAge] = useState(healthProfile?.show_age ?? false)
  const [showBodyData, setShowBodyData] = useState(healthProfile?.show_body_data ?? false)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const initials =
    fullName
      .split(' ')
      .map((name) => name[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'A'

  function handleAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      event.target.value = ''
      setMessage({ type: 'error', text: 'A foto deve ter no máximo 5 MB.' })
      return
    }
    setPreview(URL.createObjectURL(file))
    setMessage(null)
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const result = await updateProfile(new FormData(event.currentTarget))
      if (result.error) {
        setMessage({ type: 'error', text: result.error })
        return
      }
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' })
      setPreview(null)
      if (fileRef.current) fileRef.current.value = ''
      router.refresh()
    } catch {
      setMessage({ type: 'error', text: 'Não foi possível salvar agora. Tente novamente.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="max-w-lg space-y-6">
      <div className="flex items-center gap-5">
        <div className="relative">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-red-100">
            {preview || profile.avatar_url ? (
              <Image
                src={preview || profile.avatar_url || ''}
                alt={`Foto de ${fullName || 'atleta'}`}
                width={80}
                height={80}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-2xl font-black text-[var(--color-red)]">{initials}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-red)] text-white transition-colors hover:bg-red-700"
            aria-label="Alterar foto"
          >
            <Camera size={15} aria-hidden="true" />
          </button>
        </div>
        <div>
          <p className="font-semibold text-stone-800">{fullName || 'Seu nome'}</p>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="mt-0.5 text-sm text-[var(--color-red)] hover:underline"
          >
            Escolher foto de perfil
          </button>
          <p className="mt-1 text-xs text-stone-500">JPG, PNG ou WebP · até 5 MB</p>
        </div>
        <input
          ref={fileRef}
          id="profile-avatar"
          name="avatar"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleAvatar}
          className="hidden"
        />
      </div>

      <div className="grid gap-4">
        <div>
          <label htmlFor="profile-full-name" className="mb-1.5 block text-sm font-semibold text-stone-700">Nome completo</label>
          <input id="profile-full-name" name="full_name" value={fullName} onChange={(event) => setFullName(event.target.value)} maxLength={120} className="input-base" placeholder="Seu nome completo" required />
        </div>
        <div>
          <label htmlFor="profile-city" className="mb-1.5 block text-sm font-semibold text-stone-700">Cidade</label>
          <input id="profile-city" name="cidade" value={cidade} onChange={(event) => setCidade(event.target.value)} maxLength={100} className="input-base" placeholder="Ex: Descalvado - SP" />
        </div>
        <fieldset className="border border-stone-200 bg-stone-50 p-4">
          <legend className="px-1 text-sm font-semibold text-stone-700">Dados para personalizar sua avaliação</legend>
          <p className="mt-1 text-xs leading-relaxed text-stone-500">O sexo informado aqui é usado como parâmetro da Tanita para escolher a ilustração corporal. Ele não é inferido pelo seu nome ou pela sua foto.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="profile-sex" className="mb-1.5 block text-sm font-semibold text-stone-700">Sexo</label>
              <select id="profile-sex" name="sex" value={sex} onChange={(event) => setSex(event.target.value)} className="input-base bg-white">
                <option value="">Prefiro não informar</option>
                <option value="male">Homem</option>
                <option value="female">Mulher</option>
              </select>
            </div>
            <div>
              <label htmlFor="profile-age" className="mb-1.5 block text-sm font-semibold text-stone-700">Idade</label>
              <input id="profile-age" name="age" type="number" inputMode="numeric" min={13} max={120} value={age} onChange={(event) => setAge(event.target.value)} className="input-base" placeholder="Ex: 35" />
            </div>
            <div>
              <label htmlFor="profile-weight" className="mb-1.5 block text-sm font-semibold text-stone-700">Peso atual (kg)</label>
              <input id="profile-weight" name="weight_kg" type="number" inputMode="decimal" min={20} max={400} step="0.1" value={weightKg} onChange={(event) => setWeightKg(event.target.value)} className="input-base" placeholder="Ex: 72,5" />
            </div>
            <div>
              <label htmlFor="profile-height" className="mb-1.5 block text-sm font-semibold text-stone-700">Altura (cm)</label>
              <input id="profile-height" name="height_cm" type="number" inputMode="decimal" min={100} max={250} step="0.1" value={heightCm} onChange={(event) => setHeightCm(event.target.value)} className="input-base" placeholder="Ex: 175" />
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-stone-700">
            <label className="flex items-start gap-3"><input name="show_age" type="checkbox" checked={showAge} onChange={(event) => setShowAge(event.target.checked)} className="mt-0.5 h-4 w-4 accent-red-600" /><span><strong>Exibir minha idade no perfil compartilhado.</strong><span className="block text-xs text-stone-500">Desmarcado, sua idade continua privada.</span></span></label>
            <label className="flex items-start gap-3"><input name="show_body_data" type="checkbox" checked={showBodyData} onChange={(event) => setShowBodyData(event.target.checked)} className="mt-0.5 h-4 w-4 accent-red-600" /><span><strong>Permitir que a equipe veja meus dados físicos básicos.</strong><span className="block text-xs text-stone-500">Inclui sexo, peso e altura para personalizar o acompanhamento. Desmarcado, ficam visíveis somente para você.</span></span></label>
          </div>
        </fieldset>
        <div>
          <label htmlFor="profile-goal" className="mb-1.5 block text-sm font-semibold text-stone-700">Meta</label>
          <input id="profile-goal" name="personal_goal" value={personalGoalValue} onChange={(event) => setPersonalGoalValue(event.target.value)} maxLength={200} className="input-base" placeholder="Ex: Completar minha primeira corrida de 10 km" />
          <p className="mt-1 text-xs text-stone-500">Somente você pode ver esta meta.</p>
        </div>
        <div>
          <label htmlFor="profile-bio" className="mb-1.5 block text-sm font-semibold text-stone-700">Bio</label>
          <textarea id="profile-bio" name="bio" value={bio} onChange={(event) => setBio(event.target.value)} rows={3} maxLength={300} className="input-base resize-none" placeholder="Conte um pouco sobre você..." />
          <p className="mt-1 text-xs text-stone-500">{bio.length}/300</p>
        </div>
      </div>

      {message && (
        <div role={message.type === 'error' ? 'alert' : 'status'} className={`rounded-lg border px-4 py-3 text-sm font-medium ${message.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <button type="submit" id="profile-save-btn" disabled={loading} className="btn-primary py-3">
        {loading ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Save size={17} aria-hidden="true" />}
        {loading ? 'Salvando...' : 'Salvar perfil'}
      </button>
    </form>
  )
}
