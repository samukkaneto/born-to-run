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
  const closeRef = useRef<HTMLButtonElement>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
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
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
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
      <div ref={dialogRef} className="animate-scale-in relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-xl border border-[#E5E1D8] bg-white shadow-card-lg sm:rounded-xl">
        <div className="sticky top-0 flex items-start justify-between gap-4 border-b border-[#E5E1D8] bg-white px-6 py-4">
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
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
