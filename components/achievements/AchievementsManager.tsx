'use client'

import { useState } from 'react'
import {
  Award,
  Check,
  Crown,
  Flag,
  Flame,
  Footprints,
  Gem,
  Medal,
  Mountain,
  Pencil,
  Plus,
  Rocket,
  Route,
  Sparkles,
  Star,
  Timer,
  Trash2,
  Trophy,
  Zap,
} from 'lucide-react'
import AdminModal from '@/components/admin/AdminModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toaster'
import { deleteRaceResult, saveRaceResult } from '@/lib/actions/achievements'
import { formatDate, getTodayCalendarDate } from '@/lib/utils'
import { formatRaceDuration, getJourneyProgress, type MissionActivity } from '@/lib/gamification'
import type { Mission, RaceResult } from '@/types'

const MISSION_ICONS = { footprints: Footprints, route: Route, medal: Medal, mountain: Mountain, flame: Flame, trophy: Trophy, crown: Crown, gem: Gem, timer: Timer, zap: Zap, rocket: Rocket, star: Star }
const TIER_STYLES: Record<string, string> = {
  bronze: 'border-amber-700/25 bg-amber-50 text-amber-800',
  silver: 'border-slate-400/40 bg-slate-50 text-slate-700',
  gold: 'border-yellow-500/35 bg-yellow-50 text-yellow-800',
  platinum: 'border-cyan-500/30 bg-cyan-50 text-cyan-800',
  diamond: 'border-violet-500/30 bg-violet-50 text-violet-800',
  elite: 'border-red-500/30 bg-[#171717] text-white',
}

