'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  Rss,
  Dumbbell,
  Megaphone,
  User,
  Plus,
  ShieldCheck,
  ClipboardList,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

const navItems = [
  { href: '/dashboard',             icon: Home,      label: 'Início',         short: 'Início'  },
  { href: '/dashboard/feed',        icon: Rss,       label: 'Feed da equipe',  short: 'Feed'    },
  { href: '/dashboard/treinos',     icon: Dumbbell,  label: 'Treinos',         short: 'Treinos' },
  { href: '/dashboard/avaliacoes',  icon: ClipboardList, label: 'Minhas avaliações', short: 'Avaliações' },
  { href: '/dashboard/conquistas',  icon: Trophy, label: 'Missões e conquistas', short: 'Conquistas' },
  { href: '/dashboard/comunicados', icon: Megaphone, label: 'Comunicados',     short: 'Avisos'  },
  { href: '/dashboard/perfil',      icon: User,      label: 'Meu perfil',      short: 'Perfil'  },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

/** Menu lateral (desktop) — painel carbono, item ativo vermelho sólido. */
export function DashboardSidebarNav({
  managementRole,
}: {
  managementRole?: Extract<UserRole, 'admin' | 'coach'> | null
}) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação do painel">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3.5 py-3 font-condensed text-sm font-medium uppercase tracking-[0.08em] transition-colors',
              active
                ? 'bg-[#DC2626] text-white'
                : 'text-[#A8A29E] hover:bg-[#232323] hover:text-white'
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5 flex-shrink-0 transition-colors',
                active ? 'text-white' : 'text-[#78716C] group-hover:text-[#DC2626]'
              )}
              aria-hidden="true"
            />
            {label}
          </Link>
        )
      })}

      {managementRole && (
        <>
          <div className="my-3 border-t border-[#2E2E2E]" aria-hidden="true" />
          <Link
            href="/admin"
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3.5 py-3 font-condensed text-sm font-medium uppercase tracking-[0.08em] transition-colors',
              pathname.startsWith('/admin')
                ? 'bg-[#DC2626] text-white'
                : 'text-[#A8A29E] hover:bg-[#232323] hover:text-white'
            )}
          >
            <ShieldCheck
              className="h-5 w-5 flex-shrink-0 text-[#16A34A]"
              aria-hidden="true"
            />
            {managementRole === 'coach' ? 'Painel do treinador' : 'Administração'}
          </Link>
        </>
      )}
    </nav>
  )
}

/** Navegação inferior (mobile) — botão central vermelho "+" (novo post). */
export function DashboardBottomNav() {
  const pathname = usePathname()
  const left = [navItems[0], navItems[2]]
  const right = [navItems[4], navItems[6]]

  const renderItem = ({ href, icon: Icon, short }: (typeof navItems)[number]) => {
    const active = isActive(pathname, href)
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex h-full w-full flex-col items-center justify-center transition-colors',
          active ? 'text-[#DC2626]' : 'text-[#78716C] hover:text-[#DC2626]'
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
        <span className="mt-1 font-condensed text-[10px] font-medium uppercase tracking-[0.08em]">
          {short}
        </span>
      </Link>
    )
  }

  return (
    <nav
      className="fixed bottom-0 z-40 flex h-16 w-full items-center justify-around border-t border-[#E5E1D8] bg-white px-1 shadow-[0_-4px_12px_rgba(23,23,23,0.06)] md:hidden"
      aria-label="Navegação mobile do painel"
    >
      {left.map(renderItem)}

      {/* Botão central: novo post no feed */}
      <div className="flex h-full w-full items-center justify-center">
        <Link
          href="/dashboard/feed"
          aria-label="Publicar no feed da equipe"
          className="flex h-12 w-12 -translate-y-4 items-center justify-center rounded-xl bg-[#DC2626] text-white shadow-[0_6px_16px_rgba(220,38,38,0.4)] transition-colors hover:bg-[#B91C1C]"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </Link>
      </div>

      {right.map(renderItem)}
    </nav>
  )
}
