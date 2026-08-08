import { createClient } from '@/lib/supabase/server'
import WorkoutsManager from '@/components/admin/WorkoutsManager'
import type { Profile, TrainingGroup, WorkoutWithAssignments } from '@/types'

export default async function AdminTreinosPage() {
  const supabase = await createClient()
  const [workoutsResult, membersResult, groupsResult] = await Promise.all([
    supabase
      .from('workouts')
      .select('*, workout_assignments ( athlete_user_id, group_id )')
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .order('full_name'),
    supabase
      .from('training_groups')
      .select('*')
      .order('name'),
  ])

  if (workoutsResult.error || membersResult.error || groupsResult.error) {
    throw new Error('Não foi possível carregar os treinos e destinatários.')
  }

  const workouts = (workoutsResult.data ?? []) as unknown as WorkoutWithAssignments[]
  const members = (membersResult.data ?? []) as Profile[]
  const groups = (groupsResult.data ?? []) as TrainingGroup[]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="section-kicker mb-3">Treinos</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
          Gerenciar <span className="text-[#DC2626]">treinos</span>
        </h1>
        <p className="mt-3 text-sm text-[#57534E]">
          {workouts.length} treino(s) cadastrado(s). Envie cada plano para toda a equipe,
          grupos específicos ou atletas selecionados.
        </p>
      </div>

      <WorkoutsManager workouts={workouts} members={members} groups={groups} />
    </div>
  )
}
