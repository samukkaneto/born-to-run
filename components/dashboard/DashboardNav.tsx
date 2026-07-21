'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Rss, Dumbbell, Megaphone, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard',             icon: Home,     label: 'Início',         short: 'Início'      },
  { href: '/dashboard/feed',        icon: Rss,      label: 'Feed da Equipe',  short: 'Feed'        },
  { href: '/dashboard/treinos',     icon: Dumbbell, label: 'Treinos',         short: 'Treinos'     },
  { href: '/dashboard/comunicados', icon: Megaphone,label: 'Comunicados',     short: 'Avisos'      },
  { href: '/dashboard/perfil',      icon: User,     label: 'Meu Perfil',      short: 'Perfil'      },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/dashboard') return pathname === '/dashboard'
  return pathname.startsWith(href)
}

/** Menu lateral (desktop) da área do aluno, com estado ativo. */
export function DashboardSidebarNav() {
  const pathname = usePathname()
  return (
    <nav className="space-y-1" aria-label="Navegação do painel">
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors',
              active
                ? 'bg-white text-[#DC2626] shadow-sm'
                : 'text-stone-700 hover:bg-white hover:text-[#DC2626]'
            )}
          >
            <Icon
              className={cn(
                'flex-shrink-0 mr-3 h-5 w-5 transition-colors',
                active ? 'text-[#DC2626]' : 'text-stone-400 group-hover:text-[#DC2626]'
              )}
            />
            {label}
          </Link>
        )
      })}
    </nav>
  )
}

/** Navegação inferior (mobile) da área do aluno, com estado ativo. */
export function DashboardBottomNav() {
  const pathname = usePathname()
  return (
    <nav
      className="md:hidden fixed bottom-0 w-full bg-white border-t border-stone-200 z-40 flex justify-around items-center h-16 px-1 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      aria-label="Navegação mobile do painel"
    >
      {navItems.map(({ href, icon: Icon, short }) => {
        const active = isActive(pathname, href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-col items-center justify-center w-full h-full transition-colors',
              active ? 'text-[#DC2626]' : 'text-stone-500 hover:text-[#DC2626]'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium">{short}</span>
          </Link>
        )
      })}
    </nav>
  )
}
