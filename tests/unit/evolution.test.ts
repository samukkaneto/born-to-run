import { describe, expect, it } from 'vitest'
import { formatPace, summarizeEvolution } from '@/lib/evolution'

describe('evolução do atleta', () => {
  it('resume distância, maior treino e melhor ritmo', () => {
    const summary = summarizeEvolution([
      { distanceKm: 5, durationMinutes: 30, createdAt: '2026-07-01' },
      { distanceKm: 10, durationMinutes: 55, createdAt: '2026-08-01' },
      { distanceKm: Number.NaN, durationMinutes: null, createdAt: '2026-08-02' },
    ], new Date(2026, 7, 15))

    expect(summary.activityCount).toBe(2)
    expect(summary.totalDistanceKm).toBe(15)
    expect(summary.longestDistanceKm).toBe(10)
    expect(formatPace(summary.bestPace)).toBe('5:30/km')
    expect(summary.months.at(-1)?.distanceKm).toBe(10)
  })
})
