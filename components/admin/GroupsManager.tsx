'use client'

import { useMemo, useState } from 'react'
import { Archive, Layers3, Pencil, Plus, Search, Users } from 'lucide-react'
import { archiveTrainingGroup, saveTrainingGroup } from '@/lib/actions/admin'
import AdminModal from '@/components/admin/AdminModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toaster'
import type { Profile, TrainingGroupWithMembers } from '@/types'

const MEMBER_STATUS_LABELS: Record<Profile['membership_status'], string> = {
  pending: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
  rejected: 'Recusado',
}

export default function GroupsManager({
  groups,
  members,
}: {
  groups: TrainingGroupWithMembers[]
  members: Profile[]
}) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [memberSearch, setMemberSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [modal, setModal] = useState<'create' | TrainingGroupWithMembers | null>(null)
  const [toArchive, setToArchive] = useState<TrainingGroupWithMembers | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const editing = modal && modal !== 'create' ? modal : null

  const existingMemberIds = useMemo(
    () => new Set(
      editing?.training_group_members?.map((membership) => membership.user_id) ?? [],
    ),
    [editing],
  )

  const eligibleMembers = useMemo(
    () => members.filter((member) =>
      member.membership_status === 'active' || existingMemberIds.has(member.user_id),
    ),
    [members, existingMemberIds],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return groups
    return groups.filter((group) =>
      [group.name, group.description].some((value) => (value || '').toLowerCase().includes(query)),
    )
  }, [groups, search])

  const visibleMembers = useMemo(() => {
    const query = memberSearch.trim().toLowerCase()
    if (!query) return eligibleMembers
    return eligibleMembers.filter((member) =>
      [member.full_name, member.cidade].some((value) => (value || '').toLowerCase().includes(query)),
    )
  }, [eligibleMembers, memberSearch])
  function openModal(value: 'create' | TrainingGroupWithMembers) {
    setError('')
    setMemberSearch('')
    setSelectedIds(
      value === 'create'
        ? []
        : value.training_group_members?.map((membership) => membership.user_id) ?? [],
    )
    setModal(value)
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const result = await saveTrainingGroup(editing?.id ?? null, new FormData(event.currentTarget))
      if (result.error) {
        setError(result.error)
        return
      }
      toast('success', editing ? 'Grupo atualizado com sucesso.' : 'Grupo criado com sucesso.')
      setModal(null)
    } catch {
      setError('Não foi possível salvar o grupo. Tente novamente.')
    } finally {
      setWorking(false)
    }
  }

  async function handleArchive() {
    if (!toArchive) return
    setWorking(true)
    try {
      const result = await archiveTrainingGroup(toArchive.id)
      if (result.error) toast('error', result.error)
      else {
        toast('success', 'Grupo arquivado. Os treinos existentes continuam preservados.')
        setToArchive(null)
      }
    } catch {
      toast('error', 'Não foi possível arquivar o grupo.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]" aria-hidden="true" />
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar grupo…" className="input-base pl-10" aria-label="Buscar grupos" />
        </div>
        <button type="button" onClick={() => openModal('create')} className="btn-primary">
          <Plus size={16} aria-hidden="true" /> Novo grupo
        </button>
      </div>

      <div className="space-y-3">
        {filtered.length > 0 ? filtered.map((group) => {
          const count = group.training_group_members?.length ?? 0
          const archived = Boolean(group.archived_at)
          return (
            <article key={group.id} className="card flex items-start gap-4 p-4 sm:p-5">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FEE2E2] sm:flex">
                <Layers3 size={19} className="text-[#DC2626]" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.03em] text-[#171717]">{group.name}</h3>
                  <span className="badge badge-gray"><Users size={11} aria-hidden="true" /> {count} atleta{count === 1 ? '' : 's'}</span>
                  {archived && <span className="badge badge-orange">Arquivado</span>}
                </div>
                <p className="text-sm text-[#57534E]">{group.description || 'Sem descrição.'}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button type="button" onClick={() => openModal(group)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]" aria-label={`Editar grupo ${group.name}`} title={archived ? 'Editar e reativar grupo' : 'Editar grupo'}><Pencil size={16} /></button>
                {!archived && <button type="button" onClick={() => setToArchive(group)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label={`Arquivar grupo ${group.name}`} title="Arquivar grupo"><Archive size={16} /></button>}
              </div>
            </article>
          )
        }) : (
          <div className="card p-10 text-center text-[#57534E]">
            <Layers3 size={28} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
            <p className="text-sm">{groups.length === 0 ? 'Nenhum grupo criado. Organize seus atletas por nível, objetivo ou turma.' : 'Nenhum grupo encontrado.'}</p>
          </div>
        )}
      </div>

      <AdminModal
        open={modal !== null}
        title={editing ? (editing.archived_at ? 'Reativar grupo' : 'Editar grupo') : 'Novo grupo'}
        subtitle="Selecione os atletas que receberão treinos destinados a este grupo."
        onClose={() => !working && setModal(null)}
      >
        <form key={editing?.id ?? 'create'} onSubmit={handleSave} className="space-y-4">
          {selectedIds.map((id) => <input key={id} type="hidden" name="member_ids" value={id} />)}
          <div>
            <label htmlFor="group-name" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Nome do grupo</label>
            <input id="group-name" name="name" defaultValue={editing?.name ?? ''} maxLength={100} required className="input-base" placeholder="Ex: Iniciantes de terça" />
          </div>
          <div>
            <label htmlFor="group-description" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Descrição</label>
            <textarea id="group-description" name="description" defaultValue={editing?.description ?? ''} maxLength={500} rows={3} className="input-base resize-none" placeholder="Objetivo, horário ou observações da turma…" />
          </div>
          <fieldset>
            <legend className="mb-1.5 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Atletas</legend>
            <div className="relative mb-2">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#78716C]" aria-hidden="true" />
              <input type="search" value={memberSearch} onChange={(event) => setMemberSearch(event.target.value)} className="input-base pl-9 text-sm" placeholder="Buscar atleta…" aria-label="Buscar atleta para o grupo" />
            </div>
            <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[#E5E1D8] p-2">
              {visibleMembers.length > 0 ? visibleMembers.map((member) => (
                <label key={member.user_id} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-[#44403C] hover:bg-[#FAFAF9]">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(member.user_id)}
                    onChange={(event) => setSelectedIds((current) =>
                      event.target.checked
                        ? [...new Set([...current, member.user_id])]
                        : current.filter((id) => id !== member.user_id),
                    )}
                    className="h-4 w-4 accent-[#DC2626]"
                  />
                  <span className="min-w-0 flex-1 truncate font-medium">{member.full_name}</span>
                  {member.membership_status !== 'active' && (
                    <span className="badge badge-gray shrink-0">
                      {MEMBER_STATUS_LABELS[member.membership_status]}
                    </span>
                  )}
                  {member.cidade && <span className="text-xs text-[#57534E]">{member.cidade}</span>}
                </label>
              )) : <p className="p-4 text-center text-sm text-[#57534E]">Nenhum atleta disponível encontrado.</p>}
            </div>
          </fieldset>
          {error && <p role="alert" className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p>}
          <button type="submit" disabled={working} className="btn-primary w-full sm:w-auto">{working ? 'Salvando…' : editing?.archived_at ? 'Salvar e reativar' : 'Salvar grupo'}</button>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={toArchive !== null}
        title="Arquivar grupo"
        description={toArchive ? `O grupo “${toArchive.name}” deixará de receber novas atribuições. O histórico será preservado.` : ''}
        confirmLabel="Arquivar grupo"
        loadingLabel="Arquivando…"
        loading={working}
        onConfirm={handleArchive}
        onCancel={() => !working && setToArchive(null)}
      />
    </div>
  )
}
