'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, Dumbbell, Layers3, LockKeyhole, Target } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { TRAINING_TYPE_VISUALS, getTrainingTypeVisual } from '@/lib/workouts/training-types'
import { addCalendarDays, calendarMonth, cycleProgress, cycleWeek, parseCalendarDate, workoutsByDate } from '@/lib/workouts/mesocycle'
import type { AssignedWorkout } from '@/types'

const WEEK_DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const LEVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}

type View = 'today' | 'calendar' | 'cycle'

export default function AthleteTrainingPlan({
  workouts,
  today,
}: {
  workouts: AssignedWorkout[]
  today: string
}) {
  const [view, setView] = useState<View>('today')
  const [selectedDate, setSelectedDate] = useState(today)
  const byDate = useMemo(() => workoutsByDate(workouts), [workouts])
  const selectedWorkouts = byDate.get(selectedDate) ?? []
  const monthDates = useMemo(() => calendarMonth(selectedDate), [selectedDate])
  const selectedMonth = parseCalendarDate(selectedDate).getUTCMonth()
  const cycles = useMemo(() => {
    const grouped = new Map<string, AssignedWorkout[]>()
    for (const workout of workouts) {
      if (!workout.training_cycle_id) continue
      const current = grouped.get(workout.training_cycle_id) ?? []
      current.push(workout)
      grouped.set(workout.training_cycle_id, current)
    }
    return [...grouped.entries()].map(([id, items]) => ({ id, items }))
      .sort((a, b) => (b.items[0]?.cycle_starts_on ?? '').localeCompare(a.items[0]?.cycle_starts_on ?? ''))
  }, [workouts])
  const currentCycle = cycles.find(({ items }) => {
    const first = items[0]
    return first?.cycle_starts_on && first.cycle_ends_on
      && today >= first.cycle_starts_on && today <= first.cycle_ends_on
  }) ?? cycles[0]

  function moveMonth(amount: number) {
    const current = parseCalendarDate(selectedDate)
    current.setUTCMonth(current.getUTCMonth() + amount, 1)
    setSelectedDate(current.toISOString().slice(0, 10))
  }

  return (
    <div className="space-y-6">
      <header className="overflow-hidden rounded-xl bg-[#171717] text-white">
        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="flex items-center gap-2 font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#FCA5A5]"><LockKeyhole size={14} aria-hidden="true" /> Prescrição individual e privada</p>
            <h1 className="mt-3 font-display text-4xl uppercase leading-none sm:text-5xl">Meu plano de treino</h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#D6D3D1]">Escolha um dia, consulte os detalhes prescritos e acompanhe a visão completa do seu mesociclo.</p>
          </div>
          {currentCycle && currentCycle.items[0]?.cycle_starts_on && currentCycle.items[0]?.cycle_ends_on && (
            <div className="min-w-64 border-t border-white/15 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              <p className="text-xs uppercase text-[#A8A29E]">Mesociclo em foco</p>
              <p className="mt-1 font-condensed text-lg font-semibold uppercase">{currentCycle.items[0].cycle_name}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><span className="block h-full bg-[#DC2626]" style={{ width: `${cycleProgress(currentCycle.items[0].cycle_starts_on, currentCycle.items[0].cycle_ends_on, today)}%` }} /></div>
              <p className="mt-2 text-xs text-[#D6D3D1]">{cycleProgress(currentCycle.items[0].cycle_starts_on, currentCycle.items[0].cycle_ends_on, today)}% do período · {currentCycle.items.length} sessões</p>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 border-b border-[#D6D3D1]" role="tablist" aria-label="Visualização do plano de treino">
        <ViewTab active={view === 'today'} icon={Clock3} label="Hoje" onClick={() => { setView('today'); setSelectedDate(today) }} />
        <ViewTab active={view === 'calendar'} icon={CalendarDays} label="Calendário" onClick={() => setView('calendar')} />
        <ViewTab active={view === 'cycle'} icon={Layers3} label="Mesociclo" onClick={() => setView('cycle')} />
      </div>

      {view !== 'cycle' && (
        <section aria-labelledby="day-heading" className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <div>
            {view === 'calendar' ? (
              <div className="border border-[#E5E1D8] bg-white p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <button type="button" onClick={() => moveMonth(-1)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4]" aria-label="Mês anterior"><ChevronLeft size={18} /></button>
                  <p className="font-condensed text-base font-semibold uppercase text-[#171717]">{parseCalendarDate(selectedDate).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })}</p>
                  <button type="button" onClick={() => moveMonth(1)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4]" aria-label="Próximo mês"><ChevronRight size={18} /></button>
                </div>
                <div className="grid grid-cols-7" aria-hidden="true">{WEEK_DAYS.map((day) => <span key={day} className="pb-2 text-center text-[10px] font-semibold uppercase text-[#78716C]">{day}</span>)}</div>
                <div className="grid grid-cols-7 border-l border-t border-[#E7E5E4]">
                  {monthDates.map((date) => {
                    const dayWorkouts = byDate.get(date) ?? []
                    const active = date === selectedDate
                    const inMonth = parseCalendarDate(date).getUTCMonth() === selectedMonth
                    return (
                      <button key={date} type="button" onClick={() => setSelectedDate(date)} className={`relative aspect-square min-h-11 border-b border-r border-[#E7E5E4] p-1 text-sm ${active ? 'bg-[#171717] text-white' : inMonth ? 'bg-white text-[#171717] hover:bg-[#FAFAF9]' : 'bg-[#FAFAF9] text-[#A8A29E]'}`} aria-label={`${formatDate(date)}${dayWorkouts.length ? `, ${dayWorkouts.length} treino` : ', sem treino'}`}>
                        <span>{parseCalendarDate(date).getUTCDate()}</span>
                        {dayWorkouts.length > 0 && <span className="absolute bottom-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full" style={{ backgroundColor: active ? '#FCA5A5' : getTrainingTypeVisual(dayWorkouts[0].training_type).color }} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="border-l-4 border-l-[#DC2626] bg-[#FFF7F7] p-5">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#991B1B]">Hoje</p>
                <p className="mt-2 font-display text-3xl uppercase text-[#171717]">{formatDate(today)}</p>
                <p className="mt-2 text-sm text-[#57534E]">{selectedWorkouts.length ? `${selectedWorkouts.length} sessão(ões) prescrita(s)` : 'Dia sem sessão prescrita'}</p>
              </div>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#78716C]">Treino prescrito</p>
                <h2 id="day-heading" className="mt-1 font-display text-2xl uppercase text-[#171717]">{formatDate(selectedDate)}</h2>
              </div>
              <div className="flex gap-1">
                <button type="button" onClick={() => setSelectedDate(addCalendarDays(selectedDate, -1))} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4]" aria-label="Dia anterior"><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => setSelectedDate(addCalendarDays(selectedDate, 1))} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4]" aria-label="Próximo dia"><ChevronRight size={18} /></button>
              </div>
            </div>
            {selectedWorkouts.length ? <div className="space-y-3">{selectedWorkouts.map((workout) => <WorkoutDetail key={workout.id} workout={workout} />)}</div> : <EmptyDay />}
          </div>
        </section>
      )}

      {view === 'cycle' && (
        <section aria-labelledby="cycle-heading" className="space-y-7">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#78716C]">Visão geral</p>
            <h2 id="cycle-heading" className="mt-1 font-display text-3xl uppercase text-[#171717]">Mesociclos prescritos</h2>
          </div>
          {cycles.length ? cycles.map(({ id, items }) => {
            const first = items[0]
            const weeks = new Map<number, AssignedWorkout[]>()
            for (const workout of items) {
              if (!workout.scheduled_date || !first.cycle_starts_on) continue
              const week = cycleWeek(first.cycle_starts_on, workout.scheduled_date)
              weeks.set(week, [...(weeks.get(week) ?? []), workout])
            }
            return (
              <article key={id} className="border-t-4 border-t-[#171717] bg-white">
                <div className="grid gap-4 border-x border-b border-[#E5E1D8] p-5 sm:grid-cols-[1fr_auto] sm:items-end">
                  <div><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#DC2626]">{LEVEL_LABELS[first.level] ?? first.level}</p><h3 className="mt-1 font-display text-2xl uppercase text-[#171717]">{first.cycle_name}</h3><p className="mt-2 text-sm text-[#57534E]">{first.cycle_starts_on && formatDate(first.cycle_starts_on)} a {first.cycle_ends_on && formatDate(first.cycle_ends_on)}</p></div>
                  <p className="text-sm font-semibold text-[#171717]">{items.length} sessões · {weeks.size} semanas</p>
                </div>
                <div className="divide-y divide-[#E5E1D8] border-x border-b border-[#E5E1D8]">
                  {[...weeks.entries()].sort(([a], [b]) => a - b).map(([week, weekItems]) => (
                    <div key={week} className="grid gap-3 p-4 sm:grid-cols-[90px_1fr]">
                      <p className="font-condensed text-sm font-semibold uppercase text-[#57534E]">Semana {week}</p>
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{weekItems.map((workout) => <CycleWorkout key={workout.id} workout={workout} onSelect={() => { if (workout.scheduled_date) setSelectedDate(workout.scheduled_date); setView('calendar') }} />)}</div>
                    </div>
                  ))}
                </div>
              </article>
            )
          }) : <EmptyDay message="Nenhum mesociclo foi publicado para você ainda." />}
        </section>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[#E5E1D8] pt-4" aria-label="Cores dos tipos de treino">
        {Object.entries(TRAINING_TYPE_VISUALS).map(([type, visual]) => <span key={type} className="inline-flex items-center gap-1.5 text-xs text-[#57534E]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: visual.color }} />{visual.shortLabel}</span>)}
      </div>
    </div>
  )
}

function ViewTab({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof Clock3; label: string; onClick: () => void }) {
  return <button type="button" role="tab" aria-selected={active} onClick={onClick} className={`flex min-h-12 items-center justify-center gap-2 border-b-2 px-2 text-sm font-semibold ${active ? 'border-[#DC2626] text-[#171717]' : 'border-transparent text-[#78716C] hover:text-[#171717]'}`}><Icon size={16} aria-hidden="true" />{label}</button>
}

function WorkoutDetail({ workout }: { workout: AssignedWorkout }) {
  const visual = getTrainingTypeVisual(workout.training_type)
  return (
    <article className="relative overflow-hidden border border-[#E5E1D8] bg-white p-5" style={{ borderLeftWidth: 6, borderLeftColor: visual.color }}>
      <div className="flex flex-wrap items-center gap-2"><span className="badge" style={{ backgroundColor: visual.background, color: visual.text, borderColor: visual.border }}>{visual.label}</span><span className="badge badge-gray">{LEVEL_LABELS[workout.level] ?? workout.level}</span></div>
      <h3 className="mt-3 font-condensed text-xl font-semibold uppercase text-[#171717]">{workout.title}</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[#44403C]">{workout.description}</p>
      <p className="mt-4 flex items-start gap-2 border-t border-[#E5E1D8] pt-3 text-sm text-[#57534E]"><Target size={15} className="mt-0.5 shrink-0 text-[#DC2626]" aria-hidden="true" /><span><strong className="text-[#171717]">Objetivo:</strong> {workout.objective}</span></p>
    </article>
  )
}

function CycleWorkout({ workout, onSelect }: { workout: AssignedWorkout; onSelect: () => void }) {
  const visual = getTrainingTypeVisual(workout.training_type)
  return <button type="button" onClick={onSelect} className="min-h-24 border-l-4 bg-[#FAFAF9] p-3 text-left hover:bg-[#F5F5F4]" style={{ borderLeftColor: visual.color }}><span className="text-[11px] font-semibold uppercase" style={{ color: visual.text }}>{workout.scheduled_date && formatDate(workout.scheduled_date)}</span><span className="mt-1 block text-sm font-semibold text-[#171717]">{workout.title}</span><span className="mt-1 block text-xs text-[#57534E]">{visual.shortLabel}</span></button>
}

function EmptyDay({ message = 'Nenhum treino prescrito para esta data.' }: { message?: string }) {
  return <div className="border border-dashed border-[#D6D3D1] bg-[#FAFAF9] p-10 text-center text-[#78716C]"><Dumbbell size={28} className="mx-auto mb-3 opacity-40" aria-hidden="true" /><p className="text-sm">{message}</p></div>
}
