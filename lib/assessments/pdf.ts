'use client'

import type { PDFFont, PDFImage, PDFPage, RGB } from 'pdf-lib'
import type { BodyAssessment } from '@/types'

type AssessmentHistoryPoint = Pick<
  BodyAssessment,
  | 'assessed_at'
  | 'weight_kg'
  | 'body_fat_pct'
  | 'muscle_mass_kg'
  | 'body_water_pct'
  | 'bmi'
  | 'visceral_fat_level'
>

export type AssessmentPdfData = Pick<
  BodyAssessment,
  | 'assessed_at'
  | 'weight_kg'
  | 'body_fat_pct'
  | 'body_fat_category'
  | 'fat_mass_kg'
  | 'fat_free_mass_kg'
  | 'muscle_mass_kg'
  | 'visceral_fat_level'
  | 'body_water_pct'
  | 'body_water_mass_kg'
  | 'bmi'
  | 'metabolic_age'
  | 'bone_mass_kg'
  | 'basal_metabolic_rate'
  | 'daily_calorie_intake'
  | 'heart_rate_bpm'
  | 'physique_rating'
  | 'segment_left_arm_fat_pct'
  | 'segment_left_arm_muscle_kg'
  | 'segment_right_arm_fat_pct'
  | 'segment_right_arm_muscle_kg'
  | 'segment_trunk_fat_pct'
  | 'segment_trunk_muscle_kg'
  | 'segment_left_leg_fat_pct'
  | 'segment_left_leg_muscle_kg'
  | 'segment_right_leg_fat_pct'
  | 'segment_right_leg_muscle_kg'
  | 'notes'
> & {
  athleteName: string
  avatarUrl?: string | null
  history?: AssessmentHistoryPoint[]
}

const BODY_FAT_CATEGORY: Record<string, string> = {
  underfat: 'Abaixo da faixa',
  healthy: 'Saudável',
  overfat: 'Acima da faixa',
  obese: 'Obesidade',
}

const PHYSIQUE_RATING: Record<number, string> = {
  1: 'Obesidade oculta',
  2: 'Obesidade',
  3: 'Constituição sólida',
  4: 'Pouco exercício',
  5: 'Padrão',
  6: 'Musculoso padrão',
  7: 'Magro',
  8: 'Magro e musculoso',
  9: 'Muito musculoso',
}

function safePdfText(value: string) {
  return value
    .replace(/[–—]/g, '-')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E\u00A0-\u00FF]/g, '?')
}

