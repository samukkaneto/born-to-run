'use client'

import { useState } from 'react'
import { CheckCircle2, Send } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import {
  CONTACT_LIMITS,
  type ContactErrors,
  validateContactPayload,
} from '@/lib/contact'
import { site } from '@/lib/site'

interface FormState {
  name: string
  email: string
  message: string
  company: string
}

const initialState: FormState = { name: '', email: '', message: '', company: '' }

/**
 * Formulário de contato.
 *
 * O envio passa pelo endpoint do próprio site e é entregue pela Resend no
 * e-mail oficial. O Instagram e o link direto continuam como alternativas.
 */
export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<ContactErrors>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitError('')
    const validation = validateContactPayload(form)
    if (!validation.ok) {
      setErrors(validation.errors)
      return
    }

    setErrors({})
    setSubmitting(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const result = (await response.json().catch(() => ({}))) as {
        error?: string
        errors?: ContactErrors
      }

      if (!response.ok) {
        if (result.errors) setErrors(result.errors)
        setSubmitError(
          result.error ?? 'Não foi possível enviar agora. Tente novamente.',
        )
        return
      }

      setSubmitted(true)
    } catch {
      setSubmitError('Falha de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-7 w-7 text-[var(--color-green)]" />
        </span>
        <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-neutral-900">
          Mensagem enviada, {form.name.trim().split(' ')[0]}!
        </h3>
        <p className="max-w-md text-neutral-600" role="status">
          Ela foi entregue para {site.contact.email}. A equipe responderá no
          e-mail que você informou.
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(initialState)
            setSubmitted(false)
            setSubmitError('')
          }}
          className="text-sm font-medium text-[var(--color-red)] hover:underline"
        >
          Escrever outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-busy={submitting}
      className="card space-y-5 p-8"
    >
      <Input
        label="Nome"
        id="name"
        name="name"
        autoComplete="name"
        placeholder="Seu nome completo"
        value={form.name}
        maxLength={CONTACT_LIMITS.name}
        error={errors.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        label="E-mail"
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="voce@exemplo.com"
        value={form.email}
        maxLength={254}
        error={errors.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-neutral-800"
        >
          Mensagem
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Conte para a gente como podemos ajudar: quer começar a correr, entrar para a equipe, tirar dúvidas..."
          value={form.message}
          maxLength={CONTACT_LIMITS.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input-base resize-y"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? 'message-error' : undefined}
        />
        {errors.message && (
          <p id="message-error" role="alert" className="mt-1.5 text-sm text-[var(--color-red)]">
            {errors.message}
          </p>
        )}
      </div>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label htmlFor="company">Empresa</label>
        <input
          id="company"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          value={form.company}
          onChange={(event) => setForm({ ...form, company: event.target.value })}
        />
      </div>
      {submitError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {submitError}{' '}
          <a className="font-semibold underline" href={`mailto:${site.contact.email}`}>
            Enviar diretamente por e-mail
          </a>
          .
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        <Send className="h-4 w-4" />
        {submitting ? 'Enviando…' : 'Enviar mensagem'}
      </Button>
      <p className="text-xs leading-relaxed text-neutral-500">
        Seus dados serão usados somente para responder ao contato, conforme o{' '}
        <a href="/privacidade" className="font-medium underline underline-offset-2">
          Aviso de Privacidade
        </a>
        .
      </p>
    </form>
  )
}
