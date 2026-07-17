import { redirect } from 'next/navigation'

// A história da equipe está na página Sobre.
export default function HistoriaPage() {
  redirect('/sobre')
}
