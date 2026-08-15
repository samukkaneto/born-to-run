'use client'

import { parseTanitaOcrText, type TanitaExtraction } from '@/lib/assessments/tanita-ocr'
import {
  parseTanitaTemplateNumber,
  reconcileTanitaMeasurements,
  TANITA_TEMPLATE_REGIONS,
  type TanitaPhotoSlot,
  type TanitaTemplateRegion,
} from '@/lib/assessments/tanita-template'

type ProgressHandler = (progress: number, message: string) => void

export type TanitaFileExtraction = TanitaExtraction & {
  rawText: string
  confidence: number | null
  method: 'pdf_text' | 'ocr'
}

const MAX_FILE_SIZE = 15 * 1024 * 1024
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']
const TEMPLATE_ASPECT_RATIO = 16 / 9

let activeWorkerProgress: ProgressHandler = () => undefined
let workerPromise: ReturnType<typeof createOcrWorker> | null = null

async function createOcrWorker() {
  const { createWorker } = await import('tesseract.js')
  return createWorker('eng', undefined, {
    logger(message) {
      if (message.status !== 'recognizing text') return
      activeWorkerProgress(typeof message.progress === 'number' ? message.progress : 0, 'Lendo a imagem…')
    },
  })
}

function getOcrWorker() {
  workerPromise ??= createOcrWorker()
  return workerPromise
}

function prepareCanvas(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return canvas
  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  let luminanceTotal = 0
  for (let index = 0; index < image.data.length; index += 4) {
    luminanceTotal += (
      image.data[index] * 0.299
      + image.data[index + 1] * 0.587
      + image.data[index + 2] * 0.114
    )
  }
  const average = luminanceTotal / (image.data.length / 4)
  const invert = average < 118
  for (let index = 0; index < image.data.length; index += 4) {
    let value = Math.round(
      image.data[index] * 0.299
      + image.data[index + 1] * 0.587
      + image.data[index + 2] * 0.114,
    )
    if (invert) value = 255 - value
    value = Math.max(0, Math.min(255, Math.round((value - 128) * 1.35 + 128)))
    image.data[index] = value
    image.data[index + 1] = value
    image.data[index + 2] = value
  }
  context.putImageData(image, 0, 0)
  return canvas
}

async function imageFileToCanvas(file: File) {
  const bitmap = await createImageBitmap(file)
  const maximumSide = 2400
  const scale = Math.min(1, maximumSide / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Não foi possível preparar a imagem para leitura.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return canvas
}

function cloneCanvas(source: HTMLCanvasElement) {
  const canvas = document.createElement('canvas')
  canvas.width = source.width
  canvas.height = source.height
  canvas.getContext('2d')?.drawImage(source, 0, 0)
  return canvas
}

function templateCropCanvas(source: HTMLCanvasElement, region: TanitaTemplateRegion) {
  const [referenceLeft, referenceTop, referenceWidth, referenceHeight] = region.rect
  const scaleX = source.width / 1280
  const scaleY = source.height / 720
  const left = referenceLeft * scaleX
  const top = referenceTop * scaleY
  const width = referenceWidth * scaleX
  const height = referenceHeight * scaleY
  const zoom = referenceWidth <= 32 ? 24 : 20
  const padding = 80
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(width * zoom) + padding * 2
  canvas.height = Math.round(height * zoom) + padding * 2
  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return canvas
  context.fillStyle = region.darkBackground ? '#000000' : '#ffffff'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.imageSmoothingEnabled = region.smoothing ?? false
  context.imageSmoothingQuality = 'high'
  context.drawImage(
    source,
    left,
    top,
    width,
    height,
    padding,
    padding,
    Math.round(width * zoom),
    Math.round(height * zoom),
  )

  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  for (let index = 0; index < image.data.length; index += 4) {
    const gray = Math.round(
      image.data[index] * 0.299
      + image.data[index + 1] * 0.587
      + image.data[index + 2] * 0.114,
    )
    image.data[index] = gray
    image.data[index + 1] = gray
    image.data[index + 2] = gray
  }
  context.putImageData(image, 0, 0)
  return canvas
}

async function recognizeTemplate(
  source: HTMLCanvasElement,
  slot: TanitaPhotoSlot,
  onProgress: ProgressHandler,
) {
  const regions = TANITA_TEMPLATE_REGIONS[slot]
  const measurements: TanitaExtraction['measurements'] = {}
  if (!regions.length || Math.abs(source.width / source.height - TEMPLATE_ASPECT_RATIO) > 0.12) {
    return { measurements, assessedAt: null, bodyFatCategory: null, blankHeartRate: false, texts: [] as string[], confidence: null }
  }

  const { PSM } = await import('tesseract.js')
  const worker = await getOcrWorker()
  let assessedAt: string | null = null
  let bodyFatCategory: TanitaExtraction['labels']['bodyFatCategory'] = null
  const texts: string[] = []
  const confidences: number[] = []
  let blankHeartRate = false

  for (let index = 0; index < regions.length; index += 1) {
    const region = regions[index]
    onProgress(0.28 + (index / regions.length) * 0.68, `Calibrando campo ${index + 1} de ${regions.length}…`)
    const isWords = region.kind === 'category' || region.kind === 'physique'
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: isWords ? '' : region.kind === 'date' ? '0123456789/' : '0123456789.',
      preserve_interword_spaces: '1',
    })
    activeWorkerProgress = () => undefined
    const result = await worker.recognize(templateCropCanvas(source, region))
    const text = result.data.text.trim()
    texts.push(`${region.id}: ${text}`)
    if (text) confidences.push(result.data.confidence)
    if (region.field === 'heart_rate_bpm' && !text) blankHeartRate = true

    if (region.kind === 'date') {
      assessedAt = parseTanitaOcrText(`Date & Time ${text}`).assessedAt
    } else if (region.kind === 'category') {
      bodyFatCategory = parseTanitaOcrText(`Body Fat Range ${text}`).labels.bodyFatCategory
    } else if (region.kind === 'physique' && region.field) {
      const rating = text.match(/[1-9]/)?.[0]
      if (rating) measurements[region.field] = Number(rating)
    } else if (region.field) {
      const value = parseTanitaTemplateNumber(text, region.field)
      if (value !== null) measurements[region.field] = value
    }
  }

  return {
    measurements: reconcileTanitaMeasurements(measurements),
    assessedAt,
    bodyFatCategory,
    blankHeartRate,
    texts,
    confidence: confidences.length
      ? confidences.reduce((total, current) => total + current, 0) / confidences.length
      : null,
  }
}

