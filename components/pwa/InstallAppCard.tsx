'use client'

import { useState } from 'react'
import { CheckCircle2, Download, Share2, Smartphone } from 'lucide-react'
import { usePwaInstall } from '@/components/pwa/PwaProvider'

export default function InstallAppCard() {
  const { canInstall, isInstalled, install } = usePwaInstall()
  const [dismissed, setDismissed] = useState(false)

  if (isInstalled) {
    return (
      <div className="card flex items-start gap-4 p-6" role="status">
        <CheckCircle2 className="mt-1 shrink-0 text-green-600" aria-hidden="true" />
        <div><h2 className="font-display text-2xl uppercase">Aplicativo instalado</h2><p className="mt-1 text-sm text-stone-600">Abra a Born to Run pelo ícone na tela inicial do seu dispositivo.</p></div>
      </div>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <div className="card p-6 sm:p-8">
        <Download className="text-[var(--color-red)]" size={30} aria-hidden="true" />
        <h2 className="mt-5 font-display text-3xl uppercase">Android e computador</h2>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">No Chrome ou Edge, use o botão abaixo. Se ele ainda não aparecer, abra o menu do navegador e escolha “Instalar aplicativo”.</p>
        <button
          type="button"
          className="btn-primary mt-6 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!canInstall || dismissed}
          onClick={async () => setDismissed((await install()) === 'dismissed')}
        >
          <Download size={17} aria-hidden="true" />
          {canInstall && !dismissed ? 'Instalar Born to Run' : 'Use o menu do navegador'}
        </button>
      </div>
      <div className="card p-6 sm:p-8">
        <Share2 className="text-[var(--color-red)]" size={30} aria-hidden="true" />
        <h2 className="mt-5 font-display text-3xl uppercase">iPhone e iPad</h2>
        <ol className="mt-3 space-y-2 text-sm leading-relaxed text-stone-600">
          <li>1. Abra este site no Safari.</li>
          <li>2. Toque em Compartilhar.</li>
          <li>3. Escolha “Adicionar à Tela de Início”.</li>
          <li>4. Confirme em “Adicionar”.</li>
        </ol>
      </div>
      <div className="card flex items-start gap-4 p-6 lg:col-span-2">
        <Smartphone className="mt-1 shrink-0 text-[var(--color-red)]" aria-hidden="true" />
        <p className="text-sm leading-relaxed text-stone-600">A versão instalável é uma PWA: abre em janela própria, ganha ícone e continua sendo atualizada pela web. Ela ainda não é um binário publicado nas lojas Android ou iOS.</p>
      </div>
    </div>
  )
}
