export const FEED_PAGE_SIZE = 15

const CURSOR_VERSION = 1
const MAX_CURSOR_LENGTH = 256
const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const TIMESTAMPTZ_PATTERN = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d{1,6})?(?:Z|([+-])(\d{2}):(\d{2}))$/

export type FeedPageDirection = 'older' | 'newer'

export type FeedCursor = {
  createdAt: string
  id: string
}

export type FeedPaginationRequest =
  | { kind: 'initial' }
  | { kind: 'cursor'; direction: FeedPageDirection; cursor: FeedCursor }
  | { kind: 'invalid' }

type FeedSearchParams = {
  cursor?: string | string[]
  direction?: string | string[]
}

type CursorSource = {
  created_at: string
  id: string
}

function isValidCursorTimestamp(value: string): boolean {
  const match = TIMESTAMPTZ_PATTERN.exec(value)
  if (!match) return false

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const hour = Number(match[4])
  const minute = Number(match[5])
  const second = Number(match[6])
  const offsetHour = match[8] ? Number(match[8]) : 0
  const offsetMinute = match[9] ? Number(match[9]) : 0
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  return year >= 1
    && month >= 1
    && month <= 12
    && day >= 1
    && day <= daysInMonth[month - 1]
    && hour <= 23
    && minute <= 59
    && second <= 59
    && offsetHour <= 14
    && offsetMinute <= 59
    && (offsetHour < 14 || offsetMinute === 0)
}

function normalizeCursor(value: unknown): FeedCursor | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null

  const payload = value as Record<string, unknown>
  if (
    payload.version !== CURSOR_VERSION
    || typeof payload.createdAt !== 'string'
    || typeof payload.id !== 'string'
    || Object.keys(payload).length !== 3
    || !UUID_PATTERN.test(payload.id)
  ) {
    return null
  }

  if (
    !isValidCursorTimestamp(payload.createdAt)
  ) return null

  return {
    // Não normalize com Date/toISOString: PostgreSQL pode devolver microssegundos,
    // e truncá-los mudaria a fronteira exata da paginação keyset.
    createdAt: payload.createdAt,
    id: payload.id.toLowerCase(),
  }
}

function decodeCursor(token: string): FeedCursor | null {
  if (
    token.length === 0
    || token.length > MAX_CURSOR_LENGTH
    || !BASE64URL_PATTERN.test(token)
  ) {
    return null
  }

  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8')
    return normalizeCursor(JSON.parse(decoded))
  } catch {
    return null
  }
}

export function parseFeedPagination(params: FeedSearchParams): FeedPaginationRequest {
  const rawCursor = params.cursor
  const rawDirection = params.direction

  if (rawCursor === undefined && rawDirection === undefined) return { kind: 'initial' }
  if (
    typeof rawCursor !== 'string'
    || (rawDirection !== 'older' && rawDirection !== 'newer')
  ) {
    return { kind: 'invalid' }
  }

  const cursor = decodeCursor(rawCursor)
  if (!cursor) return { kind: 'invalid' }

  return { kind: 'cursor', direction: rawDirection, cursor }
}

export function encodeFeedCursor(source: CursorSource): string {
  if (
    !isValidCursorTimestamp(source.created_at)
    || !UUID_PATTERN.test(source.id)
  ) {
    throw new Error('Não foi possível criar o cursor do feed.')
  }

  return Buffer.from(JSON.stringify({
    version: CURSOR_VERSION,
    createdAt: source.created_at,
    id: source.id.toLowerCase(),
  })).toString('base64url')
}

export function buildFeedCursorFilter(
  direction: FeedPageDirection,
  cursor: FeedCursor,
): string {
  const comparison = direction === 'older' ? 'lt' : 'gt'

  return [
    `created_at.${comparison}.${cursor.createdAt}`,
    `and(created_at.eq.${cursor.createdAt},id.${comparison}.${cursor.id})`,
  ].join(',')
}

export function buildFeedPageHref(
  direction: FeedPageDirection,
  source: CursorSource,
): string {
  const params = new URLSearchParams({
    direction,
    cursor: encodeFeedCursor(source),
  })

  return `/dashboard/feed?${params.toString()}`
}
