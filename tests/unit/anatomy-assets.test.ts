import { describe, expect, it } from 'vitest'
import { anatomyAssetPath, ANATOMY_ASSETS } from '@/lib/assessments/anatomy-assets'

describe('anatomyAssetPath', () => {
  it('resolve as seis variantes oficiais da família anatômica', () => {
    for (const sex of ['male', 'female'] as const) {
      for (const biotype of ['lean', 'mid', 'large'] as const) {
        const path = anatomyAssetPath(sex, biotype)
        expect(path).toBe(`/brand/anatomy-${sex}-${biotype}.png`)
        expect(Object.values(ANATOMY_ASSETS[sex]).includes(path)).toBe(true)
      }
    }
  })

  it('aplica o padrão de apresentação (masculino · intermediário) quando não há escolha explícita', () => {
    expect(anatomyAssetPath(null, null)).toBe('/brand/anatomy-male-mid.png')
    expect(anatomyAssetPath(undefined, undefined)).toBe('/brand/anatomy-male-mid.png')
    expect(anatomyAssetPath('' as never, '' as never)).toBe('/brand/anatomy-male-mid.png')
  })

  it('preserva o sexo feminino e normaliza apenas o biotipo', () => {
    expect(anatomyAssetPath('female', null)).toBe('/brand/anatomy-female-mid.png')
    expect(anatomyAssetPath('female', 'lean')).toBe('/brand/anatomy-female-lean.png')
  })

  it('rejeita valores de domínio inválidos aplicando o padrão', () => {
    expect(anatomyAssetPath('other' as never, null)).toBe('/brand/anatomy-male-mid.png')
    expect(anatomyAssetPath(null, 'giant' as never)).toBe('/brand/anatomy-male-mid.png')
  })

  it('combina qualquer sexo válido com biotipos válidos', () => {
    expect(anatomyAssetPath('male', 'large')).toBe('/brand/anatomy-male-large.png')
    expect(anatomyAssetPath('female', 'large')).toBe('/brand/anatomy-female-large.png')
    expect(anatomyAssetPath('male', 'lean')).toBe('/brand/anatomy-male-lean.png')
  })
})
