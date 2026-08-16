'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { anatomyAssetPath, type AnatomyBiotype, type AnatomySex, BIOTYPE_LABELS, SEX_LABELS } from '@/lib/assessments/anatomy-assets'
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

/** Marcadores sobre a ilustração. Percentuais do container (x horizontal,
 *  y vertical), calibrados na família anatômica aprovada (fonte vista de
 *  frente, braços levemente afastados). */
const MARKERS: Array<{ id: string; region: 'braço esquerdo' | 'braço direito' | 'tronco' | 'perna esquerda' | 'perna direita'; x: number; y: number; dot: 'muscle' | 'fat' }> = [
  { id: 'left-arm', region: 'braço esquerdo', x: 34, y: 30, dot: 'muscle' },
  { id: 'right-arm', region: 'braço direito', x: 66, y: 30, dot: 'muscle' },
  { id: 'trunk', region: 'tronco', x: 50, y: 42, dot: 'fat' },
  { id: 'left-leg', region: 'perna esquerda', x: 43, y: 62, dot: 'muscle' },
  { id: 'right-leg', region: 'perna direita', x: 57, y: 62, dot: 'muscle' },
]

/** Escolhe as leituras corretas por região. */
function readingsFor(assessment: BodyAssessment) {
  return {
    'braço esquerdo': { fat: assessment.segment_left_arm_fat_pct, muscle: assessment.segment_left_arm_muscle_kg },
    'braço direito': { fat: assessment.segment_right_arm_fat_pct, muscle: assessment.segment_right_arm_muscle_kg },
    'tronco': { fat: assessment.segment_trunk_fat_pct, muscle: assessment.segment_trunk_muscle_kg },
    'perna esquerda': { fat: assessment.segment_left_leg_fat_pct, muscle: assessment.segment_left_leg_muscle_kg },
    'perna direita': { fat: assessment.segment_right_leg_fat_pct, muscle: assessment.segment_right_leg_muscle_kg },
  }
}

function isSex(value: unknown): value is AnatomySex {
  return value === 'male' || value === 'female'
}

function isBiotype(value: unknown): value is AnatomyBiotype {
  return value === 'lean' || value === 'mid' || value === 'large'
}

export default function SegmentedBodyMap({ assessment }: { assessment: BodyAssessment }) {
  const [sex, setSex] = useState<AnatomySex | null>(isSex(assessment.sex) ? assessment.sex : null)
  const [biotype, setBiotype] = useState<AnatomyBiotype>(isBiotype(assessment.biotype) ? assessment.biotype : 'mid')
  const [sexSelectionNote, setSexSelectionNote] = useState('')
  const [saving, setSaving] = useState(false)

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

  async function persistIllustrationChoice(nextSex: AnatomySex | null, nextBiotype: AnatomyBiotype) {
    if (saving) return
    setSaving(true)
    setSexSelectionNote('')
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('body_assessments')
        .update({ sex: nextSex, biotype: nextBiotype })
        .eq('id', assessment.id)
      if (error) throw error
      setSex(nextSex)
      setBiotype(nextBiotype)
    } catch {
      setSexSelectionNote('Não foi possível salvar sua escolha de ilustração. Ela permanece apenas nesta sessão.')
    } finally {
      setSaving(false)
    }
  }

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
              <SegmentReading title="Braço esquerdo" fat={readings['braço esquerdo'].fat} muscle={readings['braço esquerdo'].muscle} />
              <SegmentReading title="Perna esquerda" fat={readings['perna esquerda'].fat} muscle={readings['perna esquerda'].muscle} />
            </div>

            <div className="order-1 mx-auto flex w-full flex-col items-center xl:order-2">
              <div className="relative w-full max-w-[260px]">
                <Image
                  src={assetPath}
                  alt="Ilustração anatômica com as cinco regiões avaliadas: braços, tronco e pernas"
                  width={260}
                  height={390}
                  className="h-auto w-full"
                  priority={false}
                />
                <div className="absolute inset-0" aria-hidden="true">
                  {MARKERS.map((marker) => {
                    const reading = readings[marker.region]
                    return (
                      <span key={marker.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${marker.x}%`, top: `${marker.y}%` }}>
                        {marker.dot === 'muscle' ? (
                          <span className="block h-4 w-4 rounded-full border-[3px] border-[#86EFAC] bg-[#171717]" />
                        ) : (
                          <span className="block h-5 w-5 rounded-full border-[3px] border-[#F87171] bg-[#171717]" />
                        )}
                        
                        {reading.fat !== null || reading.muscle !== null ? (
                          <span className="pointer-events-none absolute left-1/2 top-full mt-1 w-max -translate-x-1/2 whitespace-nowrap rounded border border-white/15 bg-[#171717]/95 px-2 py-1 text-[10px] leading-tight">
                            <span className="text-[#FCA5A5]"><strong className="text-white">{formatMetric(reading.fat, '%')}</strong> gordura</span>
                            <span className="mx-1 text-white/40">·</span>
                            <span className="text-[#86EFAC]"><strong className="text-white">{formatMetric(reading.muscle, ' kg')}</strong> músculo</span>
                          </span>
                        ) : null}
                      </span>
                    )
                  })}
                </div>
              </div>

              <div className="mt-4 flex w-full max-w-[260px] items-stretch gap-1.5">
                <select
                  aria-label="Modelo ilustrado"
                  value={sex ?? ''}
                  onChange={(event) => {
                    const next = isSex(event.target.value) ? event.target.value : null
                    persistIllustrationChoice(next, biotype)
                  }}
                  disabled={saving}
                  className="flex-1 rounded-md border border-white/15 bg-[#292524] px-2 py-1.5 text-[11px] text-white outline-none transition-colors focus:border-[#F87171]"
                >
                  <option value="">Não informado</option>
                  <option value="male">Masculino</option>
                  <option value="female">Feminino</option>
                </select>
                <select
                  aria-label="Biotipo ilustrado"
                  value={biotype}
                  onChange={(event) => {
                    const next = isBiotype(event.target.value) ? event.target.value : 'mid'
                    persistIllustrationChoice(sex, next)
                  }}
                  disabled={saving}
                  className="flex-1 rounded-md border border-white/15 bg-[#292524] px-2 py-1.5 text-[11px] text-white outline-none transition-colors focus:border-[#F87171]"
                >
                  <option value="lean">Leve</option>
                  <option value="mid">Intermediário</option>
                  <option value="large">Maior volume</option>
                </select>
              </div>
              {sexSelectionNote && <p role="status" className="mt-2 text-center text-[10px] text-[#FCA5A5]">{sexSelectionNote}</p>}
              <p className="mt-2 max-w-[260px] text-center text-[10px] text-[#78716C]">
                Modelo anatômico ilustrativo da região avaliada. {SEX_LABELS[sex ?? 'male']} · {BIOTYPE_LABELS[biotype]}.
              </p>

              <div className="mt-4 flex items-center justify-center gap-4 text-[10px] uppercase text-[#A8A29E]"><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#F87171]" /> Gordura</span><span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full border-2 border-[#86EFAC]" /> Músculo</span></div>
            </div>

            <div className="order-3">
              <p className="pb-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#78716C] xl:text-right">Lado direito</p>
              <SegmentReading title="Braço direito" fat={readings['braço direito'].fat} muscle={readings['braço direito'].muscle} align="right" />
              <SegmentReading title="Perna direita" fat={readings['perna direita'].fat} muscle={readings['perna direita'].muscle} align="right" />
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
