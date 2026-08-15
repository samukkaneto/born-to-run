import { describe, expect, it } from 'vitest'
import { addCalendarDays, calendarMonth, cycleProgress, cycleWeek } from '@/lib/workouts/mesocycle'

describe('calendário do mesociclo', () => {
  it('mantém datas civis sem deslocamento de fuso', () => {
    expect(addCalendarDays('2026-08-31', 1)).toBe('2026-09-01')
    expect(addCalendarDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('monta seis semanas iniciando na segunda-feira', () => {
    const dates = calendarMonth('2026-08-15')
    expect(dates).toHaveLength(42)
    expect(dates[0]).toBe('2026-07-27')
    expect(dates[41]).toBe('2026-09-06')
  })

  it('calcula semana e progresso do ciclo', () => {
    expect(cycleWeek('2026-08-03', '2026-08-03')).toBe(1)
    expect(cycleWeek('2026-08-03', '2026-08-17')).toBe(3)
    expect(cycleProgress('2026-08-01', '2026-08-31', '2026-08-16')).toBe(50)
  })
})
