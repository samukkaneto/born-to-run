'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface AdminModalProps {
  open: boolean
  title: string
  subtitle?: string
  onClose: () => void
  children: React.ReactNode
}

/** Modal do painel do treinador (criar/editar treino e comunicado). */
export default function AdminModal({
  open,
  title,
  subtitle,
  onClose,
  children,
}: AdminModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    scrollRef.current?.scrollTo({ top: 0 })
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
      if (e.key !== 'Tab') return
      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
      previousFocus?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex h-[100dvh] items-stretch justify-center overflow-hidden p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#171717]/60"
        onClick={onClose}
        aria-label="Fechar janela"
        tabIndex={-1}
      />
      <div ref={dialogRef} className="animate-scale-in relative z-10 flex h-[100dvh] min-h-0 w-full max-w-lg flex-col overflow-hidden border border-[#E5E1D8] bg-white shadow-card-lg sm:h-auto sm:max-h-[92dvh] sm:rounded-xl">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5E1D8] bg-white px-4 pb-3 pt-[max(1rem,env(safe-area-inset-top))] sm:px-6 sm:py-4">
          <div>
            <h2
              id="admin-modal-title"
              className="font-display text-2xl uppercase leading-none text-[#171717]"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-xs text-[#78716C]">{subtitle}</p>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-[#A8A29E] transition-colors hover:bg-[#F5F5F4] hover:text-[#171717]"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">{children}</div>
      </div>
    </div>
  )
}
