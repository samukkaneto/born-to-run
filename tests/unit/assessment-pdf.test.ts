import { describe, expect, it } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { buildAssessmentPdf } from '@/lib/assessments/pdf'

describe('PDF premium da avaliação', () => {
  it('gera um documento A4 válido com metadados privados', async () => {
    const bytes = await buildAssessmentPdf({
      athleteName: 'Atleta de Teste',
      assessed_at: '2026-07-21',
      weight_kg: 61.8,
      body_fat_pct: 35.7,
      muscle_mass_kg: 37.7,
      visceral_fat_level: 8,
      body_water_pct: 46.7,
      bmi: 24.8,
      metabolic_age: 51,
      bone_mass_kg: 2,
      basal_metabolic_rate: 1202,
      physique_rating: 5,
      notes: 'Documento técnico de teste.',
    })

    expect(new TextDecoder().decode(bytes.slice(0, 5))).toBe('%PDF-')
    const document = await PDFDocument.load(bytes)
    expect(document.getPageCount()).toBe(1)
    expect(document.getTitle()).toContain('Atleta de Teste')
    const [page] = document.getPages()
    expect(Math.round(page.getWidth())).toBe(595)
    expect(Math.round(page.getHeight())).toBe(842)
  })
})
