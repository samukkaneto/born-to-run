import { redirect } from 'next/navigation'
import { Activity, ClipboardList, Droplets, ExternalLink, Scale, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createMediaUrl } from '@/lib/supabase/media'
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

  const { data, error } = await supabase
    .from('body_assessments')
    .select('*')
    .eq('athlete_user_id', user.id)
    .order('assessed_at', { ascending: false })
  if (error) throw new Error('Não foi possível carregar suas avaliações.')

  const assessments = (data ?? []) as BodyAssessment[]
  const latest = assessments[0]
  const latestSourceUrl = await createMediaUrl(supabase, 'assessment-files', latest?.source_path)

  return (
    <div className="mx-auto max-w-4xl animate-fade-in space-y-8">
      <div>
        <p className="section-kicker mb-3">Minha evolução</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
          Avaliações <span className="text-[#DC2626]">físicas</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#57534E]">
          Acompanhe os resultados registrados pelo Prof. Robson Alves nas avaliações de bioimpedância.
        </p>
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
