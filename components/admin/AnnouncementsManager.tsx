'use client'

import { useMemo, useState } from 'react'
import { Megaphone, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import AdminModal from '@/components/admin/AdminModal'
import AdminForm, { type AdminFormField } from '@/components/admin/AdminForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { Announcement } from '@/types'

const ANNOUNCEMENT_FIELDS: AdminFormField[] = [
  { name: 'title', label: 'Título', type: 'text', required: true, placeholder: 'Ex: Alteração no horário de treino' },
  { name: 'content', label: 'Conteúdo', type: 'textarea', required: true, placeholder: 'Escreva a mensagem para a equipe…' },
]

/** Gestão de comunicados: busca, criação/edição em modal e remoção
 *  com confirmação + toasts. */
export default function AnnouncementsManager({
  announcements,
}: {
  announcements: Announcement[]
}) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<'create' | Announcement | null>(null)
  const [toDelete, setToDelete] = useState<Announcement | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return announcements
    return announcements.filter(
      (a) =>
        a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q),
    )
  }, [announcements, search])

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    const result = await deleteAnnouncement(toDelete.id)
    setDeleting(false)
    setToDelete(null)
    if (result?.error) toast('error', result.error)
    else toast('success', 'Comunicado removido com sucesso.')
  }

  const editing = modal !== null && modal !== 'create' ? modal : null

  return (
    <div className="space-y-6">
      {/* Barra de ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A29E]"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar comunicado…"
            className="input-base pl-10"
            aria-label="Buscar comunicados"
          />
        </div>
        <button type="button" onClick={() => setModal('create')} className="btn-primary">
          <Plus size={16} aria-hidden="true" />
          Novo comunicado
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((a) => (
            <div
              key={a.id}
              className="card flex items-start gap-4 border-l-4 border-l-[#F97316] p-4 sm:p-5"
            >
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 font-condensed text-base font-semibold uppercase tracking-[0.03em] text-[#171717]">
                  {a.title}
                </h3>
                <p className="whitespace-pre-line text-sm text-[#57534E]">{a.content}</p>
                <p className="mt-2 text-xs text-[#A8A29E]">{formatDate(a.created_at)}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setModal(a)}
                  className="rounded-lg p-2.5 text-[#A8A29E] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]"
                  aria-label={`Editar comunicado ${a.title}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(a)}
                  className="rounded-lg p-2.5 text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                  aria-label={`Remover comunicado ${a.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-10 text-center text-[#A8A29E]">
            <Megaphone size={28} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
            <p className="text-sm">
              {announcements.length === 0
                ? 'Nenhum comunicado publicado. Clique em "Novo comunicado" para avisar a equipe.'
                : 'Nenhum comunicado encontrado com essa busca.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      <AdminModal
        open={modal !== null}
        title={editing ? 'Editar comunicado' : 'Novo comunicado'}
        subtitle={
          editing
            ? 'As alterações aparecem imediatamente para os atletas.'
            : 'O comunicado ficará visível para toda a equipe.'
        }
        onClose={() => setModal(null)}
      >
        <AdminForm
          key={editing?.id ?? 'create'}
          action={async (fd) =>
            editing ? updateAnnouncement(editing.id, fd) : createAnnouncement(fd)
          }
          fields={ANNOUNCEMENT_FIELDS}
          submitLabel={editing ? 'Salvar alterações' : 'Publicar comunicado'}
          defaultValues={
            editing ? { title: editing.title, content: editing.content } : undefined
          }
          onSuccess={() => {
            setModal(null)
            toast(
              'success',
              editing ? 'Comunicado atualizado com sucesso.' : 'Comunicado publicado com sucesso.',
            )
          }}
        />
      </AdminModal>

      {/* Confirmação de remoção */}
      <ConfirmDialog
        open={toDelete !== null}
        title="Confirmar remoção"
        description={
          toDelete
            ? `O comunicado "${toDelete.title}" será removido para toda a equipe. Esta ação exige confirmação e não pode ser desfeita.`
            : ''
        }
        confirmLabel="Remover comunicado"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
