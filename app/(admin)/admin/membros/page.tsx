import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Clock3, Layers3, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createMediaUrl } from '@/lib/supabase/media'
import { MEMBER_PROFILE_COLUMNS } from '@/lib/data/profiles'
import { getAccessContext } from '@/lib/auth/access'
import MembersTable from '@/components/admin/MembersTable'
import GroupsManager from '@/components/admin/GroupsManager'
import type { MemberProfile, TrainingGroupWithMembers } from '@/types'

export default async function AdminMembrosPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const [{ user, profile }, supabase] = await Promise.all([
    getAccessContext(),
    createClient(),
  ])
  if (!user) redirect('/login')
  const isCoach = profile?.role === 'coach'
  const isAdmin = profile?.role === 'admin'

  const { data: memberData, error: membersError } = await supabase
    .from('profiles')
    .select(MEMBER_PROFILE_COLUMNS)
    .order('created_at', { ascending: true })
  if (membersError) throw new Error('Não foi possível carregar a gestão da equipe.')

  const groupResult = isCoach
    ? await supabase
        .from('training_groups')
        .select('*, training_group_members ( user_id )')
        .order('created_at', { ascending: false })
    : { data: [], error: null }
  if (groupResult.error) throw new Error('Não foi possível carregar os grupos de treino.')

  const members = await Promise.all(
    ((memberData ?? []) as MemberProfile[]).map(async (member) => ({
      ...member,
      avatar_url: await createMediaUrl(supabase, 'avatars', member.avatar_url),
    })),
  )
  const groups = (groupResult.data ?? []) as unknown as TrainingGroupWithMembers[]
  const { view } = await searchParams
  if (view === 'grupos' && !isCoach) redirect('/admin/membros')
  const showingGroups = view === 'grupos'
  const activeMembers = members.filter((member) => member.membership_status === 'active')
  const pendingCount = members.filter((member) => member.membership_status === 'pending').length

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-kicker mb-3">Equipe</p>
          <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
            Membros e <span className="text-[#DC2626]">grupos</span>
          </h1>
        </div>
        <div className="flex gap-4 font-condensed text-sm uppercase tracking-[0.08em] text-[#57534E]">
          <span className="flex items-center gap-1.5"><Users size={14} aria-hidden="true" /> {activeMembers.length} ativos</span>
          <span className="flex items-center gap-1.5"><Clock3 size={14} className="text-orange-700" aria-hidden="true" /> {pendingCount} pendentes</span>
        </div>
      </div>

      <nav className="flex gap-2 border-b border-[#E5E1D8]" aria-label="Gestão da equipe">
        <Link
          href="/admin/membros"
          aria-current={!showingGroups ? 'page' : undefined}
          className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 py-3 font-condensed text-sm font-semibold uppercase tracking-[0.08em] ${
            !showingGroups
              ? 'border-[#DC2626] text-[#171717]'
              : 'border-transparent text-[#57534E] hover:text-[#171717]'
          }`}
        >
          <Users size={16} aria-hidden="true" /> Membros
        </Link>
        {isCoach && (
          <Link
            href="/admin/membros?view=grupos"
            aria-current={showingGroups ? 'page' : undefined}
            className={`inline-flex min-h-11 items-center gap-2 border-b-2 px-4 py-3 font-condensed text-sm font-semibold uppercase tracking-[0.08em] ${
              showingGroups
                ? 'border-[#DC2626] text-[#171717]'
                : 'border-transparent text-[#57534E] hover:text-[#171717]'
            }`}
          >
            <Layers3 size={16} aria-hidden="true" /> Grupos
          </Link>
        )}
      </nav>

      {showingGroups ? (
        <GroupsManager groups={groups} members={members} />
      ) : (
        <MembersTable members={members} currentUserId={user.id} canManageRoles={isAdmin} />
      )}
    </div>
  )
}
