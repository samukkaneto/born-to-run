import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getTodayCalendarDate } from '@/lib/utils'
import { Dumbbell, Calendar, Target } from 'lucide-react'
import type { Workout } from '@/types'

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
    return (
      <div className="card p-5 flex items-start gap-4 hover:-translate-y-0.5 transition-transform">
        <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Dumbbell size={22} className="text-[var(--color-red)]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display font-bold text-stone-800">{w.title}</h3>
            <span className={`badge ${levelColors[w.level] || 'badge-gray'} flex-shrink-0`}>
              {levelLabels[w.level] || w.level}
            </span>
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
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-black text-stone-900">Treinos 💪</h1>
        <p className="text-stone-500 text-sm mt-1">
          Planos publicados pelo Prof. Robson Alves
        </p>
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
