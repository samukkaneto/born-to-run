/**
 * Bloco C — variante da ilustração anatômica do mapa segmentado.
 *
 * Regras do backlog:
 * - Sexo/modelo visual vem de seleção explícita ou dado autorizado; nunca
 *   inferido por nome, fotografia ou aparência.
 * - Quando os dados de sexo/biotipo forem insuficientes, a equipe técnica
 *   (ou o atleta) escolhe manualmente; o padrão de apresentação é "mid".
 * - O mesmo ativo é usado no aplicativo e no PDF: esta lista centraliza
 *   os mestres em public/brand/anatomy-*.png.
 */
export type AnatomySex = 'male' | 'female'
export type AnatomyBiotype = 'lean' | 'mid' | 'large'

export const ANATOMY_ASSETS: Record<AnatomySex, Record<AnatomyBiotype, string>> = {
  male: {
    lean: '/brand/anatomy-male-lean.png',
    mid: '/brand/anatomy-male-mid.png',
    large: '/brand/anatomy-male-large.png',
  },
  female: {
    lean: '/brand/anatomy-female-lean.png',
    mid: '/brand/anatomy-female-mid.png',
    large: '/brand/anatomy-female-large.png',
  },
} as const

/** Resolve o caminho do master. Nunca inventa sexo: quando não houver
 *  escolha explícita, usa o modelo masculino intermediário como base
 *  neutra de apresentação e o seletor da interface decide a variante. */
export function anatomyAssetPath(sex: AnatomySex | null | undefined, biotype: AnatomyBiotype | null | undefined) {
  const resolvedSex: AnatomySex = sex === 'female' ? 'female' : 'male'
  const resolvedBiotype: AnatomyBiotype = biotype === 'lean' || biotype === 'large' ? biotype : 'mid'
  return ANATOMY_ASSETS[resolvedSex][resolvedBiotype]
}

export const BIOTYPE_LABELS: Record<AnatomyBiotype, string> = {
  lean: 'Leve',
  mid: 'Intermediário',
  large: 'Maior volume',
}

export const SEX_LABELS: Record<AnatomySex, string> = {
  male: 'Masculino',
  female: 'Feminino',
}
