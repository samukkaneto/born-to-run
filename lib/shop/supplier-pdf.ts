import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { CatalogProduct } from './catalog'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function truncate(value: string, length: number) {
  return value.length <= length ? value : `${value.slice(0, length - 3)}...`
}

export async function createSupplierReportPdf(products: CatalogProduct[]): Promise<Uint8Array> {
  const document = await PDFDocument.create()
  const regular = await document.embedFont(StandardFonts.Helvetica)
  const bold = await document.embedFont(StandardFonts.HelveticaBold)
  const pageSize: [number, number] = [595.28, 841.89]
  let page = document.addPage(pageSize)
  let y = 790

  const nextPage = () => {
    page = document.addPage(pageSize)
    y = 735
  }

  y = 735
  page.drawText('Acesso restrito a administradores e treinadores. Precos sugeridos incluem 100% sobre o custo de referencia.', { x: 38, y, size: 8.5, font: regular, color: rgb(0.3, 0.3, 0.3) })
  y -= 28

  for (const product of products) {
    if (y < 115) nextPage()
    page.drawRectangle({ x: 34, y: y - 72, width: 527, height: 82, borderColor: rgb(0.88, 0.87, 0.85), borderWidth: 0.8 })
    page.drawRectangle({ x: 34, y: y - 72, width: 4, height: 82, color: rgb(0.86, 0.15, 0.15) })
    page.drawText(product.name, { x: 48, y: y - 8, size: 12, font: bold, color: rgb(0.09, 0.09, 0.09) })
    page.drawText(`${product.category} | ${truncate(product.material, 72)}`, { x: 48, y: y - 23, size: 8, font: regular, color: rgb(0.35, 0.33, 0.3) })
    page.drawText(`Custo: ${currency.format(product.referenceCost)}   Preco sugerido: ${currency.format(product.price)}`, { x: 48, y: y - 40, size: 9, font: bold, color: rgb(0.09, 0.09, 0.09) })
    page.drawText(truncate(product.reference.label, 78), { x: 48, y: y - 55, size: 7.5, font: regular, color: rgb(0.72, 0.08, 0.08) })
    page.drawText(truncate(product.reference.url, 92), { x: 48, y: y - 67, size: 6.5, font: regular, color: rgb(0.35, 0.33, 0.3) })
    y -= 94
  }

  const pages = document.getPages()
  pages.forEach((item, index) => {
    item.drawRectangle({ x: 0, y: 760, width: pageSize[0], height: 82, color: rgb(0.09, 0.09, 0.09) })
    item.drawText('BORN TO RUN', { x: 38, y: 798, size: 22, font: bold, color: rgb(1, 1, 1) })
    item.drawText('RELATORIO INTERNO DE FORNECEDORES', { x: 38, y: 778, size: 10, font: regular, color: rgb(0.98, 0.8, 0.08) })
    item.drawText(`Born to Run Treinamento e Saude | pagina ${index + 1} de ${pages.length}`, { x: 38, y: 24, size: 7, font: regular, color: rgb(0.45, 0.43, 0.4) })
  })
  document.setTitle('Relatorio interno de fornecedores - Born to Run')
  document.setAuthor('Born to Run Treinamento e Saude')
  return document.save()
}
