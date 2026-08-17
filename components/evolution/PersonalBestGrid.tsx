import { Award, Clock3, Medal, TrendingDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { formatDuration, formatPace, type PersonalBestDistance } from '@/lib/evolution'

function bestChartPoints(record: PersonalBestDistance) {
  const points = record.improvements
  if (points.length === 0) return []
  const times = points.map((point) => point.timeSeconds)
  const slowest = Math.max(...times)
  const fastest = Math.min(...times)
  const range = Math.max(slowest - fastest, 1)
  return points.map((point, index) => ({
    x: points.length === 1 ? 150 : 16 + (index / (points.length - 1)) * 268,
    y: 74 - ((slowest - point.timeSeconds) / range) * 48,
  }))
}

function PersonalBestCard({ record, index }: { record: PersonalBestDistance; index: number }) {
  const hasRecord = record.bestTimeSeconds !== null
  const points = bestChartPoints(record)
  const latestImprovement = record.improvements.at(-1)

  return (
    <article className={`relative overflow-hidden rounded-2xl border p-4 shadow-[0_10px_28px_rgba(23,23,23,0.05)] sm:p-5 ${hasRecord ? 'border-[#E7E5E4] bg-white' : 'border-dashed border-[#D6D3D1] bg-[#FAFAF9]'}`}>
      <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#DC2626]/[0.04] blur-2xl" aria-hidden="true" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${hasRecord ? 'bg-[#FEF2F2] text-[#DC2626]' : 'bg-[#F5F5F4] text-[#A8A29E]'}`}>
            {hasRecord ? <Medal size={19} aria-hidden="true" /> : <Clock3 size={19} aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.16em] text-[#A8A29E]">Marca {String(index + 1).padStart(2, '0')}</p>
            <h3 className="mt-0.5 truncate font-display text-2xl uppercase leading-none text-[#171717]">{record.label}</h3>
            <p className="mt-1 text-xs text-[#78716C]">{record.descriptor}</p>
          </div>
        </div>
        {hasRecord && <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#15803D]"><Award size={12} aria-hidden="true" /> RP</span>}
      </div>

      {hasRecord ? (
        <>
          <div className="relative mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#78716C]">Melhor tempo</p>
              <p className="mt-1 font-display text-4xl leading-none text-[#171717]">{formatDuration(record.bestTimeSeconds)}</p>
              <p className="mt-2 text-xs font-semibold text-[#DC2626]">{formatPace(record.bestPaceMinutesPerKm)}</p>
            </div>
            <div className="text-right text-[11px] text-[#78716C]">
              <p>{record.attempts} {record.attempts === 1 ? 'registro' : 'registros'}</p>
              <p className="mt-1">{record.improvements.length} {record.improvements.length === 1 ? 'RP' : 'RPs'} conquistado{record.improvements.length === 1 ? '' : 's'}</p>
            </div>
          </div>
          <svg viewBox="0 0 300 92" className="mt-4 h-24 w-full" role="img" aria-label={`Evolução do recorde pessoal em ${record.label}`}>
            {[26, 50, 74].map((y) => <line key={y} x1="16" y1={y} x2="284" y2={y} stroke="#F0EFED" strokeWidth="1" />)}
            {points.length > 1 && <polyline points={points.map((point) => `${point.x},${point.y}`).join(' ')} fill="none" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
            {points.map((point, pointIndex) => <circle key={`${point.x}-${point.y}`} cx={point.x} cy={point.y} r={pointIndex === points.length - 1 ? 5 : 3.5} fill={pointIndex === points.length - 1 ? '#DC2626' : '#FFFFFF'} stroke="#DC2626" strokeWidth="2.5" />)}
          </svg>
          <div className="flex items-center justify-between gap-3 border-t border-[#F0EFED] pt-3 text-[10px] uppercase tracking-[0.05em] text-[#A8A29E]">
            <span>{record.improvements.length > 1 ? `${record.improvements.length} momentos de evolução` : 'Primeiro recorde registrado'}</span>
            {latestImprovement && <span>{formatDate(latestImprovement.date)}</span>}
          </div>
        </>
      ) : (
        <div className="relative mt-6 border-t border-dashed border-[#D6D3D1] pt-5">
          <p className="text-sm font-semibold text-[#57534E]">Ainda sem marca registrada</p>
          <p className="mt-1 text-xs leading-relaxed text-[#A8A29E]">Quando um treino ou prova for salvo próximo desta distância, o melhor tempo aparecerá aqui.</p>
        </div>
      )}
    </article>
  )
}

export default function PersonalBestGrid({ records }: { records: PersonalBestDistance[] }) {
  const completed = records.filter((record) => record.bestTimeSeconds !== null).length
  const improvements = records.reduce((total, record) => total + record.improvements.length, 0)

  return (
    <section aria-labelledby="personal-bests-title">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker mb-2">Marcas pessoais</p>
          <h2 id="personal-bests-title" className="font-display text-3xl uppercase text-[#171717]">Recordes do atleta</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#57534E]">O painel guarda sempre o menor tempo registrado em cada distância e desenha cada conquista de RP ao longo do tempo.</p>
        </div>
        <div className="flex items-center gap-3 text-right text-[11px] uppercase tracking-[0.08em] text-[#78716C]">
          <span><strong className="font-display text-xl text-[#171717]">{completed}</strong>/10 marcas</span>
          <span className="h-8 w-px bg-[#E7E5E4]" aria-hidden="true" />
          <span><strong className="font-display text-xl text-[#DC2626]">{improvements}</strong> RPs</span>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {records.map((record, index) => <PersonalBestCard key={record.id} record={record} index={index} />)}
      </div>
      <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-[#78716C]"><TrendingDown size={14} className="mt-0.5 shrink-0 text-[#DC2626]" aria-hidden="true" />A evolução usa registros com distância próxima à marca para absorver arredondamentos comuns. Atividades mais longas não são convertidas em parciais sem um tempo específico daquela distância.</p>
    </section>
  )
}
