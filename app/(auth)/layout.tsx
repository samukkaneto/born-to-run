import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex">
      {/* Painel esquerdo — decorativo (desktop) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12"
           style={{ background: 'linear-gradient(135deg, #e81010 0%, #a10000 100%)' }}>
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="relative w-44 h-14">
            <Image
              src="/logo.png"
              alt="Born to Run"
              fill
              style={{ objectFit: 'contain', objectPosition: 'left center',
                       filter: 'brightness(0) invert(1)' }}
              priority
            />
          </div>
        </Link>

        {/* Quote central */}
        <div>
          <blockquote className="text-white">
            <p className="font-display text-3xl font-bold leading-tight mb-4">
              "Transformando vidas através da corrida desde 2015"
            </p>
            <footer className="text-red-200 text-sm">
              — Born to Run · Descalvado, SP
            </footer>
          </blockquote>
        </div>

        {/* Stats rodapé */}
        <div className="flex gap-8">
          {[
            { value: '~200', label: 'Atletas' },
            { value: '+200', label: 'Corridas' },
            { value: '2015', label: 'Fundação' },
          ].map(({ value, label }) => (
            <div key={label} className="text-white">
              <div className="font-display text-2xl font-black">{value}</div>
              <div className="text-red-200 text-xs">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12">
        {/* Logo mobile */}
        <div className="lg:hidden mb-8">
          <Link href="/">
            <div className="relative w-40 h-12">
              <Image src="/logo.png" alt="Born to Run" fill
                     style={{ objectFit: 'contain' }} />
            </div>
          </Link>
        </div>

        <div className="w-full max-w-md">
          {children}
        </div>

        <p className="mt-8 text-stone-400 text-xs text-center">
          © {new Date().getFullYear()} Born to Run · Descalvado-SP ·{' '}
          <Link href="/" className="hover:text-[var(--color-red)] transition-colors">
            Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  )
}
