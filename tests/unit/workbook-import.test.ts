import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { classifyTrainingType, parseWorkoutWorkbook } from '@/lib/workouts/workbook-import'

describe('importação de planilha de treinos prescritos', () => {
  it('preserva o significado oficial das cores', () => {
    expect(classifyTrainingType({ argb: 'FF00B0F0' }, '')).toBe('rest')
    expect(classifyTrainingType({ argb: 'FFFFFF00' }, '')).toBe('continuous')
    expect(classifyTrainingType({ theme: 7 }, '')).toBe('fast_interval')
    expect(classifyTrainingType({ argb: 'FF00B050' }, '')).toBe('easy_moderate')
    expect(classifyTrainingType({ theme: 5, tint: 0.4 }, '')).toBe('aerobic_power')
    expect(classifyTrainingType({ argb: 'FFFF0000' }, '')).toBe('competition')
  })

  it('converte uma semana em treinos diários com prévia editável', async () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('CICLO')
    sheet.getCell('A1').value = 'MESOCICLO - AGOSTO 2026'
    sheet.getCell('A2').value = 'PRIMEIRA SEMANA - 10 DE AGOSTO A 16 DE AGOSTO'
    sheet.getRow(3).values = ['SEGUNDA', 'TERÇA', 'QUARTA', 'QUINTA', 'SEXTA', 'SABADO/DOMINGO']
    sheet.getCell('A4').value = 'DESCANSO'
    sheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF00B0F0' } }
    sheet.getCell('B4').value = '8KM DE RITMO CONTÍNUO'
    sheet.getCell('B4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } }
    sheet.getCell('B5').value = 'TOTAL:8KM'

    const output = await workbook.xlsx.writeBuffer()
    const drafts = await parseWorkoutWorkbook(output as ArrayBuffer, 'mesociclo-2026.xlsx')

    expect(drafts).toHaveLength(2)
    expect(drafts[0]).toMatchObject({ scheduledDate: '2026-08-10', trainingType: 'rest' })
    expect(drafts[1]).toMatchObject({
      scheduledDate: '2026-08-11',
      trainingType: 'continuous',
      title: 'Ritmo contínuo - 8km',
    })
  })
})
