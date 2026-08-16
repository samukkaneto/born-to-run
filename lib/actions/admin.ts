'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { removeMedia } from '@/lib/supabase/media'
import { cleanText, isUuid, uniqueUuids, validateAssessmentSourceFile } from '@/lib/validation'
import { isTrainingType } from '@/lib/workouts/training-types'
import type { MembershipStatus, UserRole } from '@/types'

export type AdminActionResult = { success?: boolean; error?: string; id?: string; count?: number }

export type ImportedWorkoutInput = {
  scheduled_date: string
  title: string
  description: string
  objective: string
  training_type: string
}

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
const requireTrainingManager = () => requireRole(
  ['admin', 'coach'],
  'Acesso restrito ao administrador ou treinador.',
)
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
  const trainingType = String(formData.get('training_type') ?? '')
  const scheduledDate = safeDate(formData.get('scheduled_date'))
  const memberIds = uniqueUuids(formData.getAll('member_ids'))
  const groupIds = uniqueUuids(formData.getAll('group_ids'))
  const trainingCycleId = String(formData.get('training_cycle_id') ?? '').trim()

  if (title.length < 3) return { error: 'Informe um título com pelo menos 3 caracteres.' }
  if (!description) return { error: 'A descrição do treino é obrigatória.' }
  if (!objective) return { error: 'Informe o objetivo do treino.' }
  if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
    return { error: 'Selecione um nível válido.' }
  }
  if (!isTrainingType(trainingType)) return { error: 'Selecione um tipo de treino válido.' }
  if (scheduledDate === 'invalid') return { error: 'Informe uma data válida.' }
  if (!memberIds || !groupIds) return { error: 'A lista de destinatários é inválida.' }
  if (trainingCycleId && !isUuid(trainingCycleId)) return { error: 'Selecione um mesociclo válido.' }
  if (memberIds.length === 0 && groupIds.length === 0) {
    return { error: 'Escolha ao menos um atleta ou grupo para este treino.' }
  }

  return {
    data: {
      title,
      description,
      objective,
      level: level as (typeof VALID_LEVELS)[number],
      trainingType,
      scheduledDate,
      audience: 'targeted' as const,
      memberIds,
      groupIds,
      trainingCycleId: trainingCycleId || null,
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
  const { supabase, user, error: authError } = await requireTrainingManager()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const parsed = parseWorkoutForm(formData)
  if ('error' in parsed) return { error: parsed.error }

  const { data, error } = await supabase.rpc('staff_save_workout_v2', {
    // O gerador do Supabase tipa argumentos de RPC como não nulos, embora
    // PostgreSQL aceite NULL para distinguir criação de edição.
    target_workout_id: id as string,
    target_title: parsed.data.title,
    target_description: parsed.data.description,
    target_level: parsed.data.level,
    target_objective: parsed.data.objective,
    target_scheduled_date: parsed.data.scheduledDate as string,
    target_member_ids: parsed.data.memberIds,
    target_group_ids: parsed.data.groupIds,
    target_training_type: parsed.data.trainingType,
    target_training_cycle_id: parsed.data.trainingCycleId as string,
  })

  if (error || !data) return { error: 'Erro ao salvar treino. Confira os destinatários e tente novamente.' }
  refreshWorkouts()
  return { success: true, id: data }
}

export async function deleteWorkout(id: string): Promise<AdminActionResult> {
  if (!isUuid(id)) return { error: 'Treino inválido.' }
  const { supabase, user, error: authError } = await requireTrainingManager()
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

export async function importWorkoutPlan(
  cycleName: string,
  items: ImportedWorkoutInput[],
  level: string,
  memberIds: string[],
  groupIds: string[],
): Promise<AdminActionResult> {
  const { supabase, user, error: authError } = await requireTrainingManager()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  const cleanedCycleName = cleanText(cycleName, 120)
  if (cleanedCycleName.length < 3) return { error: 'Informe um nome para o mesociclo.' }
  if (!VALID_LEVELS.includes(level as (typeof VALID_LEVELS)[number])) {
    return { error: 'Selecione um nível válido.' }
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > 62) {
    return { error: 'A importação deve conter entre 1 e 62 treinos.' }
  }
  if (
    !Array.isArray(memberIds)
    || !Array.isArray(groupIds)
    || memberIds.some((id) => !isUuid(id))
    || groupIds.some((id) => !isUuid(id))
  ) {
    return { error: 'A lista de destinatários é inválida.' }
  }
  const uniqueMemberIds = [...new Set(memberIds)]
  const uniqueGroupIds = [...new Set(groupIds)]
  if (uniqueMemberIds.length === 0 && uniqueGroupIds.length === 0) {
    return { error: 'Escolha ao menos um atleta ou grupo.' }
  }

  const cleanedItems: ImportedWorkoutInput[] = []
  for (const item of items) {
    if (!item || typeof item !== 'object') return { error: 'A planilha contém um treino inválido.' }
    const scheduledDate = safeDate(item.scheduled_date)
    const title = cleanText(item.title, 160)
    const description = cleanText(item.description, 5000)
    const objective = cleanText(item.objective, 500)
    if (
      scheduledDate === null
      || scheduledDate === 'invalid'
      || title.length < 3
      || !description
      || !objective
      || !isTrainingType(item.training_type)
    ) {
      return { error: 'Revise as datas, descrições e tipos de todos os treinos importados.' }
    }
    cleanedItems.push({
      scheduled_date: scheduledDate,
      title,
      description,
      objective,
      training_type: item.training_type,
    })
  }

  const { data, error } = await supabase.rpc('staff_import_training_cycle', {
    target_name: cleanedCycleName,
    target_items: cleanedItems,
    target_level: level,
    target_member_ids: uniqueMemberIds,
    target_group_ids: uniqueGroupIds,
  })
  if (error || !data) {
    return { error: 'Não foi possível publicar o ciclo. Nenhum treino foi importado.' }
  }

  refreshWorkouts()
  return { success: true, id: data, count: cleanedItems.length }
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

export async function setMemberTeamJoinedAt(
  userId: string,
  value: string,
): Promise<AdminActionResult> {
  if (!isUuid(userId)) return { error: 'Membro inválido.' }
  const joinedAt = safeDate(value)
  if (!joinedAt || joinedAt === 'invalid' || joinedAt < '2015-01-01') {
    return { error: 'Informe uma data entre 2015 e hoje.' }
  }
  const { supabase, user, error: authError } = await requireAccessManager()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }
  const { data, error } = await supabase.rpc('staff_set_team_joined_at', {
    target_user_id: userId,
    target_team_joined_at: joinedAt,
  })
  if (error || !data) return { error: 'Não foi possível atualizar a data de entrada.' }
  revalidatePath('/admin/membros')
  revalidatePath('/dashboard/conquistas')
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
  const { supabase, user, error: authError } = await requireTrainingManager()
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
  const { supabase, user, error: authError } = await requireTrainingManager()
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

const ASSESSMENT_MEASUREMENT_FIELDS = [
  'weight_kg',
  'body_fat_pct',
  'muscle_mass_kg',
  'visceral_fat_level',
  'body_water_pct',
  'bmi',
  'metabolic_age',
  'bone_mass_kg',
  'basal_metabolic_rate',
  'physique_rating',
  'fat_mass_kg',
  'fat_free_mass_kg',
  'body_water_mass_kg',
  'daily_calorie_intake',
  'heart_rate_bpm',
  'segment_left_arm_fat_pct',
  'segment_right_arm_fat_pct',
  'segment_trunk_fat_pct',
  'segment_left_leg_fat_pct',
  'segment_right_leg_fat_pct',
  'segment_left_arm_muscle_kg',
  'segment_right_arm_muscle_kg',
  'segment_trunk_muscle_kg',
  'segment_left_leg_muscle_kg',
  'segment_right_leg_muscle_kg',
] as const

const INTEGER_ASSESSMENT_FIELDS = new Set<string>([
  'metabolic_age',
  'basal_metabolic_rate',
  'physique_rating',
  'daily_calorie_intake',
  'heart_rate_bpm',
])

export async function saveBodyAssessment(
  assessmentId: string | null,
  formData: FormData,
): Promise<AdminActionResult> {
  if (assessmentId && !isUuid(assessmentId)) return { error: 'Avaliação inválida.' }
  const { supabase, user, error: authError } = await requireAccessManager()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const athleteUserId = String(formData.get('athlete_user_id') ?? '')
  const assessedAt = safeDate(formData.get('assessed_at'))
  const notes = cleanText(formData.get('notes'), 2000)
  const measurements: Record<string, number | string | null> = {}
  let hasInvalidMeasurement = false
  for (const field of ASSESSMENT_MEASUREMENT_FIELDS) {
    const parsed = INTEGER_ASSESSMENT_FIELDS.has(field)
      ? optionalInteger(formData.get(field))
      : optionalDecimal(formData.get(field))
    if (parsed === 'invalid') hasInvalidMeasurement = true
    else measurements[field] = parsed
  }
  const bodyFatCategory = String(formData.get('body_fat_category') ?? '').trim()
  if (bodyFatCategory && !['underfat', 'healthy', 'overfat', 'obese'].includes(bodyFatCategory)) {
    return { error: 'Selecione uma faixa de gordura corporal válida.' }
  }
  measurements.body_fat_category = bodyFatCategory || null
  const sourceFiles = [1, 2, 3].map((slot) => {
    const entry = formData.get(`source_photo_${slot}`)
    return entry instanceof File && entry.size > 0 ? entry : null
  })
  const selectedSourceCount = sourceFiles.filter(Boolean).length

  if (!isUuid(athleteUserId)) return { error: 'Selecione um atleta válido.' }
  if (!assessedAt || assessedAt === 'invalid') return { error: 'Informe uma data válida.' }
  if (hasInvalidMeasurement) return { error: 'Revise os valores numéricos informados.' }
  if (ASSESSMENT_MEASUREMENT_FIELDS.every((field) => measurements[field] === null) && !notes) {
    return { error: 'Informe ao menos uma medida ou observação.' }
  }
  if ((!assessmentId && selectedSourceCount !== 3) || (selectedSourceCount > 0 && selectedSourceCount !== 3)) {
    return { error: 'Envie as três imagens da Tanita nas posições Foto 1, Foto 2 e Foto 3.' }
  }

  let previousFilePaths: string[] = []
  if (assessmentId) {
    const { data: currentFiles, error: currentFilesError } = await supabase
      .from('body_assessment_files')
      .select('storage_path')
      .eq('assessment_id', assessmentId)
    if (currentFilesError) return { error: 'Avaliação não encontrada.' }
    previousFilePaths = (currentFiles ?? []).map((file) => file.storage_path)
  }

  const uploadedPaths: string[] = []
  const uploadedMimes: string[] = []
  if (selectedSourceCount === 3) {
    const batchId = crypto.randomUUID()
    for (let index = 0; index < sourceFiles.length; index += 1) {
      const sourceFile = sourceFiles[index]
      if (!sourceFile) continue
      if (!['image/jpeg', 'image/png'].includes(sourceFile.type)) {
        await Promise.all(uploadedPaths.map((path) => removeMedia(supabase, 'assessment-files', path)))
        return { error: `A Foto ${index + 1} deve ser uma imagem JPG ou PNG.` }
      }
      const validation = await validateAssessmentSourceFile(sourceFile)
      if ('error' in validation) {
        await Promise.all(uploadedPaths.map((path) => removeMedia(supabase, 'assessment-files', path)))
        return { error: validation.error }
      }
      const uploadedPath = `${athleteUserId}/${batchId}-${index + 1}.${validation.extension}`
      const { error: uploadError } = await supabase.storage
        .from('assessment-files')
        .upload(uploadedPath, sourceFile, {
          cacheControl: '3600',
          contentType: validation.mimeType,
          upsert: false,
        })
      if (uploadError) {
        await Promise.all(uploadedPaths.map((path) => removeMedia(supabase, 'assessment-files', path)))
        return { error: `Não foi possível enviar a Foto ${index + 1} da Tanita.` }
      }
      uploadedPaths.push(uploadedPath)
      uploadedMimes.push(validation.mimeType)
    }
  }

  const submittedSex = String(formData.get('sex') ?? '').trim()
  const submittedBiotype = String(formData.get('biotype') ?? '').trim()
  if (submittedSex && !['male', 'female'].includes(submittedSex)) {
    return { error: 'Selecione a variante ilustrada masculina ou feminina.' }
  }
  if (submittedBiotype && !['lean', 'mid', 'large'].includes(submittedBiotype)) {
    return { error: 'Selecione o biotipo ilustrado (leve, intermediário ou maior volume).' }
  }
  const { data, error } = await supabase.rpc('staff_save_body_assessment_v5', {
    target_assessment_id: assessmentId as string,
    target_athlete_user_id: athleteUserId,
    target_assessed_at: assessedAt,
    target_measurements: measurements,
    target_source_paths: uploadedPaths,
    target_source_mime_types: uploadedMimes,
    target_notes: notes,
    target_sex: submittedSex || ('' as string),
    target_biotype: submittedBiotype || ('' as string),
  })

  if (error || !data) {
    await Promise.all(uploadedPaths.map((path) => removeMedia(supabase, 'assessment-files', path)))
    return { error: 'Não foi possível salvar a avaliação. Revise as medidas.' }
  }
  if (uploadedPaths.length === 3 && previousFilePaths.length) {
    await Promise.all(previousFilePaths.map((path) => removeMedia(supabase, 'assessment-files', path)))
  }
  revalidatePath('/admin/avaliacoes')
  revalidatePath('/dashboard/avaliacoes')
  return { success: true, id: data }
}

export async function deleteBodyAssessment(id: string): Promise<AdminActionResult> {
  if (!isUuid(id)) return { error: 'Avaliação inválida.' }
  const { supabase, user, error: authError } = await requireAccessManager()
  if (authError || !user) return { error: authError ?? 'Não autenticado.' }

  const { data: files } = await supabase
    .from('body_assessment_files')
    .select('storage_path')
    .eq('assessment_id', id)

  const { data, error } = await supabase.rpc('staff_delete_body_assessment', {
    target_assessment_id: id,
  })
  if (error || data === null) return { error: 'Não foi possível remover a avaliação.' }

  await Promise.all([
    removeMedia(supabase, 'assessment-files', data || null),
    ...(files ?? []).map((file) => removeMedia(supabase, 'assessment-files', file.storage_path)),
  ])

  revalidatePath('/admin/avaliacoes')
  revalidatePath('/dashboard/avaliacoes')
  return { success: true }
}
