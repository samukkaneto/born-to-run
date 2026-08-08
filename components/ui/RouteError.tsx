'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

export default function RouteError({
  error,
  reset,
  homeHref = '/',
}: {
  error: Error & { digest?: string }
  reset: () => void
  homeHref?: string
}) {
  useEffect(() => {
    console.error('Born to Run route error', error.digest ?? error.name)
  }, [error])

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg items-center justify-center px-4 py-12">
      <div className="card w-full space-y-5 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-[#FEE2E2] text-[#DC2626]">
          <AlertTriangle size={26} aria-hidden="true" />
        </span>
        <div>
          <h1 className="font-display text-3xl uppercase text-[#171717]">Algo saiu do ritmo</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#57534E]">
            Não foi possível carregar esta área agora. Tente novamente; se o problema continuar,
            avise o treinador.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-2 sm:flex-row">
          <button type="button" onClick={reset} className="btn-primary">
            <RotateCcw size={16} aria-hidden="true" /> Tentar novamente
          </button>
          <Link href={homeHref} className="btn-outline">
            <Home size={16} aria-hidden="true" /> Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
