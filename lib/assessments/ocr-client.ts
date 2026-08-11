'use client'

import { parseTanitaOcrText, type TanitaExtraction } from '@/lib/assessments/tanita-ocr'

type ProgressHandler = (progress: number, message: string) => void

export type TanitaFileExtraction = TanitaExtraction & {
  rawText: string
  confidence: number | null
  method: 'pdf_text' | 'ocr'
}

const MAX_FILE_SIZE = 15 * 1024 * 1024
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

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
  const minimumScale = Math.min(2, maximumSide / Math.max(bitmap.width, bitmap.height))
  const scale = Math.max(1, minimumScale)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Não foi possível preparar a imagem para leitura.')
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return prepareCanvas(canvas)
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
  const { createWorker, PSM } = await import('tesseract.js')
  let activePage = 0
  const worker = await createWorker('eng', undefined, {
    logger(message) {
      if (message.status !== 'recognizing text') return
      const pageProgress = typeof message.progress === 'number' ? message.progress : 0
      const combined = (activePage + pageProgress) / Math.max(canvases.length, 1)
      onProgress(0.2 + combined * 0.75, `Lendo medidas: ${Math.round(combined * 100)}%`)
    },
  })
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SPARSE_TEXT,
    preserve_interword_spaces: '1',
  })
  const texts: string[] = []
  const confidences: number[] = []
  try {
    for (const canvas of canvases) {
      const result = await worker.recognize(canvas)
      texts.push(result.data.text)
      confidences.push(result.data.confidence)
      activePage += 1
    }
  } finally {
    await worker.terminate()
  }
  const confidence = confidences.length
    ? confidences.reduce((total, current) => total + current, 0) / confidences.length
    : null
  return { text: texts.join('\n'), confidence }
}

export async function extractTanitaFile(
  file: File,
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
    const recognized = await recognizeCanvases([canvas], onProgress)
    rawText = recognized.text
    confidence = recognized.confidence
  }

  onProgress(0.98, 'Organizando as medidas em português…')
  return {
    ...parseTanitaOcrText(rawText),
    rawText,
    confidence,
    method,
  }
}
