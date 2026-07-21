import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/lib/actions/auth'
import { LogOut, ShieldCheck } from 'lucide-react'
import { DashboardSidebarNav, DashboardBottomNav } from '@/components/dashboard/DashboardNav'

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
            <Link href="/dashboard" className="flex items-center shrink-0">
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
          <DashboardSidebarNav />
        </aside>

        {/* Conteúdo */}
        <main className="flex-1 pb-20 md:pb-0 min-w-0">{children}</main>
      </div>

      {/* Navegação inferior (mobile) */}
      <DashboardBottomNav />
    </div>
  )
}
