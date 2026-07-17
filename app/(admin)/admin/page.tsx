import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Dumbbell, Megaphone, Rss, ArrowRight } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const [
    { count: membersCount },
    { count: workoutsCount },
    { count: announcementsCount },
    { count: postsCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('workouts').select('*', { count: 'exact', head: true }),
    supabase.from('announcements').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
  ])

  const cards = [
    { icon: Users,     label: 'Membros',      value: membersCount ?? 0,       href: '/admin/membros',     color: 'text-[var(--color-red)]',    bg: 'bg-red-50'    },
    { icon: Dumbbell,  label: 'Treinos',      value: workoutsCount ?? 0,      href: '/admin/treinos',     color: 'text-[var(--color-green)]',  bg: 'bg-green-50'  },
    { icon: Megaphone, label: 'Comunicados',  value: announcementsCount ?? 0, href: '/admin/comunicados', color: 'text-[var(--color-orange)]', bg: 'bg-orange-50' },
    { icon: Rss,       label: 'Posts no Feed',value: postsCount ?? 0,         href: '/dashboard/feed',    color: 'text-stone-500',             bg: 'bg-stone-50'  },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-black text-stone-900">Visão Geral</h1>
        <p className="text-stone-500 text-sm mt-1">Bem-vindo ao painel de administração, Robson!</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ icon: Icon, label, value, href, color, bg }) => (
          <Link key={label} href={href}
                className="card p-5 flex flex-col gap-4 hover:-translate-y-1 transition-transform group">
            <div className={`${bg} w-11 h-11 rounded-xl flex items-center justify-center`}>
              <Icon size={22} className={color} />
            </div>
            <div>
              <p className={`font-display text-3xl font-black ${color}`}>{value}</p>
              <p className="text-stone-500 text-sm">{label}</p>
            </div>
            <ArrowRight size={14} className="text-stone-300 group-hover:text-stone-500 transition-colors self-end" />
          </Link>
        ))}
      </div>

      <div className="card p-6 border-l-4 border-[var(--color-red)]">
        <h2 className="font-display font-semibold text-stone-800 mb-1">Acesso Rápido</h2>
        <p className="text-stone-500 text-sm mb-4">Ações mais comuns do administrador</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/treinos"     className="btn-primary text-sm py-2 px-4">+ Novo Treino</Link>
          <Link href="/admin/comunicados" className="btn-secondary text-sm py-2 px-4">+ Novo Comunicado</Link>
          <Link href="/admin/membros"     className="btn-outline text-sm py-2 px-4">Ver Membros</Link>
        </div>
      </div>
    </div>
  )
}
