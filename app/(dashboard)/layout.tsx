import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Home, Image as ImageIcon, LogOut, Settings, Activity } from 'lucide-react'

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar Superior do App */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center">
                <div className="relative w-[150px] h-[50px]">
                  <Image
                    src="/logo.png"
                    alt="Born to Run"
                    fill
                    style={{ objectFit: 'contain', objectPosition: 'left center' }}
                  />
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 hidden sm:block">
                Olá, {user.user_metadata?.full_name || 'Atleta'}
              </span>
              <form action="/auth/signout" method="POST">
                <button
                  type="submit"
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-gray-100"
                  aria-label="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Menu Lateral (Desktop) */}
        <aside className="hidden md:block w-64 flex-shrink-0 pr-8">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="bg-red-50 text-[#DC2626] group flex items-center px-3 py-3 text-sm font-medium rounded-md"
            >
              <Home className="text-[#DC2626] flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Feed da Equipe
            </Link>
            <Link
              href="/treinos"
              className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors"
            >
              <Activity className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Meus Treinos
            </Link>
            <Link
              href="/fotos"
              className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors"
            >
              <ImageIcon className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Fotos e Momentos
            </Link>
            <Link
              href="/perfil"
              className="text-gray-700 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-3 py-3 text-sm font-medium rounded-md transition-colors"
            >
              <Settings className="text-gray-400 group-hover:text-gray-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5" />
              Meu Perfil
            </Link>
          </nav>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 pb-20 md:pb-0">
          {children}
        </main>
      </div>

      {/* Menu Inferior (Mobile Bottom Navigation) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-40 flex justify-around items-center h-16 px-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Link href="/dashboard" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#DC2626]">
          <Home className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Feed</span>
        </Link>
        <Link href="/treinos" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#DC2626]">
          <Activity className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Treinos</span>
        </Link>
        <Link href="/fotos" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#DC2626]">
          <ImageIcon className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Fotos</span>
        </Link>
        <Link href="/perfil" className="flex flex-col items-center justify-center w-full h-full text-gray-500 hover:text-[#DC2626]">
          <Settings className="h-6 w-6" />
          <span className="text-[10px] mt-1 font-medium">Perfil</span>
        </Link>
      </nav>
    </div>
  )
}
