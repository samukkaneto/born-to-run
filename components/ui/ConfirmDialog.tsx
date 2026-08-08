'use client'

import { useEffect, useRef } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/**
 * Diálogo de confirmação para ações destrutivas
 * ("Esta ação exige confirmação" — pranchas Fable 5).
 */
export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Remover',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[#171717]/60"
        onClick={onCancel}
        aria-label="Fechar diálogo"
        tabIndex={-1}
      />
      <div className="animate-scale-in relative w-full max-w-md rounded-xl border border-[#E5E1D8] bg-white p-6 shadow-card-lg">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#FEE2E2]">
            <AlertTriangle size={20} className="text-[#DC2626]" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              id="confirm-dialog-title"
              className="font-condensed text-lg font-semibold uppercase tracking-[0.04em] text-[#171717]"
            >
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[#57534E]">
              {description}
            </p>
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-outline text-sm"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-primary text-sm"
          >
            {loading && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
            {loading ? 'Removendo…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
