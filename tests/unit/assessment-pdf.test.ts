import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { buildAssessmentPdf } from '@/lib/assessments/pdf'

describe('PDF premium da avaliação', () => {
  it('gera três páginas A4 com resultados, segmentos e evolução', async () => {
    const bytes = await buildAssessmentPdf({
      athleteName: 'Atleta de Teste',
      assessed_at: '2026-07-21',
      weight_kg: 61.8,
      body_fat_pct: 35.7,
      body_fat_category: 'healthy',
      fat_mass_kg: 22.1,
      fat_free_mass_kg: 39.7,
      muscle_mass_kg: 37.7,
      visceral_fat_level: 8,
      body_water_pct: 46.7,
      body_water_mass_kg: 28.9,
      bmi: 24.8,
      metabolic_age: 51,
      bone_mass_kg: 2,
      basal_metabolic_rate: 1202,
      daily_calorie_intake: 2188,
      heart_rate_bpm: null,
      physique_rating: 5,
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
      notes: 'Documento técnico de teste.',
      history: [
        { assessed_at: '2026-06-21', weight_kg: 63.1, body_fat_pct: 36.4, muscle_mass_kg: 37.2, body_water_pct: 45.9, bmi: 25.3, visceral_fat_level: 9 },
        { assessed_at: '2026-07-21', weight_kg: 61.8, body_fat_pct: 35.7, muscle_mass_kg: 37.7, body_water_pct: 46.7, bmi: 24.8, visceral_fat_level: 8 },
      ],
    })

    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')
    const document = await PDFDocument.load(bytes)
    expect(document.getPageCount()).toBe(3)
    expect(document.getTitle()).toContain('Atleta de Teste')
    expect(document.getTitle()).toContain('Avaliação Tetrapolar Segmentada')
    for (const page of document.getPages()) {
      expect(Math.round(page.getWidth())).toBe(595)
      expect(Math.round(page.getHeight())).toBe(842)
    }
  })
})
