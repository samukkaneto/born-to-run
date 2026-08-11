import type { Mission } from '@/types'

export type MissionActivity = {
  distanceKm: number
  durationSeconds: number | null
}

export type JourneyLevel = {
  name: string
  minimumXp: number
  color: string
  symbol: string
}

export const JOURNEY_LEVELS: JourneyLevel[] = [
  { name: 'Primeira Largada', minimumXp: 0, color: '#78716C', symbol: '01' },
  { name: 'Em Movimento', minimumXp: 300, color: '#16A34A', symbol: '02' },
  { name: 'Ritmo Crescente', minimumXp: 900, color: '#2563EB', symbol: '03' },
  { name: 'Constância', minimumXp: 1900, color: '#7C3AED', symbol: '04' },
  { name: 'Resistência', minimumXp: 3500, color: '#EA580C', symbol: '05' },
  { name: 'Superação', minimumXp: 6000, color: '#DC2626', symbol: '06' },
  { name: 'Veterano BTR', minimumXp: 10000, color: '#A16207', symbol: '07' },
  { name: 'Referência', minimumXp: 15500, color: '#0F766E', symbol: '08' },
  { name: 'Lenda BTR', minimumXp: 23000, color: '#4C1D95', symbol: '09' },
  { name: 'Legado Born to Run', minimumXp: 32000, color: '#171717', symbol: '10' },
]

export function isMissionCompleted(mission: Mission, activities: MissionActivity[]): boolean {
  if (!mission.distance_km || !['distance', 'pace'].includes(mission.category)) return false
  return activities.some((activity) => {
    if (activity.distanceKm < Number(mission.distance_km)) return false
    if (!mission.max_pace_seconds) return true
    if (!activity.durationSeconds || activity.distanceKm <= 0) return false
    return activity.durationSeconds / activity.distanceKm < mission.max_pace_seconds
  })
}

export function getJourneyProgress(
  missions: Mission[],
  activities: MissionActivity[],
  joinedAt: string,
  now = new Date(),
) {
  const completed = missions.filter((mission) => isMissionCompleted(mission, activities))
  const missionXp = completed.reduce((total, mission) => total + mission.points, 0)
  const joined = new Date(joinedAt)
  const fullMonths = Math.max(0, (now.getUTCFullYear() - joined.getUTCFullYear()) * 12 + now.getUTCMonth() - joined.getUTCMonth())
  const tenureXp = Math.min(fullMonths * 150, 24000)
  const xp = missionXp + tenureXp
  const levelIndex = JOURNEY_LEVELS.findLastIndex((level) => xp >= level.minimumXp)
  const level = JOURNEY_LEVELS[Math.max(levelIndex, 0)]
  const nextLevel = JOURNEY_LEVELS[Math.max(levelIndex, 0) + 1] ?? null
  const progress = nextLevel
    ? Math.min(100, Math.round(((xp - level.minimumXp) / (nextLevel.minimumXp - level.minimumXp)) * 100))
    : 100
  return { completed, missionXp, tenureXp, xp, level, nextLevel, progress }
}

export function formatRaceDuration(seconds: number | null): string {
  if (!seconds) return 'Tempo não informado'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remaining = seconds % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
    : `${minutes}:${String(remaining).padStart(2, '0')}`
}
