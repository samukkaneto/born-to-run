import { describe, expect, it } from 'vitest'
import { formatDate, getTodayCalendarDate } from '@/lib/utils'

describe('datas-calendário da Born to Run', () => {
  it('usa America/Sao_Paulo para determinar o dia atual', () => {
    expect(getTodayCalendarDate(new Date('2026-08-09T00:30:00.000Z'))).toBe(
      '2026-08-08',
    )
    expect(getTodayCalendarDate(new Date('2026-08-09T03:00:00.000Z'))).toBe(
      '2026-08-09',
    )
  })

  it('não desloca um DATE do PostgreSQL para a véspera', () => {
    expect(formatDate('2026-08-08')).toBe('08 de agosto de 2026')
  })
})
