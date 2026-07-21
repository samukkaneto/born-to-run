import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate, formatRelativeTime, getInitials } from '@/lib/utils'
import {
  Rss, Dumbbell, Megaphone, User, ArrowRight, Calendar, MapPin,
} from 'lucide-react'
import type { Workout, Announcement } from '@/types'

/**
 * Dashboard do aluno: resumo com boas-vindas, próximos treinos,
 * últimos comunicados, atividades recentes do feed e atalhos.
 */
export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, cidade, objetivo')
    .eq('user_id', user.id)
    .single()

  const today = new Date().toISOString().split('T')[0]

  const [{ data: workouts }, { data: announcements }, { data: recentPosts }, { count: myPostsCount }] =
    await Promise.all([
      supabase
        .from('workouts')
        .select('id, title, level, scheduled_date, objective')
        .gte('scheduled_date', today)
        .order('scheduled_date', { ascending: true })
        .limit(3) as unknown as Promise<{ data: Workout[] | null }>,
      supabase
        .from('announcements')
        .select('id, title, content, created_at')
        .order('created_at', { ascending: false })
        .limit(3) as unknown as Promise<{ data: Announcement[] | null }>,
      supabase
        .from('posts')
        .select('id, caption, distance_km, created_at, profiles ( full_name, avatar_url )')
        .order('created_at', { ascending: false })
        .limit(4),
      supabase
        .from('posts')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ])

  const firstName = (profile?.full_name || 'Atleta').split(' ')[0]

  const levelLabels: Record<string, string> = {
    iniciante: 'Iniciante', intermediario: 'Intermediário', avancado: 'Avançado',
  }
  const levelColors: Record<string, string> = {
    iniciante: 'badge-green', intermediario: 'badge-orange', avancado: 'badge-red',
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      {/* Boas-vindas */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-stone-900">
          Olá, {firstName}! 👋
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {profile?.objetivo
            ? <>Seu objetivo: <span className="font-medium text-stone-700">{profile.objetivo}</span></>
            : 'Bem-vindo(a) à área de membros da Born to Run.'}
        </p>
      </div>

      {/* Atalhos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/dashboard/feed',        icon: Rss,      label: 'Feed'        },
          { href: '/dashboard/treinos',     icon: Dumbbell, label: 'Treinos'     },
          { href: '/dashboard/comunicados', icon: Megaphone,label: 'Comunicados' },
          { href: '/dashboard/perfil',      icon: User,     label: 'Perfil'      },
        ].map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="card p-4 text-center hover:-translate-y-0.5 transition-transform group"
          >
            <Icon size={22} className="mx-auto mb-2 text-[var(--color-red)]" />
            <span className="text-sm font-semibold text-stone-700 group-hover:text-[var(--color-red)] transition-colors">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Próximos treinos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-stone-800 flex items-center gap-2">
            <Dumbbell size={18} className="text-[var(--color-red)]" />
            Próximos treinos
          </h2>
          <Link href="/dashboard/treinos" className="text-sm text-[var(--color-red)] font-medium hover:underline inline-flex items-center gap-1">
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>
        {workouts && workouts.length > 0 ? (
          <div className="space-y-3">
            {workouts.map((w) => (
              <Link key={w.id} href="/dashboard/treinos" className="card p-4 flex items-center gap-4 hover:-translate-y-0.5 transition-transform">
                <div className="w-11 h-11 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Dumbbell size={20} className="text-[var(--color-red)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-stone-800 truncate">{w.title}</p>
                  <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-0.5">
                    {w.scheduled_date && (
                      <><Calendar size={11} /> {formatDate(w.scheduled_date)}</>
                    )}
                  </p>
                </div>
                <span className={`badge ${levelColors[w.level] || 'badge-gray'} flex-shrink-0`}>
                  {levelLabels[w.level] || w.level}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-stone-400">
            <Dumbbell size={26} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum treino agendado no momento.</p>
          </div>
        )}
      </section>

      {/* Últimos comunicados */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-stone-800 flex items-center gap-2">
            <Megaphone size={18} className="text-[var(--color-red)]" />
            Últimos comunicados
          </h2>
          <Link href="/dashboard/comunicados" className="text-sm text-[var(--color-red)] font-medium hover:underline inline-flex items-center gap-1">
            Ver todos <ArrowRight size={13} />
          </Link>
        </div>
        {announcements && announcements.length > 0 ? (
          <div className="space-y-3">
            {announcements.map((a) => (
              <Link key={a.id} href="/dashboard/comunicados" className="card p-4 block hover:-translate-y-0.5 transition-transform">
                <p className="font-semibold text-stone-800">{a.title}</p>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">{a.content}</p>
                <p className="text-xs text-stone-400 mt-2">{formatRelativeTime(a.created_at)}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-stone-400">
            <Megaphone size={26} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum comunicado por enquanto.</p>
          </div>
        )}
      </section>

      {/* Atividade recente da equipe */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-stone-800 flex items-center gap-2">
            <Rss size={18} className="text-[var(--color-red)]" />
            Atividade da equipe
          </h2>
          <Link href="/dashboard/feed" className="text-sm text-[var(--color-red)] font-medium hover:underline inline-flex items-center gap-1">
            Abrir feed <ArrowRight size={13} />
          </Link>
        </div>
        {recentPosts && recentPosts.length > 0 ? (
          <div className="card divide-y divide-stone-50">
            {recentPosts.map((p) => {
              const prof = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles
              const name = prof?.full_name || 'Atleta'
              return (
                <div key={p.id} className="p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-[11px] font-bold text-[var(--color-red)]">
                    {getInitials(name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-stone-700 truncate">
                      <span className="font-semibold">{name}</span>
                      {p.caption ? ` — ${p.caption}` : p.distance_km ? ` correu ${p.distance_km} km` : ' publicou uma atividade'}
                    </p>
                    <p className="text-xs text-stone-400 mt-0.5">{formatRelativeTime(p.created_at)}</p>
                  </div>
                  {p.distance_km != null && (
                    <span className="badge badge-red flex-shrink-0 inline-flex items-center gap-1">
                      <MapPin size={10} /> {p.distance_km} km
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="card p-8 text-center text-stone-400">
            <Rss size={26} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">
              Ainda não há publicações.{' '}
              <Link href="/dashboard/feed" className="text-[var(--color-red)] font-medium hover:underline">
                Seja o primeiro!
              </Link>
            </p>
          </div>
        )}
      </section>

      {/* Resumo pessoal */}
      <section className="card p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-500">Suas publicações no feed</p>
          <p className="font-display text-2xl font-black text-stone-900">{myPostsCount ?? 0}</p>
        </div>
        <Link href="/dashboard/perfil" className="btn-outline text-sm py-2 px-4">
          Ver meu perfil
        </Link>
      </section>
    </div>
  )
}