async function readPdf(file: File, onProgress: ProgressHandler) {
  onProgress(0.05, 'Abrindo o PDF da Tanita…')
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()
  const loadingTask = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) })
  const pdf = await loadingTask.promise
  const pageCount = Math.min(pdf.numPages, 4)
  const directText: string[] = []

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const content = await page.getTextContent()
    directText.push(content.items.map((item) => ('str' in item ? item.str : '')).join(' '))
  }

  const combinedText = directText.join('\n').trim()
  if (parseTanitaOcrText(combinedText).detectedCount >= 4) {
    await loadingTask.destroy()
    return { text: combinedText, canvases: [] as HTMLCanvasElement[] }
  }

  const canvases: HTMLCanvasElement[] = []
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    onProgress(0.08 + (pageNumber / pageCount) * 0.12, `Preparando página ${pageNumber} de ${pageCount}…`)
    const page = await pdf.getPage(pageNumber)
    const viewport = page.getViewport({ scale: 2.4 })
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Não foi possível renderizar o PDF.')
    await page.render({ canvas, canvasContext: context, viewport }).promise
    canvases.push(prepareCanvas(canvas))
  }
  await loadingTask.destroy()
  return { text: combinedText, canvases }
}

async function recognizeCanvases(canvases: HTMLCanvasElement[], onProgress: ProgressHandler) {
  const { PSM } = await import('tesseract.js')
  let activePage = 0
  const worker = await getOcrWorker()
  activeWorkerProgress = (pageProgress) => {
    const combined = (activePage + pageProgress) / Math.max(canvases.length, 1)
    onProgress(0.08 + combined * 0.18, `Mapeando a imagem: ${Math.round(combined * 100)}%`)
  }
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    preserve_interword_spaces: '1',
    tessedit_char_whitelist: '',
  })
  const texts: string[] = []
  const confidences: number[] = []
  for (const canvas of canvases) {
    const result = await worker.recognize(canvas)
    texts.push(result.data.text)
    confidences.push(result.data.confidence)
    activePage += 1
  }
  const confidence = confidences.length
    ? confidences.reduce((total, current) => total + current, 0) / confidences.length
    : null
  return { text: texts.join('\n'), confidence }
}

export async function extractTanitaFile(
  file: File,
  slot: TanitaPhotoSlot,
  onProgress: ProgressHandler = () => undefined,
): Promise<TanitaFileExtraction> {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    throw new Error('Envie um arquivo PDF, JPG ou PNG.')
  }
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
    throw new Error('O arquivo deve ter no máximo 15 MB.')
  }

  let rawText = ''
  let confidence: number | null = null
  let method: TanitaFileExtraction['method'] = 'ocr'
  let template: Awaited<ReturnType<typeof recognizeTemplate>> | null = null

  if (file.type === 'application/pdf') {
    const pdf = await readPdf(file, onProgress)
    rawText = pdf.text
    if (parseTanitaOcrText(rawText).detectedCount >= 4) {
      method = 'pdf_text'
      confidence = 100
    } else {
      const recognized = await recognizeCanvases(pdf.canvases, onProgress)
      rawText = `${rawText}\n${recognized.text}`
      confidence = recognized.confidence
    }
  } else {
    onProgress(0.05, 'Preparando a imagem…')
    const canvas = await imageFileToCanvas(file)
    const recognized = await recognizeCanvases([prepareCanvas(cloneCanvas(canvas))], onProgress)
    rawText = recognized.text
    confidence = recognized.confidence
    template = await recognizeTemplate(canvas, slot, onProgress)
  }

  onProgress(0.98, 'Organizando as medidas em português…')
  const parsed = parseTanitaOcrText(rawText)
  const measurements = reconcileTanitaMeasurements({
    ...parsed.measurements,
    ...template?.measurements,
  })
  if (template?.blankHeartRate) delete measurements.heart_rate_bpm
  return {
    ...parsed,
    assessedAt: template?.assessedAt ?? parsed.assessedAt,
    measurements,
    labels: {
      bodyFatCategory: template?.bodyFatCategory ?? parsed.labels.bodyFatCategory,
    },
    detectedCount: Object.keys(measurements).length,
    rawText: `${rawText}\n${template?.texts.join('\n') ?? ''}`.trim(),
    confidence: template?.confidence ?? confidence,
    method,
  }
}
