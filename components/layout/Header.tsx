'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Início', href: '/' },
  { label: 'Sobre', href: '/sobre' },
  { label: 'Galeria', href: '/galeria' },
  { label: 'Loja', href: '/loja' },
  { label: 'Contato', href: '/contato' },
]

/**
 * Header público — barra carbono (#171717) com o logo original
 * (texto branco + eletrocardiograma colorido), navegação clara e
 * CTAs no estilo editorial das pranchas Fable 5.
 */
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setMenuOpen(false)
      requestAnimationFrame(() => {
        if (previousFocus?.isConnected) previousFocus.focus()
        else menuButtonRef.current?.focus()
      })
    }

    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <header
      className={cn(
        'fixed top-0 inset-x-0 z-50 bg-[#171717] transition-shadow duration-300',
        scrolled && 'shadow-[0_4px_24px_rgba(0,0,0,0.35)]'
      )}
    >
      <div className="container-main">
        <div className="flex items-center justify-between h-16 md:h-[76px]">
          {/* Logo — texto branco funciona sobre o carbono */}
          <Link
            href="/"
            className="relative flex items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626] rounded-md"
            aria-label="Born to Run — página inicial"
          >
            <div className="relative w-[150px] h-[52px] md:w-[190px] md:h-[64px]">
              <Image
                src="/logo.png"
                alt="Born to Run — Treinamento e Saúde"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left center' }}
                priority
                sizes="(max-width: 768px) 150px, 190px"
              />
            </div>
          </Link>

          {/* Navegação desktop */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9" aria-label="Navegação principal">
            {navLinks.map((link) => {
              const active = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'font-condensed text-[15px] font-medium uppercase tracking-wide transition-colors duration-200 relative pb-1',
                    'after:absolute after:bottom-0 after:left-0 after:h-[3px] after:bg-[#DC2626] after:transition-all after:duration-200',
                    active
                      ? 'text-[#F87171] after:w-full'
                      : 'text-[#F7F4EF] hover:text-[#F87171] after:w-0 hover:after:w-full'
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
              className="inline-flex items-center gap-2 font-condensed text-sm font-medium uppercase tracking-wide text-[#F7F4EF] border border-[#3d3d3d] hover:border-[#F7F4EF] rounded-lg px-4 py-2.5 transition-colors"
            >
              <User size={15} aria-hidden="true" />
              Área do atleta
            </Link>
            <Link
              href="/cadastro"
              className="inline-flex items-center font-condensed text-sm font-semibold uppercase tracking-wide bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg px-5 py-2.5 transition-colors"
            >
              Conheça a equipe
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            ref={menuButtonRef}
            type="button"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="md:hidden flex items-center justify-center w-12 h-12 rounded-lg text-[#F7F4EF] hover:bg-[#232323] transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Menu mobile — painel carbono */}
      <div
        id="mobile-menu"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-[#171717] border-t border-[#2E2E2E]',
          menuOpen ? 'max-h-[440px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <nav className="container-main py-4 flex flex-col gap-1" aria-label="Navegação mobile">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                'block px-3 py-3.5 rounded-lg font-condensed text-lg font-medium uppercase tracking-wide transition-colors',
                pathname === link.href
                  ? 'text-[#F87171]'
                  : 'text-[#F7F4EF] hover:text-[#F87171]'
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-3 border-t border-[#2E2E2E] mt-2 pb-2">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 font-condensed text-base font-medium uppercase tracking-wide text-[#171717] bg-[#F7F4EF] rounded-lg px-4 py-3.5 transition-colors hover:bg-white"
            >
              <User size={17} aria-hidden="true" />
              Área do atleta
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
