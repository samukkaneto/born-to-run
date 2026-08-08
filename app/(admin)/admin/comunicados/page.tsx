import { createClient } from '@/lib/supabase/server'
import AnnouncementsManager from '@/components/admin/AnnouncementsManager'
import type { Announcement } from '@/types'

export default async function AdminComunicadosPage() {
  const supabase = await createClient()
  const { data: announcements, error } = (await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })) as {
      data: Announcement[] | null
      error: { message: string } | null
    }
  if (error) throw new Error('Não foi possível carregar os comunicados.')

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <p className="section-kicker mb-3">Comunicados</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
          Gerenciar <span className="text-[#DC2626]">comunicados</span>
        </h1>
        <p className="mt-3 text-sm text-[#57534E]">
          {announcements?.length ?? 0} comunicado(s) publicado(s). Avise a
          equipe sobre provas, horários e novidades.
        </p>
      </div>

      <AnnouncementsManager announcements={announcements ?? []} />
    </div>
  )
}
