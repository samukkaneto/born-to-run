export type CatalogColor = { name: string; hex: string }

export type CatalogProduct = {
  name: string
  category: 'Vestuário' | 'Hidratação' | 'Acessórios' | 'Casa'
  description: string
  material: string
  referenceCost: number
  price: number
  image: string
  imagePosition?: string
  colors: CatalogColor[]
  reference: { label: string; url: string; checkedAt: string }
}

const colors = {
  carbon: { name: 'Carbono', hex: '#171717' },
  white: { name: 'Branco', hex: '#F7F4EF' },
  lime: { name: 'Verde lima', hex: '#84CC16' },
  pink: { name: 'Rosa corrida', hex: '#EC1778' },
  yellow: { name: 'Amarelo energia', hex: '#FACC15' },
  blue: { name: 'Azul royal', hex: '#1D4ED8' },
  cyan: { name: 'Azul turquesa', hex: '#06B6D4' },
  orange: { name: 'Laranja', hex: '#F97316' },
} satisfies Record<string, CatalogColor>

function product(entry: Omit<CatalogProduct, 'price'>): CatalogProduct {
  return { ...entry, price: Math.round(entry.referenceCost * 2 * 100) / 100 }
}

const checkedAt = '2026-08-11'
const apparel = '/shop-preview/apparel-color-collection-v2.webp'
const accessories = '/shop-preview/accessories-color-collection.webp'

