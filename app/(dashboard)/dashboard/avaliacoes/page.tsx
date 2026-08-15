import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, ClipboardList, Droplets, ExternalLink, Gauge, Scale, ShieldCheck, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createMediaUrl } from '@/lib/supabase/media'
import { MEMBER_PROFILE_COLUMNS } from '@/lib/data/profiles'
import { formatDate } from '@/lib/utils'
import AssessmentPdfButton from '@/components/assessments/AssessmentPdfButton'
import type { BodyAssessment } from '@/types'

type AssessmentView = BodyAssessment & {
  body_assessment_files: { slot: number; storage_path: string; mime_type: string }[]
}

const BODY_FAT_CATEGORY: Record<string, string> = {
  underfat: 'Abaixo da faixa',
  healthy: 'Saudável',
  overfat: 'Acima da faixa',
  obese: 'Obesidade',
}

const PHYSIQUE_RATING: Record<number, string> = {
  1: 'Obesidade oculta',
  2: 'Obesidade',
  3: 'Constituição sólida',
  4: 'Pouco exercício',
  5: 'Padrão',
  6: 'Musculoso padrão',
  7: 'Magro',
  8: 'Magro e musculoso',
  9: 'Muito musculoso',
}

function value(value: number | null, suffix = '') {
  if (value === null) return '—'
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`
}

export default async function AvaliacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [assessmentsResult, profileResult] = await Promise.all([
    supabase
      .from('body_assessments')
      .select('*, body_assessment_files (*)')
      .eq('athlete_user_id', user.id)
      .order('assessed_at', { ascending: false }),
    supabase
      .from('profiles')
      .select(MEMBER_PROFILE_COLUMNS)
      .eq('user_id', user.id)
      .maybeSingle(),
  ])
  if (assessmentsResult.error || profileResult.error) {
    throw new Error('Não foi possível carregar suas avaliações.')
  }

  const assessments = (assessmentsResult.data ?? []) as AssessmentView[]
  const latest = assessments[0]
  const previous = assessments[1]
  const latestSourceUrl = await createMediaUrl(supabase, 'assessment-files', latest?.source_path)
  const latestSourceFiles = await Promise.all((latest?.body_assessment_files ?? [])
    .sort((a, b) => a.slot - b.slot)
    .map(async (file) => ({ ...file, url: await createMediaUrl(supabase, 'assessment-files', file.storage_path) })))
  const avatarUrl = await createMediaUrl(supabase, 'avatars', profileResult.data?.avatar_url)
  const athleteName = profileResult.data?.full_name ?? 'Atleta Born to Run'

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-8">
      <div className="card overflow-hidden bg-[#171717] text-white">
        <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr] sm:items-center sm:p-8">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[#292929]">
            {avatarUrl ? <Image src={avatarUrl} alt={`Foto de ${athleteName}`} width={96} height={96} className="h-full w-full object-cover" /> : <UserRound size={38} className="text-[#A8A29E]" aria-hidden="true" />}
          </div>
          <div>
            <p className="font-condensed text-xs font-semibold uppercase tracking-[0.18em] text-[#F87171]">Evolução corporal · Born to Run</p>
            <h1 className="mt-2 font-display text-4xl uppercase leading-none sm:text-5xl">{athleteName}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#D6D3D1]">Acompanhamento em português a partir das avaliações presenciais realizadas pelo Prof. Robson Alves.</p>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[#DDD6FE] bg-[#F5F3FF] p-4 text-sm text-[#5B21B6]">
        <ShieldCheck size={19} className="mt-0.5 shrink-0" aria-hidden="true" />
        <p><strong>Histórico privado.</strong> Somente você, o treinador e o administrador conseguem acessar estas informações.</p>
      </div>

      {latest ? (
        <>
          <section aria-labelledby="latest-assessment">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="latest-assessment" className="font-display text-2xl uppercase text-[#171717]">Avaliação mais recente</h2>
                <p className="text-sm text-[#57534E]">Realizada em {formatDate(latest.assessed_at)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
              <MetricCard icon={Scale} label="Peso" value={value(latest.weight_kg, ' kg')} />
              <MetricCard icon={Activity} label="Gordura corporal" value={value(latest.body_fat_pct, '%')} />
              <MetricCard icon={Activity} label="Massa de gordura" value={value(latest.fat_mass_kg, ' kg')} />
              <MetricCard icon={Activity} label="Massa livre de gordura" value={value(latest.fat_free_mass_kg, ' kg')} />
              <MetricCard icon={Activity} label="Massa muscular" value={value(latest.muscle_mass_kg, ' kg')} />
              <MetricCard icon={Droplets} label="Água corporal" value={value(latest.body_water_pct, '%')} />
              <MetricCard icon={Droplets} label="Massa de água" value={value(latest.body_water_mass_kg, ' kg')} />
              <MetricCard icon={Activity} label="Gordura visceral" value={value(latest.visceral_fat_level)} />
              <MetricCard icon={Activity} label="IMC" value={value(latest.bmi)} />
              <MetricCard icon={Activity} label="Idade metabólica" value={latest.metabolic_age === null ? '—' : `${latest.metabolic_age} anos`} />
              <MetricCard icon={Activity} label="Massa óssea" value={value(latest.bone_mass_kg, ' kg')} />
              <MetricCard icon={Activity} label="Metabolismo basal" value={latest.basal_metabolic_rate === null ? '—' : `${latest.basal_metabolic_rate} kcal`} />
              <MetricCard icon={Activity} label="Ingestão calórica diária" value={latest.daily_calorie_intake === null ? '—' : `${latest.daily_calorie_intake} kcal`} />
              <MetricCard icon={Activity} label="Frequência cardíaca" value={latest.heart_rate_bpm === null ? '—' : `${latest.heart_rate_bpm} bpm`} />
              <MetricCard icon={Activity} label="Classificação física" value={latest.physique_rating === null ? '—' : `${latest.physique_rating} · ${PHYSIQUE_RATING[latest.physique_rating] ?? 'Tanita'}`} />
            </div>
            {latest.body_fat_category && <div className="mt-4 flex items-center justify-between gap-3 border-l-4 border-l-[#16A34A] bg-[#F0FDF4] px-4 py-3"><div><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#166534]">Faixa de gordura corporal</p><p className="mt-1 text-lg font-semibold text-[#14532D]">{BODY_FAT_CATEGORY[latest.body_fat_category] ?? latest.body_fat_category}</p></div><Gauge size={24} className="text-[#16A34A]" aria-hidden="true" /></div>}
            {previous && (
              <div className="mt-5">
                <h3 className="mb-3 font-condensed text-sm font-semibold uppercase tracking-[0.08em] text-[#44403C]">Comparação com {formatDate(previous.assessed_at)}</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <TrendCard label="Peso" current={latest.weight_kg} previous={previous.weight_kg} suffix=" kg" />
                  <TrendCard label="Gordura corporal" current={latest.body_fat_pct} previous={previous.body_fat_pct} suffix=" p.p." />
                  <TrendCard label="Massa muscular" current={latest.muscle_mass_kg} previous={previous.muscle_mass_kg} suffix=" kg" />
                  <TrendCard label="Água corporal" current={latest.body_water_pct} previous={previous.body_water_pct} suffix=" p.p." />
                </div>
                <p className="mt-2 text-xs leading-relaxed text-[#78716C]">As setas mostram apenas a variação entre medições; não representam diagnóstico ou classificação clínica.</p>
              </div>
            )}
            <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
              <section className="border border-[#E5E1D8] bg-white p-5" aria-labelledby="reference-ranges">
                <h3 id="reference-ranges" className="font-condensed text-base font-semibold uppercase text-[#171717]">Faixas de referência</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#78716C]">Versão traduzida da Foto 2. O marcador mostra a posição do resultado na escala visual, sem substituir avaliação profissional.</p>
                <div className="mt-5 space-y-5">
                  <ReferenceBar label="IMC" metricValue={latest.bmi} min={10} max={40} suffix="" />
                  <ReferenceBar label="Gordura corporal" metricValue={latest.body_fat_pct} min={5} max={55} suffix="%" />
                  <ReferenceBar label="Água corporal" metricValue={latest.body_water_pct} min={25} max={75} suffix="%" />
                  <ReferenceBar label="Gordura visceral" metricValue={latest.visceral_fat_level} min={1} max={30} suffix="" />
                </div>
              </section>
              <SegmentalPanel assessment={latest} />
            </div>
            <div className="mt-5 flex flex-wrap items-start gap-3">
              <AssessmentPdfButton assessment={{
                athleteName,
                avatarUrl,
                assessed_at: latest.assessed_at,
                weight_kg: latest.weight_kg,
                body_fat_pct: latest.body_fat_pct,
                muscle_mass_kg: latest.muscle_mass_kg,
                visceral_fat_level: latest.visceral_fat_level,
                body_water_pct: latest.body_water_pct,
                bmi: latest.bmi,
                metabolic_age: latest.metabolic_age,
                bone_mass_kg: latest.bone_mass_kg,
                basal_metabolic_rate: latest.basal_metabolic_rate,
                physique_rating: latest.physique_rating,
                notes: latest.notes,
              }} />
              {latestSourceFiles.map((file) => file.url && <a key={file.slot} href={file.url} target="_blank" rel="noreferrer" className="btn-outline inline-flex text-sm"><ExternalLink size={15} aria-hidden="true" /> Foto {file.slot}</a>)}
              {latestSourceUrl && <a href={latestSourceUrl} target="_blank" rel="noreferrer" className="btn-outline inline-flex text-sm"><ExternalLink size={15} aria-hidden="true" /> Arquivo original antigo</a>}
            </div>
            {latest.notes && (
              <div className="card mt-4 border-l-4 border-l-[#7C3AED] p-5">
                <h3 className="font-condensed text-sm font-semibold uppercase tracking-[0.08em] text-[#171717]">Observações do treinador</h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#57534E]">{latest.notes}</p>
              </div>
            )}
          </section>

          <section aria-labelledby="assessment-history">
            <h2 id="assessment-history" className="mb-4 font-display text-2xl uppercase text-[#171717]">Histórico</h2>
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-sm">
                  <thead className="border-b border-[#E5E1D8] bg-[#FAFAF9] text-left font-condensed text-xs uppercase tracking-[0.08em] text-[#57534E]">
                    <tr><th className="px-4 py-3">Data</th><th className="px-4 py-3">Peso</th><th className="px-4 py-3">Gordura</th><th className="px-4 py-3">Massa muscular</th><th className="px-4 py-3">IMC</th><th className="px-4 py-3">Idade metabólica</th></tr>
                  </thead>
                  <tbody className="divide-y divide-[#F5F5F4]">
                    {assessments.map((assessment) => (
                      <tr key={assessment.id}>
                        <td className="px-4 py-3 font-medium text-[#171717]">{formatDate(assessment.assessed_at)}</td>
                        <td className="px-4 py-3 text-[#57534E]">{value(assessment.weight_kg, ' kg')}</td>
                        <td className="px-4 py-3 text-[#57534E]">{value(assessment.body_fat_pct, '%')}</td>
                        <td className="px-4 py-3 text-[#57534E]">{value(assessment.muscle_mass_kg, ' kg')}</td>
                        <td className="px-4 py-3 text-[#57534E]">{value(assessment.bmi)}</td>
                        <td className="px-4 py-3 text-[#57534E]">{assessment.metabolic_age ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div className="card p-12 text-center text-[#57534E]">
          <ClipboardList size={36} className="mx-auto mb-4 opacity-35" aria-hidden="true" />
          <h2 className="font-condensed text-lg font-semibold uppercase text-[#171717]">Nenhuma avaliação registrada</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed">Quando o treinador realizar e registrar sua primeira avaliação, os resultados aparecerão aqui.</p>
        </div>
      )}
    </div>
  )
}

function TrendCard({
  label,
  current,
  previous,
  suffix,
}: {
  label: string
  current: number | null
  previous: number | null
  suffix: string
}) {
  if (current === null || previous === null) return null
  const delta = Number(current) - Number(previous)
  const Icon = delta > 0 ? ArrowUpRight : delta < 0 ? ArrowDownRight : ArrowRight
  const formatted = Math.abs(delta).toLocaleString('pt-BR', { maximumFractionDigits: 2 })
  return (
    <div className="rounded-xl border border-[#E5E1D8] bg-white p-4">
      <p className="font-condensed text-xs uppercase tracking-[0.08em] text-[#78716C]">{label}</p>
      <p className="mt-2 flex items-center gap-1.5 font-display text-2xl text-[#171717]"><Icon size={18} className="text-[#7C3AED]" aria-hidden="true" />{delta === 0 ? 'Sem alteração' : `${delta > 0 ? '+' : '−'}${formatted}${suffix}`}</p>
    </div>
  )
}

function MetricCard({
  icon: Icon,
  label,
  value: metricValue,
}: {
  icon: typeof Activity
  label: string
  value: string
}) {
  return (
    <div className="card p-5">
      <Icon size={18} className="mb-3 text-[#7C3AED]" aria-hidden="true" />
      <p className="font-display text-2xl leading-none text-[#171717]">{metricValue}</p>
      <p className="mt-2 font-condensed text-xs uppercase tracking-[0.08em] text-[#78716C]">{label}</p>
    </div>
  )
}

function ReferenceBar({
  label,
  metricValue,
  min,
  max,
  suffix,
}: {
  label: string
  metricValue: number | null
  min: number
  max: number
  suffix: string
}) {
  const numeric = metricValue === null ? null : Number(metricValue)
  const position = numeric === null ? 0 : Math.max(0, Math.min(100, ((numeric - min) / (max - min)) * 100))
  return (
    <div>
      <div className="mb-2 flex items-end justify-between gap-2"><span className="text-xs font-semibold text-[#44403C]">{label}</span><strong className="font-display text-xl text-[#171717]">{numeric === null ? '—' : `${numeric.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`}</strong></div>
      <div className="relative h-3 bg-[linear-gradient(90deg,#FCA5A5_0%,#FDE68A_28%,#86EFAC_45%,#86EFAC_66%,#FDE68A_82%,#FCA5A5_100%)]">
        {numeric !== null && <span className="absolute -top-1 h-5 w-1 bg-[#171717]" style={{ left: `calc(${position}% - 2px)` }} aria-hidden="true" />}
      </div>
      <div className="mt-1 flex justify-between text-[10px] uppercase text-[#A8A29E]"><span>Menor</span><span>Referência</span><span>Maior</span></div>
    </div>
  )
}

function SegmentalPanel({ assessment }: { assessment: BodyAssessment }) {
  const segments = [
    ['Braço esquerdo', assessment.segment_left_arm_fat_pct, assessment.segment_left_arm_muscle_kg],
    ['Braço direito', assessment.segment_right_arm_fat_pct, assessment.segment_right_arm_muscle_kg],
    ['Tronco', assessment.segment_trunk_fat_pct, assessment.segment_trunk_muscle_kg],
    ['Perna esquerda', assessment.segment_left_leg_fat_pct, assessment.segment_left_leg_muscle_kg],
    ['Perna direita', assessment.segment_right_leg_fat_pct, assessment.segment_right_leg_muscle_kg],
  ] as const
  const hasSegmentalData = segments.some(([, fat, muscle]) => fat !== null || muscle !== null)
  return (
    <section className="border border-[#E5E1D8] bg-[#171717] p-5 text-white" aria-labelledby="segmental-title">
      <h3 id="segmental-title" className="font-condensed text-base font-semibold uppercase">Análise segmental</h3>
      <p className="mt-1 text-xs leading-relaxed text-[#A8A29E]">Versão em português da Foto 3 · gordura e massa muscular por região.</p>
      {hasSegmentalData ? (
        <div className="mt-5 divide-y divide-white/10">
          <div className="grid grid-cols-[1fr_86px_86px] gap-2 pb-2 text-right text-[10px] font-semibold uppercase text-[#A8A29E]"><span className="text-left">Região</span><span>Gordura</span><span>Músculo</span></div>
          {segments.map(([label, fat, muscle]) => <div key={label} className="grid min-h-12 grid-cols-[1fr_86px_86px] items-center gap-2 py-2 text-right text-sm"><span className="text-left text-[#E7E5E4]">{label}</span><strong className="text-[#FCA5A5]">{value(fat, '%')}</strong><strong className="text-[#86EFAC]">{value(muscle, ' kg')}</strong></div>)}
        </div>
      ) : <p className="mt-8 border border-dashed border-white/20 p-6 text-center text-sm text-[#A8A29E]">Dados segmentais ainda não registrados nesta avaliação.</p>}
    </section>
  )
}
