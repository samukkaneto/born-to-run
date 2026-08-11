'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { downloadAssessmentPdf, type AssessmentPdfData } from '@/lib/assessments/pdf'

export default function AssessmentPdfButton({ assessment }: { assessment: AssessmentPdfData }) {
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')

  async function handleDownload() {
    setWorking(true)
    setError('')
    try {
      await downloadAssessmentPdf(assessment)
    } catch {
      setError('Não foi possível gerar o PDF. Tente novamente.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={handleDownload} disabled={working} className="btn-primary text-sm">
        <Download size={15} aria-hidden="true" />
        {working ? 'Gerando PDF…' : 'Baixar avaliação em PDF'}
      </button>
      {error && <p role="alert" className="mt-2 text-sm text-[#B91C1C]">{error}</p>}
    </div>
  )
}
