'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type AdminActionResult = { success?: boolean; error?: string }

/**
 * Garante que o usuário atual está autenticado E é admin.
 * Toda mutação do painel do treinador passa por aqui (defesa em
 * profundidade — o RLS do Supabase é a última barreira).
 */
async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { supabase, user: null, error: 'Acesso restrito ao treinador.' }
  }
  return { supabase, user, error: null }
}

/* ── Validações de formulário ── */

const VALID_LEVELS = ['iniciante', 'intermediario', 'avancado'] as const

function parseWorkoutForm(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const description = String(formData.get('description') ?? '').trim()
  const objective = String(formData.get('objective') ?? '').trim()
  const level = String(formData.get('level') ?? '').trim()
  const scheduledDate = String(formData.get('scheduled_date') ?? '').trim()

  if (!title || title.length < 3) return { error: 'Informe um título com pelo menos 3 caracteres.' }
  if (!description) return { error: 'A descrição do treino é obrigatória.' }
  if (!objective) return { error: 'Informe o objetivo do treino.' }
  if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
    return { error: 'Selecione um nível válido.' }
  }
  return {
    data: {
      title,
      description,
      objective,
      level,
      scheduled_date: scheduledDate || null,
    },
  }
}

function parseAnnouncementForm(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  if (!title || title.length < 3) return { error: 'Informe um título com pelo menos 3 caracteres.' }
  if (!content) return { error: 'O conteúdo do comunicado é obrigatório.' }
  return { data: { title, content } }
}

/* ── Treinos ── */

export async function createWorkout(formData: FormData): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const parsed = parseWorkoutForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  const { error } = await supabase
    .from('workouts')
    .insert({ ...parsed.data, created_by: user.id })

  if (error) return { error: 'Erro ao criar treino. Tente novamente.' }
  revalidatePath('/admin/treinos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/treinos')
  return { success: true }
}

export async function updateWorkout(
  id: string,
  formData: FormData,
): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  if (!id) return { error: 'Treino inválido.' }

  const parsed = parseWorkoutForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  const { error } = await supabase.from('workouts').update(parsed.data).eq('id', id)

  if (error) return { error: 'Erro ao atualizar treino. Tente novamente.' }
  revalidatePath('/admin/treinos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/treinos')
  return { success: true }
}

export async function deleteWorkout(id: string): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  if (!id) return { error: 'Treino inválido.' }

  const { error } = await supabase.from('workouts').delete().eq('id', id)
  if (error) return { error: 'Erro ao remover treino. Tente novamente.' }

  revalidatePath('/admin/treinos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/treinos')
  return { success: true }
}

/* ── Comunicados ── */

export async function createAnnouncement(formData: FormData): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const parsed = parseAnnouncementForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  const { error } = await supabase
    .from('announcements')
    .insert({ ...parsed.data, created_by: user.id })

  if (error) return { error: 'Erro ao criar comunicado. Tente novamente.' }
  revalidatePath('/admin/comunicados')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/comunicados')
  return { success: true }
}

export async function updateAnnouncement(
  id: string,
  formData: FormData,
): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  if (!id) return { error: 'Comunicado inválido.' }

  const parsed = parseAnnouncementForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  const { error } = await supabase.from('announcements').update(parsed.data).eq('id', id)

  if (error) return { error: 'Erro ao atualizar comunicado. Tente novamente.' }
  revalidatePath('/admin/comunicados')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/comunicados')
  return { success: true }
}

export async function deleteAnnouncement(id: string): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  if (!id) return { error: 'Comunicado inválido.' }

  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) return { error: 'Erro ao remover comunicado. Tente novamente.' }

  revalidatePath('/admin/comunicados')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/comunicados')
  return { success: true }
}

/* ── Membros ── */

export async function deleteMember(userId: string): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  if (!userId) return { error: 'Membro inválido.' }
  if (userId === user.id) {
    return { error: 'Você não pode remover a própria conta pelo painel.' }
  }

  const { error } = await supabase.from('profiles').delete().eq('user_id', userId)
  if (error) return { error: 'Erro ao remover membro. Tente novamente.' }

  revalidatePath('/admin/membros')
  return { success: true }
}

export async function toggleAdminRole(
  userId: string,
  currentRole: string,
): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  if (!userId) return { error: 'Membro inválido.' }
  if (userId === user.id) {
    return { error: 'Você não pode alterar a própria função.' }
  }

  const newRole = currentRole === 'admin' ? 'member' : 'admin'
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('user_id', userId)

  if (error) return { error: 'Erro ao alterar função. Tente novamente.' }
  revalidatePath('/admin/membros')
  return { success: true }
}
