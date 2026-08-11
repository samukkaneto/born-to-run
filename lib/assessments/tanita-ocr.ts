export type TanitaMeasurementKey =
  | 'weight_kg'
  | 'body_fat_pct'
  | 'muscle_mass_kg'
  | 'visceral_fat_level'
  | 'body_water_pct'
  | 'bmi'
  | 'metabolic_age'
  | 'bone_mass_kg'
  | 'basal_metabolic_rate'
  | 'physique_rating'

export type TanitaExtraction = {
  assessedAt: string | null
  measurements: Partial<Record<TanitaMeasurementKey, number>>
  detectedCount: number
  warnings: string[]
}

const NUMBER = '(\\d{1,4}(?:[.,]\\d{1,2})?)'

const PATTERNS: Record<TanitaMeasurementKey, RegExp[]> = {
  weight_kg: [
    new RegExp(`\\bWeight\\s*(?:Weight\\s*)?[:=]?\\s*${NUMBER}\\s*kg`, 'i'),
    new RegExp(`\\bPeso\\s*[:=]?\\s*${NUMBER}\\s*kg`, 'i'),
  ],
  body_fat_pct: [
    new RegExp(`\\bBody\\s*Fat(?:\\s*Percentage|\\s*\\(%\\))?[^0-9]{0,24}${NUMBER}\\s*%`, 'i'),
    new RegExp(`\\bGordura\\s*corporal[^0-9]{0,24}${NUMBER}\\s*%`, 'i'),
  ],
  muscle_mass_kg: [
    new RegExp(`\\bMuscle\\s*Mass[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
    new RegExp(`\\bMassa\\s*muscular[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
  ],
  visceral_fat_level: [
    new RegExp(`\\bVisceral\\s*Fat(?:\\s*Rating|\\s*Level)?[^0-9]{0,18}${NUMBER}`, 'i'),
    new RegExp(`\\bGordura\\s*visceral[^0-9]{0,18}${NUMBER}`, 'i'),
  ],
  body_water_pct: [
    new RegExp(`\\bBody\\s*Water(?:\\s*Percentage|\\s*\\(%\\))?[^0-9]{0,24}${NUMBER}\\s*%`, 'i'),
    new RegExp(`\\b[ÁA]gua\\s*corporal[^0-9]{0,24}${NUMBER}\\s*%`, 'i'),
  ],
  bmi: [
    new RegExp(`\\bBody\\s*Mass\\s*Index\\s*\\(BMI\\)[^0-9]{0,18}${NUMBER}`, 'i'),
    new RegExp(`\\bBMI[^0-9]{0,12}${NUMBER}`, 'i'),
    new RegExp(`\\bIMC[^0-9]{0,12}${NUMBER}`, 'i'),
  ],
  metabolic_age: [
    new RegExp(`\\bMetabolic\\s*Age[^0-9]{0,18}${NUMBER}`, 'i'),
    new RegExp(`\\bIdade\\s*metab[oó]lica[^0-9]{0,18}${NUMBER}`, 'i'),
  ],
  bone_mass_kg: [
    new RegExp(`\\bBone\\s*Mass[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
    new RegExp(`\\bMassa\\s*[oó]ssea[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
  ],
  basal_metabolic_rate: [
    new RegExp(`\\bBasal\\s*Metabolic\\s*Rate[^0-9]{0,24}${NUMBER}\\s*kcal`, 'i'),
    new RegExp(`\\bMetabolismo\\s*basal[^0-9]{0,24}${NUMBER}\\s*kcal`, 'i'),
  ],
  physique_rating: [
    new RegExp(`\\bPhysique\\s*Rating[^0-9]{0,18}(\\d)`, 'i'),
    new RegExp(`\\bClassifica[cç][aã]o\\s*f[ií]sica[^0-9]{0,18}(\\d)`, 'i'),
  ],
}

const LIMITS: Record<TanitaMeasurementKey, [number, number]> = {
  weight_kg: [20, 400],
  body_fat_pct: [1, 75],
  muscle_mass_kg: [5, 250],
  visceral_fat_level: [1, 60],
  body_water_pct: [20, 80],
  bmi: [8, 80],
  metabolic_age: [10, 120],
  bone_mass_kg: [0.5, 15],
  basal_metabolic_rate: [500, 10000],
  physique_rating: [1, 9],
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
}

function findMeasurement(text: string, key: TanitaMeasurementKey) {
  for (const pattern of PATTERNS[key]) {
    const match = text.match(pattern)
    const value = match?.[1] ? parseNumber(match[1]) : null
    if (value === null) continue
    const [minimum, maximum] = LIMITS[key]
    if (value >= minimum && value <= maximum) return value
  }
  return null
}

function parseAssessmentDate(text: string) {
  const match = text.match(
    /(?:Date\s*&?\s*Time|Measurement\s*Date|Data(?:\s+e\s+hora)?)[^0-9]{0,20}(\d{1,2})[/.\-](\d{1,2})[/.\-](\d{2,4})/i,
  )
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  const year = match[3].length === 2 ? 2000 + Number(match[3]) : Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  if (
    date.getUTCFullYear() !== year
    || date.getUTCMonth() !== month - 1
    || date.getUTCDate() !== day
  ) return null
  return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
}

export function parseTanitaOcrText(rawText: string): TanitaExtraction {
  const text = rawText
    .normalize('NFKC')
    .replace(/[|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  const measurements: Partial<Record<TanitaMeasurementKey, number>> = {}

  for (const key of Object.keys(PATTERNS) as TanitaMeasurementKey[]) {
    const value = findMeasurement(text, key)
    if (value !== null) measurements[key] = value
  }

  const detectedCount = Object.keys(measurements).length
  const warnings: string[] = []
  if (detectedCount === 0) {
    warnings.push('Nenhuma medida foi reconhecida. Verifique a nitidez do arquivo ou preencha os campos manualmente.')
  } else if (detectedCount < 5) {
    warnings.push('Poucas medidas foram reconhecidas. Confira com atenção o relatório original antes de salvar.')
  } else {
    warnings.push('A leitura automática é uma prévia. Confira todos os números com o relatório original antes de publicar.')
  }

  return {
    assessedAt: parseAssessmentDate(text),
    measurements,
    detectedCount,
    warnings,
  }
}
