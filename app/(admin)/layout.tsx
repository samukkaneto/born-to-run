import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, Dumbbell, Megaphone, Users, ArrowLeft } from 'lucide-react'

const navItems = [
  { href: '/admin',             icon: ShieldCheck, label: 'Visão Geral' },
  { href: '/admin/treinos',     icon: Dumbbell,    label: 'Treinos'     },
  { href: '/admin/comunicados', icon: Megaphone,   label: 'Comunicados' },
  { href: '/admin/membros',     icon: Users,       label: 'Membros'     },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('user_id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard')

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#fafaf9' }}>
      {/* Header */}
      <header style={{
        backgroundColor: '#18181b', color: '#fff', padding: '0 32px',
        height: '56px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', backgroundColor: '#e81010',
            borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <span style={{ fontWeight: 700, fontSize: '15px' }}>Painel Admin</span>
            <span style={{ color: '#71717a', fontSize: '12px', marginLeft: '8px' }}>Born to Run</span>
          </div>
        </div>
        <Link href="/dashboard" style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          color: '#a1a1aa', textDecoration: 'none', fontSize: '13px',
          transition: 'color 0.2s',
        }}>
          <ArrowLeft size={14} /> Voltar ao Dashboard
        </Link>
      </header>

      {/* Body */}
      <div style={{ display: 'flex', maxWidth: '1100px', margin: '0 auto', padding: '32px 24px', gap: '28px' }}>
        {/* Sidebar */}
        <aside style={{
          width: '200px', minWidth: '200px', flexShrink: 0,
        }}>
          <nav style={{
            backgroundColor: '#fff', borderRadius: '14px',
            border: '1px solid #e7e5e4', padding: '8px', overflow: 'hidden',
          }}>
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 12px', borderRadius: '8px',
                color: '#57534e', textDecoration: 'none',
                fontSize: '13px', fontWeight: 500, marginBottom: '2px',
              }} className="admin-nav-link">
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main style={{ flex: 1, minWidth: 0 }}>
          {children}
        </main>
      </div>

      <style>{`
        .admin-nav-link:hover { background: #f5f5f4; color: #e81010; }
      `}</style>
    </div>
  )
}
