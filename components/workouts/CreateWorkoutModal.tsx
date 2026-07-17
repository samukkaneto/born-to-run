'use client'

import { useState } from 'react'
import { Plus, X, Loader2 } from 'lucide-react'
import { createWorkout } from '@/app/actions/workouts'

type Student = {
  user_id: string
  full_name: string | null
}

export function CreateWorkoutModal({ students }: { students: Student[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const formData = new FormData(e.currentTarget)
      await createWorkout(formData)
      setIsOpen(false)
    } catch (error: any) {
      alert(error.message || 'Erro ao criar treino')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-[#DC2626] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#B91C1C] transition-colors flex items-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Novo Treino Oficial</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Enviar Treino Privado</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título do Treino</label>
                <input 
                  type="text" 
                  name="title"
                  required
                  placeholder="Ex: Longão 15km / Tiro 400m"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                <textarea 
                  name="description"
                  required
                  rows={3}
                  placeholder="Instruções para o aluno..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] focus:border-transparent outline-none resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nível</label>
                  <select name="level" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] outline-none">
                    <option value="iniciante">Iniciante</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="avancado">Avançado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo</label>
                  <select name="objective" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] outline-none">
                    <option value="Condicionamento">Condicionamento</option>
                    <option value="Emagrecimento">Emagrecimento</option>
                    <option value="Maratona">Maratona</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para qual aluno?</label>
                <select name="assigned_to" required className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DC2626] outline-none font-medium">
                  <option value="">Selecione o atleta...</option>
                  {students.map(s => (
                    <option key={s.user_id} value={s.user_id}>{s.full_name || 'Atleta sem nome'}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">Apenas o treinador e este atleta poderão ver este treino.</p>
              </div>

              <div className="pt-4 border-t border-gray-100 mt-6">
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#DC2626] text-white py-3 rounded-lg font-bold hover:bg-[#B91C1C] transition-colors flex justify-center items-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Enviar Treino Privado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
