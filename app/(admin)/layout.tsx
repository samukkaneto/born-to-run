import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { logout } from '@/lib/actions/auth'
import { getAccessContext } from '@/lib/auth/access'
import { LogOut, ShieldCheck } from 'lucide-react'
import AdminNav, { AdminNavMobile } from '@/components/admin/AdminNav'
import ToastProvider from '@/components/ui/Toaster'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile } = await getAccessContext()
  if (!user) redirect('/login')
  if (!profile || profile.membership_status === 'pending') redirect('/acesso-pendente')
  if (profile.membership_status !== 'active') redirect('/acesso-bloqueado')
  if (profile?.role !== 'admin') redirect('/dashboard')

  const firstName = (profile?.full_name || 'Treinador').split(' ')[0]

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-[#F7F4EF]">
        <a href="#conteudo-principal" className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-lg bg-white px-4 py-3 font-semibold text-[#171717] shadow-card-lg transition-transform focus:translate-y-0">
          Pular para o conteúdo
        </a>
        {/* ── Sidebar carbono fixa (desktop) ── */}
        <aside className="panel-carbon fixed inset-y-0 left-0 z-40 hidden w-64 flex-col md:flex">
          <div className="border-b border-[#2E2E2E] px-5 py-5">
            <Link href="/admin" className="inline-flex" aria-label="Painel do treinador">
              <div className="relative h-[46px] w-[150px]">
                <Image
                  src="/logo.png"
                  alt="Born to Run — Treinamento e Saúde"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'left center' }}
                  sizes="150px"
                />
              </div>
            </Link>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-[#DC2626] px-2.5 py-1 font-condensed text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
              <ShieldCheck size={12} aria-hidden="true" />
              Painel do treinador
            </p>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-5">
            <AdminNav />
          </div>

          <div className="border-t border-[#2E2E2E] p-3">
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3.5 py-3 font-condensed text-sm font-medium uppercase tracking-[0.08em] text-[#A8A29E] transition-colors hover:bg-[#232323] hover:text-white"
              >
                <LogOut className="h-5 w-5 text-[#78716C]" aria-hidden="true" />
                Sair da conta
              </button>
            </form>
          </div>
        </aside>

        {/* ── Coluna principal ── */}
        <div className="flex min-w-0 flex-1 flex-col md:pl-64">
          {/* Topo mobile (carbono) */}
          <header className="panel-carbon sticky top-0 z-30 md:hidden">
            <div className="flex h-16 items-center justify-between px-4">
              <Link href="/admin" className="flex shrink-0 items-center gap-3">
                <div className="relative h-[40px] w-[124px]">
                  <Image
                    src="/logo.png"
                    alt="Born to Run"
                    fill
                    style={{ objectFit: 'contain', objectPosition: 'left center' }}
                    sizes="124px"
                  />
                </div>
                <span className="rounded-md bg-[#DC2626] px-2 py-0.5 font-condensed text-[10px] font-semibold uppercase tracking-[0.12em] text-white">
                  Treinador
                </span>
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-lg p-2.5 text-[#A8A29E] transition-colors hover:bg-[#232323] hover:text-white"
                  aria-label="Sair da conta"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </form>
            </div>
            <div className="border-t border-[#2E2E2E]">
              <AdminNavMobile />
            </div>
          </header>

          {/* Barra de contexto (desktop) */}
          <div className="hidden border-b border-[#E5E1D8] bg-white md:block">
            <div className="flex h-16 items-center justify-between px-6 lg:px-8">
              <p className="font-condensed text-sm font-medium uppercase tracking-[0.12em] text-[#57534E]">
                Olá, <span className="text-[#171717]">{firstName}</span> — gestão da equipe
              </p>
              <span className="font-condensed text-xs uppercase tracking-[0.18em] text-[#A8A29E]">
                Born to Run · painel do treinador
              </span>
            </div>
          </div>

          {/* Conteúdo */}
          <main id="conteudo-principal" tabIndex={-1} className="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
