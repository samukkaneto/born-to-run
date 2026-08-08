// Utilitários gerais do projeto

export const APP_TIME_ZONE = 'America/Sao_Paulo'

const CALENDAR_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/**
 * Retorna a data civil atual da Born to Run sem depender do fuso do servidor.
 *
 * Datas de treino são colunas PostgreSQL `date`, portanto representam um dia
 * do calendário (não um instante UTC).
 */
export function getTodayCalendarDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: APP_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  )

  return `${values.year}-${values.month}-${values.day}`
}

/**
 * Formata pace em min/km a partir de duração (min) e distância (km)
 */
export function calcPace(distanceKm: number, durationMinutes: number): string {
  if (!distanceKm || !durationMinutes) return '--:--'
  const paceDecimal = durationMinutes / distanceKm
  const mins = Math.floor(paceDecimal)
  const secs = Math.round((paceDecimal - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Formata duração em minutos para hh:mm ou mm:ss
 */
export function formatDuration(minutes: number): string {
  if (!minutes) return '--'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  return `${h}h${m > 0 ? ` ${m}min` : ''}`
}

/**
 * Formata data para pt-BR
 */
export function formatDate(dateString: string): string {
  const calendarMatch = CALENDAR_DATE_PATTERN.exec(dateString)
  const date = calendarMatch
    ? new Date(Date.UTC(
        Number(calendarMatch[1]),
        Number(calendarMatch[2]) - 1,
        Number(calendarMatch[3]),
      ))
    : new Date(dateString)

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    // Um `date` puro é formatado em UTC para manter exatamente o dia salvo;
    // timestamps reais são exibidos no fuso oficial da equipe.
    timeZone: calendarMatch ? 'UTC' : APP_TIME_ZONE,
  })
}

/**
 * Formata data relativa (ex: "há 2 horas")
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'agora'
  if (diffMins < 60) return `há ${diffMins}min`
  if (diffHours < 24) return `há ${diffHours}h`
  if (diffDays < 7) return `há ${diffDays}d`
  return formatDate(dateString)
}

/**
 * Retorna as iniciais de um nome
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

/**
 * Combina classes CSS condicionalmente
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
