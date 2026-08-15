export type EvolutionActivity = {
  distanceKm: number
  durationMinutes: number | null
  createdAt: string
}

export type MonthlyDistance = { key: string; label: string; distanceKm: number }

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

export function formatPace(minutesPerKm: number | null): string {
  if (minutesPerKm === null || !Number.isFinite(minutesPerKm)) return '—'
  const minutes = Math.floor(minutesPerKm)
  const seconds = Math.round((minutesPerKm - minutes) * 60)
  return `${minutes}:${String(seconds === 60 ? 0 : seconds).padStart(2, '0')}/km`
}
