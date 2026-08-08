'use client'

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: number
  type: ToastType
  message: string
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de <ToastProvider>')
  return ctx
}

const STYLES: Record<
  ToastType,
  { bar: string; icon: React.ComponentType<{ size?: number; className?: string }>; iconColor: string }
> = {
  success: { bar: 'bg-[#16A34A]', icon: CheckCircle2, iconColor: 'text-[#16A34A]' },
  error:   { bar: 'bg-[#DC2626]', icon: XCircle,      iconColor: 'text-[#DC2626]' },
  warning: { bar: 'bg-[#F97316]', icon: AlertTriangle, iconColor: 'text-[#F97316]' },
  info:    { bar: 'bg-[#2563EB]', icon: Info,          iconColor: 'text-[#2563EB]' },
}

/** Provider de toasts (sucesso/erro/aviso/info) no padrão visual da marca. */
export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (type: ToastType, message: string) => {
      const id = nextId.current++
      setToasts((prev) => [...prev.slice(-3), { id, type, message }])
      window.setTimeout(() => dismiss(id), 5000)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Região de toasts */}
      <div
        className="pointer-events-none fixed bottom-20 left-1/2 z-[70] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4 md:bottom-6 md:left-auto md:right-6 md:translate-x-0 md:px-0"
        aria-live="polite"
        aria-atomic="false"
      >
        {toasts.map(({ id, type, message }) => {
          const { bar, icon: Icon, iconColor } = STYLES[type]
          return (
            <div
              key={id}
              role="status"
              className="animate-toast-in pointer-events-auto flex items-start gap-3 overflow-hidden rounded-lg border border-[#E5E1D8] bg-white shadow-card-lg"
            >
              <span className={`w-1.5 self-stretch ${bar}`} aria-hidden="true" />
              <Icon size={18} className={`mt-3 shrink-0 ${iconColor}`} aria-hidden="true" />
              <p className="flex-1 py-3 text-sm leading-snug text-[#171717]">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                className="p-3 text-[#A8A29E] transition-colors hover:text-[#171717]"
                aria-label="Fechar aviso"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}
