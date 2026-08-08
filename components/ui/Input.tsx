import { useId } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const errorId = error ? `${inputId}-error` : undefined
  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-stone-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn('input-base', error && 'border-[#DC2626]', className)}
        aria-invalid={!!error}
        aria-describedby={errorId}
        {...props}
      />
      {error && <p id={errorId} role="alert" className="text-xs text-[#B91C1C] mt-1">{error}</p>}
    </div>
  )
}
