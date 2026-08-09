import { validateEmail } from '@/lib/validation'

export const CONTACT_LIMITS = {
  name: 100,
  message: 2_000,
} as const

export type ContactFields = {
  name: string
  email: string
  message: string
  company: string
}

export type ContactErrors = Partial<Record<'name' | 'email' | 'message', string>>

type ContactValidation =
  | { ok: true; value: ContactFields; spam: boolean }
  | { ok: false; errors: ContactErrors }

function readString(input: Record<string, unknown>, key: keyof ContactFields): string {
  return typeof input[key] === 'string' ? input[key].trim() : ''
}

export function validateContactPayload(payload: unknown): ContactValidation {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, errors: { message: 'Preencha os campos do formulário.' } }
  }

  const input = payload as Record<string, unknown>
  const name = readString(input, 'name').replace(/\s+/g, ' ')
  const email = validateEmail(readString(input, 'email'))
  const message = readString(input, 'message').replace(/\r\n/g, '\n')
  const company = readString(input, 'company')
  const errors: ContactErrors = {}

  if (name.length < 2 || name.length > CONTACT_LIMITS.name) {
    errors.name = `Informe um nome entre 2 e ${CONTACT_LIMITS.name} caracteres.`
  }
  if (!email) errors.email = 'Informe um e-mail válido.'
  if (message.length < 10 || message.length > CONTACT_LIMITS.message) {
    errors.message = `Escreva uma mensagem entre 10 e ${CONTACT_LIMITS.message} caracteres.`
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors }

  return {
    ok: true,
    value: { name, email: email!, message, company },
    spam: company.length > 0,
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

export function createContactEmail(
  contact: ContactFields,
  recipient: string,
): Record<string, unknown> {
  const safeName = escapeHtml(contact.name)
  const safeEmail = escapeHtml(contact.email)
  const safeMessage = escapeHtml(contact.message).replaceAll('\n', '<br />')

  return {
    from: `Born to Run <${recipient}>`,
    to: [recipient],
    reply_to: contact.email,
    subject: `Novo contato pelo site — ${contact.name}`,
    text: `Nome: ${contact.name}\nE-mail: ${contact.email}\n\nMensagem:\n${contact.message}`,
    html: `<h2>Novo contato pelo site Born to Run</h2><p><strong>Nome:</strong> ${safeName}</p><p><strong>E-mail:</strong> ${safeEmail}</p><p><strong>Mensagem:</strong><br />${safeMessage}</p>`,
  }
}

export async function createContactIdempotencyKey(contact: ContactFields): Promise<string> {
  const bytes = new TextEncoder().encode(
    `${contact.name}\n${contact.email}\n${contact.message}`,
  )
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const hash = Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('')
  return `contact-form/${hash}`
}
