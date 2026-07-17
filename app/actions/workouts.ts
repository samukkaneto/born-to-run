'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createWorkout(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Check if admin/treinador
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!profile || (profile.role !== 'admin' && profile.role !== 'treinador')) {
    throw new Error('Sem permissão para criar treinos')
  }

  const title = formData.get('title') as string
  const description = formData.get('description') as string
  const level = formData.get('level') as string
  const objective = formData.get('objective') as string
  const assigned_to = formData.get('assigned_to') as string

  const { error } = await supabase
    .from('workouts')
    .insert({
      title,
      description,
      level,
      objective,
      assigned_to,
      created_by: user.id,
      scheduled_date: new Date().toISOString() // Or get from form
    })

  if (error) {
    console.error('Insert error:', error)
    throw new Error('Falha ao criar treino')
  }

  revalidatePath('/treinos')
  return { success: true }
}

export async function getStudents() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('user_id, full_name')
    .eq('role', 'member')
    .order('full_name')
    
  if (error) return []
  return data
}
