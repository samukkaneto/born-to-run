import { redirect } from 'next/navigation'

/**
 * A raiz da área do aluno redireciona para o feed da equipe.
 * O dashboard completo (resumo, próximos treinos, comunicados)
 * será construído nas fases 7–10 do plano de reconstrução.
 */
export default function DashboardPage() {
  redirect('/dashboard/feed')
}
