'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, X, MessageCircle } from 'lucide-react'

const navLinks = [
  { label: 'Sobre', href: '#sobre' },
  { label: 'Modalidades', href: '#modalidades' },
  { label: 'Como Funciona', href: '#como-funciona' },
  { label: 'Depoimentos', href: '#depoimentos' },
  { label: 'Contato', href: '#contato' },
]

const WHATSAPP_URL = 'https://wa.me/5519900000000'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/97 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.07)]'
          : 'bg-white/90 backdrop-blur-sm'
      }`}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-24 md:h-32">

          {/* Logo */}
          <Link
            href="/"
            className="relative flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded-md"
            aria-label="Born to Run — página inicial"
          >
            <div className="relative w-[280px] h-[80px] md:w-[380px] md:h-[120px] ml-2">
              <Image
                src="/logo.png"
                alt="Born to Run logo"
                fill
                style={{ objectFit: 'contain', objectPosition: 'center' }}
                priority
                sizes="(max-width: 768px) 280px, 380px"
              />
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Navegação principal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[#44403C] hover:text-[#DC2626] transition-colors duration-200 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-[#DC2626] after:transition-all after:duration-200 hover:after:w-full pb-0.5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Botões de Acesso (Login/Cadastro) */}
          <div className="hidden lg:flex items-center space-x-4 ml-6 pl-6 border-l border-gray-200">
            <Link
              href="/login"
              className="text-gray-600 hover:text-[#DC2626] font-medium transition-colors"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="bg-[#DC2626] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#B91C1C] hover:scale-105 transition-all shadow-sm flex items-center space-x-2"
            >
              <span>Comece Agora</span>
            </Link>
          </div>

          {/* Botão WhatsApp Desktop */}
          <div className="hidden lg:flex shrink-0 ml-4">
            <Link
              href="https://wa.me/5519999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-[#16a34a] bg-green-50 rounded-full border border-[#16a34a]/20 hover:bg-[#16a34a] hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#16a34a] shadow-sm hover:shadow"
              aria-label="Fale conosco via WhatsApp"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>WhatsApp</span>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#44403C] hover:bg-[#F5F5F4] transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-[480px] opacity-100' : 'max-h-0 opacity-0'
        } bg-white border-t border-[#E7E5E4]`}
      >
        <nav className="container-main py-4 flex flex-col gap-1" aria-label="Navegação mobile">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block px-3 py-3 rounded-lg text-base font-semibold text-[#44403C] hover:text-[#DC2626] hover:bg-[#FEE2E2] transition-colors"
            >
              {link.label}
            </a>
          ))}

          <div className="flex flex-col gap-2 pt-3 border-t border-[#E7E5E4] mt-2">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full text-base font-semibold text-[#16A34A] border-2 border-[#16A34A] hover:bg-[#16A34A] hover:text-white transition-all duration-200"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Fale pelo WhatsApp
            </a>
            <a
              href="#modalidades"
              onClick={closeMenu}
              className="flex items-center justify-center px-4 py-3 rounded-full text-base font-bold bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors"
            >
              Comece Agora
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}
