import { createClient } from '@/lib/supabase/server'
import WorkoutsManager from '@/components/admin/WorkoutsManager'
import type { Workout } from '@/types'

export default async function AdminTreinosPage() {
  const supabase = await createClient()
  const { data: workouts } = (await supabase
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: false })) as { data: Workout[] | null }

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <p className="section-kicker mb-3">Treinos</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
          Gerenciar <span className="text-[#DC2626]">treinos</span>
        </h1>
        <p className="mt-3 text-sm text-[#57534E]">
          {workouts?.length ?? 0} treino(s) cadastrado(s). Crie, edite ou remova
          planilhas — os atletas veem tudo em tempo real.
        </p>
      </div>

      <WorkoutsManager workouts={workouts ?? []} />
    </div>
  )
}
