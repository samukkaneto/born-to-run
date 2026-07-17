'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const full_name = formData.get('full_name') as string
  const bio = formData.get('bio') as string
  const cidade = formData.get('cidade') as string
  const objetivo = formData.get('objetivo') as string
  const file = formData.get('avatar') as File | null

  let avatar_url = formData.get('current_avatar') as string

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-avatar.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (!uploadError) {
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)
      avatar_url = publicUrl
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      bio,
      cidade,
      objetivo,
      avatar_url
    })
    .eq('user_id', user.id)

  if (error) {
    console.error('Update profile error:', error)
    throw new Error('Falha ao atualizar perfil')
  }

  revalidatePath('/perfil')
  return { success: true }
}
