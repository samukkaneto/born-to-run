// Utilitários gerais do projeto

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
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
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
