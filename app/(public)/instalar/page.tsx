import type { Metadata } from 'next'
import InstallAppCard from '@/components/pwa/InstallAppCard'

export const metadata: Metadata = {
  title: 'Instalar aplicativo | Born to Run',
  description: 'Instale a Born to Run no celular ou computador e acesse a comunidade em uma janela própria.',
}

export default function InstalarPage() {
  return (
    <section className="container-main py-16 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <p className="section-kicker mb-3">Aplicativo da equipe</p>
        <h1 className="font-display text-5xl uppercase leading-none sm:text-6xl">Leve a Born to Run com você</h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-stone-600">Instale a experiência web no seu dispositivo para abrir com ícone próprio e sem a moldura do navegador.</p>
        <div className="mt-10"><InstallAppCard /></div>
      </div>
    </section>
  )
}
