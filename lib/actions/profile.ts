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
  if (fullName.length < 2) return { error: 'Informe seu nome completo.' }

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

  revalidatePath('/dashboard', 'layout')
  revalidatePath('/dashboard/perfil')
  revalidatePath('/dashboard/feed')
  return { success: true }
}
