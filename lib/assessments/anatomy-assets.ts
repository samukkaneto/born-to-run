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

/**
 * Pontos de referência normalizados na imagem anatômica (origem no canto
 * superior esquerdo). Os seis masters usam a mesma moldura 2:3; manter os
 * pontos aqui evita que o PDF e o sistema apontem para posições diferentes.
 */
export const ANATOMY_MARKERS = {
  leftArm: [0.325, 0.31],
  rightArm: [0.675, 0.31],
  trunk: [0.5, 0.37],
  leftLeg: [0.43, 0.58],
  rightLeg: [0.57, 0.58],
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

/**
 * Classificação automática do biotipo da ilustração (Bloco C — atualização).
 *
 * Regra de negócio definida pelo proprietário: a balança Tanita é mais
 * específica que o IMC. Um fisiculturista pode ter IMC de "obeso" e ainda
 * assim estar saudável e cheio de músculo. Por isso a escolha da variante
 * anatômica é feita primeiro pelo **percentual de gordura corporal da
 * Tanita** (com o physique rating ajustando o retrato de composição) e
 * somente na ausência de avaliação o IMC entra como regra geral.
 *
 * Faixas de %G: baseadas na tabela oficial da Tanita (faixa saudável
 * 12–25% homens / 21–36% mulheres, ajustada por idade) e na correspondência
 * IMC-↔-%G de Gallagher et al. (NY Obesity Research Center), que é a base
 * científica declarada da tabela da própria Tanita:
 *   Homens:  <11% magro · 11–22% saudável · 22–27% sobrepeso · >27% obeso
 *   Mulheres: <16% magro · 16–30% saudável · 30–35% sobrepeso · >35% obeso
 *
 * Fallback IMC (OMS, sem avaliação Tanita):
 *   <18,5 magro · 18,5–24,9 normal · >=25 sobrepeso/obesidade
 * Sem sexo informado, a apresentação não escolhe um modelo corporal automaticamente.
 */
export interface BodyDataForIllustration {
  sex?: string | null
  /** Percentual de gordura corporal da avaliação Tanita */
  bodyFatPct?: number | null
  /** BMI da avaliação mais recente ou do perfil */
  bmi?: number | null
  /** Physique rating da balança Tanita (1–9); ajusta retratos atípicos */
  physiqueRating?: number | null
  /** Nível de gordura visceral da Tanita; 1–12 saudável e 13–59 excessivo */
  visceralFatLevel?: number | null
}

/** Faixas de %G por sexo que separam magro / saudável / sobrepeso / obeso.
 *  Limites superiores da faixa "saudável" por idade (Tanita/Europa):
 *  homens 25% / mulheres 36% (limite mais permissivo) — usados apenas
 *  para diferenciar saudável vs. sobrepeso quando o limite por idade
 *  não estiver disponível; os limites de sobrepeso/obesidade seguem
 *  Gallagher et al. (base da tabela Tanita). */
function classifyByBodyFatPct(sex: AnatomySex | null, pct: number | null | undefined, rating: number | null | undefined): AnatomyBiotype | null {
  if (!sex) return null
  const low = sex === 'female' ? 16 : 11
  const high = sex === 'female' ? 30 : 22
  if (!Number.isFinite(pct) || (pct as number) <= 0) return null
  const bodyFat = pct as number
  // Physique rating 8–9 (fino e musculoso / muito musculoso) → retrato magro
  if (rating === 8 || rating === 9) return 'lean'
  // Physique rating 1–3 (obeso oculto / obeso / sólido) → retrato de maior volume
  if (rating === 1 || rating === 2 || rating === 3) return 'large'
  if (bodyFat < low) return 'lean'
  if (bodyFat <= high) return 'mid'
  return 'large'
}

function hasExcessVisceralFat(level: number | null | undefined) {
  return Number.isFinite(level) && (level as number) >= 13
}

function classifyByBmi(bmi: number | null | undefined): AnatomyBiotype | null {
  if (!Number.isFinite(bmi) || (bmi as number) <= 0) return null
  const value = bmi as number
  if (value < 18.5) return 'lean'
  if (value < 25) return 'mid'
  return 'large'
}

/** Escolhe o biotipo: Tanita (%G) tem prioridade; IMC é o fallback. */
export function classifyIllustrationBiotype(data: BodyDataForIllustration | null | undefined): AnatomyBiotype | null {
  const sex: AnatomySex | null = data?.sex === 'female' || data?.sex === 'male' ? data.sex : null
  const byTanita = classifyByBodyFatPct(sex, data?.bodyFatPct ?? null, data?.physiqueRating ?? null)
  const excessVisceralFat = hasExcessVisceralFat(data?.visceralFatLevel ?? null)
  // Ratings 8–9 representam um corpo magro/musculoso e não devem ser
  // transformados em um retrato maior apenas por um sinal isolado.
  if (byTanita === 'lean' && (data?.physiqueRating === 8 || data?.physiqueRating === 9)) return 'lean'
  if (byTanita === 'large' || excessVisceralFat) return 'large'
  if (byTanita) return byTanita
  return classifyByBmi(data?.bmi ?? null)
}

/** Caminho do master resolvendo a variante automaticamente quando possível. */
export function autoAnatomyAssetPath(data: BodyDataForIllustration | null | undefined): string {
  const sex: AnatomySex = data?.sex === 'female' ? 'female' : 'male'
  const biotype = classifyIllustrationBiotype(data) ?? 'mid'
  return ANATOMY_ASSETS[sex][biotype]
}
