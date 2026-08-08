import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createMediaUrl } from '@/lib/supabase/media'
import PerfilForm from '@/components/feed/PerfilForm'
import { formatDate } from '@/lib/utils'
import { User, MapPin, Target, Rss } from 'lucide-react'
import type { Profile } from '@/types'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle() as { data: Profile | null; error: { message: string } | null }

  if (profileError) throw new Error('Não foi possível carregar o perfil.')
  if (!profile) throw new Error('O perfil autenticado não foi encontrado.')

  const profileForView: Profile = {
    ...profile,
    avatar_url: await createMediaUrl(supabase, 'avatars', profile.avatar_url),
  }

  // Histórico de posts
  const { data: posts, count, error: postsError } = await supabase
    .from('posts')
    .select('id, caption, distance_km, created_at', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)
  if (postsError) throw new Error('Não foi possível carregar as atividades do perfil.')

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-black text-stone-900">Meu Perfil 👤</h1>
        <p className="text-stone-500 text-sm mt-1">Gerencie suas informações pessoais</p>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Rss,    value: count ?? 0,                label: 'Posts'           },
          { icon: MapPin, value: profileForView.cidade || '—',     label: 'Cidade'          },
          { icon: Target, value: profileForView.objetivo ? '✓' : '—', label: 'Objetivo'     },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="card p-4 text-center">
            <Icon size={18} className="mx-auto mb-1 text-[var(--color-red)]" />
            <p className="font-display font-bold text-stone-800 text-lg">{value}</p>
            <p className="text-stone-400 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Formulário de edição */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-stone-800 mb-6 flex items-center gap-2">
          <User size={18} className="text-[var(--color-red)]" />
          Editar informações
        </h2>
        <PerfilForm profile={profileForView} />
      </div>

      {/* Histórico de posts */}
      {posts && posts.length > 0 && (
        <div className="card p-6">
          <h2 className="font-display font-bold text-stone-800 mb-4 flex items-center gap-2">
            <Rss size={18} className="text-[var(--color-red)]" />
            Últimas atividades
          </h2>
          <div className="space-y-3">
            {posts.map(p => (
              <div key={p.id} className="flex items-center gap-3 py-2 border-b border-stone-50 last:border-0">
                <div className="w-2 h-2 rounded-full bg-[var(--color-red)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-stone-700 text-sm truncate">
                    {p.caption || (p.distance_km ? `${p.distance_km} km` : 'Atividade')}
                  </p>
                  <p className="text-stone-400 text-xs">{formatDate(p.created_at)}</p>
                </div>
                {p.distance_km && (
                  <span className="badge badge-red flex-shrink-0">{p.distance_km} km</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
