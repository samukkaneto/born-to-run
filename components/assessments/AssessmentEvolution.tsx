import { formatDate } from '@/lib/utils'
import type { BodyAssessment } from '@/types'

type TrendMetric = {
  key: keyof Pick<BodyAssessment, 'weight_kg' | 'body_fat_pct' | 'muscle_mass_kg' | 'body_water_pct' | 'bmi' | 'visceral_fat_level'>
  label: string
  unit: string
  color: string
}

const METRICS: TrendMetric[] = [
  { key: 'weight_kg', label: 'Peso', unit: 'kg', color: '#DC2626' },
  { key: 'body_fat_pct', label: 'Gordura corporal', unit: '%', color: '#F97316' },
  { key: 'muscle_mass_kg', label: 'Massa muscular', unit: 'kg', color: '#16A34A' },
  { key: 'body_water_pct', label: 'Água corporal', unit: '%', color: '#0284C7' },
  { key: 'bmi', label: 'IMC', unit: '', color: '#7C3AED' },
  { key: 'visceral_fat_level', label: 'Gordura visceral', unit: '', color: '#CA8A04' },
]

function TrendChart({ assessments, metric }: { assessments: BodyAssessment[]; metric: TrendMetric }) {
  const points = assessments
    .map((assessment) => ({ date: assessment.assessed_at, value: assessment[metric.key] as number | null }))
    .filter((point): point is { date: string; value: number } => point.value !== null)

  const current = points.at(-1)
  const initial = points.at(0)
  const values = points.map((point) => Number(point.value))
  const minimum = Math.min(...values)
  const maximum = Math.max(...values)
  const range = Math.max(maximum - minimum, Math.max(Math.abs(maximum), 1) * 0.08)
  const coordinates = points.map((point, index) => ({
    x: points.length === 1 ? 120 : 16 + (index / (points.length - 1)) * 208,
    y: 72 - ((Number(point.value) - minimum) / range) * 48,
  }))
  const delta = current && initial ? Number(current.value) - Number(initial.value) : null

  return (
    <article className="card min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-[#78716C]">{metric.label}</p>
          <p className="mt-1 font-display text-3xl text-[#171717]">{current ? `${Number(current.value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${metric.unit ? ` ${metric.unit}` : ''}` : '—'}</p>
        </div>
        <span className="mt-1 h-2.5 w-8" style={{ backgroundColor: metric.color }} aria-hidden="true" />
      </div>
      {points.length > 1 ? (
        <>
          <svg viewBox="0 0 240 88" className="mt-4 h-24 w-full" role="img" aria-label={`Evolução de ${metric.label} entre ${formatDate(points[0].date)} e ${formatDate(points.at(-1)!.date)}`}>
            {[24, 48, 72].map((y) => <line key={y} x1="16" y1={y} x2="224" y2={y} stroke="#E7E5E4" strokeWidth="1" />)}
            <polyline points={coordinates.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke={metric.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
            {coordinates.map((point, index) => <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={index === coordinates.length - 1 ? 4.5 : 3} fill="white" stroke={metric.color} strokeWidth="2.5" />)}
          </svg>
          <div className="flex items-center justify-between gap-3 text-[10px] uppercase text-[#78716C]"><span>{formatDate(points[0].date)}</span><strong style={{ color: metric.color }}>{delta === null || delta === 0 ? 'Sem alteração' : `${delta > 0 ? '+' : ''}${delta.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${metric.unit ? ` ${metric.unit}` : ''}`}</strong><span>{formatDate(points.at(-1)!.date)}</span></div>
        </>
      ) : <p className="mt-8 border-t border-dashed border-[#D6D3D1] pt-5 text-xs text-[#78716C]">Uma nova avaliação criará a linha de evolução.</p>}
    </article>
  )
}

export default function AssessmentEvolution({ assessments }: { assessments: BodyAssessment[] }) {
  const chronological = [...assessments].reverse()
  return (
    <section aria-labelledby="assessment-evolution-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.16em] text-[#DC2626]">Histórico comparativo</p>
          <h2 id="assessment-evolution-title" className="mt-1 font-display text-3xl uppercase text-[#171717]">Evolução da avaliação</h2>
        </div>
        <p className="text-xs text-[#78716C]">{assessments.length} {assessments.length === 1 ? 'medição registrada' : 'medições registradas'}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {METRICS.map((metric) => <TrendChart key={metric.key} assessments={chronological} metric={metric} />)}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#78716C]">As linhas representam somente a variação entre medições registradas. A interpretação deve considerar o contexto individual do atleta.</p>
    </section>
  )
}
