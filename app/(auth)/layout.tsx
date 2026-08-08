import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/lib/site'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#F7F4EF]">
      {/* Painel esquerdo — foto real da equipe + overlay carbono (desktop) */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-1/2">
        <Image
          src="/robson-running.jpg"
          alt=""
          fill
          priority
          aria-hidden="true"
          style={{ objectFit: 'cover', objectPosition: 'center' }}
          sizes="50vw"
        />
        {/* Overlay carbono para leitura (logo exige fundo escuro) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(23,23,23,0.82) 0%, rgba(23,23,23,0.55) 45%, rgba(23,23,23,0.88) 100%)',
          }}
          aria-hidden="true"
        />

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center">
          <div className="relative h-14 w-44">
            <Image
              src="/logo.png"
              alt="Born to Run — Treinamento e Saúde"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left center' }}
              priority
              sizes="176px"
            />
          </div>
        </Link>

        {/* Tagline editorial */}
        <div className="relative z-10">
          <p className="section-kicker mb-5">
            Área do atleta · desde {site.foundedYear}
          </p>
          <p className="font-display text-5xl uppercase leading-[0.95] text-white xl:text-6xl">
            Corra com propósito.
            <br />
            <span className="text-[#DC2626]">Evolua em equipe.</span>
          </p>
        </div>

        {/* Stats rodapé */}
        <div className="relative z-10 flex gap-10">
          {[
            { value: site.stats.athletes, label: 'Atletas' },
            { value: site.stats.races, label: 'Corridas' },
            { value: site.stats.since, label: 'Fundação' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="font-display text-3xl leading-none text-white">
                {value}
              </div>
              <div className="mt-1.5 font-condensed text-[11px] uppercase tracking-[0.18em] text-[#A8A29E]">
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
        {/* Logo mobile (faixa carbono — logo só funciona em fundo escuro) */}
        <div className="mb-8 lg:hidden">
          <Link
            href="/"
            className="inline-flex rounded-lg bg-[#171717] px-5 py-3"
            aria-label="Born to Run — página inicial"
          >
            <div className="relative h-11 w-36">
              <Image
                src="/logo.png"
                alt="Born to Run — Treinamento e Saúde"
                fill
                style={{ objectFit: 'contain' }}
                sizes="144px"
              />
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md">{children}</div>

        <p className="mt-8 text-center text-xs text-[#78716C]">
          © {new Date().getFullYear()} {site.shortName} · {site.location} ·{' '}
          <Link href="/" className="transition-colors hover:text-[#DC2626]">
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  )
}
