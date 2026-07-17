import { createClient } from '@/lib/supabase/server'
import { deleteWorkout, createWorkout } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { Trash2, Dumbbell } from 'lucide-react'
import AdminForm from '@/components/admin/AdminForm'
import type { Workout } from '@/types'

export default async function AdminTreinosPage() {
  const supabase = await createClient()
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Workout[] | null }

  const levelColors: Record<string, string> = {
    iniciante: 'badge-green', intermediario: 'badge-orange', avancado: 'badge-red',
  }
  const levelLabels: Record<string, string> = {
    iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado',
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-display text-2xl font-black text-stone-900">Gerenciar Treinos</h1>

      {/* Formulário novo treino */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-stone-800 mb-5 flex items-center gap-2">
          <Dumbbell size={18} className="text-[var(--color-red)]" />
          Criar novo treino
        </h2>
        <AdminForm
          action={createWorkout}
          submitLabel="Criar Treino"
          fields={[
            { name: 'title',       label: 'Título',           type: 'text',     required: true, placeholder: 'Ex: Treino de Velocidade 5km' },
            { name: 'description', label: 'Descrição',        type: 'textarea', required: true, placeholder: 'Descreva o treino detalhadamente...' },
            { name: 'objective',   label: 'Objetivo',         type: 'text',     required: true, placeholder: 'Ex: Melhorar pace, resistência...' },
            { name: 'level',       label: 'Nível',            type: 'select',   required: true,
              options: [
                { value: 'iniciante',     label: 'Iniciante'    },
                { value: 'intermediario', label: 'Intermediário' },
                { value: 'avancado',      label: 'Avançado'     },
              ]
            },
            { name: 'scheduled_date', label: 'Data (opcional)', type: 'date' },
          ]}
        />
      </div>

      {/* Lista de treinos */}
      <div>
        <h2 className="font-display font-bold text-stone-700 mb-4">
          Treinos cadastrados ({workouts?.length ?? 0})
        </h2>
        <div className="space-y-3">
          {workouts && workouts.length > 0 ? (
            workouts.map(w => (
              <div key={w.id} className="card p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-stone-800">{w.title}</h3>
                    <span className={`badge ${levelColors[w.level] || 'badge-gray'}`}>
                      {levelLabels[w.level] || w.level}
                    </span>
                  </div>
                  <p className="text-stone-500 text-sm line-clamp-2">{w.description}</p>
                  <p className="text-stone-400 text-xs mt-1">
                    {w.scheduled_date ? formatDate(w.scheduled_date) : 'Sem data'} · {w.objective}
                  </p>
                </div>
                <form action={async () => { 'use server'; await deleteWorkout(w.id) }}>
                  <button type="submit"
                          className="p-2 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Excluir treino">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="card p-8 text-center text-stone-400">
              <Dumbbell size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum treino cadastrado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
