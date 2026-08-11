import { redirect } from 'next/navigation'
import Image from 'next/image'
import { Activity, ArrowDownRight, ArrowRight, ArrowUpRight, ClipboardList, Droplets, ExternalLink, Scale, ShieldCheck, UserRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createMediaUrl } from '@/lib/supabase/media'
import { MEMBER_PROFILE_COLUMNS } from '@/lib/data/profiles'
import { formatDate } from '@/lib/utils'
import type { BodyAssessment } from '@/types'

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
      .select('*')
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

  const assessments = (assessmentsResult.data ?? []) as BodyAssessment[]
  const latest = assessments[0]
  const previous = assessments[1]
  const latestSourceUrl = await createMediaUrl(supabase, 'assessment-files', latest?.source_path)
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard icon={Scale} label="Peso" value={value(latest.weight_kg, ' kg')} />
              <MetricCard icon={Activity} label="Gordura corporal" value={value(latest.body_fat_pct, '%')} />
              <MetricCard icon={Activity} label="Massa muscular" value={value(latest.muscle_mass_kg, ' kg')} />
              <MetricCard icon={Droplets} label="Água corporal" value={value(latest.body_water_pct, '%')} />
              <MetricCard icon={Activity} label="Gordura visceral" value={value(latest.visceral_fat_level)} />
              <MetricCard icon={Activity} label="IMC" value={value(latest.bmi)} />
              <MetricCard icon={Activity} label="Idade metabólica" value={latest.metabolic_age === null ? '—' : `${latest.metabolic_age} anos`} />
              <MetricCard icon={Activity} label="Massa óssea" value={value(latest.bone_mass_kg, ' kg')} />
              <MetricCard icon={Activity} label="Metabolismo basal" value={latest.basal_metabolic_rate === null ? '—' : `${latest.basal_metabolic_rate} kcal`} />
              <MetricCard icon={Activity} label="Classificação física" value={value(latest.physique_rating)} />
            </div>
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
            {latestSourceUrl && <a href={latestSourceUrl} target="_blank" rel="noreferrer" className="btn-outline mt-4 inline-flex text-sm"><ExternalLink size={15} aria-hidden="true" /> Ver arquivo original da Tanita</a>}
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
