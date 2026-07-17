import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, id, className, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-stone-700 mb-1.5">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn('input-base', error && 'border-[#DC2626]', className)}
        aria-invalid={!!error}
        {...props}
      />
      {error && <p className="text-xs text-[#B91C1C] mt-1">{error}</p>}
    </div>
  )
}
