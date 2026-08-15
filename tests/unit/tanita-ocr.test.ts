import { describe, expect, it } from 'vitest'
import { parseTanitaOcrText } from '@/lib/assessments/tanita-ocr'
import { parseTanitaTemplateNumber, reconcileTanitaMeasurements } from '@/lib/assessments/tanita-template'

describe('leitura de relatório Tanita', () => {
  it('extrai medidas e data de um texto em inglês', () => {
    const result = parseTanitaOcrText(`
      Date & Time 21/07/26 06:52
      Weight 61.8 kg BMI 24.8
      Body Fat Percentage 35.7 % Mass 22.1 kg
      Body Fat Range Healthy
      Fat Free Mass 39.7 kg
      Visceral Fat Rating 8.0
      Body Water Percentage 46.7 % Mass 28.9 kg
      Muscle Mass 37.7 kg Bone Mass 2.0 kg
      Basal Metabolic Rate 1202 kcal Metabolic Age 51.0 yrs
      Daily Calorie Intake 2188 kcal
      Physique Rating 5-Standard
    `)

    expect(result.assessedAt).toBe('2026-07-21')
    expect(result.measurements).toMatchObject({
      weight_kg: 61.8,
      bmi: 24.8,
      body_fat_pct: 35.7,
      visceral_fat_level: 8,
      body_water_pct: 46.7,
      muscle_mass_kg: 37.7,
      bone_mass_kg: 2,
      basal_metabolic_rate: 1202,
      metabolic_age: 51,
      physique_rating: 5,
      fat_mass_kg: 22.1,
      fat_free_mass_kg: 39.7,
      body_water_mass_kg: 28.9,
      daily_calorie_intake: 2188,
    })
    expect(result.detectedCount).toBe(14)
    expect(result.labels.bodyFatCategory).toBe('healthy')
  })

  it('extrai gordura e massa muscular dos cinco segmentos', () => {
    const result = parseTanitaOcrText(`
      Left Arm Fat 37.8 % Muscle Mass 1.8 kg
      Right Arm Fat 39.8 % Muscle Mass 1.5 kg
      Trunk Fat 36.4 % Muscle Mass 21.8 kg
      Left Leg Fat 33.6 % Muscle Mass 6.3 kg
      Right Leg Fat 33.6 % Muscle Mass 6.3 kg
    `)

    expect(result.measurements).toMatchObject({
      segment_left_arm_fat_pct: 37.8,
      segment_left_arm_muscle_kg: 1.8,
      segment_right_arm_fat_pct: 39.8,
      segment_right_arm_muscle_kg: 1.5,
      segment_trunk_fat_pct: 36.4,
      segment_trunk_muscle_kg: 21.8,
      segment_left_leg_fat_pct: 33.6,
      segment_left_leg_muscle_kg: 6.3,
      segment_right_leg_fat_pct: 33.6,
      segment_right_leg_muscle_kg: 6.3,
    })
  })

  it('rejeita números impossíveis em vez de preencher silenciosamente', () => {
    const result = parseTanitaOcrText('Weight 9999 kg Body Fat Percentage 120 % BMI 300')
    expect(result.detectedCount).toBe(0)
    expect(result.warnings[0]).toContain('Nenhuma medida')
  })

  it('restaura a casa decimal omitida pelo OCR das células fixas', () => {
    expect(parseTanitaTemplateNumber('618', 'weight_kg')).toBe(61.8)
    expect(parseTanitaTemplateNumber('357', 'body_fat_pct')).toBe(35.7)
    expect(parseTanitaTemplateNumber('18', 'segment_left_arm_muscle_kg')).toBe(1.8)
    expect(parseTanitaTemplateNumber('1202', 'basal_metabolic_rate')).toBe(1202)
    expect(parseTanitaTemplateNumber('', 'heart_rate_bpm')).toBeNull()
  })

  it('corrige massas truncadas usando as relações redundantes da própria Tanita', () => {
    expect(reconcileTanitaMeasurements({
      weight_kg: 61.8,
      body_fat_pct: 35.7,
      fat_mass_kg: 22.1,
      fat_free_mass_kg: 9.7,
      body_water_pct: 46.7,
      body_water_mass_kg: 2.9,
      bone_mass_kg: 2,
      muscle_mass_kg: 7.7,
    })).toMatchObject({
      fat_mass_kg: 22.1,
      fat_free_mass_kg: 39.7,
      body_water_mass_kg: 28.9,
      muscle_mass_kg: 37.7,
    })
  })
})
