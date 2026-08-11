'use client'

import type { BodyAssessment } from '@/types'

export type AssessmentPdfData = Pick<
  BodyAssessment,
  | 'assessed_at'
  | 'weight_kg'
  | 'body_fat_pct'
  | 'muscle_mass_kg'
  | 'visceral_fat_level'
  | 'body_water_pct'
  | 'bmi'
  | 'metabolic_age'
  | 'bone_mass_kg'
  | 'basal_metabolic_rate'
  | 'physique_rating'
  | 'notes'
> & {
  athleteName: string
  avatarUrl?: string | null
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
  return { bytes: await response.arrayBuffer(), type: response.headers.get('content-type') ?? '' }
}

async function convertImageToPng(url: string) {
  const response = await fetch(url)
  if (!response.ok) return null
  const bitmap = await createImageBitmap(await response.blob())
  const canvas = document.createElement('canvas')
  canvas.width = bitmap.width
  canvas.height = bitmap.height
  const context = canvas.getContext('2d')
  if (!context) return null
  context.drawImage(bitmap, 0, 0)
  bitmap.close()
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  return blob ? blob.arrayBuffer() : null
}

function wrapText(
  text: string,
  font: { widthOfTextAtSize(value: string, size: number): number },
  fontSize: number,
  maximumWidth: number,
) {
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
  document.setTitle(`Avaliação de bioimpedância - ${data.athleteName}`)
  document.setAuthor('Born to Run - Treinamento e Saúde')
  document.setSubject('Acompanhamento privado de bioimpedância')

  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)
  const page = document.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  const carbon = rgb(0.09, 0.09, 0.09)
  const red = rgb(0.86, 0.15, 0.15)
  const offWhite = rgb(0.97, 0.96, 0.94)
  const stone = rgb(0.35, 0.33, 0.31)
  const border = rgb(0.89, 0.87, 0.83)

  page.drawRectangle({ x: 0, y: height - 148, width, height: 148, color: carbon })
  page.drawRectangle({ x: 0, y: height - 154, width, height: 6, color: red })

  try {
    const logoResource = await fetchBytes('/logo.png')
    const logo = await document.embedPng(logoResource.bytes)
    const dimensions = logo.scaleToFit(170, 92)
    page.drawImage(logo, { x: 32, y: height - 122, width: dimensions.width, height: dimensions.height })
  } catch {
    page.drawText('BORN TO RUN', { x: 34, y: height - 74, size: 25, font: bold, color: offWhite })
  }

  page.drawText('AVALIAÇÃO DE', { x: 226, y: height - 55, size: 11, font: bold, color: rgb(0.97, 0.45, 0.45) })
  page.drawText('BIOIMPEDÂNCIA', { x: 226, y: height - 86, size: 28, font: bold, color: offWhite })
  page.drawText(`Realizada em ${dateInPortuguese(data.assessed_at)}`, { x: 226, y: height - 111, size: 11, font: regular, color: rgb(0.78, 0.76, 0.73) })

  let profileX = 34
  if (data.avatarUrl) {
    try {
      const avatarBytes = await convertImageToPng(data.avatarUrl)
      if (avatarBytes) {
        const avatar = await document.embedPng(avatarBytes)
        page.drawRectangle({ x: 34, y: height - 238, width: 64, height: 64, color: border })
        page.drawImage(avatar, { x: 36, y: height - 236, width: 60, height: 60 })
        profileX = 114
      }
    } catch {
      profileX = 34
    }
  }

  page.drawText('ATLETA', { x: profileX, y: height - 184, size: 9, font: bold, color: red })
  const athleteLines = wrapText(data.athleteName, bold, 22, width - profileX - 34)
  athleteLines.slice(0, 2).forEach((line, index) => {
    page.drawText(line, { x: profileX, y: height - 211 - index * 23, size: 22, font: bold, color: carbon })
  })

  const metrics = [
    ['Peso', measurement(data.weight_kg, ' kg')],
    ['Gordura corporal', measurement(data.body_fat_pct, '%')],
    ['Massa muscular', measurement(data.muscle_mass_kg, ' kg')],
    ['Água corporal', measurement(data.body_water_pct, '%')],
    ['Gordura visceral', measurement(data.visceral_fat_level)],
    ['IMC', measurement(data.bmi)],
    ['Idade metabólica', data.metabolic_age === null ? '-' : `${data.metabolic_age} anos`],
    ['Massa óssea', measurement(data.bone_mass_kg, ' kg')],
    ['Metabolismo basal', data.basal_metabolic_rate === null ? '-' : `${data.basal_metabolic_rate} kcal`],
    ['Classificação física', measurement(data.physique_rating)],
  ] as const

  const cardWidth = 252
  const cardHeight = 65
  const startY = height - 286
  metrics.forEach(([label, value], index) => {
    const column = index % 2
    const row = Math.floor(index / 2)
    const x = 34 + column * (cardWidth + 23)
    const y = startY - row * (cardHeight + 10)
    page.drawRectangle({ x, y, width: cardWidth, height: cardHeight, color: offWhite, borderColor: border, borderWidth: 0.8 })
    page.drawRectangle({ x, y, width: 5, height: cardHeight, color: row % 2 === 0 ? red : carbon })
    page.drawText(safePdfText(label).toUpperCase(), { x: x + 18, y: y + 40, size: 8.5, font: bold, color: stone })
    page.drawText(safePdfText(value), { x: x + 18, y: y + 15, size: 18, font: bold, color: carbon })
  })

  const noteY = 120
  if (data.notes) {
    page.drawText('OBSERVAÇÕES DO TREINADOR', { x: 34, y: noteY + 54, size: 9, font: bold, color: red })
    const noteLines = wrapText(data.notes, regular, 9.5, width - 68).slice(0, 4)
    noteLines.forEach((line, index) => {
      page.drawText(line, { x: 34, y: noteY + 36 - index * 12, size: 9.5, font: regular, color: stone })
    })
  }

  page.drawLine({ start: { x: 34, y: 72 }, end: { x: width - 34, y: 72 }, thickness: 0.8, color: border })
  page.drawText('Born to Run - Treinamento e Saúde | Descalvado - SP', { x: 34, y: 52, size: 8.5, font: bold, color: carbon })
  page.drawText('Documento privado de acompanhamento. Não substitui diagnóstico ou orientação médica.', { x: 34, y: 36, size: 8, font: regular, color: stone })

  return document.save()
}

export async function downloadAssessmentPdf(data: AssessmentPdfData) {
  const bytes = await buildAssessmentPdf(data)
  const pdfBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
  const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `avaliacao-${data.athleteName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')}-${data.assessed_at}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
