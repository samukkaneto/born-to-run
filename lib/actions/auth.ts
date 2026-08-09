'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { destinationForStatus } from '@/lib/auth/access'
import { cleanText, validateEmail } from '@/lib/validation'

export type AuthActionState = {
  error?: string
  success?: string
}

/** Origem pública do site (para links de e-mail do Supabase). */
async function getSiteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return new URL(`${proto === 'https' ? 'https' : 'http'}://${host}`).origin
}

export async function login(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createClient()

  const email = validateEmail(formData.get('email'))
  const password = String(formData.get('password') ?? '')
  if (!email || !password) {
    return { error: 'Informe um e-mail válido e sua senha.' }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: 'E-mail ou senha incorretos. Tente novamente.' }
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, membership_status')
    .eq('user_id', data.user.id)
    .maybeSingle()

  if (profileError) {
    await supabase.auth.signOut()
    return { error: 'Não foi possível verificar seu acesso. Tente novamente.' }
  }

  revalidatePath('/', 'layout')
  redirect(destinationForStatus(profile?.membership_status, profile?.role))
}

export async function signup(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createClient()

  const fullName = cleanText(formData.get('full_name'), 120)
  const email = validateEmail(formData.get('email'))
  const password = String(formData.get('password') ?? '')

  if (fullName.length < 2) {
    return { error: 'Informe seu nome completo.' }
  }
  if (!email) {
    return { error: 'Informe um e-mail válido.' }
  }
  if (password.length < 8 || !/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) {
    return { error: 'A senha deve ter ao menos 8 caracteres, uma letra e um número.' }
  }

  const origin = await getSiteOrigin()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/acesso-pendente`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este e-mail já está cadastrado. Faça login.' }
    }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  revalidatePath('/', 'layout')
  // Comunidade fechada: o treinador precisa aprovar todo novo cadastro.
  redirect('/acesso-pendente')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createClient()
  const email = validateEmail(formData.get('email'))
  if (!email) return { error: 'Informe um e-mail válido.' }

  // Correção da auditoria: o redirect apontava para a URL do Supabase
  // em vez da URL do site, quebrando o fluxo de recuperação.
  const origin = await getSiteOrigin()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/recuperar-senha/nova`,
  })

  if (error) {
    return { error: 'Erro ao enviar e-mail. Verifique o endereço digitado.' }
  }

  return { success: 'E-mail enviado! Verifique sua caixa de entrada.' }
}

export async function updatePassword(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sessão expirada. Solicite um novo link de recuperação.' }
  }

  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 8 || !/[A-Za-zÀ-ÿ]/.test(password) || !/\d/.test(password)) {
    return { error: 'A nova senha deve ter ao menos 8 caracteres, uma letra e um número.' }
  }
  if (password !== confirm) {
    return { error: 'As senhas não coincidem. Digite novamente.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: 'Erro ao atualizar a senha. Tente novamente.' }
  }

  revalidatePath('/', 'layout')
  redirect('/acesso')
}
