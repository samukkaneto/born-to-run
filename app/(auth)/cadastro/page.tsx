'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import { signup } from '@/lib/actions/auth'

export default function CadastroPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await signup(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="card w-full space-y-8 p-8 sm:p-10">
      <div className="text-center">
        <h1 className="font-[family-name:var(--font-barlow)] text-3xl font-bold uppercase tracking-wide text-neutral-900">
          Crie sua conta
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Já é membro?{' '}
          <Link
            href="/login"
            className="font-medium text-[var(--color-red)] transition-colors hover:text-red-700"
          >
            Faça login
          </Link>
        </p>
      </div>

      <form action={handleSubmit} className="space-y-5">
        {error && (
          <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Input
          label="Nome completo"
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          required
          placeholder="Seu nome e sobrenome"
        />
        <Input
          label="E-mail"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="voce@exemplo.com"
        />
        <Input
          label="Senha"
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          placeholder="Mínimo de 6 caracteres"
        />

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary group flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Criar minha conta
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
