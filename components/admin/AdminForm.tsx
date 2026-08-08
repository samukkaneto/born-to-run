'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'

export interface AdminFormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'date'
  placeholder?: string
  required?: boolean
  options?: { value: string; label: string }[]
}

interface AdminFormProps {
  action: (fd: FormData) => Promise<{ error?: string; success?: boolean } | void>
  fields: AdminFormField[]
  submitLabel?: string
  /** Valores iniciais (modo edição) */
  defaultValues?: Record<string, string>
  /** Limpa o formulário após salvar (padrão: true no modo criação) */
  resetOnSuccess?: boolean
  onSuccess?: () => void
}

/** Formulário genérico do painel do treinador (criação e edição). */
export default function AdminForm({
  action,
  fields,
  submitLabel = 'Salvar',
  defaultValues,
  resetOnSuccess = !defaultValues,
  onSuccess,
}: AdminFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const form = e.currentTarget
    const result = await action(new FormData(form))
    if (result?.error) {
      setError(result.error)
    } else {
      if (resetOnSuccess) form.reset()
      onSuccess?.()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ name, label, type, placeholder, required, options }) => (
        <div key={name}>
          <label
            htmlFor={`admin-${name}`}
            className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]"
          >
            {label}{' '}
            {required && (
              <span className="text-[#DC2626]" aria-hidden="true">
                *
              </span>
            )}
          </label>

          {type === 'textarea' ? (
            <textarea
              id={`admin-${name}`}
              name={name}
              required={required}
              placeholder={placeholder}
              rows={4}
              defaultValue={defaultValues?.[name] ?? ''}
              className="input-base resize-none"
            />
          ) : type === 'select' ? (
            <select
              id={`admin-${name}`}
              name={name}
              required={required}
              defaultValue={defaultValues?.[name] ?? options?.[0]?.value}
              className="input-base bg-white"
            >
              {options?.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={`admin-${name}`}
              name={name}
              type={type}
              required={required}
              placeholder={placeholder}
              defaultValue={defaultValues?.[name] ?? ''}
              className="input-base"
            />
          )}
        </div>
      ))}

      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]"
        >
          {error}
        </p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto">
        {loading ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <Check size={16} aria-hidden="true" />
        )}
        {loading ? 'Salvando…' : submitLabel}
      </button>
    </form>
  )
}
