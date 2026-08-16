import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative min-h-[100svh] overflow-hidden bg-[#F7F4EF]">
      <Image
        src="/team-archive/team-race-palace.jpg"
        alt=""
        fill
        priority
        aria-hidden="true"
        className="object-cover object-[54%_center] opacity-55 lg:object-center lg:opacity-70"
        sizes="100vw"
      />
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#F7F4EF]/55 via-[#F7F4EF]/85 to-[#F7F4EF] lg:bg-gradient-to-r lg:from-[#F7F4EF]/88 lg:via-[#F7F4EF]/70 lg:to-[#F7F4EF]/95"
        aria-hidden="true"
      />

      <main className="relative z-10 mx-auto grid min-h-[100svh] max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between px-12 py-11 lg:flex xl:px-16 xl:py-14">
          <Link
            href="/"
            className="block w-80 focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#DC2626] xl:w-96"
            aria-label="Born to Run — página inicial"
          >
            <Image
              src="/brand/logo-com-contorno.png"
              alt="Born to Run — Treinamento e Saúde"
              width={988}
              height={599}
              className="h-auto w-full object-contain"
              priority
              sizes="384px"
            />
          </Link>

          <div className="max-w-2xl pb-8">
            <p className="section-kicker mb-6">Movimento e saúde · desde {site.foundedYear}</p>
            <p className="font-display text-6xl uppercase leading-[0.88] text-[#171717] xl:text-7xl">
              Seu ritmo.
              <br />
              Sua equipe.
              <br />
              <span className="text-[#DC2626]">Sua evolução.</span>
            </p>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-[#44403C]">
              Treinos orientados, acompanhamento do treinador e a energia de quem
              corre ao seu lado — tudo em um só lugar.
            </p>
          </div>

          <div className="flex items-center gap-8 border-t border-[#171717]/15 pt-6">
            <div>
              <p className="font-display text-3xl leading-none text-[#171717]">{site.stats.races}</p>
              <p className="mt-1 font-condensed text-[11px] uppercase tracking-[0.18em] text-[#57534E]">
                Participações em corridas
              </p>
            </div>
            <div className="h-10 w-px bg-[#171717]/15" aria-hidden="true" />
            <div>
              <p className="font-display text-3xl leading-none text-[#171717]">{site.stats.since}</p>
              <p className="mt-1 font-condensed text-[11px] uppercase tracking-[0.18em] text-[#57534E]">
                Juntos desde
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-[100svh] flex-col items-center justify-center px-5 py-7 sm:px-8 sm:py-10 lg:bg-[#F7F4EF]/92 lg:px-12">
          <div className="mb-5 flex w-full max-w-md flex-col items-center lg:hidden">
            <Link
              href="/"
              className="block w-[min(86vw,320px)] focus-visible:outline-2 focus-visible:outline-offset-6 focus-visible:outline-[#DC2626]"
              aria-label="Born to Run — página inicial"
            >
              <Image
                src="/brand/logo-com-contorno.png"
                alt="Born to Run — Treinamento e Saúde"
                width={988}
                height={599}
                className="h-auto w-full object-contain"
                priority
                sizes="320px"
              />
            </Link>
            <p className="mt-1 font-condensed text-[11px] font-semibold uppercase tracking-[0.2em] text-[#57534E]">
              Treinamento, movimento e saúde para todos
            </p>
          </div>

          <div className="w-full max-w-md">{children}</div>

          <p className="mt-6 text-center text-xs text-[#57534E]">
            © {new Date().getFullYear()} {site.shortName} · {site.location} ·{' '}
            <Link
              href="/"
              className="font-medium transition-colors hover:text-[#DC2626] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#DC2626]"
            >
              Voltar ao site
            </Link>
          </p>
        </section>
      </main>
    </div>
  )
}
