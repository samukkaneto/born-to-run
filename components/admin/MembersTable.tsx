'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  RotateCcw,
  Search,
  Shield,
  ShieldCheck,
  UserX,
  Users,
} from 'lucide-react'
import { setMemberTeamJoinedAt, toggleMemberRole, updateMembershipStatus } from '@/lib/actions/admin'
import { formatDate, getTodayCalendarDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import AdminModal from '@/components/admin/AdminModal'
import type { MemberProfile, MembershipStatus } from '@/types'

type StatusFilter = MembershipStatus | 'all'
type PendingAction =
  | { kind: 'status'; member: MemberProfile; nextStatus: MembershipStatus }
  | { kind: 'role'; member: MemberProfile }
  | null

const STATUS_LABELS: Record<MembershipStatus, string> = {
  pending: 'Pendente',
  active: 'Ativo',
  suspended: 'Suspenso',
  rejected: 'Recusado',
}

const STATUS_BADGES: Record<MembershipStatus, string> = {
  pending: 'badge-orange',
  active: 'badge-green',
  suspended: 'badge-red',
  rejected: 'badge-gray',
}

function actionCopy(action: PendingAction) {
  if (!action) return { title: '', description: '', label: '' }
  const name = action.member.full_name || 'Este membro'
  if (action.kind === 'role') {
    const promoting = action.member.role !== 'coach'
    return {
      title: promoting ? 'Conceder acesso de treinador' : 'Remover acesso de treinador',
      description: promoting
        ? `${name} poderá aprovar membros, gerenciar grupos, publicar treinos privados, avaliações e fotos institucionais.`
        : `${name} continuará na equipe, mas perderá o acesso ao painel do treinador.`,
      label: promoting ? 'Tornar treinador' : 'Remover função',
    }
  }

  const copy: Record<MembershipStatus, { title: string; description: string; label: string }> = {
    active: {
      title: 'Liberar acesso',
      description: `${name} poderá entrar na comunidade, publicar e receber treinos.`,
      label: 'Liberar acesso',
    },
    suspended: {
      title: 'Suspender acesso',
      description: `${name} perderá imediatamente o acesso ao feed, às fotos e aos treinos até ser reativado(a).`,
      label: 'Suspender',
    },
    rejected: {
      title: 'Recusar cadastro',
      description: `O pedido de ${name} será recusado e a área reservada continuará bloqueada.`,
      label: 'Recusar cadastro',
    },
    pending: {
      title: 'Reconsiderar cadastro',
      description: `${name} voltará para a fila de análise do treinador.`,
      label: 'Mover para pendentes',
    },
  }
  return copy[action.nextStatus]
}

export default function MembersTable({
  members,
  currentUserId,
  canManageRoles,
}: {
  members: MemberProfile[]
  currentUserId: string
  canManageRoles: boolean
}) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [pending, setPending] = useState<PendingAction>(null)
  const [tenureMember, setTenureMember] = useState<MemberProfile | null>(null)
  const [tenureError, setTenureError] = useState('')
  const [working, setWorking] = useState(false)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return members.filter((member) => {
      if (status !== 'all' && member.membership_status !== status) return false
      if (!query) return true
      return [member.full_name, member.cidade, member.objetivo]
        .some((value) => (value || '').toLowerCase().includes(query))
    })
  }, [members, search, status])

  async function handleConfirm() {
    if (!pending) return
    setWorking(true)
    try {
      const result = pending.kind === 'role'
        ? await toggleMemberRole(pending.member.user_id)
        : await updateMembershipStatus(pending.member.user_id, pending.nextStatus)

      if (result.error) {
        toast('error', result.error)
      } else {
        toast('success', 'Cadastro atualizado com sucesso.')
        setPending(null)
      }
    } catch {
      toast('error', 'Não foi possível concluir a ação. Tente novamente.')
    } finally {
      setWorking(false)
    }
  }

  async function handleTenureSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!tenureMember) return
    setWorking(true)
    setTenureError('')
    const form = new FormData(event.currentTarget)
    const result = await setMemberTeamJoinedAt(tenureMember.user_id, String(form.get('team_joined_at') ?? ''))
    setWorking(false)
    if (result.error) setTenureError(result.error)
    else {
      toast('success', 'Data de entrada na equipe atualizada.')
      setTenureMember(null)
    }
  }

  const copy = actionCopy(pending)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#78716C]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar membro por nome, cidade ou objetivo…"
            className="input-base pl-10"
            aria-label="Buscar membros"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as StatusFilter)}
          className="input-base bg-white sm:w-48"
          aria-label="Filtrar membros por situação"
        >
          <option value="all">Todas as situações</option>
          <option value="pending">Pendentes</option>
          <option value="active">Ativos</option>
          <option value="suspended">Suspensos</option>
          <option value="rejected">Recusados</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E1D8] bg-[#FAFAF9]">
                <th className="px-5 py-3 text-left font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#57534E]">Membro</th>
                <th className="hidden px-5 py-3 text-left font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#57534E] md:table-cell">Cidade</th>
                <th className="hidden px-5 py-3 text-left font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#57534E] lg:table-cell">Na equipe desde</th>
                <th className="px-5 py-3 text-left font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#57534E]">Acesso</th>
                <th className="px-5 py-3 text-right font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#57534E]">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {filtered.map((member) => {
                const initials = (member.full_name || 'A')
                  .split(' ')
                  .map((name) => name[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
                const isSelf = member.user_id === currentUserId
                const isActive = member.membership_status === 'active'

                return (
                  <tr key={member.id} className="transition-colors hover:bg-[#FAFAF9]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#FEE2E2]">
                          {member.avatar_url ? (
                            <Image src={member.avatar_url} alt={`Foto de ${member.full_name}`} width={36} height={36} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-[#DC2626]">{initials}</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#171717]">
                            {member.full_name || '—'}
                            {isSelf && <span className="ml-2 text-xs font-normal text-[#78716C]">(você)</span>}
                          </p>
                          <p className="max-w-[180px] truncate text-xs text-[#78716C]">{member.objetivo || 'Sem objetivo definido'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-[#57534E] md:table-cell">{member.cidade || '—'}</td>
                    <td className="hidden px-5 py-3 text-[#57534E] lg:table-cell">{formatDate(member.team_joined_at)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col items-start gap-1.5">
                        <span className={`badge ${STATUS_BADGES[member.membership_status]}`}>{STATUS_LABELS[member.membership_status]}</span>
                        <span className={`badge ${member.role === 'coach' ? 'badge-solid-red' : 'badge-gray'}`}>
                          {member.role === 'admin' ? 'Administrador' : member.role === 'coach' ? 'Treinador' : 'Atleta'}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex min-w-max items-center justify-end gap-1">
                        {isActive && (
                          <Link
                            href={`/dashboard/membros/${member.user_id}`}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg px-2.5 py-2 font-condensed text-xs font-semibold uppercase tracking-[0.06em] text-[#57534E] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]"
                          >
                            <ExternalLink size={14} aria-hidden="true" />
                            <span className="hidden xl:inline">Perfil</span>
                          </Link>
                        )}
                        {isActive && (
                          <button type="button" onClick={() => { setTenureError(''); setTenureMember(member) }} className="min-h-11 rounded-lg p-2.5 text-[#57534E] transition-colors hover:bg-[#EFF6FF] hover:text-[#2563EB]" aria-label={`Editar data de entrada de ${member.full_name}`} title="Data de entrada na equipe"><CalendarDays size={17} /></button>
                        )}
                        {!isSelf && member.membership_status === 'pending' && (
                          <>
                            <button type="button" onClick={() => setPending({ kind: 'status', member, nextStatus: 'active' })} className="min-h-11 rounded-lg p-2.5 text-green-700 transition-colors hover:bg-green-50" aria-label={`Aprovar ${member.full_name}`} title="Aprovar cadastro"><CheckCircle2 size={17} /></button>
                            <button type="button" onClick={() => setPending({ kind: 'status', member, nextStatus: 'rejected' })} className="min-h-11 rounded-lg p-2.5 text-[#78716C] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label={`Recusar ${member.full_name}`} title="Recusar cadastro"><UserX size={17} /></button>
                          </>
                        )}
                        {!isSelf && member.membership_status === 'active' && (
                          <button type="button" onClick={() => setPending({ kind: 'status', member, nextStatus: 'suspended' })} className="min-h-11 rounded-lg p-2.5 text-[#78716C] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label={`Suspender ${member.full_name}`} title="Suspender acesso"><Ban size={17} /></button>
                        )}
                        {!isSelf && member.membership_status === 'suspended' && (
                          <button type="button" onClick={() => setPending({ kind: 'status', member, nextStatus: 'active' })} className="min-h-11 rounded-lg p-2.5 text-green-700 transition-colors hover:bg-green-50" aria-label={`Reativar ${member.full_name}`} title="Reativar acesso"><RotateCcw size={17} /></button>
                        )}
                        {!isSelf && member.membership_status === 'rejected' && (
                          <button type="button" onClick={() => setPending({ kind: 'status', member, nextStatus: 'pending' })} className="min-h-11 rounded-lg p-2.5 text-[#57534E] transition-colors hover:bg-[#F5F5F4]" aria-label={`Reconsiderar ${member.full_name}`} title="Reconsiderar cadastro"><RotateCcw size={17} /></button>
                        )}
                        {canManageRoles && !isSelf && isActive && member.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => setPending({ kind: 'role', member })}
                            className="min-h-11 rounded-lg p-2.5 text-[#78716C] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]"
                            aria-label={member.role === 'coach' ? `Remover função de treinador de ${member.full_name}` : `Tornar ${member.full_name} treinador`}
                            title={member.role === 'coach' ? 'Remover função de treinador' : 'Tornar treinador'}
                          >
                            {member.role === 'coach' ? <Shield size={17} /> : <ShieldCheck size={17} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-12 text-center text-[#78716C]">
              <Users size={28} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
              <p className="text-sm">{members.length === 0 ? 'Nenhum cadastro recebido ainda.' : 'Nenhum membro encontrado com esses filtros.'}</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={pending !== null}
        title={copy.title}
        description={copy.description}
        confirmLabel={copy.label}
        loadingLabel="Salvando…"
        loading={working}
        onConfirm={handleConfirm}
        onCancel={() => !working && setPending(null)}
      />
      <AdminModal open={tenureMember !== null} title="Data de entrada na equipe" subtitle="Esta data gera pontos de permanência no nível de jornada." onClose={() => !working && setTenureMember(null)}>
        <form onSubmit={handleTenureSave} className="space-y-4">
          <p className="text-sm text-[#57534E]">Atleta: <strong className="text-[#171717]">{tenureMember?.full_name}</strong></p>
          <div><label htmlFor="team-joined-at" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Entrou na equipe em</label><input id="team-joined-at" name="team_joined_at" type="date" min="2015-01-01" max={getTodayCalendarDate()} required defaultValue={tenureMember?.team_joined_at ?? getTodayCalendarDate()} className="input-base" /></div>
          {tenureError && <p role="alert" className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{tenureError}</p>}
          <button type="submit" disabled={working} className="btn-primary w-full sm:w-auto">{working ? 'Salvando…' : 'Salvar data'}</button>
        </form>
      </AdminModal>
    </div>
  )
}
