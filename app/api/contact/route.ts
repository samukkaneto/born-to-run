import {
  createContactEmail,
  createContactIdempotencyKey,
  validateContactPayload,
} from '@/lib/contact'
import { site } from '@/lib/site'

export const runtime = 'nodejs'

const WINDOW_MS = 15 * 60 * 1_000
const MAX_REQUESTS_PER_WINDOW = 5
const attempts = new Map<string, { count: number; resetAt: number }>()

function json(body: unknown, status: number) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

function isCrossSite(request: Request): boolean {
  return request.headers.get('sec-fetch-site') === 'cross-site'
}

function clientIdentifier(request: Request): string {
  return (
    request.headers.get('x-vercel-forwarded-for') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  )
}

function exceedsRateLimit(identifier: string): boolean {
  const now = Date.now()
  const current = attempts.get(identifier)
  if (!current || current.resetAt <= now) {
    attempts.set(identifier, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  current.count += 1
  return current.count > MAX_REQUESTS_PER_WINDOW
}

export async function POST(request: Request) {
  if (isCrossSite(request)) {
    return json({ error: 'Origem não permitida.' }, 403)
  }

  const contentLength = Number(request.headers.get('content-length') ?? 0)
  if (contentLength > 32_000) {
    return json({ error: 'Mensagem muito grande.' }, 413)
  }

  const payload = await request.json().catch(() => null)
  const validation = validateContactPayload(payload)
  if (!validation.ok) {
    return json({ error: 'Revise os campos indicados.', errors: validation.errors }, 400)
  }

  // Honeypot: responde como sucesso para não ensinar o bot a contornar o campo.
  if (validation.spam) return json({ success: true }, 200)

  if (exceedsRateLimit(clientIdentifier(request))) {
    return json(
      { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
      429,
    )
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('Formulário de contato sem RESEND_API_KEY configurada.')
    return json(
      { error: 'O canal está temporariamente indisponível. Use o e-mail ou Instagram.' },
      503,
    )
  }

  const resendResponse = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': await createContactIdempotencyKey(validation.value),
    },
    body: JSON.stringify(createContactEmail(validation.value, site.contact.email)),
    cache: 'no-store',
  }).catch(() => null)

  if (!resendResponse?.ok) {
    console.error('Falha ao entregar contato pela Resend.', {
      status: resendResponse?.status ?? 'network-error',
    })
    return json(
      { error: 'Não foi possível enviar agora. Use o e-mail ou Instagram.' },
      502,
    )
  }

  return json({ success: true }, 200)
}
