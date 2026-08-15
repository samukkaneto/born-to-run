import type { BodyAssessment } from '@/types'

function formatMetric(value: number | null, suffix: string) {
  if (value === null) return '—'
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`
}

function SegmentReading({
  title,
  fat,
  muscle,
  align = 'left',
}: {
  title: string
  fat: number | null
  muscle: number | null
  align?: 'left' | 'right'
}) {
  return (
    <div className={`border-t border-white/10 py-4 ${align === 'right' ? 'xl:text-right' : ''}`}>
      <p className="font-condensed text-sm font-semibold uppercase text-white">{title}</p>
      <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs ${align === 'right' ? 'xl:justify-end' : ''}`}>
        <span className="text-[#FCA5A5]"><strong className="text-white">{formatMetric(fat, '%')}</strong> gordura</span>
        <span className="text-[#86EFAC]"><strong className="text-white">{formatMetric(muscle, ' kg')}</strong> músculo</span>
      </div>
    </div>
  )
}

function BalanceReading({
  label,
  left,
  right,
  suffix,
  scale,
}: {
  label: string
  left: number | null
  right: number | null
  suffix: string
  scale: number
}) {
  const delta = left === null || right === null ? null : Number(left) - Number(right)
  const position = delta === null ? 50 : Math.max(4, Math.min(96, 50 + (delta / scale) * 46))
  const reading = delta === null
    ? 'Sem dados comparáveis'
    : Math.abs(delta) < 0.05
      ? 'Equilibrado'
      : `${delta > 0 ? 'Esquerda' : 'Direita'} +${Math.abs(delta).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`

  return (
    <div className="min-w-0 py-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-[#E7E5E4]">{label}</span>
        <strong className="shrink-0 text-white">{reading}</strong>
      </div>
      <div className="relative mt-2 h-1.5 bg-white/10">
        <span className="absolute left-1/2 top-[-3px] h-3 w-px bg-white/35" aria-hidden="true" />
        {delta !== null && <span className="absolute top-[-3px] h-3 w-3 -translate-x-1/2 rounded-full border-2 border-[#171717] bg-[#F87171]" style={{ left: `${position}%` }} aria-hidden="true" />}
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase text-[#78716C]"><span>Esquerda</span><span>Direita</span></div>
    </div>
  )
}

export default function SegmentedBodyMap({ assessment }: { assessment: BodyAssessment }) {
  const hasData = [
    assessment.segment_left_arm_fat_pct,
    assessment.segment_left_arm_muscle_kg,
    assessment.segment_right_arm_fat_pct,
    assessment.segment_right_arm_muscle_kg,
    assessment.segment_trunk_fat_pct,
    assessment.segment_trunk_muscle_kg,
    assessment.segment_left_leg_fat_pct,
    assessment.segment_left_leg_muscle_kg,
    assessment.segment_right_leg_fat_pct,
    assessment.segment_right_leg_muscle_kg,
  ].some((metric) => metric !== null)

  return (
    <section className="overflow-hidden border border-[#292524] bg-[#171717] text-white" aria-labelledby="segmented-body-title">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F87171]">Tetrapolar · cinco regiões</p>
        <h3 id="segmented-body-title" className="mt-1 font-display text-3xl uppercase">Mapa corporal segmentado</h3>
      </div>

      {hasData ? (
        <>
          <div className="grid gap-x-6 px-5 py-6 sm:px-6 xl:grid-cols-[minmax(150px,1fr)_240px_minmax(150px,1fr)] xl:items-center">
            <div className="order-2 xl:order-1">
              <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78716C]">Lado esquerdo</p>
              <SegmentReading title="Braço esquerdo" fat={assessment.segment_left_arm_fat_pct} muscle={assessment.segment_left_arm_muscle_kg} />
              <SegmentReading title="Perna esquerda" fat={assessment.segment_left_leg_fat_pct} muscle={assessment.segment_left_leg_muscle_kg} />
            </div>

            <div className="order-1 mx-auto flex w-full max-w-[240px] flex-col items-center xl:order-2">
              <svg viewBox="0 0 220 390" className="h-[330px] w-[190px] sm:h-[360px] sm:w-[210px]" role="img" aria-labelledby="body-map-svg-title body-map-svg-description">
                <title id="body-map-svg-title">Corpo humano com cinco regiões avaliadas</title>
                <desc id="body-map-svg-description">Braços, tronco e pernas possuem marcadores de gordura corporal e massa muscular.</desc>
                <circle cx="110" cy="34" r="25" fill="#E7E5E4" />
                <path d="M92 68 Q110 57 128 68 L147 151 Q138 205 129 221 L91 221 Q82 205 73 151 Z" fill="#D6D3D1" stroke="#78716C" strokeWidth="2" />
                <path d="M78 89 C61 100 49 120 40 144 L22 207" fill="none" stroke="#D6D3D1" strokeLinecap="round" strokeWidth="23" />
                <path d="M142 89 C159 100 171 120 180 144 L198 207" fill="none" stroke="#D6D3D1" strokeLinecap="round" strokeWidth="23" />
                <path d="M97 217 L85 285 L76 369" fill="none" stroke="#D6D3D1" strokeLinecap="round" strokeWidth="30" />
                <path d="M123 217 L135 285 L144 369" fill="none" stroke="#D6D3D1" strokeLinecap="round" strokeWidth="30" />
                <path d="M61 96 L36 150 L23 206 M159 96 L184 150 L197 206 M96 230 L84 294 L76 369 M124 230 L136 294 L144 369" fill="none" stroke="#A8A29E" strokeLinecap="round" strokeWidth="2" opacity="0.7" />
                {[[46, 142], [174, 142], [110, 142], [84, 290], [136, 290]].map(([cx, cy], index) => (
                  <g key={`${cx}-${cy}`}>
                    <circle cx={cx} cy={cy} r="11" fill="#171717" stroke="#86EFAC" strokeWidth="4" />
                    <circle cx={cx} cy={cy} r="4" fill="#F87171" />
                    {index === 2 && <circle cx={cx} cy={cy} r="17" fill="none" stroke="#F87171" strokeWidth="1" opacity="0.5" />}
                  </g>
                ))}
                <text x="38" y="126" fill="#A8A29E" fontSize="10" textAnchor="middle">E</text>
                <text x="182" y="126" fill="#A8A29E" fontSize="10" textAnchor="middle">D</text>
              </svg>
              <div className="w-full border-t border-white/10 pt-4 text-center">
                <p className="font-condensed text-sm font-semibold uppercase">Tronco</p>
                <p className="mt-1 text-xs text-[#A8A29E]"><strong className="text-[#FCA5A5]">{formatMetric(assessment.segment_trunk_fat_pct, '%')}</strong> gordura · <strong className="text-[#86EFAC]">{formatMetric(assessment.segment_trunk_muscle_kg, ' kg')}</strong> músculo</p>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-[10px] uppercase text-[#A8A29E]"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#F87171]" /> Gordura</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border-2 border-[#86EFAC]" /> Músculo</span></div>
            </div>

            <div className="order-3">
              <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78716C] xl:text-right">Lado direito</p>
              <SegmentReading title="Braço direito" fat={assessment.segment_right_arm_fat_pct} muscle={assessment.segment_right_arm_muscle_kg} align="right" />
              <SegmentReading title="Perna direita" fat={assessment.segment_right_leg_fat_pct} muscle={assessment.segment_right_leg_muscle_kg} align="right" />
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#111111] px-5 py-4 sm:px-6">
            <p className="font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#A8A29E]">Equilíbrio bilateral</p>
            <div className="mt-2 grid gap-x-8 md:grid-cols-2">
              <BalanceReading label="Gordura nos braços" left={assessment.segment_left_arm_fat_pct} right={assessment.segment_right_arm_fat_pct} suffix=" p.p." scale={10} />
              <BalanceReading label="Músculo nos braços" left={assessment.segment_left_arm_muscle_kg} right={assessment.segment_right_arm_muscle_kg} suffix=" kg" scale={2} />
              <BalanceReading label="Gordura nas pernas" left={assessment.segment_left_leg_fat_pct} right={assessment.segment_right_leg_fat_pct} suffix=" p.p." scale={10} />
              <BalanceReading label="Músculo nas pernas" left={assessment.segment_left_leg_muscle_kg} right={assessment.segment_right_leg_muscle_kg} suffix=" kg" scale={2} />
            </div>
          </div>
        </>
      ) : <p className="p-8 text-center text-sm text-[#A8A29E]">Dados segmentais ainda não registrados nesta avaliação.</p>}
    </section>
  )
}
