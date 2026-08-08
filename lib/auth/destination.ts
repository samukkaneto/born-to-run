export function destinationForStatus(
  status: string | undefined,
  role?: string,
): string {
  if (status === 'pending') return '/acesso-pendente'
  if (status === 'suspended' || status === 'rejected') return '/acesso-bloqueado'
  if (status === 'active') return role === 'admin' ? '/admin' : '/dashboard'
  return '/acesso-pendente'
}

/**
 * Aceita somente destinos internos da mesma origem.
 *
 * Barras invertidas precisam ser rejeitadas antes de `new URL`: em URLs HTTP,
 * o parser as normaliza como barras comuns e `/<backslash><backslash>host`
 * poderia se transformar em um redirecionamento para outra origem.
 */
export function safeInternalRedirectPath(
  value: string | null | undefined,
  origin: string,
  fallback = '/acesso',
): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.includes('\\') || /%5c/i.test(value) || /[\u0000-\u001f\u007f]/.test(value)) {
    return fallback
  }

  try {
    const base = new URL(origin)
    const candidate = new URL(value, base)
    if (candidate.origin !== base.origin) return fallback
    return `${candidate.pathname}${candidate.search}${candidate.hash}`
  } catch {
    return fallback
  }
}
