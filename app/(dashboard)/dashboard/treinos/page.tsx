import { redirect } from 'next/navigation'
import AthleteTrainingPlan from '@/components/workouts/AthleteTrainingPlan'
import { createClient } from '@/lib/supabase/server'
import { getTodayCalendarDate } from '@/lib/utils'
import type { AssignedWorkout } from '@/types'

export default async function TreinosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase.rpc('get_my_assigned_workouts')
  if (error) throw new Error('Não foi possível carregar seu plano de treino.')

  return (
    <div className="mx-auto max-w-6xl animate-fade-in">
      <AthleteTrainingPlan
        workouts={(data ?? []) as AssignedWorkout[]}
        today={getTodayCalendarDate()}
      />
    </div>
  )
}
