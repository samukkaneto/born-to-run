import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import InstagramIcon from '@/components/ui/InstagramIcon'
import { site } from '@/lib/site'

const quickLinks = [
  { label: 'Início', href: '/' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Galeria', href: '/galeria' },
  { label: 'Contato', href: '/contato' },
]

const memberLinks = [
  { label: 'Entrar', href: '/login' },
  { label: 'Criar conta', href: '/cadastro' },
]

const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="bg-[#171717] text-[#D6D3D1]">
      <div className="container-main py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Marca */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded-md"
              aria-label="Born to Run — página inicial"
            >
              <div className="relative w-[210px] h-[66px]">
                <Image
                  src="/logo.png"
                  alt="Born to Run — Treinamento e Saúde"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'left center' }}
                  sizes="210px"
                />
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-[#A8A29E] max-w-sm mb-6">
              {site.tagline}. Equipe de corrida de rua e caminhada de{' '}
              {site.location}, comprometida com saúde, qualidade de vida e
              performance — do primeiro passo à linha de chegada.
            </p>

            <a
              href={site.social.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#A8A29E] hover:text-white transition-colors group"
            >
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#232323] group-hover:bg-[#DC2626] transition-colors">
                <InstagramIcon />
              </span>
              @{site.social.instagramHandle}
            </a>
          </div>

          {/* Links rápidos */}
          <div>
            <h3 className="text-white font-condensed font-semibold text-sm uppercase tracking-[0.18em] mb-5">
              Navegação
            </h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A8A29E] hover:text-[#DC2626] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h3 className="text-white font-condensed font-semibold text-sm uppercase tracking-[0.18em] mb-5 mt-8">
              Área de Membros
            </h3>
            <ul className="flex flex-col gap-2.5">
              {memberLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A8A29E] hover:text-[#DC2626] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato — apenas dados oficiais */}
          <div>
            <h3 className="text-white font-condensed font-semibold text-sm uppercase tracking-[0.18em] mb-5">
              Onde Estamos
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#DC2626] mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-sm text-[#A8A29E] leading-relaxed">
                  {site.city}, {site.state}
                  <br />
                  Brasil
                </span>
              </li>
              <li className="flex items-start gap-3">
                <InstagramIcon className="text-[#DC2626] mt-0.5 shrink-0" />
                <a
                  href={site.social.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#A8A29E] hover:text-white transition-colors"
                >
                  @{site.social.instagramHandle}
                </a>
              </li>
            </ul>

            <Link
              href="/contato"
              className="btn-secondary mt-6 text-sm"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </div>

      {/* Barra inferior */}
      <div className="border-t border-[#2E2E2E]">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#A8A29E] text-center sm:text-left">
            &copy; {CURRENT_YEAR} {site.name}. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[#A8A29E]">
            {site.location} · desde {site.foundedYear}
          </p>
        </div>
      </div>
    </footer>
  )
}