function measurement(value: number | null, suffix = '') {
  if (value === null) return '-'
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`
}

function dateInPortuguese(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)))
}

async function fetchBytes(url: string) {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Não foi possível carregar um recurso visual do PDF.')
  return response.arrayBuffer()
}

async function convertAvatarToCircularPng(url: string) {
  const response = await fetch(url)
  if (!response.ok) return null
  const bitmap = await createImageBitmap(await response.blob())
  const canvas = document.createElement('canvas')
  const size = 320
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return null
  const sourceSize = Math.min(bitmap.width, bitmap.height)
  const sourceX = (bitmap.width - sourceSize) / 2
  const sourceY = (bitmap.height - sourceSize) / 2
  context.clearRect(0, 0, size, size)
  context.beginPath()
  context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  context.clip()
  context.drawImage(bitmap, sourceX, sourceY, sourceSize, sourceSize, 0, 0, size, size)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  return blob ? blob.arrayBuffer() : null
}

function wrapText(text: string, font: PDFFont, fontSize: number, maximumWidth: number) {
  const words = safePdfText(text).split(/\s+/)
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(candidate, fontSize) <= maximumWidth) current = candidate
    else {
      if (current) lines.push(current)
      current = word
    }
  }
  if (current) lines.push(current)
  return lines
}

export async function buildAssessmentPdf(data: AssessmentPdfData) {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib')
  const document = await PDFDocument.create()
  document.setTitle(`Avaliação Tetrapolar Segmentada - ${data.athleteName}`)
  document.setAuthor('Born to Run - Treinamento e Saúde')
  document.setSubject('Avaliação Tetrapolar Segmentada')

  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)
  const pageSize: [number, number] = [595.28, 841.89]
  const carbon = rgb(0.09, 0.09, 0.09)
  const red = rgb(0.86, 0.15, 0.15)
  const softRed = rgb(0.99, 0.75, 0.75)
  const offWhite = rgb(0.97, 0.96, 0.94)
  const white = rgb(1, 1, 1)
  const stone = rgb(0.35, 0.33, 0.31)
  const muted = rgb(0.48, 0.45, 0.42)
  const border = rgb(0.89, 0.87, 0.83)
  const green = rgb(0.09, 0.64, 0.29)
  const softGreen = rgb(0.52, 0.93, 0.65)
  const blue = rgb(0.01, 0.52, 0.73)
  const violet = rgb(0.49, 0.23, 0.93)
  const amber = rgb(0.79, 0.54, 0.02)

  let logo: PDFImage | null = null
  try {
    logo = await document.embedPng(await fetchBytes('/logo.png'))
  } catch {
    logo = null
  }

  let avatar: PDFImage | null = null
  if (data.avatarUrl) {
    try {
      const avatarBytes = await convertAvatarToCircularPng(data.avatarUrl)
      if (avatarBytes) avatar = await document.embedPng(avatarBytes)
    } catch {
      avatar = null
    }
  }

  function drawHeader(page: PDFPage, lineOne: string, lineTwo: string, pageNumber: number) {
    const { width, height } = page.getSize()
    page.drawRectangle({ x: 0, y: height - 132, width, height: 132, color: carbon })
    page.drawRectangle({ x: 0, y: height - 138, width, height: 6, color: red })
    if (logo) {
      const dimensions = logo.scaleToFit(166, 94)
      page.drawImage(logo, { x: 30, y: height - 112, width: dimensions.width, height: dimensions.height })
    } else {
      page.drawText('BORN TO RUN', { x: 32, y: height - 76, size: 23, font: bold, color: white })
      page.drawText('TREINAMENTO E SAÚDE', { x: 32, y: height - 94, size: 8, font: bold, color: softRed })
    }
    page.drawText(safePdfText(lineOne), { x: 226, y: height - 59, size: 11, font: bold, color: softRed })
    page.drawText(safePdfText(lineTwo), { x: 226, y: height - 91, size: 24, font: bold, color: offWhite })
    page.drawText(`PÁGINA ${pageNumber} / 3`, { x: width - 92, y: height - 116, size: 7.5, font: bold, color: muted })
  }

  function drawFooter(page: PDFPage) {
    const { width } = page.getSize()
    page.drawLine({ start: { x: 32, y: 54 }, end: { x: width - 32, y: 54 }, thickness: 0.8, color: border })
    page.drawText('Born to Run - Treinamento e Saúde | Documento privado', { x: 32, y: 36, size: 8, font: bold, color: carbon })
    page.drawText('Resultados de acompanhamento. Não substituem diagnóstico médico.', { x: width - 278, y: 36, size: 7.5, font: regular, color: stone })
  }

  function drawMetricCard(page: PDFPage, x: number, y: number, label: string, metricValue: string, accent: RGB) {
    page.drawRectangle({ x, y, width: 166, height: 57, color: offWhite, borderColor: border, borderWidth: 0.7 })
    page.drawRectangle({ x, y, width: 4, height: 57, color: accent })
    page.drawText(safePdfText(label).toUpperCase(), { x: x + 14, y: y + 36, size: 7.4, font: bold, color: muted })
    const fittedSize = bold.widthOfTextAtSize(safePdfText(metricValue), 16) > 142 ? 12 : 16
    page.drawText(safePdfText(metricValue), { x: x + 14, y: y + 13, size: fittedSize, font: bold, color: carbon })
  }

  const pageOne = document.addPage(pageSize)
  const pageHeight = pageOne.getHeight()
  drawHeader(pageOne, 'AVALIAÇÃO TETRAPOLAR', 'SEGMENTADA', 1)
  pageOne.drawCircle({ x: 76, y: pageHeight - 198, size: 43, color: red })
  pageOne.drawCircle({ x: 76, y: pageHeight - 198, size: 38, color: white })
  if (avatar) {
    pageOne.drawImage(avatar, { x: 40, y: pageHeight - 234, width: 72, height: 72 })
  } else {
    const initials = safePdfText(data.athleteName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase())
    const initialsWidth = bold.widthOfTextAtSize(initials, 22)
    pageOne.drawText(initials, { x: 76 - initialsWidth / 2, y: pageHeight - 206, size: 22, font: bold, color: red })
  }
  pageOne.drawText('ATLETA', { x: 134, y: pageHeight - 176, size: 8, font: bold, color: red })
  wrapText(data.athleteName, bold, 22, 410).slice(0, 2).forEach((line, index) => {
    pageOne.drawText(line, { x: 134, y: pageHeight - 205 - index * 23, size: 22, font: bold, color: carbon })
  })
  pageOne.drawText(`Avaliação realizada em ${dateInPortuguese(data.assessed_at)}`, { x: 134, y: pageHeight - 231, size: 9, font: regular, color: stone })
  pageOne.drawText('RESULTADOS GERAIS', { x: 32, y: 585, size: 9, font: bold, color: red })

  const metrics = [
    ['Peso', measurement(data.weight_kg, ' kg')],
    ['Gordura corporal', measurement(data.body_fat_pct, '%')],
    ['Massa de gordura', measurement(data.fat_mass_kg, ' kg')],
    ['Massa livre de gordura', measurement(data.fat_free_mass_kg, ' kg')],
    ['Massa muscular', measurement(data.muscle_mass_kg, ' kg')],
    ['Água corporal', measurement(data.body_water_pct, '%')],
    ['Massa de água', measurement(data.body_water_mass_kg, ' kg')],
    ['Gordura visceral', measurement(data.visceral_fat_level)],
    ['IMC', measurement(data.bmi)],
    ['Idade metabólica', data.metabolic_age === null ? '-' : `${data.metabolic_age} anos`],
    ['Massa óssea', measurement(data.bone_mass_kg, ' kg')],
    ['Metabolismo basal', data.basal_metabolic_rate === null ? '-' : `${data.basal_metabolic_rate} kcal`],
    ['Ingestão calórica diária', data.daily_calorie_intake === null ? '-' : `${data.daily_calorie_intake} kcal`],
    ['Frequência cardíaca', data.heart_rate_bpm === null ? '-' : `${data.heart_rate_bpm} bpm`],
    ['Classificação física', data.physique_rating === null ? '-' : `${data.physique_rating} - ${PHYSIQUE_RATING[data.physique_rating] ?? 'Tanita'}`],
  ] as const
  const accents = [red, red, red, carbon, green, blue, blue, amber, violet, violet, carbon, red, red, carbon, green]
  metrics.forEach(([label, metricValue], index) => {
    const column = index % 3
    const row = Math.floor(index / 3)
    drawMetricCard(pageOne, 32 + column * 177, 518 - row * 66, label, metricValue, accents[index])
  })

  pageOne.drawRectangle({ x: 32, y: 164, width: 531, height: 45, color: carbon })
  pageOne.drawText('FAIXA DE GORDURA CORPORAL', { x: 46, y: 190, size: 7.5, font: bold, color: softRed })
  pageOne.drawText(safePdfText(data.body_fat_category ? BODY_FAT_CATEGORY[data.body_fat_category] ?? data.body_fat_category : '-'), { x: 46, y: 174, size: 13, font: bold, color: white })
  pageOne.drawText('PROTOCOLO', { x: 410, y: 190, size: 7.5, font: bold, color: softRed })
  pageOne.drawText('Tetrapolar segmentado', { x: 410, y: 174, size: 10, font: bold, color: white })
  if (data.notes) {
    pageOne.drawText('OBSERVAÇÕES DO TREINADOR', { x: 32, y: 139, size: 8, font: bold, color: red })
    wrapText(data.notes, regular, 8.5, 531).slice(0, 4).forEach((line, index) => {
      pageOne.drawText(line, { x: 32, y: 124 - index * 11, size: 8.5, font: regular, color: stone })
    })
  }
  drawFooter(pageOne)

  const pageTwo = document.addPage(pageSize)
  drawHeader(pageTwo, 'COMPOSIÇÃO CORPORAL', 'MAPA SEGMENTADO', 2)
  pageTwo.drawText('LEITURA POR REGIÃO', { x: 32, y: 678, size: 9, font: bold, color: red })
  pageTwo.drawText('Gordura corporal e massa muscular em braços, tronco e pernas.', { x: 32, y: 662, size: 9, font: regular, color: stone })
  const bodyCenterX = 298
  pageTwo.drawCircle({ x: bodyCenterX, y: 622, size: 19, color: border })
  pageTwo.drawRectangle({ x: bodyCenterX - 27, y: 492, width: 54, height: 111, color: border, borderColor: muted, borderWidth: 1 })
  pageTwo.drawLine({ start: { x: bodyCenterX - 23, y: 585 }, end: { x: bodyCenterX - 72, y: 510 }, thickness: 19, color: border })
  pageTwo.drawLine({ start: { x: bodyCenterX + 23, y: 585 }, end: { x: bodyCenterX + 72, y: 510 }, thickness: 19, color: border })
  pageTwo.drawLine({ start: { x: bodyCenterX - 14, y: 497 }, end: { x: bodyCenterX - 30, y: 397 }, thickness: 24, color: border })
  pageTwo.drawLine({ start: { x: bodyCenterX + 14, y: 497 }, end: { x: bodyCenterX + 30, y: 397 }, thickness: 24, color: border })
  ;[[bodyCenterX - 51, 542], [bodyCenterX + 51, 542], [bodyCenterX, 550], [bodyCenterX - 25, 447], [bodyCenterX + 25, 447]].forEach(([x, y], index) => {
    pageTwo.drawCircle({ x, y, size: index === 2 ? 11 : 9, color: carbon })
    pageTwo.drawCircle({ x, y, size: index === 2 ? 7 : 6, borderColor: green, borderWidth: 2, color: red })
  })

  function drawSegmentCallout(x: number, y: number, label: string, fat: number | null, muscle: number | null, side: 'left' | 'right') {
    pageTwo.drawRectangle({ x, y, width: 158, height: 58, color: offWhite, borderColor: border, borderWidth: 0.8 })
    pageTwo.drawText(safePdfText(label).toUpperCase(), { x: x + 12, y: y + 40, size: 7.5, font: bold, color: carbon })
    pageTwo.drawText(measurement(fat, '%'), { x: x + 12, y: y + 16, size: 13, font: bold, color: red })
    pageTwo.drawText('gordura', { x: x + 52, y: y + 18, size: 7, font: regular, color: muted })
    pageTwo.drawText(measurement(muscle, ' kg'), { x: x + 92, y: y + 16, size: 11, font: bold, color: green })
    const lineStart = side === 'left' ? x + 158 : x
    const lineEnd = side === 'left' ? bodyCenterX - 66 : bodyCenterX + 66
    pageTwo.drawLine({ start: { x: lineStart, y: y + 29 }, end: { x: lineEnd, y: y + 29 }, thickness: 0.8, color: muted })
  }

  drawSegmentCallout(32, 545, 'Braço esquerdo', data.segment_left_arm_fat_pct, data.segment_left_arm_muscle_kg, 'left')
  drawSegmentCallout(405, 545, 'Braço direito', data.segment_right_arm_fat_pct, data.segment_right_arm_muscle_kg, 'right')
  drawSegmentCallout(32, 423, 'Perna esquerda', data.segment_left_leg_fat_pct, data.segment_left_leg_muscle_kg, 'left')
  drawSegmentCallout(405, 423, 'Perna direita', data.segment_right_leg_fat_pct, data.segment_right_leg_muscle_kg, 'right')
  pageTwo.drawRectangle({ x: 218, y: 346, width: 160, height: 55, color: carbon })
  pageTwo.drawText('TRONCO', { x: 230, y: 382, size: 7.5, font: bold, color: softRed })
  pageTwo.drawText(measurement(data.segment_trunk_fat_pct, '%'), { x: 230, y: 360, size: 14, font: bold, color: softRed })
  pageTwo.drawText(measurement(data.segment_trunk_muscle_kg, ' kg'), { x: 302, y: 360, size: 12, font: bold, color: softGreen })

  pageTwo.drawText('QUADRO SEGMENTAL COMPLETO', { x: 32, y: 316, size: 9, font: bold, color: red })
  pageTwo.drawRectangle({ x: 32, y: 280, width: 531, height: 25, color: carbon })
  ;[['REGIÃO', 44], ['GORDURA', 286], ['MÚSCULO', 394], ['EQUILÍBRIO', 485]].forEach(([label, x]) => pageTwo.drawText(label as string, { x: x as number, y: 289, size: 7.2, font: bold, color: white }))
  const segmentRows = [
    ['Braço esquerdo', data.segment_left_arm_fat_pct, data.segment_left_arm_muscle_kg, data.segment_right_arm_fat_pct, data.segment_right_arm_muscle_kg],
    ['Braço direito', data.segment_right_arm_fat_pct, data.segment_right_arm_muscle_kg, data.segment_left_arm_fat_pct, data.segment_left_arm_muscle_kg],
    ['Tronco', data.segment_trunk_fat_pct, data.segment_trunk_muscle_kg, null, null],
    ['Perna esquerda', data.segment_left_leg_fat_pct, data.segment_left_leg_muscle_kg, data.segment_right_leg_fat_pct, data.segment_right_leg_muscle_kg],
    ['Perna direita', data.segment_right_leg_fat_pct, data.segment_right_leg_muscle_kg, data.segment_left_leg_fat_pct, data.segment_left_leg_muscle_kg],
  ] as const
  segmentRows.forEach(([label, fat, muscle, oppositeFat, oppositeMuscle], index) => {
    const y = 247 - index * 39
    pageTwo.drawRectangle({ x: 32, y, width: 531, height: 35, color: index % 2 === 0 ? offWhite : white, borderColor: border, borderWidth: 0.5 })
    pageTwo.drawText(safePdfText(label), { x: 44, y: y + 12, size: 9, font: bold, color: carbon })
    pageTwo.drawText(measurement(fat, '%'), { x: 286, y: y + 12, size: 9, font: bold, color: red })
    pageTwo.drawText(measurement(muscle, ' kg'), { x: 394, y: y + 12, size: 9, font: bold, color: green })
    const balance = fat === null || oppositeFat === null || muscle === null || oppositeMuscle === null ? '-' : `G ${Math.abs(Number(fat) - Number(oppositeFat)).toFixed(1)} | M ${Math.abs(Number(muscle) - Number(oppositeMuscle)).toFixed(1)}`
    pageTwo.drawText(balance, { x: 485, y: y + 12, size: 7.5, font: regular, color: stone })
  })
  drawFooter(pageTwo)

  const pageThree = document.addPage(pageSize)
  drawHeader(pageThree, 'HISTÓRICO COMPARATIVO', 'EVOLUÇÃO', 3)
  pageThree.drawText('EVOLUÇÃO DOS PRINCIPAIS PARÂMETROS', { x: 32, y: 678, size: 9, font: bold, color: red })
  const history = [...(data.history?.length ? data.history : [{
    assessed_at: data.assessed_at,
    weight_kg: data.weight_kg,
    body_fat_pct: data.body_fat_pct,
    muscle_mass_kg: data.muscle_mass_kg,
    body_water_pct: data.body_water_pct,
    bmi: data.bmi,
    visceral_fat_level: data.visceral_fat_level,
  }])].sort((a, b) => a.assessed_at.localeCompare(b.assessed_at))
  const chartMetrics = [
    ['Peso', 'weight_kg', 'kg', red],
    ['Gordura corporal', 'body_fat_pct', '%', rgb(0.97, 0.45, 0.09)],
    ['Massa muscular', 'muscle_mass_kg', 'kg', green],
    ['Água corporal', 'body_water_pct', '%', blue],
    ['IMC', 'bmi', '', violet],
    ['Gordura visceral', 'visceral_fat_level', '', amber],
  ] as const

  function drawEvolutionChart(x: number, y: number, label: string, key: keyof AssessmentHistoryPoint, unit: string, color: RGB) {
    const points = history.map((item) => ({ date: item.assessed_at, value: item[key] as number | null })).filter((item): item is { date: string; value: number } => item.value !== null)
    pageThree.drawRectangle({ x, y, width: 255, height: 112, color: offWhite, borderColor: border, borderWidth: 0.7 })
    pageThree.drawRectangle({ x, y: y + 108, width: 255, height: 4, color })
    pageThree.drawText(safePdfText(label).toUpperCase(), { x: x + 12, y: y + 91, size: 7.5, font: bold, color: muted })
    const current = points.at(-1)
    pageThree.drawText(current ? measurement(current.value, unit ? ` ${unit}` : '') : '-', { x: x + 12, y: y + 68, size: 16, font: bold, color: carbon })
    if (points.length > 1) {
      const values = points.map((point) => Number(point.value))
      const min = Math.min(...values)
      const max = Math.max(...values)
      const range = Math.max(max - min, Math.max(Math.abs(max), 1) * 0.08)
      const coords = points.map((point, index) => ({ x: x + 14 + (index / (points.length - 1)) * 227, y: y + 22 + ((Number(point.value) - min) / range) * 34 }))
      for (let index = 1; index < coords.length; index += 1) pageThree.drawLine({ start: coords[index - 1], end: coords[index], thickness: 2, color })
      coords.forEach((point) => pageThree.drawCircle({ x: point.x, y: point.y, size: 2.6, color: white, borderColor: color, borderWidth: 1.5 }))
      const delta = Number(points.at(-1)!.value) - Number(points[0].value)
      pageThree.drawText(`${delta > 0 ? '+' : ''}${measurement(delta, unit ? ` ${unit}` : '')}`, { x: x + 164, y: y + 72, size: 8, font: bold, color })
    } else {
      pageThree.drawText('Aguardando nova medição', { x: x + 14, y: y + 31, size: 8, font: regular, color: muted })
    }
  }

  chartMetrics.forEach(([label, key, unit, color], index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    drawEvolutionChart(32 + column * 276, 536 - row * 130, label, key, unit, color)
  })

  pageThree.drawText('ÚLTIMAS MEDIÇÕES', { x: 32, y: 257, size: 9, font: bold, color: red })
  pageThree.drawRectangle({ x: 32, y: 222, width: 531, height: 25, color: carbon })
  ;[['DATA', 42], ['PESO', 150], ['GORDURA', 230], ['MÚSCULO', 320], ['ÁGUA', 410], ['IMC', 495]].forEach(([label, x]) => pageThree.drawText(label as string, { x: x as number, y: 231, size: 7, font: bold, color: white }))
  history.slice(-4).reverse().forEach((item, index) => {
    const y = 190 - index * 34
    pageThree.drawRectangle({ x: 32, y, width: 531, height: 31, color: index % 2 === 0 ? offWhite : white, borderColor: border, borderWidth: 0.5 })
    pageThree.drawText(dateInPortuguese(item.assessed_at), { x: 42, y: y + 11, size: 8, font: bold, color: carbon })
    pageThree.drawText(measurement(item.weight_kg, ' kg'), { x: 150, y: y + 11, size: 8, font: regular, color: stone })
    pageThree.drawText(measurement(item.body_fat_pct, '%'), { x: 230, y: y + 11, size: 8, font: regular, color: stone })
    pageThree.drawText(measurement(item.muscle_mass_kg, ' kg'), { x: 320, y: y + 11, size: 8, font: regular, color: stone })
    pageThree.drawText(measurement(item.body_water_pct, '%'), { x: 410, y: y + 11, size: 8, font: regular, color: stone })
    pageThree.drawText(measurement(item.bmi), { x: 495, y: y + 11, size: 8, font: regular, color: stone })
  })
  drawFooter(pageThree)
  return document.save()
}

export async function downloadAssessmentPdf(data: AssessmentPdfData) {
  const bytes = await buildAssessmentPdf(data)
  const pdfBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `avaliacao-tetrapolar-segmentada-${data.athleteName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}-${data.assessed_at}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
