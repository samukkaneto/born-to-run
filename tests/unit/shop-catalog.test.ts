import { describe, expect, it } from 'vitest'
import { catalogPricingRule, catalogProducts } from '@/lib/shop/catalog'

describe('catálogo reservado da Born to Run', () => {
  it('aplica exatamente o acréscimo de 100% sobre cada custo pesquisado', () => {
    expect(catalogPricingRule.multiplier).toBe(2)

    for (const product of catalogProducts) {
      expect(product.price).toBe(Math.round(product.referenceCost * 2 * 100) / 100)
    }
  })

  it('mantém referências auditáveis e datadas para todos os produtos', () => {
    expect(catalogProducts.length).toBeGreaterThanOrEqual(10)

    for (const product of catalogProducts) {
      expect(product.reference.url).toMatch(/^https:\/\//)
      expect(product.reference.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    }
  })

  it('oferece uma paleta esportiva além do preto', () => {
    const colorNames = new Set(
      catalogProducts.flatMap((product) => product.colors.map((color) => color.name)),
    )

    expect(colorNames.has('Verde lima')).toBe(true)
    expect(colorNames.has('Rosa corrida')).toBe(true)
    expect(colorNames.has('Amarelo energia')).toBe(true)
    expect(colorNames.has('Azul royal')).toBe(true)
    expect(colorNames.has('Carbono')).toBe(true)
  })

  it('oferece visual e enquadramento configurável para cada produto', () => {
    for (const product of catalogProducts) {
      expect(product.image).toMatch(/^\/shop-preview\//)
      expect(product.imagePosition ?? 'center').toBeTruthy()
      expect(product.colors.length).toBeGreaterThan(0)
    }
  })

  it('mapeia somente imagens reais para as variantes publicadas', () => {
    const productsWithRealColorImages = catalogProducts.filter((product) => product.colorImages)

    expect(productsWithRealColorImages.map((product) => product.name)).toEqual([
      'Camiseta técnica',
      'Regata performance',
      'Top feminino performance',
      'Short de corrida',
      'Manga longa técnica',
    ])

    for (const product of productsWithRealColorImages) {
      expect(Object.keys(product.colorImages ?? {})).toHaveLength(1)
      expect(Object.values(product.colorImages ?? {})[0]).toMatch(/^\/shop-preview\/.+\.png$/)
    }

    expect(catalogProducts.filter((product) => !product.colorImages).length).toBeGreaterThan(0)
  })
})
