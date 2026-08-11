import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getTodayCalendarDate } from '@/lib/utils'
import { Dumbbell, Calendar, Target } from 'lucide-react'
import type { Workout } from '@/types'
import { TRAINING_TYPES, TRAINING_TYPE_VISUALS, getTrainingTypeVisual } from '@/lib/workouts/training-types'

const levelColors: Record<string, string> = {
  iniciante:    'badge-green',
  intermediario:'badge-orange',
  avancado:     'badge-red',
}
const levelLabels: Record<string, string> = {
  iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado',
}

export default async function TreinosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = getTodayCalendarDate()

  const [upcomingResult, pastResult, undatedResult] = await Promise.all([
    supabase
      .from('workouts')
      .select('*')
      .gte('scheduled_date', today)
      .order('scheduled_date', { ascending: true }),
    supabase
      .from('workouts')
      .select('*')
      .lt('scheduled_date', today)
      .order('scheduled_date', { ascending: false })
      .limit(10),
    supabase
      .from('workouts')
      .select('*')
      .is('scheduled_date', null)
      .order('created_at', { ascending: false }),
  ])

  if (upcomingResult.error || pastResult.error || undatedResult.error) {
    throw new Error('Não foi possível carregar seus treinos.')
  }

  const upcoming = upcomingResult.data as Workout[]
  const past = pastResult.data as Workout[]
  const undated = undatedResult.data as Workout[]

  function WorkoutCard({ w }: { w: Workout }) {
    const trainingVisual = getTrainingTypeVisual(w.training_type)
    return (
      <article className="card relative flex items-start gap-4 overflow-hidden p-5 transition-transform hover:-translate-y-0.5">
        <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: trainingVisual.color }} aria-hidden="true" />
        <div className="ml-1 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: trainingVisual.background, color: trainingVisual.text }}>
          <Dumbbell size={22} aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-stone-800">{w.title}</h3>
            <div className="flex shrink-0 flex-wrap justify-end gap-1.5">
              <span className="badge" style={{ backgroundColor: trainingVisual.background, borderColor: trainingVisual.border, color: trainingVisual.text }}>{trainingVisual.label}</span>
              <span className={`badge ${levelColors[w.level] || 'badge-gray'}`}>{levelLabels[w.level] || w.level}</span>
            </div>
          </div>
          <p className="text-stone-500 text-sm mt-1 leading-relaxed">{w.description}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            {w.scheduled_date && (
              <span className="flex items-center gap-1.5 text-xs text-stone-400">
                <Calendar size={12} />
                {formatDate(w.scheduled_date)}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-xs text-stone-400">
              <Target size={12} />
              {w.objective}
            </span>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="section-kicker mb-2">Prescrição individual</p>
        <h1 className="font-display text-4xl uppercase leading-none text-stone-900">Meus treinos</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-500">
          Treinos prescritos pelo Prof. Robson Alves para seus objetivos, seu momento e sua evolução.
        </p>
      </div>

      <div className="card p-4">
        <p className="mb-3 font-condensed text-xs font-semibold uppercase tracking-[0.08em] text-stone-600">Entenda as cores</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRAINING_TYPES.map((type) => (
            <div key={type} className="flex items-start gap-2.5 rounded-lg border px-3 py-2" style={{ backgroundColor: TRAINING_TYPE_VISUALS[type].background, borderColor: TRAINING_TYPE_VISUALS[type].border }}>
              <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: TRAINING_TYPE_VISUALS[type].color }} aria-hidden="true" />
              <div><p className="text-xs font-semibold" style={{ color: TRAINING_TYPE_VISUALS[type].text }}>{TRAINING_TYPE_VISUALS[type].label}</p><p className="text-[11px] leading-snug text-stone-600">{TRAINING_TYPE_VISUALS[type].description}</p></div>
            </div>
          ))}
        </div>
      </div>

      {/* Próximos */}
      <section>
        <h2 className="font-display font-bold text-stone-700 mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[var(--color-green)] inline-block" />
          Próximos Treinos
        </h2>
        {upcoming && upcoming.length > 0 ? (
          <div className="space-y-3">
            {upcoming.map(w => <WorkoutCard key={w.id} w={w} />)}
          </div>
        ) : (
          <div className="card p-8 text-center text-stone-400">
            <Dumbbell size={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum treino agendado.</p>
          </div>
        )}
      </section>

      {/* Sem data */}
      {undated && undated.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-stone-700 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-orange)] inline-block" />
            Treinos Gerais
          </h2>
          <div className="space-y-3">
            {undated.map(w => <WorkoutCard key={w.id} w={w} />)}
          </div>
        </section>
      )}

      {/* Passados */}
      {past && past.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-stone-500 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stone-300 inline-block" />
            Treinos Anteriores
          </h2>
          <div className="space-y-3 opacity-70">
            {past.map(w => <WorkoutCard key={w.id} w={w} />)}
          </div>
        </section>
      )}
    </div>
  )
}
