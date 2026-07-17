'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createWorkout(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('workouts').insert({
    title:          formData.get('title') as string,
    description:    formData.get('description') as string,
    level:          formData.get('level') as string,
    objective:      formData.get('objective') as string,
    scheduled_date: (formData.get('scheduled_date') as string) || null,
    created_by:     user.id,
  })

  if (error) return { error: 'Erro ao criar treino.' }
  revalidatePath('/admin/treinos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/treinos')
  return { success: true }
}

export async function deleteWorkout(id: string) {
  const supabase = await createClient()
  await supabase.from('workouts').delete().eq('id', id)
  revalidatePath('/admin/treinos')
  revalidatePath('/dashboard/treinos')
}

export async function createAnnouncement(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const { error } = await supabase.from('announcements').insert({
    title:      formData.get('title') as string,
    content:    formData.get('content') as string,
    created_by: user.id,
  })

  if (error) return { error: 'Erro ao criar comunicado.' }
  revalidatePath('/admin/comunicados')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteAnnouncement(id: string) {
  const supabase = await createClient()
  await supabase.from('announcements').delete().eq('id', id)
  revalidatePath('/admin/comunicados')
  revalidatePath('/dashboard')
}

export async function deleteMember(userId: string) {
  const supabase = await createClient()
  await supabase.from('profiles').delete().eq('user_id', userId)
  revalidatePath('/admin/membros')
}

export async function toggleAdminRole(userId: string, currentRole: string) {
  const supabase = await createClient()
  const newRole = currentRole === 'admin' ? 'member' : 'admin'
  await supabase.from('profiles').update({ role: newRole }).eq('user_id', userId)
  revalidatePath('/admin/membros')
}
