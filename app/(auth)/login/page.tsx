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
    <div className="w-full rounded-[1.5rem] border border-[#171717]/10 bg-white p-6 shadow-[0_24px_70px_rgba(23,23,23,0.14)] sm:p-9">
      <header className="border-b border-[#E7E5E4] pb-5 text-center sm:pb-6">
        <p className="font-condensed text-[11px] font-bold uppercase tracking-[0.2em] text-[#DC2626]">
          Área do atleta
        </p>
        <h1 className="mt-2 font-display text-4xl uppercase leading-none text-[#171717] sm:text-[2.75rem]">
          Acesse sua conta
        </h1>
        <p className="mt-3 text-sm text-[#57534E]">
          Ainda não é membro?{' '}
          <Link
            href="/cadastro"
            className="font-semibold text-[#DC2626] underline-offset-4 transition-colors hover:text-[#B91C1C] hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#DC2626]"
          >
            Faça seu cadastro
          </Link>
        </p>
      </header>

      <form action={formAction} className="mt-6 space-y-4 sm:mt-7 sm:space-y-5">
        {!isPending && state.error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
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
            className="font-semibold text-[#DC2626] underline-offset-4 hover:text-[#B91C1C] hover:underline focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#DC2626]"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary group flex w-full items-center justify-center gap-2 py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Entrando…
            </>
          ) : (
            <>
              Entrar
              <ArrowRight
                className="h-5 w-5 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </>
          )}
        </button>
      </form>
    </div>
  )
}
