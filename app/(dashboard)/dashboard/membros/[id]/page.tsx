import Link from 'next/link'
import Image from 'next/image'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, getInitials } from '@/lib/utils'
import { ArrowLeft, MapPin, Target, Rss, ShieldCheck } from 'lucide-react'
import type { Profile } from '@/types'

/**
 * Perfil público de um membro da equipe, acessado a partir do feed.
 * O parâmetro [id] é o user_id (auth.users) do membro.
 */
export default async function MembroPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Se for o próprio usuário, leva ao perfil editável.
  if (id === user.id) redirect('/dashboard/perfil')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', id)
    .single() as { data: Profile | null }

  if (!profile) notFound()

  const { data: posts, count } = await supabase
    .from('posts')
    .select('id, caption, distance_km, duration_minutes, pace, created_at', { count: 'exact' })
    .eq('user_id', id)
    .order('created_at', { ascending: false })
    .limit(10)

  const totalKm = (posts ?? []).reduce((sum, p) => sum + (Number(p.distance_km) || 0), 0)

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <Link
        href="/dashboard/feed"
        className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-700 text-sm transition-colors"
      >
        <ArrowLeft size={15} /> Voltar ao feed
      </Link>

      {/* Cabeçalho do perfil */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center overflow-hidden shrink-0">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={`Avatar de ${profile.full_name}`}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[var(--color-red)] font-black text-2xl">
                {getInitials(profile.full_name || 'A')}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-xl font-black text-stone-900 truncate">
                {profile.full_name || 'Atleta'}
              </h1>
              {profile.role === 'admin' && (
                <span className="badge badge-red inline-flex items-center gap-1">
                  <ShieldCheck size={11} /> Treinador
                </span>
              )}
            </div>
            {profile.cidade && (
              <p className="text-stone-500 text-sm mt-1 flex items-center gap-1.5">
                <MapPin size={13} /> {profile.cidade}
              </p>
            )}
            {profile.objetivo && (
              <p className="text-stone-500 text-sm mt-1 flex items-center gap-1.5">
                <Target size={13} /> {profile.objetivo}
              </p>
            )}
          </div>
        </div>
        {profile.bio && (
          <p className="text-stone-600 text-sm mt-4 leading-relaxed whitespace-pre-wrap border-t border-stone-100 pt-4">
            {profile.bio}
          </p>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <Rss size={18} className="mx-auto mb-1 text-[var(--color-red)]" />
          <p className="font-display font-bold text-stone-800 text-lg">{count ?? 0}</p>
          <p className="text-stone-400 text-xs">Publicações</p>
        </div>
        <div className="card p-4 text-center">
          <MapPin size={18} className="mx-auto mb-1 text-[var(--color-green)]" />
          <p className="font-display font-bold text-stone-800 text-lg">
            {totalKm > 0 ? `${totalKm.toFixed(1)} km` : '—'}
          </p>
          <p className="text-stone-400 text-xs">Nas últimas atividades</p>
        </div>
      </div>

      {/* Atividades */}
      <section>
        <h2 className="font-display font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Rss size={18} className="text-[var(--color-red)]" />
          Últimas atividades
        </h2>
        {posts && posts.length > 0 ? (
          <div className="card divide-y divide-stone-50">
            {posts.map((p) => (
              <div key={p.id} className="p-4 flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-[var(--color-red)] flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-stone-700 text-sm truncate">
                    {p.caption || (p.distance_km ? `Corrida de ${p.distance_km} km` : 'Atividade')}
                  </p>
                  <p className="text-stone-400 text-xs mt-0.5">{formatDate(p.created_at)}</p>
                </div>
                {p.distance_km != null && (
                  <span className="badge badge-red flex-shrink-0">{p.distance_km} km</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center text-stone-400">
            <Rss size={26} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Este atleta ainda não publicou atividades.</p>
          </div>
        )}
      </section>
    </div>
  )
}
