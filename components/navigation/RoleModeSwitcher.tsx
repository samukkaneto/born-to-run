import Link from 'next/link'
import { ShieldCheck, UserRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

type ManagementRole = Extract<UserRole, 'admin' | 'coach'>

export default function RoleModeSwitcher({
  role,
  activeMode,
  compact = false,
}: {
  role: ManagementRole
  activeMode: 'athlete' | 'management'
  compact?: boolean
}) {
  const managementLabel = role === 'coach' ? 'Modo treinador' : 'Modo administrador'
  const athleteLabel = role === 'coach' ? 'Modo atleta' : 'Modo aluno'
  const items = [
    { mode: 'athlete' as const, href: '/dashboard', label: athleteLabel, icon: UserRound },
    { mode: 'management' as const, href: '/admin', label: managementLabel, icon: ShieldCheck },
  ]

  return (
    <div
      className={cn('inline-flex max-w-full rounded-lg border border-[#D6D3D1] bg-[#F5F5F4] p-1', compact && 'w-full')}
      role="group"
      aria-label="Alternar modo de uso"
    >
      {items.map(({ mode, href, label, icon: Icon }) => {
        const active = activeMode === mode
        return (
          <Link
            key={mode}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'inline-flex min-h-9 min-w-0 items-center justify-center gap-1.5 rounded-md px-2.5 font-condensed text-[11px] font-semibold uppercase tracking-[0.06em] transition-colors sm:px-3',
              active
                ? 'bg-[#171717] text-white shadow-sm'
                : 'text-[#57534E] hover:bg-white hover:text-[#171717]',
              compact && 'flex-1 px-1.5 text-[9px] sm:flex-none sm:px-3 sm:text-[11px]',
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{label}</span>
          </Link>
        )
      })}
    </div>
  )
}
