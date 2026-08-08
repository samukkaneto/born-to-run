import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Users, ShieldCheck } from 'lucide-react'
import MembersTable from '@/components/admin/MembersTable'
import type { Profile } from '@/types'

export default async function AdminMembrosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: members } = (await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true })) as { data: Profile[] | null }

  const total = members?.length ?? 0
  const admins = members?.filter((m) => m.role === 'admin').length ?? 0

  return (
    <div className="animate-fade-in space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker mb-3">Membros</p>
          <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
            Gerenciar <span className="text-[#DC2626]">membros</span>
          </h1>
        </div>
        <div className="flex gap-4 font-condensed text-sm uppercase tracking-[0.08em] text-[#57534E]">
          <span className="flex items-center gap-1.5">
            <Users size={14} aria-hidden="true" /> {total} membros
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#DC2626]" aria-hidden="true" /> {admins} admin
          </span>
        </div>
      </div>

      <MembersTable members={members ?? []} currentUserId={user.id} />
    </div>
  )
}
