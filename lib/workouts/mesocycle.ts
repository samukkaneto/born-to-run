import type { AssignedWorkout } from '@/types'

const DAY_MS = 86_400_000

export function parseCalendarDate(value: string) {
  const [year, month, day] = value.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

export function toCalendarDate(value: Date) {
  return value.toISOString().slice(0, 10)
}

export function addCalendarDays(value: string, amount: number) {
  const date = parseCalendarDate(value)
  date.setUTCDate(date.getUTCDate() + amount)
  return toCalendarDate(date)
}

export function calendarMonth(value: string) {
  const selected = parseCalendarDate(value)
  const first = new Date(Date.UTC(selected.getUTCFullYear(), selected.getUTCMonth(), 1))
  const mondayOffset = (first.getUTCDay() + 6) % 7
  first.setUTCDate(first.getUTCDate() - mondayOffset)
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(first)
    date.setUTCDate(first.getUTCDate() + index)
    return toCalendarDate(date)
  })
}

export function workoutsByDate(workouts: AssignedWorkout[]) {
  const grouped = new Map<string, AssignedWorkout[]>()
  for (const workout of workouts) {
    if (!workout.scheduled_date) continue
    const current = grouped.get(workout.scheduled_date) ?? []
    current.push(workout)
    grouped.set(workout.scheduled_date, current)
  }
  return grouped
}

export function cycleProgress(startsOn: string, endsOn: string, today: string) {
  const start = parseCalendarDate(startsOn).getTime()
  const end = parseCalendarDate(endsOn).getTime()
  const current = parseCalendarDate(today).getTime()
  if (current <= start) return 0
  if (current >= end) return 100
  return Math.round(((current - start) / Math.max(end - start, DAY_MS)) * 100)
}

export function cycleWeek(startsOn: string, scheduledDate: string) {
  const start = parseCalendarDate(startsOn).getTime()
  const scheduled = parseCalendarDate(scheduledDate).getTime()
  return Math.max(1, Math.floor((scheduled - start) / (7 * DAY_MS)) + 1)
}
