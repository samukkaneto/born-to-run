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

function SegmentCard({
  title,
  reading,
}: {
  title: SegmentRegion
  reading: SegmentReadingValue
}) {
  const index = REGION_INDEX[title]

  return (
    <article className="min-w-0 overflow-hidden rounded border border-white/10 bg-[#1D1D1D] p-4 shadow-[0_12px_28px_rgba(0,0,0,.12)]">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#F87171]/70 bg-[#171717] font-display text-sm text-white" aria-hidden="true">
          {index}
        </span>
        <div className="min-w-0">
          <p className="font-condensed text-sm font-semibold uppercase tracking-[0.08em] text-white">{title}</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#78716C]">Leitura segmentar</p>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#FCA5A5]">Gordura corporal</p>
          <p className="mt-1 text-base font-semibold text-white">{formatMetric(reading.fat, '%')}</p>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.08em] text-[#86EFAC]">Músculo</p>
          <p className="mt-1 text-base font-semibold text-white">{formatMetric(reading.muscle, ' kg')}</p>
        </div>
      </div>
    </article>
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

const MARKERS: Array<{ id: string; region: SegmentRegion; x: number; y: number }> = [
  { id: 'left-arm', region: 'braço esquerdo', x: 34, y: 30 },
  { id: 'right-arm', region: 'braço direito', x: 66, y: 30 },
  { id: 'trunk', region: 'tronco', x: 50, y: 42 },
  { id: 'left-leg', region: 'perna esquerda', x: 43, y: 62 },
  { id: 'right-leg', region: 'perna direita', x: 57, y: 62 },
]

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
  const assetPath = sex ? anatomyAssetPath(sex, biotype) : null

  return (
    <section className="overflow-hidden border border-[#292524] bg-[#171717] text-white" aria-labelledby="segmented-body-title">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.16em] text-[#F87171]">Tetrapolar · cinco regiões</p>
        <h3 id="segmented-body-title" className="mt-1 font-display text-2xl uppercase sm:text-3xl">Mapa corporal segmentado</h3>
      </div>

      {hasData ? (
        <>
          <div className="px-4 py-6 sm:px-6">
            <div className="border-b border-white/10 pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <p className="font-condensed text-xs font-semibold uppercase tracking-[0.14em] text-[#A8A29E]">Leituras por região</p>
                  <p className="mt-1 max-w-2xl text-xs leading-relaxed text-[#78716C]">Os números identificam os cartões abaixo. Cada cartão informa claramente a gordura corporal e a massa muscular da região.</p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-2 text-[10px] uppercase tracking-[0.08em] text-[#A8A29E]" aria-label="Legenda das métricas">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#F87171]" aria-hidden="true" /> Gordura corporal</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-[#86EFAC]" aria-hidden="true" /> Músculo</span>
                </div>
              </div>
            </div>

            <div className="mx-auto mt-6 w-full max-w-[520px]">
              <div className="mx-auto w-full max-w-[240px]">
                <div className="relative aspect-[2/3] overflow-hidden rounded border border-white/10 bg-[#111111]">
                  {assetPath ? (
                    <Image
                      src={assetPath}
                      alt="Ilustração anatômica com as cinco regiões avaliadas: braços, tronco e pernas"
                      width={260}
                      height={390}
                      className="h-full w-full object-contain"
                      priority={false}
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                      <p className="font-condensed text-sm font-semibold uppercase tracking-[0.08em] text-[#E7E5E4]">Modelo anatômico</p>
                      <p className="mt-2 text-xs leading-relaxed text-[#A8A29E]">Informe Homem ou Mulher no perfil para personalizar a ilustração.</p>
                    </div>
                  )}
                  {assetPath && (
                    <div className="absolute inset-0" aria-label="Marcadores das cinco regiões corporais">
                      {MARKERS.map((marker) => (
                        <span
                          key={marker.id}
                          className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#F87171] bg-[#171717]/95 font-display text-xs text-white shadow-[0_3px_10px_rgba(0,0,0,.35)]"
                          style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                          title={`Região ${REGION_INDEX[marker.region]}: ${marker.region}`}
                          aria-label={`Região ${REGION_INDEX[marker.region]}: ${marker.region}`}
                        >
                          {REGION_INDEX[marker.region]}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <p className="mt-3 text-center text-[10px] leading-relaxed text-[#78716C]">
                  {sex ? `Modelo ${SEX_LABELS[sex].toLowerCase()} ilustrativo. Volume ${BIOTYPE_LABELS[biotype].toLowerCase()} definido automaticamente pela Tanita e pelo IMC.` : 'O modelo será personalizado assim que o sexo for informado no perfil.'}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SegmentCard title="braço esquerdo" reading={readings['braço esquerdo']} />
                <SegmentCard title="braço direito" reading={readings['braço direito']} />
                <SegmentCard title="perna esquerda" reading={readings['perna esquerda']} />
                <SegmentCard title="perna direita" reading={readings['perna direita']} />
                <div className="sm:col-span-2">
                  <SegmentCard title="tronco" reading={readings.tronco} />
                </div>
              </div>
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
