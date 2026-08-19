import { describe, expect, it, vi } from 'vitest'
import { PDFDocument } from 'pdf-lib'
import { buildAssessmentPdf } from '@/lib/assessments/pdf'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = join(fileURLToPath(import.meta.url), '..', '..', '..')

const anatomyPng = {
  male: readFileSync(join(repositoryRoot, 'public/brand/anatomy-male-mid.png')),
  female: readFileSync(join(repositoryRoot, 'public/brand/anatomy-female-mid.png')),
}

vi.stubGlobal(
  'fetch',
  vi.fn(async (url: string | URL) => {
    const urlString = typeof url === 'string' ? url : url.toString()
    if (urlString.startsWith('/brand/anatomy-male')) {
      return new Response(anatomyPng.male, { status: 200, headers: { 'content-type': 'image/png' } })
    }
    if (urlString.startsWith('/brand/anatomy-female')) {
      return new Response(anatomyPng.female, { status: 200, headers: { 'content-type': 'image/png' } })
    }
    return new Response('not found', { status: 404 })
  }),
)

describe('PDF premium da avaliação', () => {
  it('gera três páginas A4 com resultados, segmentos e evolução', async () => {
    const fetchMock = vi.mocked(fetch)
    fetchMock.mockClear()
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
      sex: 'male',
      profileSex: 'female',
      biotype: 'mid',
      history: [
        { assessed_at: '2026-06-21', weight_kg: 63.1, body_fat_pct: 36.4, muscle_mass_kg: 37.2, body_water_pct: 45.9, bmi: 25.3, visceral_fat_level: 9 },
        { assessed_at: '2026-07-21', weight_kg: 61.8, body_fat_pct: 35.7, muscle_mass_kg: 37.7, body_water_pct: 46.7, bmi: 24.8, visceral_fat_level: 8 },
      ],
    })

    expect(fetchMock.mock.calls.some(([url]) => url === '/brand/anatomy-female-large.png')).toBe(true)
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
