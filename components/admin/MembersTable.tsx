'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  ExternalLink,
} from 'lucide-react'
import { deleteMember, toggleAdminRole } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { Profile } from '@/types'

type PendingAction =
  | { kind: 'remove'; member: Profile }
  | { kind: 'role'; member: Profile }
  | null

/** Tabela de membros do painel do treinador: busca, "Ver perfil",
 *  promover/rebaixar admin e remoção — tudo com confirmação + toasts. */
export default function MembersTable({
  members,
  currentUserId,
}: {
  members: Profile[]
  currentUserId: string
}) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [pending, setPending] = useState<PendingAction>(null)
  const [working, setWorking] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return members
    return members.filter(
      (m) =>
        (m.full_name || '').toLowerCase().includes(q) ||
        (m.cidade || '').toLowerCase().includes(q) ||
        (m.objetivo || '').toLowerCase().includes(q),
    )
  }, [members, search])

  async function handleConfirm() {
    if (!pending) return
    setWorking(true)
    const { kind, member } = pending
    const result =
      kind === 'remove'
        ? await deleteMember(member.user_id)
        : await toggleAdminRole(member.user_id, member.role)
    setWorking(false)
    setPending(null)
    if (result?.error) {
      toast('error', result.error)
    } else if (kind === 'remove') {
      toast('success', `${member.full_name || 'Membro'} foi removido(a) da equipe.`)
    } else {
      toast(
        'success',
        member.role === 'admin'
          ? `${member.full_name || 'Membro'} não é mais admin.`
          : `${member.full_name || 'Membro'} agora é admin.`,
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Busca */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]"
          aria-hidden="true"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar membro por nome, cidade ou objetivo…"
          className="input-base pl-10"
          aria-label="Buscar membros"
        />
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#E5E1D8] bg-[#FAFAF9]">
                <th className="px-5 py-3 text-left font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                  Membro
                </th>
                <th className="hidden px-5 py-3 text-left font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C] md:table-cell">
                  Cidade
                </th>
                <th className="hidden px-5 py-3 text-left font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C] md:table-cell">
                  Cadastro
                </th>
                <th className="px-5 py-3 text-left font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                  Função
                </th>
                <th className="px-5 py-3 text-right font-condensed text-xs font-semibold uppercase tracking-[0.12em] text-[#78716C]">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F4]">
              {filtered.map((m) => {
                const initials = (m.full_name || 'A')
                  .split(' ')
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()
                const isSelf = m.user_id === currentUserId
                return (
                  <tr key={m.id} className="transition-colors hover:bg-[#FAFAF9]">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#FEE2E2]">
                          {m.avatar_url ? (
                            <Image
                              src={m.avatar_url}
                              alt={m.full_name}
                              width={36}
                              height={36}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-xs font-bold text-[#DC2626]">
                              {initials}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#171717]">
                            {m.full_name || '—'}
                            {isSelf && (
                              <span className="ml-2 text-xs font-normal text-[#A8A29E]">
                                (você)
                              </span>
                            )}
                          </p>
                          <p className="max-w-[180px] truncate text-xs text-[#A8A29E]">
                            {m.objetivo || 'Sem objetivo definido'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 text-[#57534E] md:table-cell">
                      {m.cidade || '—'}
                    </td>
                    <td className="hidden px-5 py-3 text-[#57534E] md:table-cell">
                      {formatDate(m.created_at)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`badge ${m.role === 'admin' ? 'badge-solid-red' : 'badge-gray'}`}>
                        {m.role === 'admin' ? 'Admin' : 'Membro'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/membros/${m.user_id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 font-condensed text-xs font-semibold uppercase tracking-[0.06em] text-[#57534E] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]"
                        >
                          <ExternalLink size={13} aria-hidden="true" />
                          <span className="hidden lg:inline">Ver perfil</span>
                        </Link>
                        {!isSelf && (
                          <>
                            <button
                              type="button"
                              onClick={() => setPending({ kind: 'role', member: m })}
                              className="rounded-lg p-2 text-[#A8A29E] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]"
                              aria-label={
                                m.role === 'admin'
                                  ? `Remover ${m.full_name} de admin`
                                  : `Tornar ${m.full_name} admin`
                              }
                              title={m.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                            >
                              {m.role === 'admin' ? (
                                <Shield size={15} />
                              ) : (
                                <ShieldCheck size={15} />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setPending({ kind: 'remove', member: m })}
                              className="rounded-lg p-2 text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                              aria-label={`Remover ${m.full_name} da equipe`}
                              title="Remover da equipe"
                            >
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-12 text-center text-[#A8A29E]">
              <Users size={28} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
              <p className="text-sm">
                {members.length === 0
                  ? 'Nenhum membro cadastrado ainda.'
                  : 'Nenhum membro encontrado com essa busca.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirmação */}
      <ConfirmDialog
        open={pending !== null}
        title={pending?.kind === 'remove' ? 'Confirmar remoção' : 'Confirmar alteração de função'}
        description={
          pending?.kind === 'remove'
            ? `${pending.member.full_name || 'Este membro'} perderá o acesso à área da equipe. Esta ação exige confirmação e não pode ser desfeita.`
            : pending?.kind === 'role'
              ? pending.member.role === 'admin'
                ? `${pending.member.full_name || 'Este membro'} deixará de ter acesso ao painel do treinador.`
                : `${pending.member.full_name || 'Este membro'} passará a ter acesso total ao painel do treinador.`
              : ''
        }
        confirmLabel={pending?.kind === 'remove' ? 'Remover membro' : 'Confirmar'}
        loading={working}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  )
}
