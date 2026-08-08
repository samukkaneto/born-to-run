import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { Megaphone, CalendarDays } from 'lucide-react'
import type { Announcement } from '@/types'
import { site } from '@/lib/site'

/**
 * Central de comunicados: avisos publicados pelo treinador
 * Robson Alves para todos os membros da equipe.
 */
export default async function ComunicadosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: announcements, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false }) as {
      data: Announcement[] | null
      error: { message: string } | null
    }
  if (error) throw new Error('Não foi possível carregar os comunicados.')

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-black text-stone-900">Comunicados 📣</h1>
        <p className="text-stone-500 text-sm mt-1">
          Avisos oficiais do treinador {site.coach.name} para a equipe
        </p>
      </div>

      {announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((a, index) => (
            <article
              key={a.id}
              className={`card p-5 ${index === 0 ? 'border-l-4 border-l-[var(--color-red)]' : ''}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Megaphone size={18} className="text-[var(--color-red)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-display font-bold text-stone-900">{a.title}</h2>
                    {index === 0 && <span className="badge badge-red">Mais recente</span>}
                  </div>
                  <p className="text-stone-600 text-sm mt-2 leading-relaxed whitespace-pre-wrap">
                    {a.content}
                  </p>
                  <p className="text-xs text-stone-400 mt-3 flex items-center gap-1.5">
                    <CalendarDays size={12} />
                    {formatDate(a.created_at)}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <Megaphone size={32} className="mx-auto mb-3 text-stone-300" />
          <h3 className="font-display font-bold text-stone-700 mb-1">Nenhum comunicado ainda</h3>
          <p className="text-stone-400 text-sm">
            Quando o treinador publicar um aviso, ele aparecerá aqui.
          </p>
        </div>
      )}
    </div>
  )
}