export const catalogProducts: CatalogProduct[] = [
  product({
    name: 'Camiseta técnica', category: 'Vestuário',
    description: 'Modelagem leve para treinos, provas e uso diário da equipe.',
    material: 'Malha dry-fit 100% poliéster com personalização colorida', referenceCost: 35.99,
    image: '/shop-preview/apparel-premium.webp', imagePosition: '20% center',
    colors: [colors.lime, colors.pink, colors.blue, colors.carbon, colors.white],
    reference: { label: 'FuturaIM — camiseta dry-fit masculina', url: 'https://www.futuraim.com.br/produto/camiseta-dry-fit-masculina', checkedAt },
  }),
  product({
    name: 'Regata performance', category: 'Vestuário',
    description: 'Respirabilidade e liberdade de movimento para os dias mais quentes.',
    material: 'Dry-fit personalizado para uso esportivo', referenceCost: 79.9,
    image: apparel, imagePosition: '52% center',
    colors: [colors.pink, colors.lime, colors.cyan, colors.yellow, colors.carbon],
    reference: { label: 'D21 Fitness — regata dry-fit personalizada', url: 'https://www.d21fitness.com.br/regata/regata-dry-fit-personalizada', checkedAt },
  }),
  product({
    name: 'Top feminino performance', category: 'Vestuário',
    description: 'Suporte e conforto para corrida e treinamento funcional.',
    material: 'Poliamida esportiva personalizada', referenceCost: 79.9,
    image: apparel, imagePosition: '52% center',
    colors: [colors.lime, colors.pink, colors.blue, colors.carbon],
    reference: { label: 'D21 Fitness — top personalizado em poliamida', url: 'https://www.d21fitness.com.br/', checkedAt },
  }),
  product({
    name: 'Short de corrida', category: 'Vestuário',
    description: 'Leve, versátil e desenvolvido para acompanhar passadas longas.',
    material: 'Poliamida esportiva personalizada', referenceCost: 89.9,
    image: apparel, imagePosition: '48% 76%',
    colors: [colors.pink, colors.lime, colors.cyan, colors.carbon],
    reference: { label: 'D21 Fitness — short personalizado em poliamida', url: 'https://www.d21fitness.com.br/short/short-personalizado-fitness-poliamida', checkedAt },
  }),
  product({
    name: 'Manga longa técnica', category: 'Vestuário',
    description: 'Proteção e conforto térmico sem perder respirabilidade.',
    material: 'Dry Performance sublimado de manga longa', referenceCost: 58,
    image: apparel, imagePosition: '20% center',
    colors: [colors.blue, colors.pink, colors.lime, colors.carbon],
    reference: { label: 'ST47 — camiseta Dry Performance manga longa', url: 'https://st47.com.br/produto/camiseta-dryfit-sublimada-manga-longa/', checkedAt },
  }),
  product({
    name: 'Moletom da equipe', category: 'Vestuário',
    description: 'Camada confortável para concentração, viagem e pós-prova.',
    material: 'Moletom flanelado personalizado', referenceCost: 89.99,
    image: apparel, imagePosition: '84% center',
    colors: [colors.yellow, colors.carbon, colors.blue, colors.pink],
    reference: { label: 'FuturaIM — moletom personalizado', url: 'https://www.futuraim.com.br/moletom-personalizado', checkedAt },
  }),
  product({
    name: 'Garrafa térmica 550 ml', category: 'Hidratação',
    description: 'Hidratação da rotina ao treino com acabamento resistente.',
    material: 'Corpo térmico personalizado com tampa metálica', referenceCost: 62.8,
    image: accessories, imagePosition: '16% 45%',
    colors: [colors.lime, colors.pink, colors.blue, colors.carbon],
    reference: { label: 'Brussax — garrafa térmica personalizada 550 ml', url: 'https://shopee.com.br/brussaxpersonalizados', checkedAt },
  }),
  product({
    name: 'Boné esportivo', category: 'Acessórios',
    description: 'Proteção ajustável com visual leve para corrida ao ar livre.',
    material: 'Tecido esportivo respirável com aplicação personalizada', referenceCost: 38.9,
    image: accessories, imagePosition: '45% 18%',
    colors: [colors.blue, colors.lime, colors.pink, colors.white, colors.carbon],
    reference: { label: 'Mercado Livre — boné esportivo personalizado', url: 'https://lista.mercadolivre.com.br/bone-esportivo-personalizado', checkedAt },
  }),
  product({
    name: 'Viseira dry-fit', category: 'Acessórios',
    description: 'Aba esportiva leve para treinos e provas sob sol forte.',
    material: 'Dry-fit ajustável, disponível em múltiplas cores', referenceCost: 45,
    image: accessories, imagePosition: '76% 20%',
    colors: [colors.carbon, colors.pink, colors.lime, colors.yellow, colors.blue, colors.white],
    reference: { label: 'Mercado Livre — viseira premium dry-fit personalizada', url: 'https://lista.mercadolivre.com.br/bone-dry-fit-personalizado', checkedAt },
  }),
  product({
    name: 'Mochila saco esportiva', category: 'Acessórios',
    description: 'Praticidade para levar o essencial aos treinos e provas.',
    material: 'Microfibra personalizada com cordões reforçados', referenceCost: 18.4,
    image: accessories, imagePosition: '50% 62%',
    colors: [colors.cyan, colors.pink, colors.lime, colors.blue, colors.carbon],
    reference: { label: 'Brindes Mil — mochila saco em microfibra', url: 'https://brindesmil.com.br/produtos/mochila-saco/', checkedAt },
  }),
  product({
    name: 'Toalha esportiva', category: 'Acessórios',
    description: 'Compacta, leve e adequada para treinos intensos.',
    material: 'Tecido esportivo refrescante personalizado', referenceCost: 32,
    image: accessories, imagePosition: '17% 82%',
    colors: [colors.carbon, colors.yellow, colors.pink, colors.lime, colors.blue, colors.cyan],
    reference: { label: 'Elo7 — toalha esportiva personalizada', url: 'https://www.elo7.com.br/lista/toalhas-esportiva-personalizadas', checkedAt },
  }),
  product({
    name: 'Caneca oficial 325 ml', category: 'Casa',
    description: 'A identidade da equipe também nos momentos de descanso.',
    material: 'Cerâmica branca personalizada por sublimação', referenceCost: 30,
    image: accessories, imagePosition: '88% 48%', colors: [colors.white],
    reference: { label: 'Nedd Publicidade — caneca de cerâmica', url: 'https://www.neddpublicidade.com.br/produto/caneca-branca-personalizada', checkedAt },
  }),
  product({
    name: 'Copo térmico 500 ml', category: 'Hidratação',
    description: 'Parede térmica e tampa para acompanhar deslocamentos e eventos.',
    material: 'Aço inox personalizado, livre de BPA', referenceCost: 59.9,
    image: accessories, imagePosition: '78% 82%',
    colors: [colors.orange, colors.lime, colors.pink, colors.blue, colors.carbon],
    reference: { label: 'Teremaq — copo térmico inox 500 ml', url: 'https://www.teremaq.com.br/produto/copo-termico-tipo-stanley-personalizado', checkedAt },
  }),
]

export const catalogPricingRule = {
  multiplier: 2,
  description: 'Preço sugerido calculado com acréscimo de 100% sobre o custo de referência.',
  checkedAt,
}

export const catalogBrandRules = [
  'Peças pretas e escuras usam o logotipo completo com nome e slogan em branco.',
  'Peças amarelas, verde-lima e azul-turquesa usam o logotipo completo com nome e slogan em preto.',
  'Nenhuma aplicação pode remover BORN TO RUN, Treinamento e Saúde ou os corredores do símbolo.',
] as const
