const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const PACE_PATTERN = /^\d{1,2}:[0-5]\d$/
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value)
}

export function cleanText(value: FormDataEntryValue | null, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export function validateEmail(value: unknown): string | null {
  const email = String(value ?? '').trim().toLowerCase()
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null
}

export function parseOptionalPositiveNumber(
  value: FormDataEntryValue | null,
  max: number,
): number | null | 'invalid' {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const number = Number(raw.replace(',', '.'))
  if (!Number.isFinite(number) || number <= 0 || number > max) return 'invalid'
  return number
}

export function parseOptionalInteger(
  value: FormDataEntryValue | null,
  max: number,
): number | null | 'invalid' {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const number = Number(raw)
  if (!Number.isSafeInteger(number) || number <= 0 || number > max) return 'invalid'
  return number
}

export function parsePace(value: FormDataEntryValue | null): string | null | 'invalid' {
  const pace = String(value ?? '').trim()
  if (!pace) return null
  return PACE_PATTERN.test(pace) && pace !== '00:00' ? pace : 'invalid'
}

export function uniqueUuids(values: FormDataEntryValue[]): string[] | null {
  const strings = values.map(String)
  if (strings.some((value) => !isUuid(value))) return null
  return [...new Set(strings)]
}

function matchesFileSignature(bytes: Uint8Array, type: string): boolean {
  if (type === 'image/jpeg') {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  }
  if (type === 'image/png') {
    return (
      bytes[0] === 0x89 &&
      bytes[1] === 0x50 &&
      bytes[2] === 0x4e &&
      bytes[3] === 0x47
    )
  }
  if (type === 'image/webp') {
    return (
      String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' &&
      String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP'
    )
  }
  return false
}

export async function validateImageFile(
  file: File,
  maxBytes: number,
): Promise<{ extension: 'jpg' | 'png' | 'webp' } | { error: string }> {
  if (file.size <= 0 || file.size > maxBytes) {
    return { error: `A imagem deve ter no máximo ${Math.floor(maxBytes / 1024 / 1024)} MB.` }
  }
  if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
    return { error: 'Formato inválido. Envie uma imagem JPG, PNG ou WebP.' }
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (!matchesFileSignature(bytes, file.type)) {
    return { error: 'O conteúdo do arquivo não corresponde a uma imagem válida.' }
  }

  const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg'
  return { extension }
}

export async function validateAssessmentSourceFile(
  file: File,
  maxBytes = 15 * 1024 * 1024,
): Promise<{ extension: 'pdf' | 'jpg' | 'png'; mimeType: string } | { error: string }> {
  if (file.size <= 0 || file.size > maxBytes) {
    return { error: `O arquivo deve ter no máximo ${Math.floor(maxBytes / 1024 / 1024)} MB.` }
  }
  if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
    return { error: 'Formato inválido. Envie o PDF da Tanita ou uma imagem JPG/PNG.' }
  }
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const valid = file.type === 'application/pdf'
    ? String.fromCharCode(...bytes.slice(0, 5)) === '%PDF-'
    : matchesFileSignature(bytes, file.type)
  if (!valid) return { error: 'O conteúdo do arquivo não corresponde ao formato informado.' }
  return {
    extension: file.type === 'application/pdf' ? 'pdf' : file.type === 'image/png' ? 'png' : 'jpg',
    mimeType: file.type,
  }
}
