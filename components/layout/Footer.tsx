import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle, MapPin, Phone, Mail } from 'lucide-react'

const quickLinks = [
  { label: 'Sobre Nós', href: '#sobre' },
  { label: 'Modalidades', href: '#modalidades' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]

const INSTAGRAM_URL = 'https://instagram.com/equipeborntorun'
const WHATSAPP_URL = 'https://wa.me/5519900000000'
const CURRENT_YEAR = new Date().getFullYear()

export default function Footer() {
  return (
    <footer id="contato" className="bg-[#1C1917] text-[#D6D3D1]">

      {/* Main footer body */}
      <div className="container-main py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link
              href="/"
              className="inline-flex items-center mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded-md"
              aria-label="Born to Run — página inicial"
            >
              <div className="relative w-[300px] h-[120px] md:w-[450px] md:h-[160px] shrink-0 transform scale-110 md:scale-125 origin-left">
                <Image
                  src="/logo.png"
                  alt="Born to Run logo"
                  fill
                  style={{ objectFit: 'contain', objectPosition: 'left center' }}
                  sizes="(max-width: 768px) 300px, 450px"
                />
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-[#A8A29E] max-w-sm mb-6">
              Equipe de corrida e caminhada comprometida com a sua saúde,
              qualidade de vida e performance. Do primeiro passo à linha de chegada.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Born to Run"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#292524] text-[#A8A29E] hover:bg-[#DC2626] hover:text-white transition-all duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp da Born to Run"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#292524] text-[#A8A29E] hover:bg-[#16A34A] hover:text-white transition-all duration-200"
              >
                <MessageCircle size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Links Rápidos
            </h3>
            <ul className="flex flex-col gap-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[#A8A29E] hover:text-[#DC2626] transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-widest mb-5">
              Contato
            </h3>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#DC2626] mt-0.5 shrink-0" aria-hidden="true" />
                <span className="text-sm text-[#A8A29E] leading-relaxed">
                  Descalvado, SP<br />Brasil
                </span>
              </li>
              <li>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[#A8A29E] hover:text-[#16A34A] transition-colors"
                >
                  <Phone size={16} className="text-[#DC2626] shrink-0" aria-hidden="true" />
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="mailto:contato@borntorun.com.br"
                  className="flex items-center gap-3 text-sm text-[#A8A29E] hover:text-[#DC2626] transition-colors"
                >
                  <Mail size={16} className="text-[#DC2626] shrink-0" aria-hidden="true" />
                  contato@borntorun.com.br
                </a>
              </li>
            </ul>

            {/* WhatsApp CTA button */}
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-full text-sm font-bold bg-[#16A34A] text-white hover:bg-[#15803D] transition-colors duration-200"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Fale Conosco
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#292524]">
        <div className="container-main py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#57534E] text-center sm:text-left">
            &copy; {CURRENT_YEAR} Born to Run Treinamento e Saúde. Todos os direitos reservados.
          </p>
          <p className="text-xs text-[#57534E]">
            Feito com{' '}
            <span className="text-[#DC2626]" aria-label="amor">
              &hearts;
            </span>{' '}
            para corredores
          </p>
        </div>
      </div>
    </footer>
  )
}
