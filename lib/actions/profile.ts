'use server'

import { revalidatePath } from 'next/cache'
import { getAccessContext } from '@/lib/auth/access'
import { removeMedia } from '@/lib/supabase/media'
import { cleanText, validateImageFile } from '@/lib/validation'
import type { Database } from '@/types/database.types'

export type ProfileActionResult = { success?: boolean; error?: string }

export async function updateProfile(formData: FormData): Promise<ProfileActionResult> {
  const { supabase, user, profile } = await getAccessContext()
  if (!user) return { error: 'Não autenticado.' }
  if (profile?.membership_status !== 'active') {
    return { error: 'Seu acesso à comunidade não está ativo.' }
  }

  const fullName = cleanText(formData.get('full_name'), 120)
  const cidade = cleanText(formData.get('cidade'), 100)
  const personalGoal = cleanText(formData.get('personal_goal'), 200)
  const bio = cleanText(formData.get('bio'), 300)
  const sexValue = cleanText(formData.get('sex'), 20)
  const sex = sexValue === 'male' || sexValue === 'female' ? sexValue : null
  const age = parseOptionalNumber(formData.get('age'))
  const weightKg = parseOptionalNumber(formData.get('weight_kg'))
  const heightCm = parseOptionalNumber(formData.get('height_cm'))
  const showAge = formData.get('show_age') === 'on'
  const showBodyData = formData.get('show_body_data') === 'on'

  if (fullName.length < 2) return { error: 'Informe seu nome completo.' }
  if (sexValue && !sex) return { error: 'Selecione Homem ou Mulher para o parâmetro corporal.' }
  if (age !== null && (!Number.isInteger(age) || age < 13 || age > 120)) return { error: 'Informe uma idade entre 13 e 120 anos.' }
  if (weightKg !== null && (weightKg < 20 || weightKg > 400)) return { error: 'Informe um peso entre 20 e 400 kg.' }
  if (heightCm !== null && (heightCm < 100 || heightCm > 250)) return { error: 'Informe uma altura entre 100 e 250 cm.' }

  const { data: current, error: lookupError } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('user_id', user.id)
    .single()
  if (lookupError) return { error: 'Não foi possível carregar seu perfil.' }

  const fileEntry = formData.get('avatar')
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null
  let newAvatarPath: string | null = null

  if (file) {
    const validation = await validateImageFile(file, 5 * 1024 * 1024)
    if ('error' in validation) return { error: validation.error }

    newAvatarPath = `${user.id}/${crypto.randomUUID()}.${validation.extension}`
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(newAvatarPath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })
    if (uploadError) return { error: 'Erro ao enviar a foto. Tente novamente.' }
  }

  const update: Database['public']['Tables']['profiles']['Update'] = {
    full_name: fullName,
    cidade: cidade || null,
    bio: bio || null,
  }
  if (newAvatarPath) update.avatar_url = newAvatarPath

  const { data: saved, error } = await supabase
    .from('profiles')
    .update(update)
    .eq('user_id', user.id)
    .select('user_id')
    .maybeSingle()

  if (error || !saved) {
    await removeMedia(supabase, 'avatars', newAvatarPath)
    return { error: 'Erro ao salvar o perfil. Tente novamente.' }
  }

  if (newAvatarPath && current.avatar_url !== newAvatarPath) {
    await removeMedia(supabase, 'avatars', current.avatar_url)
  }

  const goalResult = personalGoal
    ? await supabase.from('personal_goals').upsert({ user_id: user.id, goal: personalGoal }, { onConflict: 'user_id' })
    : await supabase.from('personal_goals').delete().eq('user_id', user.id)
  if (goalResult.error) return { error: 'O perfil foi salvo, mas não foi possível atualizar sua meta privada.' }

  const healthResult = await supabase.from('member_health_profiles').upsert({
    user_id: user.id,
    sex,
    age,
    weight_kg: weightKg,
    height_cm: heightCm,
    show_age: showAge,
    show_body_data: showBodyData,
  }, { onConflict: 'user_id' })
  if (healthResult.error) return { error: 'O perfil foi salvo, mas não foi possível atualizar seus dados físicos.' }

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/perfil')
  revalidatePath('/dashboard/feed')
  revalidatePath('/dashboard/avaliacoes')
  return { success: true }
}

function parseOptionalNumber(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || value.trim() === '') return null
  const normalized = Number(value.replace(',', '.'))
  return Number.isFinite(normalized) ? normalized : null
}
