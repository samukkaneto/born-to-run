export type EvolutionActivity = {
  distanceKm: number
  durationMinutes: number | null
  createdAt: string
  source?: 'atividade' | 'prova'
}

export type MonthlyDistance = { key: string; label: string; distanceKm: number }

export type PersonalBestDistance = {
  id: string
  label: string
  shortLabel: string
  targetKm: number
  descriptor: string
  attempts: number
  bestTimeSeconds: number | null
  bestPaceMinutesPerKm: number | null
  improvements: PersonalBestImprovement[]
}

export type PersonalBestImprovement = {
  date: string
  timeSeconds: number
  paceMinutesPerKm: number
  distanceKm: number
  source: 'atividade' | 'prova'
}

/**
 * Distâncias de referência do painel de evolução.
 * As tolerâncias absorvem arredondamentos comuns de GPS e de provas sem
 * transformar uma distância claramente diferente em um recorde daquela marca.
 */
export const PERSONAL_BEST_DISTANCES = [
  { id: '500m', label: '500 m', shortLabel: '500 m', targetKm: 0.5, descriptor: '0,5 km', toleranceKm: 0.025 },
  { id: '1km', label: '1 km', shortLabel: '1 km', targetKm: 1, descriptor: 'distância de referência', toleranceKm: 0.05 },
  { id: '1-mile', label: '1 milha', shortLabel: '1 milha', targetKm: 1.609344, descriptor: '1,609 km', toleranceKm: 0.05 },
  { id: '3km', label: '3 km', shortLabel: '3 km', targetKm: 3, descriptor: 'distância de referência', toleranceKm: 0.1 },
  { id: '5km', label: '5 km', shortLabel: '5 km', targetKm: 5, descriptor: 'distância de referência', toleranceKm: 0.12 },
  { id: '7km', label: '7 km', shortLabel: '7 km', targetKm: 7, descriptor: 'distância de referência', toleranceKm: 0.14 },
  { id: '10km', label: '10 km', shortLabel: '10 km', targetKm: 10, descriptor: 'distância de referência', toleranceKm: 0.15 },
  { id: '15km', label: '15 km', shortLabel: '15 km', targetKm: 15, descriptor: 'distância de referência', toleranceKm: 0.2 },
  { id: 'half-marathon', label: 'Meia maratona', shortLabel: 'Meia', targetKm: 21.0975, descriptor: '21,0975 km', toleranceKm: 0.2 },
  { id: 'marathon', label: 'Maratona', shortLabel: 'Maratona', targetKm: 42.195, descriptor: '42,195 km', toleranceKm: 0.25 },
] as const

export type PersonalBestDefinition = (typeof PERSONAL_BEST_DISTANCES)[number]

export function summarizeEvolution(activities: EvolutionActivity[], now = new Date()) {
  const valid = activities.filter((activity) => Number.isFinite(activity.distanceKm) && activity.distanceKm > 0)
  const totalDistanceKm = valid.reduce((total, activity) => total + activity.distanceKm, 0)
  const longestDistanceKm = valid.reduce((longest, activity) => Math.max(longest, activity.distanceKm), 0)
  const paced = valid.filter((activity) => activity.durationMinutes && activity.durationMinutes > 0)
  const bestPace = paced.reduce<number | null>((best, activity) => {
    const pace = Number(activity.durationMinutes) / activity.distanceKm
    return best === null || pace < best ? pace : best
  }, null)

  const months: MonthlyDistance[] = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1)
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      label: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(date).replace('.', ''),
      distanceKm: 0,
    }
  })

  for (const activity of valid) {
    const key = /^\d{4}-\d{2}/.test(activity.createdAt) ? activity.createdAt.slice(0, 7) : ''
    if (!key) continue
    const month = months.find((item) => item.key === key)
    if (month) month.distanceKm += activity.distanceKm
  }

  return { activityCount: valid.length, totalDistanceKm, longestDistanceKm, bestPace, months }
}

export function isPersonalBestAttempt(distanceKm: number, definition: PersonalBestDefinition): boolean {
  return Number.isFinite(distanceKm) && Math.abs(distanceKm - definition.targetKm) <= definition.toleranceKm
}

export function summarizePersonalBests(activities: EvolutionActivity[]): PersonalBestDistance[] {
  const valid = activities
    .filter((activity) => Number.isFinite(activity.distanceKm) && activity.distanceKm > 0 && activity.durationMinutes !== null && Number(activity.durationMinutes) > 0)
    .sort((first, second) => first.createdAt.localeCompare(second.createdAt))

  return PERSONAL_BEST_DISTANCES.map((definition) => {
    const attempts = valid.filter((activity) => isPersonalBestAttempt(activity.distanceKm, definition))
    let bestTimeSeconds: number | null = null
    const improvements: PersonalBestImprovement[] = []

    for (const attempt of attempts) {
      const timeSeconds = Number(attempt.durationMinutes) * 60
      if (bestTimeSeconds !== null && timeSeconds >= bestTimeSeconds) continue
      bestTimeSeconds = timeSeconds
      improvements.push({
        date: attempt.createdAt,
        timeSeconds,
        paceMinutesPerKm: Number(attempt.durationMinutes) / attempt.distanceKm,
        distanceKm: attempt.distanceKm,
        source: attempt.source ?? 'atividade',
      })
    }

    return {
      id: definition.id,
      label: definition.label,
      shortLabel: definition.shortLabel,
      targetKm: definition.targetKm,
      descriptor: definition.descriptor,
      attempts: attempts.length,
      bestTimeSeconds,
      bestPaceMinutesPerKm: bestTimeSeconds === null ? null : bestTimeSeconds / 60 / definition.targetKm,
      improvements,
    }
  })
}

export function formatPace(minutesPerKm: number | null): string {
  if (minutesPerKm === null || !Number.isFinite(minutesPerKm)) return '—'
  const minutes = Math.floor(minutesPerKm)
  const seconds = Math.round((minutesPerKm - minutes) * 60)
  return `${minutes}:${String(seconds === 60 ? 0 : seconds).padStart(2, '0')}/km`
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds <= 0) return '—'
  const rounded = Math.round(seconds)
  const hours = Math.floor(rounded / 3600)
  const minutes = Math.floor((rounded % 3600) / 60)
  const remaining = rounded % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
    : `${minutes}:${String(remaining).padStart(2, '0')}`
}
