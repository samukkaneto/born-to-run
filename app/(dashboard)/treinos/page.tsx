import { createClient } from '@/lib/supabase/server'
import { getStudents } from '@/app/actions/workouts'
import { CreateWorkoutModal } from '@/components/workouts/CreateWorkoutModal'
import { WorkoutCard } from '@/components/workouts/WorkoutCard'
import { redirect } from 'next/navigation'

export default async function TreinosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Pega o perfil para checar se é admin/treinador
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', user.id)
    .single()

  const isAdminOrTrainer = profile?.role === 'admin' || profile?.role === 'treinador'
  const students = isAdminOrTrainer ? await getStudents() : []

  // Busca os treinos
  // Pela regra de RLS no Supabase, o banco só retorna:
  // - Treinos criados por ele (se for treinador)
  // - Treinos designados para ele (se for aluno)
  const { data: workouts } = await supabase
    .from('workouts')
    .select(`
      *,
      profiles!workouts_created_by_fkey(full_name)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdminOrTrainer ? 'Central de Treinos' : 'Meus Treinos Oficiais'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdminOrTrainer 
              ? 'Gerencie e envie treinos privados para seus atletas.' 
              : 'Visualize os treinos enviados exclusivamente para você pelo seu treinador.'}
          </p>
        </div>
        
        {isAdminOrTrainer && (
          <CreateWorkoutModal students={students} />
        )}
      </div>

      <div className="space-y-6">
        {!workouts || workouts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum treino encontrado</h3>
            <p className="text-gray-500">
              {isAdminOrTrainer 
                ? 'Você ainda não enviou nenhum treino. Clique no botão acima para começar.' 
                : 'Seu treinador ainda não designou treinos para você esta semana.'}
            </p>
          </div>
        ) : (
          workouts.map((workout: any) => (
            <WorkoutCard 
              key={workout.id}
              title={workout.title}
              description={workout.description}
              level={workout.level}
              objective={workout.objective}
              created_at={workout.created_at}
              authorName={workout.profiles?.full_name}
            />
          ))
        )}
      </div>
    </div>
  )
}
