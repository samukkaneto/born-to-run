'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, FileSpreadsheet, Layers3, LoaderCircle, LockKeyhole, Trash2, Upload, Users } from 'lucide-react'
import { importWorkoutPlan } from '@/lib/actions/admin'
import { parseWorkoutWorkbook, type ImportedWorkoutDraft } from '@/lib/workouts/workbook-import'
import { TRAINING_TYPES, TRAINING_TYPE_VISUALS, type TrainingType } from '@/lib/workouts/training-types'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import type { MemberProfile, TrainingGroup } from '@/types'

export default function WorkoutWorkbookImporter({
  members,
  groups,
  preferredAthleteId,
}: {
  members: MemberProfile[]
  groups: TrainingGroup[]
  preferredAthleteId?: string
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [reading, setReading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const [drafts, setDrafts] = useState<ImportedWorkoutDraft[]>([])
  const [cycleName, setCycleName] = useState('')
  const [memberIds, setMemberIds] = useState<string[]>([])
  const [groupIds, setGroupIds] = useState<string[]>([])

  const eligibleMembers = useMemo(
    () => members.filter((member) => member.membership_status === 'active'),
    [members],
  )
  const eligibleGroups = useMemo(
    () => groups.filter((group) => !group.archived_at),
    [groups],
  )

  function toggle(
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    id: string,
    checked: boolean,
  ) {
    setter((current) => checked ? [...new Set([...current, id])] : current.filter((value) => value !== id))
  }

  function updateDraft(key: string, field: keyof ImportedWorkoutDraft, value: string) {
    setDrafts((current) => current.map((draft) => (
      draft.key === key ? { ...draft, [field]: value } : draft
    )))
  }

  async function handleFile(file: File | undefined) {
    if (!file) return
    setError('')
    setDrafts([])
    setFileName(file.name)
    if (!/\.xlsx$/i.test(file.name)) {
      setError('Envie a planilha original no formato XLSX.')
      return
    }
    setReading(true)
    try {
      const imported = await parseWorkoutWorkbook(await file.arrayBuffer(), file.name)
      setDrafts(imported)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível ler a planilha.')
    } finally {
      setReading(false)
    }
  }

  async function publish() {
    setError('')
    if (cycleName.trim().length < 3) {
      setError('Informe um nome para o mesociclo.')
      return
    }
    if (memberIds.length === 0 && groupIds.length === 0) {
      setError('Escolha ao menos um atleta ou grupo antes de publicar.')
      return
    }
    setPublishing(true)
    try {
      const result = await importWorkoutPlan(
        cycleName,
        drafts.map((draft) => ({
          scheduled_date: draft.scheduledDate,
          title: draft.title,
          description: draft.description,
          objective: draft.objective,
          training_type: draft.trainingType,
        })),
        memberIds,
        groupIds,
      )
      if (result.error) {
        setError(result.error)
        return
      }
      toast('success', `${result.count ?? drafts.length} treinos prescritos foram publicados.`)
      setDrafts([])
      setFileName('')
      setCycleName('')
      setMemberIds([])
      setGroupIds([])
      setOpen(false)
    } catch {
      setError('Não foi possível publicar o ciclo de treinos.')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <section className="overflow-hidden rounded-xl border border-[#D6B75C] bg-[#FFFBEB]">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-[0.08em] text-[#78350F]"><FileSpreadsheet size={17} aria-hidden="true" /> Importar cronograma por planilha</p>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#57534E]">O arquivo é lido no seu navegador. Confira a prévia, escolha os destinatários e publique todos os dias como treinos prescritos privados.</p>
        </div>
        <button type="button" onClick={() => {
          if (!open && preferredAthleteId) setMemberIds([preferredAthleteId])
          setOpen((current) => !current)
        }} className="btn-secondary shrink-0" aria-expanded={open}>
          <Upload size={16} aria-hidden="true" /> {open ? 'Fechar importação' : 'Importar XLSX'}
        </button>
      </div>

      {open && (
        <div className="space-y-5 border-t border-[#E7D9A7] bg-white p-5">
          <div>
            <label htmlFor="workout-workbook" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Planilha do mesociclo</label>
            <input id="workout-workbook" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => void handleFile(event.target.files?.[0])} disabled={reading || publishing} className="input-base file:mr-3 file:rounded-md file:border-0 file:bg-[#171717] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-[#57534E]"><LockKeyhole size={13} className="mt-0.5 shrink-0" aria-hidden="true" /> Leitura local e privada · XLSX de até 12 MB. Nada é publicado antes da sua confirmação.</p>
          </div>

          {reading && <p role="status" className="flex items-center gap-2 rounded-lg border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-sm text-[#1E40AF]"><LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> Lendo semanas, datas, cores e descrições…</p>}
          {error && <p role="alert" className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p>}

          {drafts.length > 0 && (
            <>
              <div role="status" className="flex items-center gap-2 rounded-lg border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-sm text-[#166534]"><CheckCircle2 size={16} aria-hidden="true" /> {drafts.length} treino(s) reconhecido(s) em “{fileName}”. Revise antes de publicar.</div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <label htmlFor="import-cycle-name" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-[#57534E]">Nome do mesociclo</label>
                  <input id="import-cycle-name" value={cycleName} onChange={(event) => setCycleName(event.target.value)} maxLength={120} className="input-base" placeholder="Ex: Base · Agosto 2026" />
                </div>
                <fieldset className="rounded-lg border border-[#E5E1D8] p-3">
                  <legend className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#57534E]"><Layers3 size={13} className="mr-1 inline" aria-hidden="true" /> Grupos</legend>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {eligibleGroups.length ? eligibleGroups.map((group) => <label key={group.id} className="flex min-h-10 items-center gap-2 rounded-md px-2 text-sm hover:bg-[#FAFAF9]"><input type="checkbox" checked={groupIds.includes(group.id)} onChange={(event) => toggle(setGroupIds, group.id, event.target.checked)} className="accent-[#DC2626]" /> {group.name}</label>) : <p className="px-2 py-3 text-xs text-[#78716C]">Nenhum grupo ativo.</p>}
                  </div>
                </fieldset>
                <fieldset className="rounded-lg border border-[#E5E1D8] p-3">
                  <legend className="px-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#57534E]"><Users size={13} className="mr-1 inline" aria-hidden="true" /> Atletas</legend>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {eligibleMembers.length ? eligibleMembers.map((member) => <label key={member.user_id} className="flex min-h-10 items-center gap-2 rounded-md px-2 text-sm hover:bg-[#FAFAF9]"><input type="checkbox" checked={memberIds.includes(member.user_id)} onChange={(event) => toggle(setMemberIds, member.user_id, event.target.checked)} className="accent-[#DC2626]" /> <span className="min-w-0 flex-1 truncate">{member.full_name}</span>{member.role !== 'member' && <span className="badge badge-gray shrink-0">{member.role === 'admin' ? 'Admin · atleta' : 'Treinador · atleta'}</span>}</label>) : <p className="px-2 py-3 text-xs text-[#78716C]">Nenhum atleta ativo.</p>}
                  </div>
                </fieldset>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.06em] text-[#171717]">Prévia editável</h3>
                  <span className="text-xs text-[#78716C]">Treino prescrito, não atividade concluída</span>
                </div>
                {drafts.map((draft) => {
                  const visual = TRAINING_TYPE_VISUALS[draft.trainingType]
                  return (
                    <article key={draft.key} className="relative grid gap-3 overflow-hidden rounded-xl border border-[#E5E1D8] p-4 sm:grid-cols-[130px_1fr_auto]" style={{ borderLeftColor: visual.color, borderLeftWidth: 6 }}>
                      <div className="text-xs text-[#57534E]">
                        <p className="flex items-center gap-1.5 font-semibold text-[#171717]"><CalendarDays size={14} aria-hidden="true" /> {formatDate(draft.scheduledDate)}</p>
                        <p className="mt-1">{draft.sourceSheet} · {draft.sourceCell}</p>
                      </div>
                      <div className="grid gap-3">
                        <input value={draft.title} onChange={(event) => updateDraft(draft.key, 'title', event.target.value)} maxLength={160} className="input-base py-2 font-semibold" aria-label={`Título de ${formatDate(draft.scheduledDate)}`} />
                        <textarea value={draft.description} onChange={(event) => updateDraft(draft.key, 'description', event.target.value)} maxLength={5000} rows={2} className="input-base resize-y py-2 text-sm" aria-label={`Descrição de ${formatDate(draft.scheduledDate)}`} />
                        <select value={draft.trainingType} onChange={(event) => updateDraft(draft.key, 'trainingType', event.target.value as TrainingType)} className="input-base bg-white py-2 text-sm" aria-label={`Tipo de ${formatDate(draft.scheduledDate)}`}>
                          {TRAINING_TYPES.map((type) => <option key={type} value={type}>{TRAINING_TYPE_VISUALS[type].label}</option>)}
                        </select>
                      </div>
                      <button type="button" onClick={() => setDrafts((current) => current.filter((item) => item.key !== draft.key))} className="min-h-11 rounded-lg p-2.5 text-[#78716C] hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label={`Remover treino de ${formatDate(draft.scheduledDate)}`}><Trash2 size={17} /></button>
                    </article>
                  )
                })}
              </div>

              <div className="flex flex-col gap-3 rounded-xl bg-[#171717] p-4 text-white sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-[#D6D3D1]">A publicação é atômica: se qualquer item falhar, nenhum treino da planilha será salvo.</p>
                <button type="button" onClick={() => void publish()} disabled={publishing || drafts.length === 0} className="btn-primary shrink-0">{publishing ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : <Upload size={16} aria-hidden="true" />} {publishing ? 'Publicando…' : `Publicar ${drafts.length} treinos`}</button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  )
}
