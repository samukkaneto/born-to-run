'use client'

import { useState } from 'react'
import { Loader2, Plus } from 'lucide-react'

interface AdminFormProps {
  action: (fd: FormData) => Promise<{ error?: string; success?: boolean } | void>
  fields: {
    name:        string
    label:       string
    type:        'text' | 'textarea' | 'select' | 'date'
    placeholder?: string
    required?:   boolean
    options?:    { value: string; label: string }[]
  }[]
  submitLabel?: string
  onSuccess?:  () => void
}

export default function AdminForm({ action, fields, submitLabel = 'Salvar', onSuccess }: AdminFormProps) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    const result = await action(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
      onSuccess?.()
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(({ name, label, type, placeholder, required, options }) => (
        <div key={name}>
          <label htmlFor={`admin-${name}`}
                 className="block text-sm font-semibold text-stone-700 mb-1.5">
            {label} {required && <span className="text-[var(--color-red)]">*</span>}
          </label>

          {type === 'textarea' ? (
            <textarea id={`admin-${name}`} name={name} required={required}
                      placeholder={placeholder} rows={4}
                      className="input-base resize-none" />
          ) : type === 'select' ? (
            <select id={`admin-${name}`} name={name} required={required}
                    className="input-base bg-white">
              {options?.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          ) : (
            <input id={`admin-${name}`} name={name} type={type}
                   required={required} placeholder={placeholder}
                   className="input-base" />
          )}
        </div>
      ))}

      {error   && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">✓ Salvo com sucesso!</p>}

      <button type="submit" disabled={loading}
              className="btn-primary py-2.5">
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        {loading ? 'Salvando...' : submitLabel}
      </button>
    </form>
  )
}
