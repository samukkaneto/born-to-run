import { createClient } from '@/lib/supabase/server'
import { createAnnouncement, deleteAnnouncement } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { Megaphone, Trash2 } from 'lucide-react'
import AdminForm from '@/components/admin/AdminForm'
import type { Announcement } from '@/types'

export default async function AdminComunicadosPage() {
  const supabase = await createClient()
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false }) as { data: Announcement[] | null }

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="font-display text-2xl font-black text-stone-900">Gerenciar Comunicados</h1>

      {/* Formulário */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-stone-800 mb-5 flex items-center gap-2">
          <Megaphone size={18} className="text-[var(--color-orange)]" />
          Novo comunicado
        </h2>
        <AdminForm
          action={createAnnouncement}
          submitLabel="Publicar Comunicado"
          fields={[
            { name: 'title',   label: 'Título',   type: 'text',     required: true, placeholder: 'Ex: Alteração no horário de treino' },
            { name: 'content', label: 'Conteúdo', type: 'textarea', required: true, placeholder: 'Escreva a mensagem para a equipe...' },
          ]}
        />
      </div>

      {/* Lista */}
      <div>
        <h2 className="font-display font-bold text-stone-700 mb-4">
          Comunicados publicados ({announcements?.length ?? 0})
        </h2>
        <div className="space-y-3">
          {announcements && announcements.length > 0 ? (
            announcements.map(a => (
              <div key={a.id} className="card p-4 border-l-4 border-[var(--color-orange)] flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-800 mb-1">{a.title}</h3>
                  <p className="text-stone-500 text-sm">{a.content}</p>
                  <p className="text-stone-400 text-xs mt-2">{formatDate(a.created_at)}</p>
                </div>
                <form action={async () => { 'use server'; await deleteAnnouncement(a.id) }}>
                  <button type="submit"
                          className="p-2 rounded-lg text-stone-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          aria-label="Excluir comunicado">
                    <Trash2 size={16} />
                  </button>
                </form>
              </div>
            ))
          ) : (
            <div className="card p-8 text-center text-stone-400">
              <Megaphone size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum comunicado publicado.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
