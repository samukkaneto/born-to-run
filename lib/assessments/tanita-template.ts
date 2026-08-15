import type { TanitaMeasurementKey } from '@/lib/assessments/tanita-ocr'

export type TanitaPhotoSlot = 1 | 2 | 3

export type TanitaTemplateRegion = {
  id: string
  field?: TanitaMeasurementKey
  kind: 'number' | 'date' | 'category' | 'physique'
  rect: readonly [left: number, top: number, width: number, height: number]
  smoothing?: boolean
  darkBackground?: boolean
}

const SUMMARY_REGIONS: TanitaTemplateRegion[] = [
  { id: 'date', kind: 'date', rect: [301, 105, 82, 19], smoothing: true },
  { id: 'weight', field: 'weight_kg', kind: 'number', rect: [302, 204, 43, 16] },
  { id: 'bmi', field: 'bmi', kind: 'number', rect: [459, 204, 43, 16] },
  { id: 'body-fat', field: 'body_fat_pct', kind: 'number', rect: [302, 249, 43, 16] },
  { id: 'fat-mass', field: 'fat_mass_kg', kind: 'number', rect: [459, 249, 43, 16] },
  { id: 'body-fat-category', kind: 'category', rect: [301, 269, 72, 22] },
  { id: 'fat-free-mass', field: 'fat_free_mass_kg', kind: 'number', rect: [459, 269, 48, 21], smoothing: true },
  { id: 'visceral-fat', field: 'visceral_fat_level', kind: 'number', rect: [302, 294, 43, 16] },
  { id: 'body-water', field: 'body_water_pct', kind: 'number', rect: [302, 339, 43, 16] },
  { id: 'body-water-mass', field: 'body_water_mass_kg', kind: 'number', rect: [459, 339, 43, 16] },
  { id: 'muscle-mass', field: 'muscle_mass_kg', kind: 'number', rect: [302, 384, 43, 16] },
  { id: 'bone-mass', field: 'bone_mass_kg', kind: 'number', rect: [459, 384, 43, 16] },
  { id: 'heart-rate', field: 'heart_rate_bpm', kind: 'number', rect: [302, 406, 43, 17] },
  { id: 'basal-metabolic-rate', field: 'basal_metabolic_rate', kind: 'number', rect: [302, 451, 43, 17] },
  { id: 'metabolic-age', field: 'metabolic_age', kind: 'number', rect: [459, 451, 43, 17] },
  { id: 'daily-calorie-intake', field: 'daily_calorie_intake', kind: 'number', rect: [302, 474, 43, 16] },
  { id: 'physique-rating', field: 'physique_rating', kind: 'physique', rect: [458, 473, 113, 18] },
]

const SEGMENTAL_REGIONS: TanitaTemplateRegion[] = [
  { id: 'left-arm-fat', field: 'segment_left_arm_fat_pct', kind: 'number', rect: [655, 271, 28, 16] },
  { id: 'left-arm-muscle', field: 'segment_left_arm_muscle_kg', kind: 'number', rect: [655, 290, 28, 16] },
  { id: 'right-arm-fat', field: 'segment_right_arm_fat_pct', kind: 'number', rect: [805, 271, 28, 16] },
  { id: 'right-arm-muscle', field: 'segment_right_arm_muscle_kg', kind: 'number', rect: [805, 290, 28, 16] },
  { id: 'trunk-fat', field: 'segment_trunk_fat_pct', kind: 'number', rect: [678, 335, 28, 16] },
  { id: 'trunk-muscle', field: 'segment_trunk_muscle_kg', kind: 'number', rect: [678, 354, 28, 16] },
  { id: 'left-leg-fat', field: 'segment_left_leg_fat_pct', kind: 'number', rect: [655, 436, 28, 16] },
  { id: 'left-leg-muscle', field: 'segment_left_leg_muscle_kg', kind: 'number', rect: [655, 455, 28, 16] },
  { id: 'right-leg-fat', field: 'segment_right_leg_fat_pct', kind: 'number', rect: [802, 436, 32, 20] },
  { id: 'right-leg-muscle', field: 'segment_right_leg_muscle_kg', kind: 'number', rect: [805, 455, 28, 16] },
]

const GRAPH_REGIONS: TanitaTemplateRegion[] = [
  { id: 'graph-bmi', field: 'bmi', kind: 'number', rect: [457, 137, 31, 17], darkBackground: true },
  { id: 'graph-body-water', field: 'body_water_pct', kind: 'number', rect: [758, 397, 48, 25], darkBackground: true },
]

export const TANITA_TEMPLATE_REGIONS: Record<TanitaPhotoSlot, TanitaTemplateRegion[]> = {
  1: SUMMARY_REGIONS,
  2: GRAPH_REGIONS,
  3: SEGMENTAL_REGIONS,
}

const INTEGER_SOURCE_FIELDS = new Set<TanitaMeasurementKey>([
  'basal_metabolic_rate',
  'daily_calorie_intake',
  'heart_rate_bpm',
  'physique_rating',
])

const LIMITS: Record<TanitaMeasurementKey, readonly [number, number]> = {
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

export function parseTanitaTemplateNumber(rawText: string, field: TanitaMeasurementKey) {
  const digits = rawText.replace(',', '.').replace(/[^0-9.]/g, '')
  if (!digits) return null

  let value: number
  if (INTEGER_SOURCE_FIELDS.has(field)) {
    value = Number(digits.replace(/\./g, ''))
  } else if (digits.includes('.')) {
    value = Number(digits)
  } else {
    value = Number(`${digits.slice(0, -1) || '0'}.${digits.slice(-1)}`)
  }

  if (field === 'metabolic_age') value = Math.round(value)
  if (!Number.isFinite(value)) return null
  const [minimum, maximum] = LIMITS[field]
  return value >= minimum && value <= maximum ? value : null
}

function rounded(value: number) {
  return Math.round(value * 10) / 10
}

export function reconcileTanitaMeasurements(
  measurements: Partial<Record<TanitaMeasurementKey, number>>,
) {
  const next = { ...measurements }
  const weight = next.weight_kg
  const bodyFat = next.body_fat_pct
  const water = next.body_water_pct

  if (weight && bodyFat) {
    const expectedFatMass = rounded(weight * bodyFat / 100)
    if (next.fat_mass_kg === undefined || Math.abs(next.fat_mass_kg - expectedFatMass) > 1.5) {
      next.fat_mass_kg = expectedFatMass
    }
  }
  if (weight && next.fat_mass_kg !== undefined) {
    const expectedFatFreeMass = rounded(weight - next.fat_mass_kg)
    if (next.fat_free_mass_kg === undefined || Math.abs(next.fat_free_mass_kg - expectedFatFreeMass) > 1.5) {
      next.fat_free_mass_kg = expectedFatFreeMass
    }
  }
  if (weight && water) {
    const expectedWaterMass = rounded(weight * water / 100)
    if (next.body_water_mass_kg === undefined || Math.abs(next.body_water_mass_kg - expectedWaterMass) > 1.5) {
      next.body_water_mass_kg = expectedWaterMass
    }
  }
  if (next.fat_free_mass_kg !== undefined && next.bone_mass_kg !== undefined) {
    const expectedMuscleMass = rounded(next.fat_free_mass_kg - next.bone_mass_kg)
    if (next.muscle_mass_kg === undefined || Math.abs(next.muscle_mass_kg - expectedMuscleMass) > 1.5) {
      next.muscle_mass_kg = expectedMuscleMass
    }
  }
  return next
}
