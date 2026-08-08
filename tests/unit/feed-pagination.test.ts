import { describe, expect, it } from 'vitest'
import {
  buildFeedCursorFilter,
  buildFeedPageHref,
  encodeFeedCursor,
  parseFeedPagination,
} from '@/lib/feed/pagination'

const post = {
  created_at: '2026-08-08T16:30:45.123+00:00',
  id: '10000000-0000-4000-8000-000000000001',
}

describe('cursor do feed', () => {
  it('reconhece a primeira página sem parâmetros', () => {
    expect(parseFeedPagination({})).toEqual({ kind: 'initial' })
  })

  it.each([
    { cursor: 'incompleto' },
    { direction: 'older' },
    { cursor: ['duplicado'], direction: 'older' },
    { cursor: 'invalido!', direction: 'older' },
    { cursor: 'a'.repeat(257), direction: 'newer' },
  ])('rejeita parâmetros inválidos: %o', (params) => {
    expect(parseFeedPagination(params)).toEqual({ kind: 'invalid' })
  })

  it('faz round-trip de um cursor opaco sem alterar a precisão do timestamp', () => {
    const href = buildFeedPageHref('older', post)
    const url = new URL(href, 'https://borntorun.example')

    expect(parseFeedPagination({
      cursor: url.searchParams.get('cursor') ?? undefined,
      direction: url.searchParams.get('direction') ?? undefined,
    })).toEqual({
      kind: 'cursor',
      direction: 'older',
      cursor: {
        createdAt: post.created_at,
        id: post.id,
      },
    })
  })

  it('usa o ID como desempate determinístico para timestamps iguais', () => {
    const request = parseFeedPagination({
      cursor: encodeFeedCursor(post),
      direction: 'older',
    })

    expect(request.kind).toBe('cursor')
    if (request.kind !== 'cursor') return

    expect(buildFeedCursorFilter(request.direction, request.cursor)).toBe(
      'created_at.lt.2026-08-08T16:30:45.123+00:00,'
      + 'and(created_at.eq.2026-08-08T16:30:45.123+00:00,'
      + 'id.lt.10000000-0000-4000-8000-000000000001)',
    )
  })

  it('inverte os comparadores ao navegar para publicações mais recentes', () => {
    const request = parseFeedPagination({
      cursor: encodeFeedCursor(post),
      direction: 'newer',
    })

    expect(request.kind).toBe('cursor')
    if (request.kind !== 'cursor') return

    expect(buildFeedCursorFilter(request.direction, request.cursor)).toContain(
      'created_at.gt.2026-08-08T16:30:45.123+00:00',
    )
    expect(buildFeedCursorFilter(request.direction, request.cursor)).toContain(
      'id.gt.10000000-0000-4000-8000-000000000001',
    )
  })

  it('não cria cursor para uma linha corrompida', () => {
    expect(() => encodeFeedCursor({ ...post, id: 'nao-e-uuid' })).toThrow(
      'Não foi possível criar o cursor do feed.',
    )
  })

  it('preserva microssegundos usados como fronteira no PostgreSQL', () => {
    const precisePost = {
      ...post,
      created_at: '2026-08-08T16:30:45.123456+00:00',
    }
    const request = parseFeedPagination({
      cursor: encodeFeedCursor(precisePost),
      direction: 'older',
    })

    expect(request).toMatchObject({
      kind: 'cursor',
      cursor: { createdAt: precisePost.created_at },
    })
  })

  it('rejeita payload adulterado mesmo quando está em base64url válido', () => {
    const tampered = Buffer.from(JSON.stringify({
      version: 1,
      createdAt: '2026-08-08T16:30:45.123Z),id.gt.00000000',
      id: post.id,
    })).toString('base64url')

    expect(parseFeedPagination({ cursor: tampered, direction: 'older' })).toEqual({
      kind: 'invalid',
    })
  })

  it('rejeita uma data impossível antes de consultar o banco', () => {
    const impossibleDate = Buffer.from(JSON.stringify({
      version: 1,
      createdAt: '2026-02-30T16:30:45.123456+00:00',
      id: post.id,
    })).toString('base64url')

    expect(parseFeedPagination({ cursor: impossibleDate, direction: 'newer' })).toEqual({
      kind: 'invalid',
    })
  })
})
