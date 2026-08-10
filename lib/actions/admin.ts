'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cleanText, isUuid, uniqueUuids } from '@/lib/validation'
import type { MembershipStatus, UserRole } from '@/types'

export type AdminActionResult = { success?: boolean; error?: string; id?: string }

const VALID_LEVELS = ['iniciante', 'intermediario', 'avancado'] as const
const VALID_STATUSES: MembershipStatus[] = ['pending', 'active', 'suspended', 'rejected']

async function requireRole(allowedRoles: UserRole[], message: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, error: 'Não autenticado.' }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role, membership_status')
    .eq('user_id', user.id)
    .maybeSingle()

  if (
    error
    || !profile
    || !allowedRoles.includes(profile.role as UserRole)
    || profile.membership_status !== 'active'
  ) {
    return { supabase, user: null, error: message }
  }
  return { supabase, user, error: null }
}

const requireAdmin = () => requireRole(['admin'], 'Acesso restrito ao administrador.')
const requireCoach = () => requireRole(['coach'], 'Acesso restrito ao treinador.')
const requireAccessManager = () => requireRole(
  ['admin', 'coach'],
  'Acesso restrito ao administrador ou treinador.',
)

function safeDate(value: FormDataEntryValue | null): string | null | 'invalid' {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return 'invalid'
  const [year, month, day] = raw.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
    ? raw
    : 'invalid'
}

function parseWorkoutForm(formData: FormData) {
  const title = cleanText(formData.get('title'), 160)
  const description = cleanText(formData.get('description'), 5000)
  const objective = cleanText(formData.get('objective'), 500)
  const level = String(formData.get('level') ?? '')
  const scheduledDate = safeDate(formData.get('scheduled_date'))
  const memberIds = uniqueUuids(formData.getAll('member_ids'))
  const groupIds = uniqueUuids(formData.getAll('group_ids'))

  if (title.length < 3) return { error: 'Informe um título com pelo menos 3 caracteres.' }
  if (!description) return { error: 'A descrição do treino é obrigatória.' }
  if (!objective) return { error: 'Informe o objetivo do treino.' }
  if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
    return { error: 'Selecione um nível válido.' }
  }
  if (scheduledDate === 'invalid') return { error: 'Informe uma data válida.' }
  if (!memberIds || !groupIds) return { error: 'A lista de destinatários é inválida.' }
  if (memberIds.length === 0 && groupIds.length === 0) {
    return { error: 'Escolha ao menos um atleta ou grupo para este treino.' }
  }

  return {
    data: {
      title,
      description,
      objective,
      level: level as (typeof VALID_LEVELS)[number],
      scheduledDate,
      audience: 'targeted' as const,
      memberIds,
      groupIds,
    },
  }
}

function parseAnnouncementForm(formData: FormData) {
  const title = cleanText(formData.get('title'), 160)
  const content = cleanText(formData.get('content'), 5000)
  if (title.length < 3) return { error: 'Informe um título com pelo menos 3 caracteres.' }
  if (!content) return { error: 'O conteúdo do comunicado é obrigatório.' }
  return { data: { title, content } }
}

function refreshWorkouts() {
  revalidatePath('/admin/treinos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/treinos')
}

export async function createWorkout(formData: FormData): Promise<AdminActionResult> {
  return saveWorkout(null, formData)
}

export async function updateWorkout(id: string, formData: FormData): Promise<AdminActionResult> {
  if (!isUuid(id)) return { error: 'Treino inválido.' }
  return saveWorkout(id, formData)
}

async function saveWorkout(id: string | null, formData: FormData): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireCoach()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const parsed = parseWorkoutForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  const { data, error } = await supabase.rpc('admin_save_workout', {
    // O gerador do Supabase tipa argumentos de RPC como não nulos, embora
    // PostgreSQL aceite NULL para distinguir criação de edição.
    target_workout_id: id as string,
    target_title: parsed.data.title,
    target_description: parsed.data.description,
    target_level: parsed.data.level,
    target_objective: parsed.data.objective,
    target_scheduled_date: parsed.data.scheduledDate as string,
    target_audience: parsed.data.audience,
    target_member_ids: parsed.data.memberIds,
    target_group_ids: parsed.data.groupIds,
  })

  if (error || !data) return { error: 'Erro ao salvar treino. Confira os destinatários e tente novamente.' }
  refreshWorkouts()
  return { success: true, id: data }
}

