import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth'
import { Rss, Dumbbell, User, LogOut, ShieldCheck } from 'lucide-react'

const navItems = [
  { href: '/dashboard/feed', icon: Rss, label: 'Feed da Equipe' },
  { href: '/dashboard/treinos', icon: Dumbbell, label: 'Treinos' },
  { href: '/dashboard/perfil', icon: User, label: 'Meu Perfil' },
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('user_id', user.id)
    .single()

  const isAdmin = profile?.role === 'admin'
  const firstName =
    (profile?.full_name || user.user_metadata?.full_name || 'Atleta').split(' ')[0]

  return (
    <div className="min-h-screen bg-[#F9F7F5] flex flex-col">
      {/* Barra superior */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-30">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/dashboard/feed" className="flex items-center shrink-0">
              <div className="relative w-[140px] h-[46px]">
                <Image
                  src="/logo.png"
                  alt="Born to Run"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'left center' }}
                  sizes="140px"
                />
              </div>
            </Link>
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-[#DC2626] border border-stone-200 rounded-full px-3 py-1.5 transition-colors"
                >
                  <ShieldCheck size={14} />
                  Painel Admin
                </Link>
              )}
              <span className="text-sm text-stone-500 hidden sm:block">
                Olá, {firstName}
              </span>
              <form action={logout}>
                <button
                  type="submit"
                  className="p-2 text-stone-400 hover:text-[#DC2626] transition-colors rounded-full hover:bg-stone-100"
                  aria-label="Sair da conta"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu lateral (desktop) */}
        <aside className="hidden md:block w-60 flex-shrink-0 pr-8">
          <nav className="space-y-1" aria-label="Navegação do painel">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link
                key={href}
                href={href}
                className="text-stone-700 hover:bg-white hover:text-[#DC2626] group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors"
              >
                <Icon className="text-stone-400 group-hover:text-[#DC2626] flex-shrink-0 mr-3 h-5 w-5" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 pb-20 md:pb-0 min-w-0">{children}</main>
      </div>

      {/* Navegação inferior (mobile) */}
      <nav
        className="md:hidden fixed bottom-0 w-full bg-white border-t border-stone-200 z-40 flex justify-around items-center h-16 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
        aria-label="Navegação mobile do painel"
      >
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center w-full h-full text-stone-500 hover:text-[#DC2626]"
          >
            <Icon className="h-6 w-6" />
            <span className="text-[10px] mt-1 font-medium">{label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
