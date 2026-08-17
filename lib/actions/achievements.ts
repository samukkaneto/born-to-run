'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { cleanText, isUuid, parseOptionalPositiveNumber } from '@/lib/validation'
import { getTodayCalendarDate } from '@/lib/utils'

export type RaceResultActionResult = { success?: boolean; error?: string }

function parseDuration(formData: FormData): number | null | 'invalid' {
  const values = ['duration_hours', 'duration_minutes', 'duration_seconds'].map((key) => {
    const raw = String(formData.get(key) ?? '').trim()
    if (!raw) return 0
    const number = Number(raw)
    return Number.isSafeInteger(number) && number >= 0 ? number : NaN
  })
  if (values.some(Number.isNaN) || values[1] > 59 || values[2] > 59 || values[0] > 480) return 'invalid'
  const total = values[0] * 3600 + values[1] * 60 + values[2]
  return total === 0 ? null : total
}

export async function saveRaceResult(id: string | null, formData: FormData): Promise<RaceResultActionResult> {
  if (id && !isUuid(id)) return { error: 'Resultado inválido.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const eventName = cleanText(formData.get('event_name'), 160)
  const eventDate = String(formData.get('event_date') ?? '')
  const distanceKm = parseOptionalPositiveNumber(formData.get('distance_km'), 500)
  const durationSeconds = parseDuration(formData)
  const achievementKind = String(formData.get('achievement_kind') ?? 'participation')
  const placementRaw = String(formData.get('placement') ?? '').trim()
  const placement = placementRaw ? Number(placementRaw) : null
  const categoryLabel = cleanText(formData.get('category_label'), 100) || null
  const isFeatured = formData.get('is_featured') === 'on'
  const notes = cleanText(formData.get('notes'), 1000) || null

  if (eventName.length < 2) return { error: 'Informe o nome da prova.' }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || eventDate > getTodayCalendarDate()) return { error: 'Informe uma data válida, que não esteja no futuro.' }
  if (distanceKm === null || distanceKm === 'invalid') return { error: 'Informe uma distância válida.' }
  if (durationSeconds === 'invalid') return { error: 'Revise o tempo informado.' }
  if (!['participation', 'overall', 'category'].includes(achievementKind)) return { error: 'Tipo de resultado inválido.' }
  if (achievementKind === 'participation' && (placement !== null || categoryLabel)) return { error: 'Participação sem premiação não deve ter colocação.' }
  if (achievementKind !== 'participation' && (!Number.isSafeInteger(placement) || !placement || placement < 1 || placement > 999)) return { error: 'Informe a colocação conquistada.' }
  if (achievementKind === 'category' && (!categoryLabel || categoryLabel.length < 2)) return { error: 'Informe a categoria da premiação.' }

  const payload = {
    event_name: eventName,
    event_date: eventDate,
    distance_km: distanceKm,
    duration_seconds: durationSeconds,
    achievement_kind: achievementKind,
    placement,
    category_label: achievementKind === 'category' ? categoryLabel : null,
    is_featured: isFeatured,
    notes,
  }

  const query = id
    ? supabase.from('race_results').update(payload).eq('id', id).eq('athlete_user_id', user.id)
    : supabase.from('race_results').insert({ ...payload, athlete_user_id: user.id })
  const { error } = await query
  if (error) return { error: 'Não foi possível salvar o resultado.' }
  revalidatePath('/dashboard/conquistas')
  revalidatePath('/dashboard/perfil')
  revalidatePath('/dashboard/evolucao')
  return { success: true }
}

export async function deleteRaceResult(id: string): Promise<RaceResultActionResult> {
  if (!isUuid(id)) return { error: 'Resultado inválido.' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }
  const { error, count } = await supabase
    .from('race_results')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('athlete_user_id', user.id)
  if (error || count !== 1) return { error: 'Não foi possível remover o resultado.' }
  revalidatePath('/dashboard/conquistas')
  revalidatePath('/dashboard/perfil')
  revalidatePath('/dashboard/evolucao')
  return { success: true }
}
