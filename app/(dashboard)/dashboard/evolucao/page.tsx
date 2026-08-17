import { redirect } from 'next/navigation'
import { Activity, Gauge, Route, TrendingUp } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPace, summarizeEvolution, summarizePersonalBests } from '@/lib/evolution'
import PersonalBestGrid from '@/components/evolution/PersonalBestGrid'
import { formatDate } from '@/lib/utils'

export default async function EvolucaoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [postsResult, racesResult, assessmentsResult] = await Promise.all([
    supabase.from('posts').select('distance_km, duration_minutes, created_at').eq('user_id', user.id).not('distance_km', 'is', null).order('created_at'),
    supabase.from('race_results').select('distance_km, duration_seconds, event_date').eq('athlete_user_id', user.id).order('event_date'),
    supabase.from('body_assessments').select('assessed_at, weight_kg, body_fat_pct, muscle_mass_kg').eq('athlete_user_id', user.id).order('assessed_at'),
  ])

  const activities = [
    ...(postsResult.data ?? []).map((post) => ({ distanceKm: Number(post.distance_km), durationMinutes: post.duration_minutes ? Number(post.duration_minutes) : null, createdAt: post.created_at, source: 'atividade' as const })),
    ...(racesResult.data ?? []).map((race) => ({ distanceKm: Number(race.distance_km), durationMinutes: race.duration_seconds ? Number(race.duration_seconds) / 60 : null, createdAt: race.event_date, source: 'prova' as const })),
  ]
  const summary = summarizeEvolution(activities)
  const personalBests = summarizePersonalBests(activities)
  const maxMonth = Math.max(...summary.months.map((month) => month.distanceKm), 1)
  const assessments = assessmentsResult.data ?? []
  const firstAssessment = assessments.at(0)
  const latestAssessment = assessments.at(-1)
  const unavailable = [postsResult.error && 'atividades', racesResult.error && 'provas', assessmentsResult.error && 'avaliações'].filter(Boolean)

  const metrics = [
    { label: 'Atividades', value: String(summary.activityCount), icon: Activity },
    { label: 'Distância total', value: `${summary.totalDistanceKm.toFixed(1)} km`, icon: Route },
    { label: 'Maior distância', value: `${summary.longestDistanceKm.toFixed(1)} km`, icon: TrendingUp },
    { label: 'Melhor ritmo', value: formatPace(summary.bestPace), icon: Gauge },
  ]

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-fade-in">
      <header>
        <p className="section-kicker mb-3">Meu desempenho</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">Evolução do <span className="text-[#DC2626]">atleta</span></h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#57534E]">Sua trajetória reúne atividades, provas e avaliações corporais em uma visão privada.</p>
      </header>

      {unavailable.length > 0 && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">Alguns dados estão temporariamente indisponíveis: {unavailable.join(', ')}.</p>}

      <section aria-label="Resumo da evolução" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-4 sm:p-5">
            <Icon size={19} className="mb-4 text-[#DC2626]" aria-hidden="true" />
            <p className="font-display text-2xl text-[#171717] sm:text-3xl">{value}</p>
            <p className="mt-1 text-xs uppercase text-[#78716C]">{label}</p>
          </div>
        ))}
      </section>

      <section className="border-y border-[#E7E5E4] py-7">
        <h2 className="font-condensed text-xl font-semibold uppercase text-[#171717]">Distância nos últimos 6 meses</h2>
        <div className="mt-6 grid h-56 grid-cols-6 items-end gap-2 sm:gap-4" aria-label="Gráfico mensal de distância">
          {summary.months.map((month) => (
            <div key={month.key} className="flex h-full flex-col items-center justify-end gap-2">
              <span className="text-xs font-semibold text-[#57534E]">{month.distanceKm.toFixed(1)}</span>
              <div className="w-full max-w-16 bg-[#DC2626]" style={{ height: `${Math.max((month.distanceKm / maxMonth) * 160, month.distanceKm > 0 ? 8 : 2)}px` }} />
              <span className="text-xs uppercase text-[#78716C]">{month.label}</span>
            </div>
          ))}
        </div>
      </section>

      <PersonalBestGrid records={personalBests} />

      <section>
        <h2 className="font-condensed text-xl font-semibold uppercase text-[#171717]">Composição corporal</h2>
        {latestAssessment ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Peso atual', current: latestAssessment.weight_kg, initial: firstAssessment?.weight_kg, unit: 'kg' },
              { label: 'Gordura corporal', current: latestAssessment.body_fat_pct, initial: firstAssessment?.body_fat_pct, unit: '%' },
              { label: 'Massa muscular', current: latestAssessment.muscle_mass_kg, initial: firstAssessment?.muscle_mass_kg, unit: 'kg' },
            ].map((item) => {
              const delta = item.current != null && item.initial != null ? Number(item.current) - Number(item.initial) : null
              return <div key={item.label} className="border-l-2 border-[#DC2626] pl-4"><p className="text-xs uppercase text-[#78716C]">{item.label}</p><p className="mt-1 font-display text-2xl text-[#171717]">{item.current == null ? '—' : `${Number(item.current).toFixed(1)} ${item.unit}`}</p><p className="mt-1 text-xs text-[#57534E]">{delta === null ? 'Sem comparação' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} ${item.unit} desde a primeira avaliação`}</p></div>
            })}
            <p className="text-xs text-[#78716C] sm:col-span-3">Última avaliação: {formatDate(latestAssessment.assessed_at)}</p>
          </div>
        ) : <p className="mt-3 text-sm text-[#57534E]">Sua evolução corporal aparecerá após a primeira avaliação.</p>}
      </section>
    </div>
  )
}
