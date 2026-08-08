import { describe, expect, it } from 'vitest'
import {
  destinationForStatus,
  safeInternalRedirectPath,
} from '@/lib/auth/destination'

describe('destino por situação de acesso', () => {
  it.each([
    [undefined, undefined, '/acesso-pendente'],
    ['pending', 'member', '/acesso-pendente'],
    ['suspended', 'member', '/acesso-bloqueado'],
    ['rejected', 'member', '/acesso-bloqueado'],
    ['active', 'member', '/dashboard'],
    ['active', 'admin', '/admin'],
  ] as const)('direciona %s/%s para %s', (status, role, expected) => {
    expect(destinationForStatus(status, role)).toBe(expected)
  })
})

describe('destino interno seguro do callback', () => {
  const origin = 'https://borntorun.example'

  it('preserva caminho, busca e fragmento da mesma origem', () => {
    expect(safeInternalRedirectPath('/dashboard/feed?pagina=2#comentarios', origin)).toBe(
      '/dashboard/feed?pagina=2#comentarios',
    )
  })

  it.each([
    'https://evil.example/roubo',
    '//evil.example/roubo',
    '/\\evil.example/roubo',
    '/\\\\evil.example/roubo',
    '/%5c%5cevil.example/roubo',
    'javascript:alert(1)',
  ])('rejeita destino externo ou ambíguo: %s', (value) => {
    expect(safeInternalRedirectPath(value, origin)).toBe('/acesso')
  })

  it('rejeita barras invertidas já decodificadas por URLSearchParams', () => {
    const decoded = new URL(
      'https://borntorun.example/auth/callback?next=/%5C%5Cevil.example',
    ).searchParams.get('next')

    expect(safeInternalRedirectPath(decoded, origin)).toBe('/acesso')
  })
})
