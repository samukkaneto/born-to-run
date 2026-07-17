import { createClient } from '@/lib/supabase/server'
import { toggleAdminRole } from '@/lib/actions/admin'
import { formatDate } from '@/lib/utils'
import { Users, ShieldCheck, Shield } from 'lucide-react'
import Image from 'next/image'
import type { Profile } from '@/types'

export default async function AdminMembrosPage() {
  const supabase = await createClient()
  const { data: members } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true }) as { data: Profile[] | null }

  const total  = members?.length ?? 0
  const admins = members?.filter(m => m.role === 'admin').length ?? 0

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-black text-stone-900">Gerenciar Membros</h1>
        <div className="flex gap-3 text-sm text-stone-500">
          <span className="flex items-center gap-1"><Users size={14} /> {total} membros</span>
          <span className="flex items-center gap-1"><ShieldCheck size={14} className="text-[var(--color-red)]" /> {admins} admin</span>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-5 py-3 text-stone-500 font-semibold">Membro</th>
                <th className="text-left px-5 py-3 text-stone-500 font-semibold hidden md:table-cell">Cidade</th>
                <th className="text-left px-5 py-3 text-stone-500 font-semibold hidden md:table-cell">Cadastro</th>
                <th className="text-left px-5 py-3 text-stone-500 font-semibold">Função</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {members?.map(m => {
                const initials = (m.full_name || 'A').split(' ').map((n: string) => n[0]).slice(0,2).join('').toUpperCase()
                return (
                  <tr key={m.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {m.avatar_url
                            ? <Image src={m.avatar_url} alt={m.full_name} width={36} height={36} className="object-cover" />
                            : <span className="text-[var(--color-red)] font-bold text-xs">{initials}</span>
                          }
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{m.full_name || '—'}</p>
                          <p className="text-stone-400 text-xs truncate max-w-[160px]">{m.objetivo || 'Sem objetivo'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-stone-500 hidden md:table-cell">{m.cidade || '—'}</td>
                    <td className="px-5 py-3 text-stone-500 hidden md:table-cell">{formatDate(m.created_at)}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${m.role === 'admin' ? 'badge-red' : 'badge-green'}`}>
                        {m.role === 'admin' ? 'Admin' : 'Membro'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <form action={async () => {
                        'use server'
                        await toggleAdminRole(m.user_id, m.role)
                      }}>
                        <button type="submit"
                                className="p-1.5 rounded-lg text-stone-300 hover:text-[var(--color-red)] hover:bg-red-50 transition-colors"
                                title={m.role === 'admin' ? 'Remover admin' : 'Tornar admin'}>
                          {m.role === 'admin' ? <Shield size={15} /> : <ShieldCheck size={15} />}
                        </button>
                      </form>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {(!members || members.length === 0) && (
            <div className="p-12 text-center text-stone-400">
              <Users size={28} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Nenhum membro cadastrado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
