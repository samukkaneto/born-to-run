'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle } from 'lucide-react'
import { resetPassword, type AuthActionState } from '@/lib/actions/auth'

const initialState: AuthActionState = {}

export default function RecuperarSenhaPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, initialState)

  return (
    <>
      <Link href="/login"
            className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-700 text-sm mb-6 transition-colors">
        <ArrowLeft size={15} /> Voltar ao login
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-stone-900 mb-1">
          Recuperar senha 🔑
        </h1>
        <p className="text-stone-500">
          Digite seu e-mail e enviaremos um link para redefinir sua senha.
        </p>
      </div>

      {state.success ? (
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-[var(--color-green)]" />
          </div>
          <h2 className="font-display font-bold text-stone-800 text-xl mb-2">E-mail enviado!</h2>
          <p role="status" className="text-stone-500 text-sm mb-6">
            Verifique sua caixa de entrada e clique no link de redefinição de senha.
          </p>
          <Link href="/login" className="btn-primary w-full justify-center">
            Voltar ao login
          </Link>
        </div>
      ) : (
        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-stone-700 mb-1.5">
              E-mail da conta
            </label>
            <div className="relative">
              <Mail size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className="input-base pl-10"
              />
            </div>
          </div>

          {!isPending && state.error && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
            >
              {state.error}
            </div>
          )}

          <button
            id="reset-submit-btn"
            type="submit"
            disabled={isPending}
            className="btn-primary w-full justify-center py-3"
          >
            {isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Enviando...</>
            ) : (
              'Enviar link de redefinição'
            )}
          </button>
        </form>
      )}
    </>
  )
}
