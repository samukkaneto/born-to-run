import Image from 'next/image'
import Link from 'next/link'
import { site } from '@/lib/site'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Painel esquerdo — decorativo (desktop) */}
      <div
        className="relative hidden flex-col justify-between p-12 lg:flex lg:w-1/2"
        style={{
          background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-14 w-44">
            <Image
              src="/logo.png"
              alt="Born to Run"
              fill
              style={{
                objectFit: 'contain',
                objectPosition: 'left center',
                filter: 'brightness(0) invert(1)',
              }}
              priority
            />
          </div>
        </Link>

        {/* Frase central */}
        <div>
          <blockquote className="text-white">
            <p className="mb-4 font-[family-name:var(--font-barlow)] text-3xl font-bold leading-tight">
              &ldquo;{site.tagline}&rdquo;
            </p>
            <footer className="text-sm text-red-200">
              — {site.shortName} · {site.location}
            </footer>
          </blockquote>
        </div>

        {/* Stats rodapé */}
        <div className="flex gap-8">
          {[
            { value: site.stats.athletes, label: 'Atletas' },
            { value: site.stats.races, label: 'Corridas' },
            { value: site.stats.since, label: 'Fundação' },
          ].map(({ value, label }) => (
            <div key={label} className="text-white">
              <div className="font-[family-name:var(--font-barlow)] text-2xl font-black">
                {value}
              </div>
              <div className="text-xs text-red-200">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
        {/* Logo mobile */}
        <div className="mb-8 lg:hidden">
          <Link href="/">
            <div className="relative h-12 w-40">
              <Image
                src="/logo.png"
                alt="Born to Run"
                fill
                style={{ objectFit: 'contain' }}
              />
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md">{children}</div>

        <p className="mt-8 text-center text-xs text-neutral-400">
          © {new Date().getFullYear()} {site.shortName} · {site.location} ·{' '}
          <Link
            href="/"
            className="transition-colors hover:text-[var(--color-red)]"
          >
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  )
}
