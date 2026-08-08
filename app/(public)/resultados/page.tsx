import { redirect } from 'next/navigation'

// Resultados/momentos da equipe agora vivem na Galeria.
export default function ResultadosPage() {
  redirect('/galeria')
}
