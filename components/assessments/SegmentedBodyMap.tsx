'use client'

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

const REGION_INDEX: Record<SegmentRegion, string> = {
  'braço esquerdo': '1',
  'braço direito': '2',
  tronco: '3',
  'perna esquerda': '4',
  'perna direita': '5',
}

const REGION_MARKERS: Record<SegmentRegion, { x: number; y: number }> = {
  'braço esquerdo': { x: 31, y: 31 },
  'braço direito': { x: 69, y: 31 },
  tronco: { x: 50, y: 42 },
  'perna esquerda': { x: 42, y: 67 },
  'perna direita': { x: 58, y: 67 },
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

function SegmentOverlay({ title, reading }: { title: SegmentRegion; reading: SegmentReadingValue }) {
  const marker = REGION_MARKERS[title]
  const index = REGION_INDEX[title]

  return (
    <div
      className="absolute z-10 w-[clamp(92px,30%,132px)] -translate-x-1/2 -translate-y-1/2 rounded-md border border-white/20 bg-[#171717]/95 px-2 py-1.5 text-left shadow-[0_5px_16px_rgba(0,0,0,.45)] backdrop-blur-[2px] sm:px-2.5 sm:py-2"
      style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
      aria-label={`Dados do ${title}`}
    >
      <div className="flex items-start gap-1.5 border-b border-white/10 pb-1">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#F87171] text-[9px] font-semibold text-white" aria-hidden="true">{index}</span>
        <p className="min-w-0 font-condensed text-[9px] font-semibold uppercase leading-tight tracking-[0.05em] text-white sm:text-[10px]">{title}</p>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-1.5 text-[8px] leading-tight sm:text-[9px]">
        <div className="min-w-0">
          <p className="uppercase tracking-[0.04em] text-[#FCA5A5]">Gordura</p>
          <p className="mt-0.5 whitespace-nowrap font-semibold text-white">{formatMetric(reading.fat, '%')}</p>
        </div>
        <div className="min-w-0">
          <p className="uppercase tracking-[0.04em] text-[#86EFAC]">Músculo</p>
          <p className="mt-0.5 whitespace-nowrap font-semibold text-white">{formatMetric(reading.muscle, ' kg')}</p>
        </div>
      </div>
    </div>
  )
}

function SegmentList({ readings }: { readings: Record<SegmentRegion, SegmentReadingValue> }) {
  return (
    <div className="mt-4 grid grid-cols-1 gap-2 sm:hidden" aria-label="Dados segmentares em lista">
      {REGIONS.map((region) => (
        <div key={region} className="flex items-center justify-between gap-3 rounded border border-white/10 bg-[#1D1D1D] px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#F87171]/70 text-[9px] text-white" aria-hidden="true">{REGION_INDEX[region]}</span>
            <span className="font-condensed text-[10px] font-semibold uppercase tracking-[0.06em] text-white">{region}</span>
          </div>
          <div className="flex shrink-0 gap-2 text-[9px]">
            <span className="text-[#FCA5A5]">{formatMetric(readings[region].fat, '%')}</span>
            <span className="text-[#86EFAC]">{formatMetric(readings[region].muscle, ' kg')}</span>
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
                  <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-[#A8A29E]">Leituras por região</p>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#78716C]">Os dados aparecem diretamente sobre a região correspondente da ilustração. O número identifica a área e as duas cores separam gordura corporal de músculo.</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.08em] text-[#A8A29E]" aria-label="Legenda das métricas">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#F87171]" aria-hidden="true" /> Gordura corporal</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#86EFAC]" aria-hidden="true" /> Músculo</span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-5 w-full max-w-[520px]">
              <div className="relative mx-auto aspect-[2/3] w-full max-w-[420px] overflow-hidden rounded border border-white/10 bg-[#111111]">
                <Image
                  src={assetPath}
                  alt={`Ilustração anatômica ${sex ? SEX_LABELS[sex].toLowerCase() : 'de referência'} com dados sobre braços, tronco e pernas`}
                  fill
                  sizes="(max-width: 640px) 92vw, 420px"
                  className="object-contain"
                  priority={false}
                />
                <div className="absolute inset-0" aria-label="Dados posicionados sobre as cinco regiões corporais">
                  {REGIONS.map((region) => <SegmentOverlay key={region} title={region} reading={readings[region]} />)}
                </div>
              </div>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-[#78716C]">
                {sex ? `Modelo ${SEX_LABELS[sex].toLowerCase()} ilustrativo. Volume ${BIOTYPE_LABELS[biotype].toLowerCase()} definido automaticamente pela Tanita e pelo IMC.` : 'Modelo de referência visual. Informe o sexo no perfil para personalizar a anatomia sem alterar os dados desta avaliação.'}
              </p>
              <SegmentList readings={readings} />
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
