'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Dumbbell,
  Megaphone,
  Users,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin',             icon: LayoutDashboard, label: 'Visão geral' },
  { href: '/admin/treinos',     icon: Dumbbell,        label: 'Treinos'     },
  { href: '/admin/comunicados', icon: Megaphone,       label: 'Comunicados' },
  { href: '/admin/membros',     icon: Users,           label: 'Membros'     },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/admin') return pathname === '/admin'
  return pathname.startsWith(href)
}

/** Navegação do painel do treinador (sidebar carbono, ativo vermelho). */
export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1" aria-label="Navegação do painel do treinador">
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

      <div className="my-3 border-t border-[#2E2E2E]" aria-hidden="true" />

      <Link
        href="/dashboard"
        className="group flex items-center gap-3 rounded-lg px-3.5 py-3 font-condensed text-sm font-medium uppercase tracking-[0.08em] text-[#A8A29E] transition-colors hover:bg-[#232323] hover:text-white"
      >
        <ArrowLeft
          className="h-5 w-5 flex-shrink-0 text-[#78716C] group-hover:text-[#DC2626]"
          aria-hidden="true"
        />
        Voltar ao dashboard
      </Link>
    </nav>
  )
}

/** Variante mobile: faixa horizontal rolável abaixo do topo carbono. */
export function AdminNavMobile() {
  const pathname = usePathname()
  return (
    <nav
      className="flex gap-2 overflow-x-auto px-4 py-3 [scrollbar-width:none]"
      aria-label="Navegação do painel do treinador"
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2.5 font-condensed text-xs font-medium uppercase tracking-[0.08em] transition-colors',
              active
                ? 'bg-[#DC2626] text-white'
                : 'bg-[#232323] text-[#A8A29E] hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
