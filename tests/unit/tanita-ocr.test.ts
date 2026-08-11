import { describe, expect, it } from 'vitest'
import { parseTanitaOcrText } from '@/lib/assessments/tanita-ocr'

describe('leitura de relatório Tanita', () => {
  it('extrai medidas e data de um texto em inglês', () => {
    const result = parseTanitaOcrText(`
      Date & Time 21/07/26 06:52
      Weight 61.8 kg BMI 24.8
      Body Fat Percentage 35.7 % Mass 22.1 kg
      Visceral Fat Rating 8.0
      Body Water Percentage 46.7 % Mass 28.9 kg
      Muscle Mass 37.7 kg Bone Mass 2.0 kg
      Basal Metabolic Rate 1202 kcal Metabolic Age 51.0 yrs
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
    })
    expect(result.detectedCount).toBe(10)
  })

  it('rejeita números impossíveis em vez de preencher silenciosamente', () => {
    const result = parseTanitaOcrText('Weight 9999 kg Body Fat Percentage 120 % BMI 300')
    expect(result.detectedCount).toBe(0)
    expect(result.warnings[0]).toContain('Nenhuma medida')
  })
})
