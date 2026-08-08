import { describe, expect, it } from 'vitest'
import { unstable_doesMiddlewareMatch } from 'next/experimental/testing/server'
import { config } from '@/proxy'

describe('matcher do Proxy', () => {
  it.each(['/dashboard', '/admin/membros', '/login', '/cadastro'])(
    'intercepta %s',
    (path) => {
      expect(
        unstable_doesMiddlewareMatch({ config, url: `https://born-to-run.test${path}` }),
      ).toBe(true)
    },
  )

  it.each([
    '/_next/static/chunks/app.js',
    '/_next/image?url=%2Flogo.png&w=128&q=75',
    '/favicon.ico',
    '/foto.webp',
  ])('ignora %s', (path) => {
    expect(
      unstable_doesMiddlewareMatch({ config, url: `https://born-to-run.test${path}` }),
    ).toBe(false)
  })
})