export async function deleteWorkout(id: string): Promise<AdminActionResult> {
  if (!isUuid(id)) return { error: 'Treino inválido.' }
  const { supabase, user, error: authError } = await requireCoach()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const { data, error } = await supabase
    .from('workouts')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error || !data) return { error: 'Treino não encontrado ou sem permissão para remover.' }

  refreshWorkouts()
  return { success: true }
}

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

export async function updateAnnouncement(id: string, formData: FormData): Promise<AdminActionResult> {
  if (!isUuid(id)) return { error: 'Comunicado inválido.' }
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  const parsed = parseAnnouncementForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  const { data, error } = await supabase
    .from('announcements')
    .update(parsed.data)
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error || !data) return { error: 'Comunicado não encontrado ou sem permissão para alterar.' }

  revalidatePath('/admin/comunicados')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/comunicados')
  return { success: true }
}

export async function deleteAnnouncement(id: string): Promise<AdminActionResult> {
  if (!isUuid(id)) return { error: 'Comunicado inválido.' }
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const { data, error } = await supabase
    .from('announcements')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle()
  if (error || !data) return { error: 'Comunicado não encontrado ou sem permissão para remover.' }

  revalidatePath('/admin/comunicados')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/comunicados')
  return { success: true }
}

const ALLOWED_TRANSITIONS: Record<MembershipStatus, MembershipStatus[]> = {
  pending: ['active', 'rejected'],
  active: ['suspended'],
  suspended: ['active'],
  rejected: ['pending', 'active'],
}

export async function updateMembershipStatus(
  userId: string,
  nextStatus: MembershipStatus,
  note = '',
): Promise<AdminActionResult> {
  if (!isUuid(userId) || !VALID_STATUSES.includes(nextStatus)) {
    return { error: 'Membro ou status inválido.' }
  }
  const { supabase, user, error: authError } = await requireAccessManager()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  if (userId === user.id) return { error: 'Você não pode alterar o próprio acesso.' }

  const { data: target, error: lookupError } = await supabase
    .from('profiles')
    .select('membership_status')
    .eq('user_id', userId)
    .maybeSingle()
  if (lookupError || !target) return { error: 'Membro não encontrado.' }
  const currentStatus = target.membership_status as MembershipStatus
  if (!VALID_STATUSES.includes(currentStatus) || !ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus)) {
    return { error: 'Essa mudança de situação não é permitida.' }
  }

  const safeNote = note.trim().slice(0, 500)
  const { data, error } = await supabase.rpc('admin_set_membership_status', {
    target_user_id: userId,
    target_status: nextStatus,
    target_note: safeNote,
  })
  if (error || !data) return { error: 'Não foi possível atualizar o acesso do membro.' }

  revalidatePath('/admin')
  revalidatePath('/admin/membros')
  return { success: true }
}

export async function toggleMemberRole(userId: string): Promise<AdminActionResult> {
  if (!isUuid(userId)) return { error: 'Membro inválido.' }
  const { supabase, user, error: authError } = await requireAdmin()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  if (userId === user.id) return { error: 'Você não pode alterar a própria função.' }

  const { data: target, error: lookupError } = await supabase
    .from('profiles')
    .select('role, membership_status')
    .eq('user_id', userId)
    .maybeSingle()
  if (lookupError || !target) return { error: 'Membro não encontrado.' }
  if (target.membership_status !== 'active') {
    return { error: 'Ative o acesso do membro antes de alterar sua função.' }
  }

  const targetRole = target.role === 'coach' ? 'member' : 'coach'
  const { data, error } = await supabase.rpc('admin_set_member_role', {
    target_user_id: userId,
    target_role: targetRole,
  })
  if (error || !data) return { error: 'Não foi possível alterar a função do membro.' }

  revalidatePath('/admin/membros')
  revalidatePath('/dashboard', 'layout')
  return { success: true }
}

export async function saveTrainingGroup(
  groupId: string | null,
  formData: FormData,
): Promise<AdminActionResult> {
  if (groupId && !isUuid(groupId)) return { error: 'Grupo inválido.' }
  const { supabase, user, error: authError } = await requireCoach()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const name = cleanText(formData.get('name'), 100)
  const description = cleanText(formData.get('description'), 500)
  const memberIds = uniqueUuids(formData.getAll('member_ids'))
  if (name.length < 2) return { error: 'Informe um nome com pelo menos 2 caracteres.' }
  if (!memberIds) return { error: 'A lista de atletas é inválida.' }

  const { data, error } = await supabase.rpc('admin_save_training_group', {
    target_group_id: groupId as string,
    target_name: name,
    target_description: description,
    target_member_ids: memberIds,
  })
  if (error || !data) return { error: 'Não foi possível salvar o grupo. Verifique o nome e os atletas.' }

  revalidatePath('/admin/membros')
  revalidatePath('/admin/treinos')
  return { success: true, id: data }
}

