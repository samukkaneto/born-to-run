import { describe, expect, it } from 'vitest'
import { getJourneyProgress, isMissionCompleted } from '@/lib/gamification'
import type { Mission } from '@/types'

function mission(overrides: Partial<Mission>): Mission {
  return {
    code: 'primeiro_5k',
    title: 'Primeiros 5 km',
    description: 'Complete 5 km.',
    category: 'distance',
    distance_km: 5,
    max_pace_seconds: null,
    points: 250,
    tier: 'silver',
    icon_key: 'medal',
    sort_order: 1,
    is_active: true,
    ...overrides,
  }
}

describe('missões e níveis inclusivos', () => {
  it('uma maratona conclui automaticamente todas as missões de distância inferior', () => {
    const activity = [{ distanceKm: 42.195, durationSeconds: 4 * 3600 }]
    expect(isMissionCompleted(mission({ distance_km: 1 }), activity)).toBe(true)
    expect(isMissionCompleted(mission({ distance_km: 5 }), activity)).toBe(true)
    expect(isMissionCompleted(mission({ distance_km: 21.1 }), activity)).toBe(true)
    expect(isMissionCompleted(mission({ distance_km: 42.195 }), activity)).toBe(true)
  })

  it('só conclui missão de ritmo quando distância e pace são suficientes', () => {
    const subFive = mission({ category: 'pace', max_pace_seconds: 300 })
    expect(isMissionCompleted(subFive, [{ distanceKm: 5, durationSeconds: 24 * 60 }])).toBe(true)
    expect(isMissionCompleted(subFive, [{ distanceKm: 5, durationSeconds: 26 * 60 }])).toBe(false)
    expect(isMissionCompleted(subFive, [{ distanceKm: 4.9, durationSeconds: 20 * 60 }])).toBe(false)
  })

  it('premia tempo de equipe sem exigir velocidade', () => {
    const progress = getJourneyProgress([], [], '2025-01-10T12:00:00Z', new Date('2026-01-10T12:00:00Z'))
    expect(progress.tenureXp).toBe(1800)
    expect(progress.level.name).toBe('Ritmo Crescente')
  })
})
