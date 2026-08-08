'use client'

import { useActionState } from 'react'
import { Lock, Loader2, AlertCircle } from 'lucide-react'
import { updatePassword, type AuthActionState } from '@/lib/actions/auth'

const initialState: AuthActionState = {}

/**
 * Página acessada pelo link de recuperação enviado por e-mail.
 * O callback (/auth/callback) troca o código por sessão e redireciona
 * para cá, onde o usuário define a nova senha.
 */
export default function NovaSenhaPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, initialState)

  return (
    <>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-black text-stone-900 mb-1">
          Nova senha 🔒
        </h1>
        <p className="text-stone-500">
          Defina uma nova senha para acessar sua conta.
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-stone-700 mb-1.5">
            Nova senha
          </label>
          <div className="relative">
            <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="8+ caracteres, com letra e número"
              className="input-base pl-10"
            />
          </div>
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-semibold text-stone-700 mb-1.5">
            Confirmar nova senha
          </label>
          <div className="relative">
            <Lock size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              id="confirm"
              name="confirm"
              type="password"
              required
              minLength={8}
              placeholder="Repita a nova senha"
              className="input-base pl-10"
            />
          </div>
        </div>

        {!isPending && state.error && (
          <div
            role="alert"
            className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg"
          >
            <AlertCircle size={16} className="shrink-0" />
            {state.error}
          </div>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full justify-center py-3"
        >
          {isPending ? (
            <><Loader2 size={18} className="animate-spin" /> Salvando...</>
          ) : (
            'Salvar nova senha'
          )}
        </button>
      </form>
    </>
  )
}
