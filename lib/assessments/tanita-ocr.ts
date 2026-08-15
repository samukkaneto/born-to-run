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
  | 'fat_mass_kg'
  | 'fat_free_mass_kg'
  | 'body_water_mass_kg'
  | 'daily_calorie_intake'
  | 'heart_rate_bpm'
  | 'segment_left_arm_fat_pct'
  | 'segment_right_arm_fat_pct'
  | 'segment_trunk_fat_pct'
  | 'segment_left_leg_fat_pct'
  | 'segment_right_leg_fat_pct'
  | 'segment_left_arm_muscle_kg'
  | 'segment_right_arm_muscle_kg'
  | 'segment_trunk_muscle_kg'
  | 'segment_left_leg_muscle_kg'
  | 'segment_right_leg_muscle_kg'

export type TanitaExtraction = {
  assessedAt: string | null
  measurements: Partial<Record<TanitaMeasurementKey, number>>
  labels: {
    bodyFatCategory: 'underfat' | 'healthy' | 'overfat' | 'obese' | null
  }
  detectedCount: number
  warnings: string[]
}

const NUMBER = '(\\d{1,4}(?:[.,]\\d{1,2})?)'

function segmentPatterns(englishRegion: string, portugueseRegion: string, unit: '%' | 'kg') {
  const englishMetric = unit === '%'
    ? `(?:Body\\s*)?Fat[^0-9]{0,18}${NUMBER}\\s*%`
    : `Muscle\\s*Mass[^0-9]{0,18}${NUMBER}\\s*kg`
  const portugueseMetric = unit === '%'
    ? `Gordura[^0-9]{0,18}${NUMBER}\\s*%`
    : `Massa\\s*muscular[^0-9]{0,18}${NUMBER}\\s*kg`
  return [
    new RegExp(`\\b${englishRegion}.{0,90}?${englishMetric}`, 'i'),
    new RegExp(`\\b${portugueseRegion}.{0,90}?${portugueseMetric}`, 'i'),
  ]
}

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
  fat_mass_kg: [
    new RegExp(`\\bBody\\s*Fat(?:\\s*Percentage|\\s*\\(%\\))?[^%]{0,30}%\\s*(?:Mass)?[^0-9]{0,12}${NUMBER}\\s*kg`, 'i'),
    new RegExp(`\\bFat\\s*Mass[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
    new RegExp(`\\bMassa\\s*de\\s*gordura[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
  ],
  fat_free_mass_kg: [
    new RegExp(`\\bFat\\s*Free\\s*Mass[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
    new RegExp(`\\bMassa\\s*livre\\s*de\\s*gordura[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
  ],
  body_water_mass_kg: [
    new RegExp(`\\bBody\\s*Water(?:\\s*Percentage|\\s*\\(%\\))?[^%]{0,30}%\\s*(?:Mass)?[^0-9]{0,12}${NUMBER}\\s*kg`, 'i'),
    new RegExp(`\\bMassa\\s*de\\s*[áa]gua[^0-9]{0,18}${NUMBER}\\s*kg`, 'i'),
  ],
  daily_calorie_intake: [
    new RegExp(`\\bDaily\\s*Calorie\\s*Intake[^0-9]{0,24}${NUMBER}\\s*kcal`, 'i'),
    new RegExp(`\\bIngest[aã]o\\s*cal[oó]rica\\s*di[aá]ria[^0-9]{0,24}${NUMBER}\\s*kcal`, 'i'),
  ],
  heart_rate_bpm: [
    new RegExp(`\\bHeart\\s*Rate[^0-9]{0,18}${NUMBER}\\s*(?:bpm)?`, 'i'),
    new RegExp(`\\bFrequ[eê]ncia\\s*card[ií]aca[^0-9]{0,18}${NUMBER}`, 'i'),
  ],
  segment_left_arm_fat_pct: segmentPatterns('Left Arm', 'Bra[cç]o esquerdo', '%'),
  segment_right_arm_fat_pct: segmentPatterns('Right Arm', 'Bra[cç]o direito', '%'),
  segment_trunk_fat_pct: segmentPatterns('Trunk', 'Tronco', '%'),
  segment_left_leg_fat_pct: segmentPatterns('Left Leg', 'Perna esquerda', '%'),
  segment_right_leg_fat_pct: segmentPatterns('Right Leg', 'Perna direita', '%'),
  segment_left_arm_muscle_kg: segmentPatterns('Left Arm', 'Bra[cç]o esquerdo', 'kg'),
  segment_right_arm_muscle_kg: segmentPatterns('Right Arm', 'Bra[cç]o direito', 'kg'),
  segment_trunk_muscle_kg: segmentPatterns('Trunk', 'Tronco', 'kg'),
  segment_left_leg_muscle_kg: segmentPatterns('Left Leg', 'Perna esquerda', 'kg'),
  segment_right_leg_muscle_kg: segmentPatterns('Right Leg', 'Perna direita', 'kg'),
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
  fat_mass_kg: [1, 300],
  fat_free_mass_kg: [1, 300],
  body_water_mass_kg: [1, 300],
  daily_calorie_intake: [500, 15000],
  heart_rate_bpm: [30, 240],
  segment_left_arm_fat_pct: [1, 75],
  segment_right_arm_fat_pct: [1, 75],
  segment_trunk_fat_pct: [1, 75],
  segment_left_leg_fat_pct: [1, 75],
  segment_right_leg_fat_pct: [1, 75],
  segment_left_arm_muscle_kg: [0.1, 100],
  segment_right_arm_muscle_kg: [0.1, 100],
  segment_trunk_muscle_kg: [0.1, 150],
  segment_left_leg_muscle_kg: [0.1, 100],
  segment_right_leg_muscle_kg: [0.1, 100],
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
  const bodyFatRange = text.match(/(?:Body\s*Fat\s*Range|Faixa\s*de\s*gordura\s*corporal)[^a-záàâãéèêíïóôõöúç]{0,18}(Underfat|Healthy|Overfat|Obese|Abaixo|Saud[aá]vel|Elevad[ao]|Obes[ao])/i)?.[1]?.toLowerCase() ?? ''
  const bodyFatCategory = bodyFatRange.startsWith('under') || bodyFatRange.startsWith('abaixo')
    ? 'underfat'
    : bodyFatRange.startsWith('health') || bodyFatRange.startsWith('saud')
      ? 'healthy'
      : bodyFatRange.startsWith('over') || bodyFatRange.startsWith('elevad')
        ? 'overfat'
        : bodyFatRange.startsWith('obes')
          ? 'obese'
          : null

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
    labels: { bodyFatCategory },
    detectedCount,
    warnings,
  }
}
