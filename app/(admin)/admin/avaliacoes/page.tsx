import { redirect } from 'next/navigation'
import { ClipboardList } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getAccessContext } from '@/lib/auth/access'
import { MEMBER_PROFILE_COLUMNS } from '@/lib/data/profiles'
import { createMediaUrl } from '@/lib/supabase/media'
import AssessmentManager from '@/components/admin/AssessmentManager'
import type { BodyAssessment, MemberProfile } from '@/types'

export default async function AdminAvaliacoesPage() {
  const [{ profile }, supabase] = await Promise.all([getAccessContext(), createClient()])
  if (!profile || !['admin', 'coach'].includes(profile.role)) redirect('/admin')

  const [assessmentsResult, athletesResult] = await Promise.all([
    supabase.from('body_assessments').select('*').order('assessed_at', { ascending: false }),
    supabase
      .from('profiles')
      .select(MEMBER_PROFILE_COLUMNS)
      .eq('membership_status', 'active')
      .order('full_name'),
  ])
  if (assessmentsResult.error || athletesResult.error) {
    throw new Error('Não foi possível carregar as avaliações e atletas.')
  }

  const assessments = await Promise.all((assessmentsResult.data ?? []).map(async (assessment) => ({
    ...assessment,
    source_url: await createMediaUrl(supabase, 'assessment-files', assessment.source_path),
  })))

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <p className="section-kicker mb-3">Acompanhamento físico</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
          Avaliações de <span className="text-[#DC2626]">bioimpedância</span>
        </h1>
        <p className="mt-3 flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-[#57534E]">
          <ClipboardList size={17} className="mt-0.5 shrink-0 text-[#7C3AED]" aria-hidden="true" />
          Registre os resultados medidos presencialmente. O histórico é privado entre treinador e atleta.
        </p>
      </div>
      <AssessmentManager
        assessments={assessments as (BodyAssessment & { source_url: string | null })[]}
        athletes={(athletesResult.data ?? []) as MemberProfile[]}
      />
    </div>
  )
}
