'use client'

import { useState } from 'react'
import { CheckCircle2, Mail, Send } from 'lucide-react'
import InstagramIcon from '@/components/ui/InstagramIcon'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { site } from '@/lib/site'

interface FormState {
  name: string
  email: string
  message: string
}

const initialState: FormState = { name: '', email: '', message: '' }

/**
 * Formulário de contato.
 *
 * O envio prepara uma mensagem no cliente de e-mail do visitante para o canal
 * oficial do projeto. O Instagram continua disponível como alternativa.
 */
export default function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState)
  const [errors, setErrors] = useState<Partial<FormState>>({})
  const [submitted, setSubmitted] = useState(false)

  function validate(): boolean {
    const next: Partial<FormState> = {}
    if (form.name.trim().length < 2) next.name = 'Informe seu nome.'
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim()))
      next.email = 'Informe um e-mail válido.'
    if (form.message.trim().length < 10)
      next.message = 'Escreva uma mensagem com pelo menos 10 caracteres.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (validate()) setSubmitted(true)
  }

  if (submitted) {
    const subject = encodeURIComponent('Contato pelo site Born to Run')
    const body = encodeURIComponent(
      `Nome: ${form.name.trim()}\nE-mail para retorno: ${form.email.trim()}\n\nMensagem:\n${form.message.trim()}`
    )
    const emailHref = `mailto:${site.contact.email}?subject=${subject}&body=${body}`

    return (
      <div className="card flex flex-col items-center gap-4 p-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
          <CheckCircle2 className="h-7 w-7 text-[var(--color-green)]" />
        </span>
        <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-neutral-900">
          Mensagem pronta, {form.name.trim().split(' ')[0]}!
        </h3>
        <p className="max-w-md text-neutral-600">
          Clique abaixo para abrir seu aplicativo de e-mail com a mensagem já
          preenchida para a equipe.
        </p>
        <Button href={emailHref} size="lg">
          <Mail className="h-5 w-5" />
          Enviar por e-mail
        </Button>
        <Button
          href={site.social.instagramUrl}
          variant="outline"
          target="_blank"
          rel="noopener noreferrer"
        >
          <InstagramIcon className="h-5 w-5" />
          Preferir Instagram
        </Button>
        <p className="max-w-md text-sm text-neutral-500">
          Destinatário: {site.contact.email}
        </p>
        <button
          type="button"
          onClick={() => {
            setForm(initialState)
            setSubmitted(false)
          }}
          className="text-sm font-medium text-[var(--color-red)] hover:underline"
        >
          Escrever outra mensagem
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="card space-y-5 p-8">
      <Input
        label="Nome"
        id="name"
        name="name"
        placeholder="Seu nome completo"
        value={form.name}
        error={errors.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        label="E-mail"
        id="email"
        name="email"
        type="email"
        placeholder="voce@exemplo.com"
        value={form.email}
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
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="input-base resize-y"
        />
        {errors.message && (
          <p className="mt-1.5 text-sm text-[var(--color-red)]">
            {errors.message}
          </p>
        )}
      </div>
      <Button type="submit" size="lg" className="w-full">
        <Send className="h-4 w-4" />
        Enviar mensagem
      </Button>
    </form>
  )
}
