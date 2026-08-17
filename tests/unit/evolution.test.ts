import { describe, expect, it } from 'vitest'
import { formatDuration, formatPace, summarizeEvolution, summarizePersonalBests } from '@/lib/evolution'

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

  it('mantém o melhor tempo e registra somente as novas marcas pessoais', () => {
    const records = summarizePersonalBests([
      { distanceKm: 5.02, durationMinutes: 32, createdAt: '2026-01-05', source: 'atividade' },
      { distanceKm: 5, durationMinutes: 31, createdAt: '2026-02-05', source: 'atividade' },
      { distanceKm: 5, durationMinutes: 31.5, createdAt: '2026-03-05', source: 'prova' },
      { distanceKm: 4.7, durationMinutes: 28, createdAt: '2026-04-05', source: 'atividade' },
    ])

    const fiveKm = records.find((record) => record.id === '5km')
    expect(fiveKm?.attempts).toBe(3)
    expect(fiveKm?.bestTimeSeconds).toBe(31 * 60)
    expect(fiveKm?.improvements.map((improvement) => improvement.timeSeconds)).toEqual([32 * 60, 31 * 60])
    expect(fiveKm?.improvements.at(-1)?.source).toBe('atividade')
  })

  it('exibe a milha, meia maratona e maratona com distâncias oficiais', () => {
    const records = summarizePersonalBests([
      { distanceKm: 1.609, durationMinutes: 8, createdAt: '2026-01-01' },
      { distanceKm: 21.0975, durationMinutes: 120, createdAt: '2026-02-01' },
      { distanceKm: 42.195, durationMinutes: 240, createdAt: '2026-03-01' },
    ])

    expect(records.map((record) => record.label)).toEqual(['500 m', '1 km', '1 milha', '3 km', '5 km', '7 km', '10 km', '15 km', 'Meia maratona', 'Maratona'])
    expect(records.find((record) => record.id === '1-mile')?.descriptor).toBe('1,609 km')
    expect(records.find((record) => record.id === 'half-marathon')?.targetKm).toBe(21.0975)
    expect(records.find((record) => record.id === 'marathon')?.targetKm).toBe(42.195)
  })

  it('não converte uma distância longa em uma parcial sem tempo específico', () => {
    const records = summarizePersonalBests([
      { distanceKm: 10, durationMinutes: 55, createdAt: '2026-01-01' },
    ])

    expect(records.find((record) => record.id === '5km')?.bestTimeSeconds).toBeNull()
    expect(records.find((record) => record.id === '10km')?.bestTimeSeconds).toBe(55 * 60)
  })

  it('formata tempos curtos e longos corretamente', () => {
    expect(formatDuration(150)).toBe('2:30')
    expect(formatDuration(3661)).toBe('1:01:01')
  })
})
