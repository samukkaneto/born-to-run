import type { Metadata } from 'next'
import Link from 'next/link'
import { WifiOff } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sem conexão | Born to Run',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <section className="container-main flex min-h-[65vh] items-center justify-center py-16 text-center">
      <div className="card max-w-lg p-8 sm:p-12">
        <WifiOff className="mx-auto text-[var(--color-red)]" size={40} aria-hidden="true" />
        <h1 className="mt-6 font-display text-4xl uppercase">Você está sem conexão</h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">Por segurança, feed, perfil e treinos privados não ficam guardados para uso offline. Reconecte-se para acessar os dados atualizados da equipe.</p>
        <Link href="/" className="btn-primary mt-7 justify-center">Tentar novamente</Link>
      </div>
    </section>
  )
}
