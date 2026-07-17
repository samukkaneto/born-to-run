import { Dumbbell, Calendar, Target, Activity } from 'lucide-react'

type WorkoutProps = {
  title: string
  description: string
  level: string
  objective: string
  created_at: string
  authorName?: string
}

export function WorkoutCard({ title, description, level, objective, created_at, authorName }: WorkoutProps) {
  const formattedDate = new Date(created_at).toLocaleDateString('pt-BR')

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-shadow">
      <div className="p-5 border-b border-gray-50 flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center">
            <Calendar className="w-4 h-4 mr-1" />
            Enviado em {formattedDate}
            {authorName && ` por ${authorName}`}
          </p>
        </div>
        <div className="bg-red-50 p-2 rounded-lg">
          <Dumbbell className="w-6 h-6 text-[#DC2626]" />
        </div>
      </div>
      
      <div className="p-5">
        <p className="text-gray-800 whitespace-pre-wrap">{description}</p>
      </div>

      <div className="bg-gray-50 px-5 py-3 flex gap-4 border-t border-gray-100">
        <div className="flex items-center text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
          <Activity className="w-4 h-4 mr-1.5 text-blue-500" />
          Nível: {level.charAt(0).toUpperCase() + level.slice(1)}
        </div>
        <div className="flex items-center text-sm font-medium text-gray-600 bg-white px-3 py-1 rounded-full border border-gray-200">
          <Target className="w-4 h-4 mr-1.5 text-green-500" />
          Foco: {objective}
        </div>
      </div>
    </div>
  )
}
