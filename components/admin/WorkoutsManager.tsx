'use client'

import { useMemo, useState } from 'react'
import { Dumbbell, Pencil, Plus, Search, Trash2, Calendar } from 'lucide-react'
import { createWorkout, updateWorkout, deleteWorkout } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import AdminModal from '@/components/admin/AdminModal'
import AdminForm, { type AdminFormField } from '@/components/admin/AdminForm'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { Workout } from '@/types'

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

const WORKOUT_FIELDS: AdminFormField[] = [
  { name: 'title', label: 'Título', type: 'text', required: true, placeholder: 'Ex: Treino de velocidade 5 km' },
  { name: 'description', label: 'Descrição', type: 'textarea', required: true, placeholder: 'Descreva o treino detalhadamente…' },
  { name: 'objective', label: 'Objetivo', type: 'text', required: true, placeholder: 'Ex: Melhorar pace, resistência…' },
  {
    name: 'level', label: 'Nível', type: 'select', required: true,
    options: [
      { value: 'iniciante', label: 'Iniciante' },
      { value: 'intermediario', label: 'Intermediário' },
      { value: 'avancado', label: 'Avançado' },
    ],
  },
  { name: 'scheduled_date', label: 'Data (opcional)', type: 'date' },
]

/** Gestão de treinos do painel do treinador: busca, filtro por nível,
 *  criação/edição em modal e remoção com confirmação + toasts. */
export default function WorkoutsManager({ workouts }: { workouts: Workout[] }) {
  const { toast } = useToast()
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('todos')
  const [modal, setModal] = useState<'create' | Workout | null>(null)
  const [toDelete, setToDelete] = useState<Workout | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return workouts.filter((w) => {
      if (level !== 'todos' && w.level !== level) return false
      if (!q) return true
      return (
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.objective.toLowerCase().includes(q)
      )
    })
  }, [workouts, search, level])

  async function handleDelete() {
    if (!toDelete) return
    setDeleting(true)
    const result = await deleteWorkout(toDelete.id)
    setDeleting(false)
    setToDelete(null)
    if (result?.error) toast('error', result.error)
    else toast('success', 'Treino removido com sucesso.')
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
            placeholder="Buscar treino por título, descrição ou objetivo…"
            className="input-base pl-10"
            aria-label="Buscar treinos"
          />
        </div>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="input-base bg-white sm:w-48"
          aria-label="Filtrar por nível"
        >
          <option value="todos">Todos os níveis</option>
          <option value="iniciante">Iniciante</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </select>
        <button type="button" onClick={() => setModal('create')} className="btn-primary">
          <Plus size={16} aria-hidden="true" />
          Novo treino
        </button>
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((w) => (
            <div key={w.id} className="card flex items-start gap-4 p-4 sm:p-5">
              <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FEE2E2] sm:flex">
                <Dumbbell size={19} className="text-[#DC2626]" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.03em] text-[#171717]">
                    {w.title}
                  </h3>
                  <span className={`badge ${LEVEL_BADGES[w.level] || 'badge-gray'}`}>
                    {LEVEL_LABELS[w.level] || w.level}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-[#57534E]">{w.description}</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[#A8A29E]">
                  <Calendar size={11} aria-hidden="true" />
                  {w.scheduled_date ? formatDate(w.scheduled_date) : 'Sem data'} · {w.objective}
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => setModal(w)}
                  className="rounded-lg p-2.5 text-[#A8A29E] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]"
                  aria-label={`Editar treino ${w.title}`}
                >
                  <Pencil size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setToDelete(w)}
                  className="rounded-lg p-2.5 text-[#A8A29E] transition-colors hover:bg-[#FEE2E2] hover:text-[#DC2626]"
                  aria-label={`Remover treino ${w.title}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-10 text-center text-[#A8A29E]">
            <Dumbbell size={28} className="mx-auto mb-3 opacity-30" aria-hidden="true" />
            <p className="text-sm">
              {workouts.length === 0
                ? 'Nenhum treino cadastrado ainda. Clique em "Novo treino" para começar.'
                : 'Nenhum treino encontrado com esses filtros.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal criar/editar */}
      <AdminModal
        open={modal !== null}
        title={editing ? 'Editar treino' : 'Novo treino'}
        subtitle={
          editing
            ? 'As alterações aparecem imediatamente para os atletas.'
            : 'O treino ficará visível para toda a equipe.'
        }
        onClose={() => setModal(null)}
      >
        <AdminForm
          key={editing?.id ?? 'create'}
          action={async (fd) =>
            editing ? updateWorkout(editing.id, fd) : createWorkout(fd)
          }
          fields={WORKOUT_FIELDS}
          submitLabel={editing ? 'Salvar alterações' : 'Criar treino'}
          defaultValues={
            editing
              ? {
                  title: editing.title,
                  description: editing.description,
                  objective: editing.objective,
                  level: editing.level,
                  scheduled_date: editing.scheduled_date ?? '',
                }
              : undefined
          }
          onSuccess={() => {
            setModal(null)
            toast('success', editing ? 'Treino atualizado com sucesso.' : 'Treino criado com sucesso.')
          }}
        />
      </AdminModal>

      {/* Confirmação de remoção */}
      <ConfirmDialog
        open={toDelete !== null}
        title="Confirmar remoção"
        description={
          toDelete
            ? `O treino "${toDelete.title}" será removido para toda a equipe. Esta ação exige confirmação e não pode ser desfeita.`
            : ''
        }
        confirmLabel="Remover treino"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
