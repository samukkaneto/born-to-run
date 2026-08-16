import { describe, expect, it } from 'vitest'
import { anatomyAssetPath, ANATOMY_ASSETS, autoAnatomyAssetPath, classifyIllustrationBiotype } from '@/lib/assessments/anatomy-assets'

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

describe('classifyIllustrationBiotype', () => {
  it('prioriza o percentual de gordura da Tanita sobre o IMC (caso fisiculturista)', () => {
    // IMC de "obeso", mas 12% de gordura: retrato de boa forma, não obeso
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 12, bmi: 32 })).toBe('mid')
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 8, bmi: 31 })).toBe('lean')
  })

  it('classifica homens pelas faixas de gordura corporais (Tanita/Gallagher)', () => {
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 9 })).toBe('lean')
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 15 })).toBe('mid')
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 22 })).toBe('mid')
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 24 })).toBe('large')
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 27 })).toBe('large')
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 35 })).toBe('large')
  })

  it('classifica mulheres pelas faixas de gordura corporais (Tanita/Gallagher)', () => {
    expect(classifyIllustrationBiotype({ sex: 'female', bodyFatPct: 14 })).toBe('lean')
    expect(classifyIllustrationBiotype({ sex: 'female', bodyFatPct: 24 })).toBe('mid')
    expect(classifyIllustrationBiotype({ sex: 'female', bodyFatPct: 30 })).toBe('mid')
    expect(classifyIllustrationBiotype({ sex: 'female', bodyFatPct: 32 })).toBe('large')
    expect(classifyIllustrationBiotype({ sex: 'female', bodyFatPct: 40 })).toBe('large')
  })

  it('ajusta retratos atípicos pelo physique rating da balança', () => {
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 18, physiqueRating: 9 })).toBe('lean')
    expect(classifyIllustrationBiotype({ sex: 'female', bodyFatPct: 18, physiqueRating: 8 })).toBe('lean')
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 20, physiqueRating: 2 })).toBe('large')
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 15, physiqueRating: 3 })).toBe('large')
  })

  it('usa o IMC como fallback quando não há avaliação Tanita', () => {
    expect(classifyIllustrationBiotype({ sex: 'male', bmi: 17 })).toBe('lean')
    expect(classifyIllustrationBiotype({ sex: 'female', bmi: 22 })).toBe('mid')
    expect(classifyIllustrationBiotype({ sex: 'male', bmi: 24.9 })).toBe('mid')
    expect(classifyIllustrationBiotype({ sex: 'female', bmi: 25 })).toBe('large')
    expect(classifyIllustrationBiotype({ sex: 'male', bmi: 33 })).toBe('large')
  })

  it('retorna null (apresentador usa o padrão mid) sem nenhum dado válido', () => {
    expect(classifyIllustrationBiotype(null)).toBeNull()
    expect(classifyIllustrationBiotype({})).toBeNull()
    expect(classifyIllustrationBiotype({ sex: 'male', bmi: null })).toBeNull()
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: 0 })).toBeNull()
    expect(classifyIllustrationBiotype({ sex: 'male', bodyFatPct: -2 })).toBeNull()
  })

  it('autoAnatomyAssetPath resolve sempre um caminho válido das seis variantes', () => {
    for (const data of [
      null,
      {},
      { sex: 'male', bmi: 22 },
      { sex: 'female', bodyFatPct: 26 },
      { sex: 'male', bodyFatPct: 10, bmi: 29 },
      { sex: 'female', bodyFatPct: 38, physiqueRating: 2 },
    ] as Array<Parameters<typeof autoAnatomyAssetPath>[0]>) {
      const path = autoAnatomyAssetPath(data)
      expect(/^\/brand\/anatomy-(male|female)-(lean|mid|large)\.png$/.test(path)).toBe(true)
      const sex = path.includes('female') ? 'female' : 'male'
      const biotype = path.split('-')[2].replace('.png', '')
      expect(Object.values(ANATOMY_ASSETS[sex]).includes(path)).toBe(true)
      void biotype
    }
  })
})
