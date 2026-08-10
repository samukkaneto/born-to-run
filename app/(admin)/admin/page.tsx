import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  ArrowRight,
  ClipboardList,
  Clock3,
  Dumbbell,
  Megaphone,
  Plus,
  Rss,
  Users,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAccessContext } from '@/lib/auth/access'

export default async function AdminPage() {
  const [{ profile }, supabase] = await Promise.all([getAccessContext(), createClient()])
  if (!profile || !['admin', 'coach'].includes(profile.role)) redirect('/dashboard')

  const isCoach = profile.role === 'coach'
  const commonResults = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .eq('membership_status', 'pending'),
  ])
  if (commonResults.some((result) => result.error)) {
    throw new Error('Não foi possível carregar os indicadores do painel.')
  }

  const [membersResult, postsResult, pendingResult] = commonResults
  const cards = [
    {
      icon: Users,
      label: 'Membros',
      value: membersResult.count ?? 0,
      href: '/admin/membros',
      color: '#DC2626',
      bg: '#FEE2E2',
    },
  ]

  if (isCoach) {
    const [workoutsResult, assessmentsResult] = await Promise.all([
      supabase.from('workouts').select('id', { count: 'exact', head: true }),
      supabase.from('body_assessments').select('id', { count: 'exact', head: true }),
    ])
    if (workoutsResult.error || assessmentsResult.error) {
      throw new Error('Não foi possível carregar os indicadores técnicos.')
    }
    cards.push(
      { icon: Dumbbell, label: 'Treinos', value: workoutsResult.count ?? 0, href: '/admin/treinos', color: '#16A34A', bg: '#DCFCE7' },
      { icon: ClipboardList, label: 'Avaliações', value: assessmentsResult.count ?? 0, href: '/admin/avaliacoes', color: '#7C3AED', bg: '#EDE9FE' },
    )
  } else {
    const announcementsResult = await supabase
      .from('announcements')
      .select('id', { count: 'exact', head: true })
    if (announcementsResult.error) throw new Error('Não foi possível carregar os comunicados.')
    cards.push({
      icon: Megaphone,
      label: 'Comunicados',
      value: announcementsResult.count ?? 0,
      href: '/admin/comunicados',
      color: '#F97316',
      bg: '#FFEDD5',
    })
  }

  cards.push({
    icon: Rss,
    label: 'Posts no feed',
    value: postsResult.count ?? 0,
    href: '/dashboard/feed',
    color: '#57534E',
    bg: '#F5F5F4',
  })

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <p className="section-kicker mb-3">{isCoach ? 'Painel do treinador' : 'Administração'}</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
          Visão geral <span className="text-[#DC2626]">da equipe</span>
        </h1>
        <p className="mt-3 text-sm text-[#57534E]">
          {isCoach
            ? 'Prescreva treinos, registre avaliações e acompanhe os atletas.'
            : 'Administre acessos, comunicados e a operação da comunidade.'}
        </p>
      </div>

      {(pendingResult.count ?? 0) > 0 && (
        <Link
          href="/admin/membros"
          className="card flex items-center gap-4 border-l-4 border-l-orange-600 p-4 transition-transform hover:-translate-y-0.5"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
            <Clock3 size={21} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <strong className="block text-sm text-[#171717]">
              {pendingResult.count} cadastro{pendingResult.count === 1 ? '' : 's'} aguardando análise
            </strong>
            <span className="text-xs text-[#57534E]">Administrador e treinador podem revisar a entrada.</span>
          </span>
          <ArrowRight size={16} className="text-[#DC2626]" aria-hidden="true" />
        </Link>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ icon: Icon, label, value, href, color, bg }) => (
          <Link key={label} href={href} className="card card-lift group flex flex-col gap-4 p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg" style={{ backgroundColor: bg }}>
              <Icon size={21} style={{ color }} aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-4xl leading-none text-[#171717]">{value}</p>
              <p className="mt-1.5 font-condensed text-xs uppercase tracking-[0.12em] text-[#78716C]">{label}</p>
            </div>
            <ArrowRight size={14} className="self-end text-[#D6D3D1] transition-colors group-hover:text-[#DC2626]" aria-hidden="true" />
          </Link>
        ))}
      </div>

      <div className="card border-l-4 border-l-[#DC2626] p-6">
        <h2 className="font-condensed text-lg font-semibold uppercase tracking-[0.04em] text-[#171717]">Ações rápidas</h2>
        <p className="mb-4 mt-1 text-sm text-[#57534E]">Atalhos para as tarefas mais comuns.</p>
        <div className="flex flex-wrap gap-3">
          {isCoach ? (
            <>
              <Link href="/admin/treinos" className="btn-primary text-sm"><Plus size={15} aria-hidden="true" /> Novo treino</Link>
              <Link href="/admin/avaliacoes" className="btn-secondary text-sm"><Plus size={15} aria-hidden="true" /> Nova avaliação</Link>
            </>
          ) : (
            <Link href="/admin/comunicados" className="btn-primary text-sm"><Plus size={15} aria-hidden="true" /> Novo comunicado</Link>
          )}
          <Link href="/admin/membros" className="btn-outline text-sm">Ver membros</Link>
        </div>
      </div>
    </div>
  )
}
