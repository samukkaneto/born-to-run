'use client'

import type { Cell, FillPattern } from 'exceljs'
import {
  TRAINING_TYPE_VISUALS,
  type TrainingType,
} from '@/lib/workouts/training-types'

export type ImportedWorkoutDraft = {
  key: string
  scheduledDate: string
  title: string
  description: string
  objective: string
  trainingType: TrainingType
  sourceSheet: string
  sourceCell: string
}

const WEEKDAY_OFFSET: Record<string, number> = {
  SEGUNDA: 0,
  TERCA: 1,
  QUARTA: 2,
  QUINTA: 3,
  SEXTA: 4,
  SABADO: 5,
  DOMINGO: 6,
  'SABADO/DOMINGO': 5,
}

const MONTHS: Record<string, number> = {
  JANEIRO: 0,
  FEVEREIRO: 1,
  MARCO: 2,
  ABRIL: 3,
  MAIO: 4,
  JUNHO: 5,
  JULHO: 6,
  AGOSTO: 7,
  SETEMBRO: 8,
  OUTUBRO: 9,
  NOVEMBRO: 10,
  DEZEMBRO: 11,
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*\/\s*/g, '/')
    .trim()
    .toUpperCase()
}

function toIsoDate(date: Date) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`
}

function addDays(date: Date, days: number) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days))
}

function parseWeekStart(value: string, fallbackYear: number) {
  const text = normalize(value)
  const match = text.match(/(\d{1,2})\s+DE\s+([A-Z]+)(?:\s+(?:DE\s+)?(20\d{2}))?/)
  if (!match) return null
  const day = Number(match[1])
  const month = MONTHS[match[2]]
  const year = match[3] ? Number(match[3]) : fallbackYear
  if (month === undefined) return null
  const date = new Date(Date.UTC(year, month, day))
  return date.getUTCDate() === day && date.getUTCMonth() === month ? date : null
}

function colorFromCell(cell: Cell) {
  if (cell.fill.type !== 'pattern') return null
  const fill = cell.fill as FillPattern
  return {
    argb: fill.fgColor?.argb?.toUpperCase() ?? null,
    theme: fill.fgColor?.theme ?? null,
    tint: (fill.fgColor as { tint?: number } | undefined)?.tint ?? null,
  }
}

export function classifyTrainingType(
  color: { argb?: string | null; theme?: number | null; tint?: number | null } | null,
  description: string,
): TrainingType {
  const argb = color?.argb?.replace(/^FF/, '')
  if (argb === '00B0F0' || argb === '38BDF8') return 'rest'
  if (argb === 'FFFF00' || argb === 'FACC15') return 'continuous'
  if (color?.theme === 7 || argb === '8064A2' || argb === '8B5CF6') return 'fast_interval'
  if (argb === '00B050' || argb === '22C55E') return 'easy_moderate'
  if (
    color?.theme === 5
    || argb === 'C49317'
    || argb === 'CC9900'
    || argb === 'D99694'
  ) return 'aerobic_power'
  if (argb === 'DC2626' || argb === 'FF0000') return 'competition'

  const text = normalize(description)
  if (text.includes('DESCANSO')) return 'rest'
  if (text.includes('COMPETICAO') || text.includes('PROVA')) return 'competition'
  if (text.includes('RITMO VARIADO') || text.includes('POTENCIA')) return 'aerobic_power'
  if (/\d+X\d+/.test(text) || text.includes('INTERVAL')) return 'fast_interval'
  if (text.includes('RITMO') || text.includes('PROGRESSIV')) return 'continuous'
  return 'easy_moderate'
}

function deriveTitle(trainingType: TrainingType, total: string | null) {
  const label = TRAINING_TYPE_VISUALS[trainingType].label
  if (trainingType === 'rest') return label
  return total ? `${label} - ${total}` : label
}

function findWorkbookYear(fileName: string, cells: string[]) {
  for (const value of [fileName, ...cells]) {
    const years = [...value.matchAll(/20\d{2}/g)].map((match) => Number(match[0]))
    if (years.length) return years[years.length - 1]
  }
  return new Date().getFullYear()
}

export async function parseWorkoutWorkbook(
  buffer: ArrayBuffer,
  fileName: string,
): Promise<ImportedWorkoutDraft[]> {
  if (buffer.byteLength <= 0 || buffer.byteLength > 12 * 1024 * 1024) {
    throw new Error('A planilha deve ter no máximo 12 MB.')
  }
  const ExcelJS = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  // ExcelJS aceita ArrayBuffer no navegador, embora a assinatura publicada
  // ainda o descreva como o Buffer da própria biblioteca.
  await workbook.xlsx.load(buffer as never)
  const titleCells = workbook.worksheets.flatMap((sheet) => (
    Array.from({ length: Math.min(sheet.rowCount, 5) }, (_, index) => sheet.getCell(index + 1, 1).text)
  ))
  const fallbackYear = findWorkbookYear(fileName, titleCells)
  const drafts: ImportedWorkoutDraft[] = []

  for (const sheet of workbook.worksheets) {
    for (let rowNumber = 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
      const row = sheet.getRow(rowNumber)
      const weekdayCells = Array.from({ length: Math.min(sheet.columnCount, 7) }, (_, index) => ({
        column: index + 1,
        weekday: normalize(row.getCell(index + 1).text),
      })).filter(({ weekday }) => WEEKDAY_OFFSET[weekday] !== undefined)
      if (weekdayCells.length < 3) continue

      let weekStart: Date | null = null
      for (let previous = rowNumber - 1; previous >= Math.max(1, rowNumber - 3); previous -= 1) {
        weekStart = parseWeekStart(sheet.getCell(previous, 1).text, fallbackYear)
        if (weekStart) break
      }
      if (!weekStart) continue

      const workoutRow = sheet.getRow(rowNumber + 1)
      const totalRow = sheet.getRow(rowNumber + 2)
      for (const { column, weekday } of weekdayCells) {
        const cell = workoutRow.getCell(column)
        const description = cell.text.replace(/\s+/g, ' ').trim()
        if (!description || /^TOTAL\s*:/i.test(description)) continue
        const trainingType = classifyTrainingType(colorFromCell(cell), description)
        const totalMatch = totalRow.getCell(column).text.match(/TOTAL\s*:\s*([^\s]+\s*KM)/i)
        const total = totalMatch?.[1]?.replace(',', ',').toLowerCase() ?? null
        const scheduledDate = toIsoDate(addDays(weekStart, WEEKDAY_OFFSET[weekday]))
        const sourceCell = cell.address
        drafts.push({
          key: `${sheet.name}-${sourceCell}-${scheduledDate}`,
          scheduledDate,
          title: deriveTitle(trainingType, total),
          description,
          objective: TRAINING_TYPE_VISUALS[trainingType].description,
          trainingType,
          sourceSheet: sheet.name,
          sourceCell,
        })
      }
    }
  }

  if (drafts.length === 0) {
    throw new Error('Não encontrei semanas e treinos no formato esperado. Confira a planilha ou preencha os treinos manualmente.')
  }
  if (drafts.length > 62) {
    throw new Error('A planilha contém mais de 62 treinos. Divida o arquivo em ciclos menores.')
  }
  return drafts.sort((first, second) => first.scheduledDate.localeCompare(second.scheduledDate))
}