export default function AchievementsManager({
  missions,
  results,
  activities,
  joinedAt,
}: {
  missions: Mission[]
  results: RaceResult[]
  activities: MissionActivity[]
  joinedAt: string
}) {
  const { toast } = useToast()
  const [modal, setModal] = useState<'create' | RaceResult | null>(null)
  const [toDelete, setToDelete] = useState<RaceResult | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const editing = modal && modal !== 'create' ? modal : null
  const progress = getJourneyProgress(missions, activities, joinedAt)
  const completedCodes = new Set(progress.completed.map((mission) => mission.code))
  const featured = results.filter((result) => result.is_featured && result.achievement_kind !== 'participation')

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const result = await saveRaceResult(editing?.id ?? null, new FormData(event.currentTarget))
      if (result.error) {
        setError(result.error)
        return
      }
      toast('success', editing ? 'Resultado atualizado.' : 'Resultado adicionado ao seu histórico.')
      setModal(null)
    } catch {
      setError('Não foi possível salvar o resultado.')
    } finally {
      setWorking(false)
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    setWorking(true)
    const result = await deleteRaceResult(toDelete.id)
    setWorking(false)
    if (result.error) toast('error', result.error)
    else {
      toast('success', 'Resultado removido.')
      setToDelete(null)
    }
  }

  return (
    <div className="space-y-10">
      <section className="overflow-hidden rounded-2xl bg-[#171717] text-white shadow-card-lg" aria-labelledby="journey-level">
        <div className="relative p-6 sm:p-8">
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#DC2626]/25 blur-3xl" aria-hidden="true" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-[0_0_32px_rgba(220,38,38,0.25)]">
              <span className="font-display text-3xl" style={{ color: progress.level.color === '#171717' ? '#FACC15' : progress.level.color }}>{progress.level.symbol}</span>
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-condensed text-xs uppercase tracking-[0.2em] text-[#A8A29E]">Nível de jornada</p>
              <h2 id="journey-level" className="mt-1 font-display text-4xl uppercase leading-none sm:text-5xl">{progress.level.name}</h2>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-[#DC2626] to-[#F97316] transition-all" style={{ width: `${progress.progress}%` }} /></div>
              <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-[#A8A29E]">
                <span>{progress.xp.toLocaleString('pt-BR')} XP · {progress.completed.length} missões</span>
                <span>{progress.nextLevel ? `${progress.nextLevel.minimumXp - progress.xp} XP para ${progress.nextLevel.name}` : 'Nível máximo de jornada'}</span>
              </div>
            </div>
          </div>
          <p className="relative mt-5 text-xs leading-relaxed text-[#D6D3D1]">O nível valoriza missões, constância e tempo de equipe. Velocidade é apenas uma das rotas — atletas de todas as idades podem evoluir.</p>
        </div>
      </section>

      <section aria-labelledby="missions-title">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="section-kicker mb-2">Desafios pessoais</p><h2 id="missions-title" className="font-display text-3xl uppercase text-[#171717]">Missões</h2></div>
          <span className="badge badge-red">{progress.completed.length}/{missions.length}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {missions.map((mission) => {
            const complete = completedCodes.has(mission.code)
            const Icon = MISSION_ICONS[mission.icon_key as keyof typeof MISSION_ICONS] ?? Flag
            return (
              <article key={mission.code} className={`relative overflow-hidden rounded-xl border p-4 ${complete ? TIER_STYLES[mission.tier] : 'border-[#E5E1D8] bg-white text-[#57534E]'}`}>
                <div className="flex items-start gap-3">
                  <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${complete ? 'bg-current/10' : 'bg-[#F5F5F4]'}`}><Icon size={21} aria-hidden="true" /></span>
                  <div className="min-w-0"><h3 className="font-condensed text-sm font-semibold uppercase tracking-[0.04em]">{mission.title}</h3><p className={`mt-1 text-xs leading-relaxed ${complete && mission.tier === 'elite' ? 'text-[#D6D3D1]' : 'opacity-80'}`}>{mission.description}</p></div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-semibold"><span>{mission.points} XP</span>{complete && <span className="inline-flex items-center gap-1"><Check size={13} /> Concluída</span>}</div>
              </article>
            )
          })}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[#78716C]">Uma atividade longa libera automaticamente as missões de distâncias menores. Exemplo: ao registrar uma maratona, 1 km, 3 km, 5 km, 10 km, 15 km, meia maratona e 30 km também são reconhecidos.</p>
      </section>

      <section aria-labelledby="featured-achievements">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div><p className="section-kicker mb-2">Premiações reais</p><h2 id="featured-achievements" className="font-display text-3xl uppercase text-[#171717]">Conquistas principais</h2></div>
          <button type="button" onClick={() => { setError(''); setModal('create') }} className="btn-primary"><Plus size={16} /> Adicionar resultado</button>
        </div>
        {featured.length > 0 ? <div className="grid gap-4 sm:grid-cols-3">{featured.map((result) => <AchievementCard key={result.id} result={result} />)}</div> : <div className="card p-8 text-center text-sm text-[#57534E]"><Award size={30} className="mx-auto mb-3 opacity-40" /><p>Marque uma premiação como principal para destacá-la aqui.</p></div>}
      </section>

      <section aria-labelledby="all-results">
        <h2 id="all-results" className="mb-4 font-display text-3xl uppercase text-[#171717]">Todas as conquistas e provas</h2>
        <div className="space-y-3">
          {results.length > 0 ? results.map((result) => (
            <article key={result.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${result.achievement_kind === 'participation' ? 'bg-[#F5F5F4] text-[#57534E]' : 'bg-[#FEF3C7] text-[#A16207]'}`}>{result.achievement_kind === 'participation' ? <Flag size={20} /> : <Trophy size={20} />}</span>
              <div className="min-w-0 flex-1"><h3 className="font-semibold text-[#171717]">{result.event_name}</h3><p className="mt-1 text-xs text-[#57534E]">{formatDate(result.event_date)} · {Number(result.distance_km).toLocaleString('pt-BR')} km · {formatRaceDuration(result.duration_seconds)}</p>{result.achievement_kind !== 'participation' && <p className="mt-1 text-xs font-semibold uppercase tracking-[0.05em] text-[#A16207]">{result.placement}º lugar {result.achievement_kind === 'overall' ? 'geral' : `na categoria ${result.category_label}`}</p>}</div>
              <div className="flex shrink-0 gap-1 self-end sm:self-auto"><button type="button" onClick={() => { setError(''); setModal(result) }} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4]" aria-label={`Editar ${result.event_name}`}><Pencil size={16} /></button><button type="button" onClick={() => setToDelete(result)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label={`Remover ${result.event_name}`}><Trash2 size={16} /></button></div>
            </article>
          )) : <div className="card p-10 text-center text-sm text-[#57534E]">Adicione a primeira prova do seu histórico.</div>}
        </div>
      </section>

      <AdminModal open={modal !== null} title={editing ? 'Editar resultado' : 'Adicionar prova'} subtitle="Missões são calculadas pela distância e pelo tempo; conquistas são premiações reais." onClose={() => !working && setModal(null)}>
        <form key={editing?.id ?? 'create'} onSubmit={handleSave} className="space-y-4">
          <div><label htmlFor="race-name" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Nome da prova</label><input id="race-name" name="event_name" required minLength={2} maxLength={160} defaultValue={editing?.event_name ?? ''} className="input-base" placeholder="Ex: Corrida de Aniversário de Descalvado" /></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="race-date" className="mb-1.5 block text-xs font-medium text-[#57534E]">Data</label><input id="race-date" name="event_date" type="date" required max={getTodayCalendarDate()} defaultValue={editing?.event_date ?? getTodayCalendarDate()} className="input-base" /></div><div><label htmlFor="race-distance" className="mb-1.5 block text-xs font-medium text-[#57534E]">Distância (km)</label><input id="race-distance" name="distance_km" type="number" inputMode="decimal" min="0.1" max="500" step="0.001" required defaultValue={editing?.distance_km ?? ''} className="input-base" /></div></div>
          <fieldset><legend className="mb-1.5 text-xs font-medium text-[#57534E]">Tempo concluído (opcional)</legend><div className="grid grid-cols-3 gap-2"><DurationInput name="duration_hours" label="Horas" value={editing ? Math.floor((editing.duration_seconds ?? 0) / 3600) : undefined} max={480} /><DurationInput name="duration_minutes" label="Min" value={editing ? Math.floor(((editing.duration_seconds ?? 0) % 3600) / 60) : undefined} max={59} /><DurationInput name="duration_seconds" label="Seg" value={editing ? (editing.duration_seconds ?? 0) % 60 : undefined} max={59} /></div></fieldset>
          <div><label htmlFor="achievement-kind" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Tipo de registro</label><select id="achievement-kind" name="achievement_kind" defaultValue={editing?.achievement_kind ?? 'participation'} className="input-base"><option value="participation">Participação, sem premiação</option><option value="overall">Premiação geral</option><option value="category">Premiação por categoria</option></select><p className="mt-1 text-xs text-[#78716C]">Geral e categoria são conquistas diferentes e aparecem identificadas.</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><div><label htmlFor="placement" className="mb-1.5 block text-xs font-medium text-[#57534E]">Colocação (se premiado)</label><input id="placement" name="placement" type="number" min="1" max="999" defaultValue={editing?.placement ?? ''} className="input-base" placeholder="Ex: 1" /></div><div><label htmlFor="category-label" className="mb-1.5 block text-xs font-medium text-[#57534E]">Categoria (somente categoria)</label><input id="category-label" name="category_label" maxLength={100} defaultValue={editing?.category_label ?? ''} className="input-base" placeholder="Ex: 50–54 anos" /></div></div>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E1D8] p-3 text-sm text-[#44403C]"><input name="is_featured" type="checkbox" defaultChecked={editing?.is_featured ?? false} className="mt-0.5 h-4 w-4 accent-[#DC2626]" /><span><strong className="block text-[#171717]">Conquista principal</strong>Destaque esta premiação no topo do perfil.</span></label>
          <div><label htmlFor="race-notes" className="mb-1.5 block text-xs font-medium text-[#57534E]">Observações</label><textarea id="race-notes" name="notes" maxLength={1000} rows={3} defaultValue={editing?.notes ?? ''} className="input-base resize-none" /></div>
          {error && <p role="alert" className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p>}
          <button type="submit" disabled={working} className="btn-primary w-full sm:w-auto"><Sparkles size={16} /> {working ? 'Salvando…' : 'Salvar resultado'}</button>
        </form>
      </AdminModal>

      <ConfirmDialog open={toDelete !== null} title="Remover resultado" description="O registro será removido do seu histórico e poderá alterar missões e nível." confirmLabel="Remover resultado" loading={working} onConfirm={handleDelete} onCancel={() => !working && setToDelete(null)} />
    </div>
  )
}

function AchievementCard({ result }: { result: RaceResult }) {
  return <article className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#171717] to-[#2E2E2E] p-5 text-white shadow-card-lg"><div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#FACC15]/10" /><Trophy size={25} className="text-[#FACC15]" /><p className="mt-4 font-display text-3xl leading-none text-[#FACC15]">{result.placement}º</p><h3 className="mt-2 font-condensed text-sm font-semibold uppercase tracking-[0.05em]">{result.event_name}</h3><p className="mt-1 text-xs text-[#A8A29E]">{result.achievement_kind === 'overall' ? 'Classificação geral' : result.category_label}</p></article>
}

function DurationInput({ name, label, value, max }: { name: string; label: string; value?: number; max: number }) {
  return <div><label htmlFor={name} className="mb-1 block text-[11px] text-[#78716C]">{label}</label><input id={name} name={name} type="number" inputMode="numeric" min={0} max={max} defaultValue={value || ''} className="input-base" /></div>
}