export async function archiveTrainingGroup(groupId: string): Promise<AdminActionResult> {
  if (!isUuid(groupId)) return { error: 'Grupo inválido.' }
  const { supabase, user, error: authError } = await requireCoach()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const { data, error } = await supabase.rpc('admin_archive_training_group', {
    target_group_id: groupId,
  })
  if (error || !data) return { error: 'Não foi possível arquivar o grupo.' }

  revalidatePath('/admin/membros')
  revalidatePath('/admin/treinos')
  return { success: true }
}

function optionalDecimal(value: FormDataEntryValue | null): number | null | 'invalid' {
  const raw = String(value ?? '').trim().replace(',', '.')
  if (!raw) return null
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : 'invalid'
}

function optionalInteger(value: FormDataEntryValue | null): number | null | 'invalid' {
  const parsed = optionalDecimal(value)
  if (parsed === null || parsed === 'invalid') return parsed
  return Number.isInteger(parsed) ? parsed : 'invalid'
}

export async function saveBodyAssessment(
  assessmentId: string | null,
  formData: FormData,
): Promise<AdminActionResult> {
  if (assessmentId && !isUuid(assessmentId)) return { error: 'Avaliação inválida.' }
  const { supabase, user, error: authError } = await requireCoach()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const athleteUserId = String(formData.get('athlete_user_id') ?? '')
  const assessedAt = safeDate(formData.get('assessed_at'))
  const weightKg = optionalDecimal(formData.get('weight_kg'))
  const bodyFatPct = optionalDecimal(formData.get('body_fat_pct'))
  const muscleMassKg = optionalDecimal(formData.get('muscle_mass_kg'))
  const visceralFatLevel = optionalDecimal(formData.get('visceral_fat_level'))
  const bodyWaterPct = optionalDecimal(formData.get('body_water_pct'))
  const bmi = optionalDecimal(formData.get('bmi'))
  const metabolicAge = optionalInteger(formData.get('metabolic_age'))
  const notes = cleanText(formData.get('notes'), 2000)

  if (!isUuid(athleteUserId)) return { error: 'Selecione um atleta válido.' }
  if (!assessedAt || assessedAt === 'invalid') return { error: 'Informe uma data válida.' }
  const measurements = [
    weightKg,
    bodyFatPct,
    muscleMassKg,
    visceralFatLevel,
    bodyWaterPct,
    bmi,
    metabolicAge,
  ]
  if (measurements.includes('invalid')) return { error: 'Revise os valores numéricos informados.' }
  if (measurements.every((value) => value === null) && !notes) {
    return { error: 'Informe ao menos uma medida ou observação.' }
  }

  const { data, error } = await supabase.rpc('coach_save_body_assessment', {
    target_assessment_id: assessmentId as string,
    target_athlete_user_id: athleteUserId,
    target_assessed_at: assessedAt,
    target_weight_kg: weightKg as number,
    target_body_fat_pct: bodyFatPct as number,
    target_muscle_mass_kg: muscleMassKg as number,
    target_visceral_fat_level: visceralFatLevel as number,
    target_body_water_pct: bodyWaterPct as number,
    target_bmi: bmi as number,
    target_metabolic_age: metabolicAge as number,
    target_notes: notes,
  })

  if (error || !data) return { error: 'Não foi possível salvar a avaliação. Revise as medidas.' }
  revalidatePath('/admin/avaliacoes')
  revalidatePath('/dashboard/avaliacoes')
  return { success: true, id: data }
}

export async function deleteBodyAssessment(id: string): Promise<AdminActionResult> {
  if (!isUuid(id)) return { error: 'Avaliação inválida.' }
  const { supabase, user, error: authError } = await requireCoach()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const { data, error } = await supabase.rpc('coach_delete_body_assessment', {
    target_assessment_id: id,
  })
  if (error || !data) return { error: 'Não foi possível remover a avaliação.' }

  revalidatePath('/admin/avaliacoes')
  revalidatePath('/dashboard/avaliacoes')
  return { success: true }
}
