'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
import Input from '@/components/ui/Input'
import { login, type AuthActionState } from '@/lib/actions/auth'

const initialState: AuthActionState = {}

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(login, initialState)

  return (
    <div className="card w-full space-y-8 p-8 sm:p-10">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-neutral-900">
          Acesse sua conta
        </h1>
        <p className="mt-2 text-sm text-neutral-600">
          Ainda não é membro?{' '}
          <Link
            href="/cadastro"
            className="font-medium text-[var(--color-red)] transition-colors hover:text-red-700"
          >
            Faça seu cadastro
          </Link>
        </p>
      </div>

      <form action={formAction} className="space-y-5">
        {!isPending && state.error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{state.error}</p>
          </div>
        )}

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
          autoComplete="current-password"
          required
          placeholder="Sua senha"
        />

        <div className="flex justify-end text-sm">
          <Link
            href="/recuperar-senha"
            className="font-medium text-[var(--color-red)] hover:text-red-700"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary group flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Entrar
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
