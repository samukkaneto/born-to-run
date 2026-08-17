
import { useMemo } from 'react'
import Image from 'next/image'
import { anatomyAssetPath, classifyIllustrationBiotype, type AnatomyBiotype, type AnatomySex, BIOTYPE_LABELS, SEX_LABELS } from '@/lib/assessments/anatomy-assets'
import type { BodyAssessment } from '@/types'

function formatMetric(value: number | null, suffix: string) {
  if (value === null) return '—'
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`
}

type SegmentRegion = 'braço esquerdo' | 'braço direito' | 'tronco' | 'perna esquerda' | 'perna direita'

type SegmentReadingValue = {
  fat: number | null
  muscle: number | null
}

const REGIONS: SegmentRegion[] = ['braço esquerdo', 'braço direito', 'tronco', 'perna esquerda', 'perna direita']

function readingsFor(assessment: BodyAssessment): Record<SegmentRegion, SegmentReadingValue> {
  return {
    'braço esquerdo': { fat: assessment.segment_left_arm_fat_pct, muscle: assessment.segment_left_arm_muscle_kg },
    'braço direito': { fat: assessment.segment_right_arm_fat_pct, muscle: assessment.segment_right_arm_muscle_kg },
    tronco: { fat: assessment.segment_trunk_fat_pct, muscle: assessment.segment_trunk_muscle_kg },
    'perna esquerda': { fat: assessment.segment_left_leg_fat_pct, muscle: assessment.segment_left_leg_muscle_kg },
    'perna direita': { fat: assessment.segment_right_leg_fat_pct, muscle: assessment.segment_right_leg_muscle_kg },
  }
}

function isSex(value: unknown): value is AnatomySex {
  return value === 'male' || value === 'female'
}

function AnatomyCallout({
  title,
  reading,
  side,
  top,
}: {
  title: SegmentRegion
  reading: SegmentReadingValue
  side: 'left' | 'right'
  top: string
}) {
  const isLeft = side === 'left'

  return (
    <div
      className={`absolute z-10 w-[min(100%,220px)] px-1 ${isLeft ? 'right-0 text-right' : 'left-0 text-left'}`}
      style={{ top }}
      aria-label={`Dados do ${title}`}
    >
      <p className="font-condensed text-[11px] font-semibold uppercase leading-tight tracking-[0.12em] text-[#F5F5F4] sm:text-xs">{title}</p>
      <div className={`mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] uppercase leading-tight tracking-[0.04em] sm:text-[11px] ${isLeft ? 'justify-end' : 'justify-start'}`}>
        <span className="text-[#FCA5A5]">Gordura <strong className="font-semibold text-white">{formatMetric(reading.fat, '%')}</strong></span>
        <span className="text-[#86EFAC]">Músculo <strong className="font-semibold text-white">{formatMetric(reading.muscle, ' kg')}</strong></span>
      </div>
    </div>
  )
}

function SegmentList({ readings }: { readings: Record<SegmentRegion, SegmentReadingValue> }) {
  return (
    <div className="mt-5 border-y border-white/10 md:hidden" aria-label="Dados segmentares em lista">
      {REGIONS.map((region) => (
        <div key={region} className="flex items-center justify-between gap-3 border-b border-white/10 py-3 last:border-b-0">
          <span className="font-condensed text-[11px] font-semibold uppercase tracking-[0.08em] text-white">{region}</span>
          <div className="flex shrink-0 flex-wrap justify-end gap-x-3 gap-y-1 text-[10px] uppercase">
            <span className="text-[#FCA5A5]">Gordura <strong className="font-semibold text-white">{formatMetric(readings[region].fat, '%')}</strong></span>
            <span className="text-[#86EFAC]">Músculo <strong className="font-semibold text-white">{formatMetric(readings[region].muscle, ' kg')}</strong></span>
          </div>
        </div>
      ))}
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

export default function SegmentedBodyMap({ assessment, profileSex }: { assessment: BodyAssessment; profileSex?: string | null }) {
  const sex = isSex(profileSex) ? profileSex : isSex(assessment.sex) ? assessment.sex : null
  const biotype = useMemo<AnatomyBiotype>(
    () =>
      classifyIllustrationBiotype({
        sex,
        bodyFatPct: assessment.body_fat_pct,
        bmi: assessment.bmi,
        physiqueRating: assessment.physique_rating,
        visceralFatLevel: assessment.visceral_fat_level,
      }) ?? 'mid',
    [sex, assessment.body_fat_pct, assessment.bmi, assessment.physique_rating, assessment.visceral_fat_level],
  )

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

  const readings = readingsFor(assessment)
  const assetPath = anatomyAssetPath(sex, biotype)

  return (
    <section className="min-w-0 overflow-hidden border border-[#292524] bg-[#171717] text-white" aria-labelledby="segmented-body-title">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F87171]">Tetrapolar · cinco regiões</p>
        <h3 id="segmented-body-title" className="mt-1 font-display text-2xl uppercase sm:text-3xl">Mapa corporal segmentado</h3>
      </div>

      {hasData ? (
        <>
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div className="border-b border-white/10 pb-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-[#A8A29E]">Leituras anatômicas</p>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#78716C]">Linhas-guia apontam para cada região corporal. Gordura aparece em vermelho e músculo em verde.</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.08em] text-[#A8A29E]" aria-label="Legenda das métricas">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#F87171]" aria-hidden="true" /> Gordura corporal</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#86EFAC]" aria-hidden="true" /> Músculo</span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-5 w-full max-w-[900px]">
              <div className="relative hidden grid-cols-[minmax(0,1fr)_minmax(250px,420px)_minmax(0,1fr)] items-stretch gap-x-4 md:grid">
                <div className="relative">
                  <AnatomyCallout title="braço esquerdo" reading={readings['braço esquerdo']} side="left" top="21%" />
                  <AnatomyCallout title="tronco" reading={readings.tronco} side="left" top="41%" />
                  <AnatomyCallout title="perna esquerda" reading={readings['perna esquerda']} side="left" top="68%" />
                </div>

                <div className="relative mx-auto aspect-[2/3] w-full max-w-[420px] overflow-hidden border-x border-white/10 bg-[#111111]">
                  <Image
                    src={assetPath}
                    alt={`Ilustração anatômica ${sex ? SEX_LABELS[sex].toLowerCase() : 'de referência'} com linhas de dados sobre braços, tronco e pernas`}
                    fill
                    sizes="(max-width: 900px) 46vw, 420px"
                    className="object-contain"
                    priority={false}
                  />
                </div>

                <div className="relative">
                  <AnatomyCallout title="braço direito" reading={readings['braço direito']} side="right" top="21%" />
                  <AnatomyCallout title="perna direita" reading={readings['perna direita']} side="right" top="68%" />
                </div>

                <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                  <g fill="none" stroke="#A8A29E" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.16">
                    <polyline points="39,28 29,28 22,23" />
                    <polyline points="50,41 29,41 22,42" />
                    <polyline points="44,66 29,66 22,70" />
                    <polyline points="61,28 71,28 78,23" />
                    <polyline points="56,66 71,66 78,70" />
                  </g>
                  <g fill="#F87171">
                    <circle cx="39" cy="28" r="0.45" />
                    <circle cx="50" cy="41" r="0.45" />
                    <circle cx="44" cy="66" r="0.45" />
                    <circle cx="61" cy="28" r="0.45" />
                    <circle cx="56" cy="66" r="0.45" />
                  </g>
                </svg>
              </div>

              <div className="mx-auto w-full max-w-[420px] md:hidden">
                <div className="relative aspect-[2/3] w-full overflow-hidden border-x border-white/10 bg-[#111111]">
                  <Image
                    src={assetPath}
                    alt={`Ilustração anatômica ${sex ? SEX_LABELS[sex].toLowerCase() : 'de referência'} com dados segmentares`}
                    fill
                    sizes="92vw"
                    className="object-contain"
                    priority={false}
                  />
                </div>
                <SegmentList readings={readings} />
              </div>

              <p className="mt-3 text-center text-[10px] leading-relaxed text-[#78716C]">
                {sex ? `Modelo ${SEX_LABELS[sex].toLowerCase()} ilustrativo. Volume ${BIOTYPE_LABELS[biotype].toLowerCase()} definido automaticamente pela Tanita e pelo IMC.` : 'Modelo de referência visual. Informe o sexo no perfil para personalizar a anatomia sem alterar os dados desta avaliação.'}
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 bg-[#111111] px-4 py-4 sm:px-6">
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
