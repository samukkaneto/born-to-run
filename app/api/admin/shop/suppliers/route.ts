import { NextResponse } from 'next/server'
import { getAccessContext } from '@/lib/auth/access'
import { catalogProducts } from '@/lib/shop/catalog'
import { createSupplierReportPdf } from '@/lib/shop/supplier-pdf'

export async function GET() {
  const { user, profile } = await getAccessContext()
  if (!user) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 })
  if (!profile || profile.membership_status !== 'active' || !['admin', 'coach'].includes(profile.role)) {
    return NextResponse.json({ error: 'Acesso restrito à gestão.' }, { status: 403 })
  }

  const bytes = await createSupplierReportPdf(catalogProducts)
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="fornecedores-born-to-run.pdf"',
      'Cache-Control': 'private, no-store',
    },
  })
}
