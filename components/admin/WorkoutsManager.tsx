'use client'

import { useMemo, useState } from 'react'
import {
  Calendar,
  Dumbbell,
  Layers3,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react'
import { createWorkout, deleteWorkout, updateWorkout } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import AdminModal from '@/components/admin/AdminModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import WorkoutWorkbookImporter from '@/components/admin/WorkoutWorkbookImporter'
import { TRAINING_TYPES, TRAINING_TYPE_VISUALS, getTrainingTypeVisual } from '@/lib/workouts/training-types'
import type { MemberProfile, TrainingGroup, WorkoutWithAssignments } from '@/types'

const LEVEL_LABELS: Record<string, string> = {
  iniciante: 'Iniciante',
  intermediario: 'Intermediário',
  avancado: 'Avançado',
}
const LEVEL_BADGES: Record<string, string> = {
  iniciante: 'badge-green',
  intermediario: 'badge-orange',
  avancado: 'badge-red',
}
const MEMBER_STATUS_LABELS: Record<MemberProfile['membership_status'], string> = {
  pending: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
  rejected: 'Recusado',
}

function recipientLabel(workout: WorkoutWithAssignments) {
  const memberCount = workout.workout_assignments?.filter((item) => item.athlete_user_id).length ?? 0
  const groupCount = workout.workout_assignments?.filter((item) => item.group_id).length ?? 0
  const parts = []
  if (groupCount) parts.push(`${groupCount} grupo${groupCount === 1 ? '' : 's'}`)
  if (memberCount) parts.push(`${memberCount} atleta${memberCount === 1 ? '' : 's'}`)
  return parts.join(' + ') || 'Sem destinatários'
}

export default function WorkoutsManager({
  workouts,
  members,
  groups,
}: {
  workouts: WorkoutWithAssignments[]
  members: MemberProfile[]
  groups: TrainingGroup[]
}) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('todos')
  const [memberSearch, setMemberSearch] = useState('')
  const [modal, setModal] = useState<'create' | WorkoutWithAssignments | null>(null)
  const [toDelete, setToDelete] = useState<WorkoutWithAssignments | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [selectedGroups, setSelectedGroups] = useState<string[]>([])
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const editing = modal && modal !== 'create' ? modal : null

  const existingMemberIds = useMemo(
    () => new Set(
      editing?.workout_assignments
        ?.flatMap((assignment) => assignment.athlete_user_id ? [assignment.athlete_user_id] : []) ?? [],
    ),
    [editing],
  )
  const existingGroupIds = useMemo(
    () => new Set(
      editing?.workout_assignments
        ?.flatMap((assignment) => assignment.group_id ? [assignment.group_id] : []) ?? [],
    ),
    [editing],
  )
  const eligibleMembers = useMemo(
    () => members.filter((member) =>
      member.membership_status === 'active' || existingMemberIds.has(member.user_id),
    ),
    [members, existingMemberIds],
  )
  const eligibleGroups = useMemo(
    () => groups.filter((group) => !group.archived_at || existingGroupIds.has(group.id)),
    [groups, existingGroupIds],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return workouts.filter((workout) => {
      if (level !== 'todos' && workout.level !== level) return false
      if (!query) return true
      return [workout.title, workout.description, workout.objective]
        .some((value) => value.toLowerCase().includes(query))
    })
  }, [workouts, search, level])

  const visibleMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase()
    if (!query) return eligibleMembers
    return eligibleMembers.filter((member) =>
      [member.full_name, member.cidade].some((value) => (value || '').toLowerCase().includes(query)),
    )
  }, [eligibleMembers, memberSearch])

  function openEditor(value: 'create' | WorkoutWithAssignments) {
    setError('')
    setMemberSearch('')
    setModal(value)
    if (value === 'create') {
      setSelectedMembers([])
      setSelectedGroups([])
      return
    }
    setSelectedMembers(
      value.workout_assignments
        ?.flatMap((assignment) => assignment.athlete_user_id ? [assignment.athlete_user_id] : []) ?? [],
    )
    setSelectedGroups(
      value.workout_assignments
        ?.flatMap((assignment) => assignment.group_id ? [assignment.group_id] : []) ?? [],
    )
  }

  function toggleSelection(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    id: string,
    checked: boolean,
  ) {
    setter((current) => checked ? [...new Set([...current, id])] : current.filter((value) => value !== id))
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const formData = new FormData(event.currentTarget)
      const result = editing
        ? await updateWorkout(editing.id, formData)
        : await createWorkout(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      toast('success', editing ? 'Treino atualizado com sucesso.' : 'Treino criado com sucesso.')
      setModal(null)
    } catch {
      setError('Não foi possível salvar o treino. Tente novamente.')
    } finally {
      setWorking(false)
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    setWorking(true)
    try {
      const result = await deleteWorkout(toDelete.id)
      if (result.error) toast('error', result.error)
      else {
        toast('success', 'Treino removido com sucesso.')
        setToDelete(null)
      }
    } catch {
      toast('error', 'Não foi possível remover o treino.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-6">
      <WorkoutWorkbookImporter members={members} groups={groups} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" aria-hidden="true" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar treino por título, descrição ou objetivo…" className="input-base pl-10" aria-label="Buscar treinos" />
        </div>
        <select value={level} onChange={(event) => setLevel(event.target.value)} className="input-base bg-white sm:w-48" aria-label="Filtrar por nível">
          <option value="todos">Todos os níveis</option>
          <option value="iniciante">Iniciante</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </select>
        <button type="button" onClick={() => openEditor('create')} className="btn-primary"><Plus size={16} aria-hidden="true" /> Novo treino</button>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map((workout) => (
          <article key={workout.id} className="card relative flex items-start gap-4 overflow-hidden p-4 sm:p-5">
            <span className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: getTrainingTypeVisual(workout.training_type).color }} aria-hidden="true" />
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg sm:flex" style={{ backgroundColor: getTrainingTypeVisual(workout.training_type).background, color: getTrainingTypeVisual(workout.training_type).text }}><Dumbbell size={19} aria-hidden="true" /></div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.03em] text-[#171717]">{workout.title}</h3>
                <span className={`badge ${LEVEL_BADGES[workout.level] || 'badge-gray'}`}>{LEVEL_LABELS[workout.level] || workout.level}</span>
                <span className="badge" style={{ backgroundColor: getTrainingTypeVisual(workout.training_type).background, borderColor: getTrainingTypeVisual(workout.training_type).border, color: getTrainingTypeVisual(workout.training_type).text }}>{getTrainingTypeVisual(workout.training_type).label}</span>
                <span className="badge badge-gray"><Users size={11} aria-hidden="true" /> {recipientLabel(workout)}</span>
              </div>
              <p className="line-clamp-2 text-sm text-[#57534E]">{workout.description}</p>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#57534E]"><Calendar size={11} aria-hidden="true" /> {workout.scheduled_date ? formatDate(workout.scheduled_date) : 'Sem data'} · {workout.objective}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button type="button" onClick={() => openEditor(workout)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]" aria-label={`Editar treino ${workout.title}`}><Pencil size={16} /></button>
              <button type="button" onClick={() => setToDelete(workout)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label={`Remover treino ${workout.title}`}><Trash2 size={16} /></button>
            </div>
          </article>
        )) : (
          <div className="card p-10 text-center text-[#57534E]"><Dumbbell size={28} className="mx-auto mb-3 opacity-40" aria-hidden="true" /><p className="text-sm">{workouts.length === 0 ? 'Nenhum treino cadastrado. Crie a primeira prescrição para um atleta ou grupo.' : 'Nenhum treino encontrado com esses filtros.'}</p></div>
        )}
      </div>

      <AdminModal
        open={modal !== null}
        title={editing ? 'Editar treino' : 'Novo treino'}
        subtitle="Defina o conteúdo e escolha exatamente quem receberá este treino."
        onClose={() => !working && setModal(null)}
      >
        <form key={editing?.id ?? 'create'} onSubmit={handleSave} className="space-y-4">
          {selectedMembers.map((id) => <input key={`member-${id}`} type="hidden" name="member_ids" value={id} />)}
          {selectedGroups.map((id) => <input key={`group-${id}`} type="hidden" name="group_ids" value={id} />)}
          <div><label htmlFor="workout-title" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Título</label><input id="workout-title" name="title" defaultValue={editing?.title ?? ''} maxLength={160} required className="input-base" placeholder="Ex: Treino de velocidade 5 km" /></div>
          <div><label htmlFor="workout-description" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Descrição</label><textarea id="workout-description" name="description" defaultValue={editing?.description ?? ''} maxLength={5000} rows={5} required className="input-base resize-none" placeholder="Descreva aquecimento, séries, pausas e desaquecimento…" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="workout-objective" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Objetivo</label><input id="workout-objective" name="objective" defaultValue={editing?.objective ?? ''} maxLength={500} required className="input-base" placeholder="Ex: Melhorar o pace" /></div>
            <div><label htmlFor="workout-level" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Nível</label><select id="workout-level" name="level" defaultValue={editing?.level ?? 'iniciante'} className="input-base bg-white"><option value="iniciante">Iniciante</option><option value="intermediario">Intermediário</option><option value="avancado">Avançado</option></select></div>
          </div>
          <div>
            <label htmlFor="workout-training-type" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Tipo e cor do treino</label>
            <select id="workout-training-type" name="training_type" defaultValue={editing?.training_type ?? 'easy_moderate'} className="input-base bg-white">
              {TRAINING_TYPES.map((type) => (
                <option key={type} value={type}>{TRAINING_TYPE_VISUALS[type].label} — {TRAINING_TYPE_VISUALS[type].description}</option>
              ))}
            </select>
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Legenda das cores de treino">
              {TRAINING_TYPES.map((type) => (
                <span key={type} className="inline-flex items-center gap-1.5 text-[11px] text-[#57534E]"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TRAINING_TYPE_VISUALS[type].color }} aria-hidden="true" />{TRAINING_TYPE_VISUALS[type].shortLabel}</span>
              ))}
            </div>
          </div>
          <div><label htmlFor="workout-date" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Data opcional</label><input id="workout-date" name="scheduled_date" type="date" defaultValue={editing?.scheduled_date ?? ''} className="input-base" /></div>

          <fieldset className="space-y-3 rounded-xl border border-[#E5E1D8] p-4">
            <legend className="px-1 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Destinatários</legend>
            <p className="rounded-lg border border-[#FECACA] bg-[#FFF7F7] px-3 py-2 text-xs leading-relaxed text-[#991B1B]">
              Privado: somente o treinador e os atletas ou grupos escolhidos poderão ver este treino.
            </p>
            <div className="grid gap-4 pt-2 sm:grid-cols-2">
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#57534E]"><Layers3 size={13} /> Grupos</p>
                  <div className="max-h-44 space-y-1 overflow-y-auto rounded-lg border border-[#E5E1D8] p-2">
                    {eligibleGroups.length > 0 ? eligibleGroups.map((group) => <label key={group.id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#FAFAF9]"><input type="checkbox" checked={selectedGroups.includes(group.id)} onChange={(event) => toggleSelection(setSelectedGroups, group.id, event.target.checked)} className="accent-[#DC2626]" /><span className="min-w-0 flex-1 truncate">{group.name}</span>{group.archived_at && <span className="badge badge-orange shrink-0">Arquivado</span>}</label>) : <p className="p-3 text-center text-xs text-[#57534E]">Crie um grupo na área de membros.</p>}
                  </div>
                </div>
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#57534E]"><Users size={13} /> Atletas</p>
                  <div className="relative mb-2"><Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78716C]" /><input type="search" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} className="input-base py-2 pl-8 text-xs" placeholder="Buscar…" aria-label="Buscar atleta destinatário" /></div>
                  <div className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-[#E5E1D8] p-2">
                    {visibleMembers.length > 0 ? visibleMembers.map((member) => <label key={member.user_id} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-[#FAFAF9]"><input type="checkbox" checked={selectedMembers.includes(member.user_id)} onChange={(event) => toggleSelection(setSelectedMembers, member.user_id, event.target.checked)} className="accent-[#DC2626]" /><span className="min-w-0 flex-1 truncate">{member.full_name}</span>{member.membership_status !== 'active' && <span className="badge badge-gray shrink-0">{MEMBER_STATUS_LABELS[member.membership_status]}</span>}</label>) : <p className="p-3 text-center text-xs text-[#57534E]">Nenhum atleta encontrado.</p>}
                  </div>
                </div>
            </div>
          </fieldset>

          {error && <p role="alert" className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p>}
          <button type="submit" disabled={working} className="btn-primary w-full sm:w-auto">{working ? 'Salvando…' : editing ? 'Salvar alterações' : 'Criar treino'}</button>
        </form>
      </AdminModal>

      <ConfirmDialog open={toDelete !== null} title="Confirmar remoção" description={toDelete ? `O treino “${toDelete.title}” será removido dos destinatários. Esta ação não pode ser desfeita.` : ''} confirmLabel="Remover treino" loadingLabel="Removendo…" loading={working} onConfirm={handleDelete} onCancel={() => !working && setToDelete(null)} />
    </div>
  )
}
