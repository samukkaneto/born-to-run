import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Users, Dumbbell, Megaphone, Rss, ArrowRight, Plus, Clock3 } from 'lucide-react'

export default async function AdminPage() {
  const supabase = await createClient()

  const countResults = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('workouts').select('*', { count: 'exact', head: true }),
    supabase.from('announcements').select('*', { count: 'exact', head: true }),
    supabase.from('posts').select('*', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('membership_status', 'pending'),
  ])
  if (countResults.some((result) => result.error)) {
    throw new Error('Não foi possível carregar os indicadores do painel.')
  }
  const [
    { count: membersCount },
    { count: workoutsCount },
    { count: announcementsCount },
    { count: postsCount },
    { count: pendingCount },
  ] = countResults

  const cards = [
    { icon: Users,     label: 'Membros',       value: membersCount ?? 0,       href: '/admin/membros',     color: '#DC2626', bg: '#FEE2E2' },
    { icon: Dumbbell,  label: 'Treinos',       value: workoutsCount ?? 0,      href: '/admin/treinos',     color: '#16A34A', bg: '#DCFCE7' },
    { icon: Megaphone, label: 'Comunicados',   value: announcementsCount ?? 0, href: '/admin/comunicados', color: '#F97316', bg: '#FFEDD5' },
    { icon: Rss,       label: 'Posts no feed', value: postsCount ?? 0,         href: '/dashboard/feed',    color: '#57534E', bg: '#F5F5F4' },
  ]

  return (
    <div className="animate-fade-in space-y-8">
      {/* Cabeçalho editorial */}
      <div>
        <p className="section-kicker mb-3">Painel do treinador</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
          Visão geral <span className="text-[#DC2626]">da equipe</span>
        </h1>
        <p className="mt-3 text-sm text-[#57534E]">
          Acompanhe os números da Born to Run e gerencie treinos, comunicados e membros.
        </p>
      </div>

      {(pendingCount ?? 0) > 0 && (
        <Link
          href="/admin/membros"
          className="card flex items-center gap-4 border-l-4 border-l-orange-600 p-4 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <Clock3 size={21} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm text-[#171717]">
              {pendingCount} cadastro{pendingCount === 1 ? '' : 's'} aguardando análise
            </strong>
            <span className="text-xs text-[#57534E]">Revise quem pode entrar na comunidade fechada.</span>
          </span>
          <ArrowRight size={16} className="text-[#DC2626]" aria-hidden="true" />
        </Link>
      )}

      {/* Cards de contadores */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, href, color, bg }) => (
          <Link
            key={label}
            href={href}
            className="card card-lift group flex flex-col gap-4 p-5"
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-lg"
              style={{ backgroundColor: bg }}
            >
              <Icon size={21} style={{ color }} aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-4xl leading-none text-[#171717]">{value}</p>
              <p className="mt-1.5 font-condensed text-xs uppercase tracking-[0.12em] text-[#78716C]">
                {label}
              </p>
            </div>
            <ArrowRight
              size={14}
              className="self-end text-[#D6D3D1] transition-colors group-hover:text-[#DC2626]"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>

      {/* Ações rápidas */}
      <div className="card border-l-4 border-l-[#DC2626] p-6">
        <h2 className="font-condensed text-lg font-semibold uppercase tracking-[0.04em] text-[#171717]">
          Ações rápidas
        </h2>
        <p className="mb-4 mt-1 text-sm text-[#57534E]">
          Atalhos para as tarefas mais comuns do dia a dia.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/treinos" className="btn-primary text-sm">
            <Plus size={15} aria-hidden="true" />
            Novo treino
          </Link>
          <Link href="/admin/comunicados" className="btn-secondary text-sm">
            <Plus size={15} aria-hidden="true" />
            Novo comunicado
          </Link>
          <Link href="/admin/membros" className="btn-outline text-sm">
            Ver membros
          </Link>
        </div>
      </div>
    </div>
  )
}
