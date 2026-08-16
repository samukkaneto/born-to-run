import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parseTanitaOcrText } from '@/lib/assessments/tanita-ocr'

const FIXTURE = join(process.cwd(), 'tests/unit/fixtures/tanita-screenshot-ocr.txt')

function fixture() {
  return readFileSync(FIXTURE, 'utf8')
}

describe('Tanita OCR — captura real do Healthy Edge Lite (21/07/26)', () => {
  it('extrai as medidas gerais corretas da captura real', () => {
    const result = parseTanitaOcrText(fixture())
    expect(result.assessedAt).toBe('2026-07-21')
    expect(result.measurements.weight_kg).toBe(61.8)
    expect(result.measurements.body_fat_pct).toBe(35.7)
    expect(result.measurements.fat_mass_kg).toBe(22.1)
    expect(result.measurements.fat_free_mass_kg).toBe(39.7)
    expect(result.measurements.body_water_pct).toBe(46.7)
    expect(result.measurements.body_water_mass_kg).toBe(28.9)
    expect(result.measurements.muscle_mass_kg).toBe(37.7)
    expect(result.measurements.bone_mass_kg).toBe(2.0)
    expect(result.measurements.visceral_fat_level).toBe(8.0)
    expect(result.measurements.bmi).toBe(24.8)
    expect(result.measurements.basal_metabolic_rate).toBe(1202)
    expect(result.measurements.metabolic_age).toBe(51.0)
    expect(result.measurements.daily_calorie_intake).toBe(2188)
    expect(result.measurements.physique_rating).toBe(5)
    expect(result.labels.bodyFatCategory).toBe('healthy')
  })

  describe('dados segmentares (Segmental Data)', () => {
    it('não contamina o músculo do braço esquerdo com a massa muscular geral (37.7 kg)', () => {
      const result = parseTanitaOcrText(fixture())
      // Ground truth do software Tanita: braço esquerdo = 1.8 kg de músculo.
      // O bug antigo capturava 37.7 (músculo geral) porque o padrão
      // procurava "Muscle Mass X kg" em qualquer ponto do texto.
      expect(result.measurements.segment_left_arm_muscle_kg).toBe(1.8)
      expect(result.measurements.segment_right_arm_muscle_kg).toBe(1.5)
    })

    it('lê a gordura segmentar correta de cada membro', () => {
      const result = parseTanitaOcrText(fixture())
      expect(result.measurements.segment_left_arm_fat_pct).toBe(37.8)
      expect(result.measurements.segment_right_arm_fat_pct).toBe(39.8)
      expect(result.measurements.segment_trunk_fat_pct).toBe(36.4)
      expect(result.measurements.segment_left_leg_fat_pct).toBe(33.6)
      expect(result.measurements.segment_right_leg_fat_pct).toBe(33.6)
    })

    it('lê o músculo segmentar do tronco e das pernas', () => {
      const result = parseTanitaOcrText(fixture())
      expect(result.measurements.segment_trunk_muscle_kg).toBe(21.8)
      expect(result.measurements.segment_left_leg_muscle_kg).toBe(6.3)
      expect(result.measurements.segment_right_leg_muscle_kg).toBe(6.3)
    })

    it('preserva sanidade: soma dos músculos segmentares bate com o total geral', () => {
      const result = parseTanitaOcrText(fixture())
      const m = result.measurements
      const total =
        Number(m.segment_left_arm_muscle_kg ?? 0)
        + Number(m.segment_right_arm_muscle_kg ?? 0)
        + Number(m.segment_trunk_muscle_kg ?? 0)
        + Number(m.segment_left_leg_muscle_kg ?? 0)
        + Number(m.segment_right_leg_muscle_kg ?? 0)
      const expected = Number(m.muscle_mass_kg ?? NaN)
      if (total && expected) {
        expect(total).toBeCloseTo(expected, 0)
      } else {
        expect.unreachable('campos segmentares ou total geral faltaram na extração')
      }
    })
  })
})
