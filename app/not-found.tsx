import Link from 'next/link'
import { ArrowLeft, MapPinOff } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F7F4EF] px-4 py-12">
      <div className="card max-w-lg space-y-5 p-8 text-center">
        <MapPinOff size={40} className="mx-auto text-[#DC2626]" aria-hidden="true" />
        <div>
          <p className="section-kicker mb-3">404</p>
          <h1 className="font-display text-4xl uppercase text-[#171717]">Rota não encontrada</h1>
          <p className="mt-2 text-sm text-[#57534E]">A página que você procurou não existe ou mudou de endereço.</p>
        </div>
        <Link href="/" className="btn-primary"><ArrowLeft size={16} aria-hidden="true" /> Voltar ao site</Link>
      </div>
    </main>
  )
}
