'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Galeria', href: '/galeria' },
  { label: 'Contato', href: '/contato' },
]

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-[0_2px_16px_rgba(0,0,0,0.07)]'
          : 'bg-white/90 backdrop-blur-sm'
      )}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="relative flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded-md"
            aria-label="Born to Run — página inicial"
          >
            <div className="relative w-[170px] h-[54px] md:w-[210px] md:h-[66px]">
              <Image
                src="/logo.png"
                alt="Born to Run — Treinamento e Saúde"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left center' }}
                priority
                sizes="(max-width: 768px) 170px, 210px"
              />
            </div>
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Navegação principal">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'text-sm font-semibold transition-colors duration-200 relative pb-0.5',
                    'after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-[#DC2626] after:transition-all after:duration-200',
                    active
                      ? 'text-[#DC2626] after:w-full'
                      : 'text-[#44403C] hover:text-[#DC2626] after:w-0 hover:after:w-full'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* CTAs desktop */}
          <div className="hidden md:flex items-center gap-3 ml-6">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#44403C] hover:text-[#DC2626] transition-colors px-3 py-2"
            >
              <LogIn size={16} aria-hidden="true" />
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary text-sm">
              Comece Agora
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-[#44403C] hover:bg-[#F5F5F4] transition-colors"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        id="mobile-menu"
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-t border-[#E7E5E4]',
          menuOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="container-main py-4 flex flex-col gap-1" aria-label="Navegação mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'block px-3 py-3 rounded-lg text-base font-semibold transition-colors',
                pathname === link.href
                  ? 'text-[#DC2626] bg-[#FEE2E2]'
                  : 'text-[#44403C] hover:text-[#DC2626] hover:bg-[#FEE2E2]'
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="flex flex-col gap-2 pt-3 border-t border-[#E7E5E4] mt-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="btn-outline justify-center py-3 text-base"
            >
              <LogIn size={17} aria-hidden="true" />
              Entrar
            </Link>
            <Link
              href="/cadastro"
              onClick={() => setMenuOpen(false)}
              className="btn-primary justify-center py-3 text-base"
            >
              Comece Agora
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
