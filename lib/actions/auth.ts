'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

/** Origem pública do site (para links de e-mail do Supabase). */
async function getSiteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  const h = await headers()
  const host = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const proto = h.get('x-forwarded-proto') ?? 'http'
  return `${proto}://${host}`
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  })

  if (error) {
    return { error: 'E-mail ou senha incorretos. Tente novamente.' }
  }

  // Admin (Robson) vai direto ao painel; aluno vai ao dashboard.
  let destination = '/dashboard'
  if (data.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', data.user.id)
      .single()
    if (profile?.role === 'admin') destination = '/admin'
  }

  revalidatePath('/', 'layout')
  redirect(destination)
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const fullName = formData.get('full_name') as string
  const email    = formData.get('email') as string
  const password = formData.get('password') as string

  if (password.length < 6) {
    return { error: 'A senha deve ter pelo menos 6 caracteres.' }
  }

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Este e-mail já está cadastrado. Faça login.' }
    }
    return { error: 'Erro ao criar conta. Tente novamente.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  const email = (formData.get('email') as string)?.trim()

  if (!email) return { error: 'Informe o e-mail da sua conta.' }

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

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Sessão expirada. Solicite um novo link de recuperação.' }
  }

  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string

  if (!password || password.length < 6) {
    return { error: 'A nova senha deve ter pelo menos 6 caracteres.' }
  }
  if (password !== confirm) {
    return { error: 'As senhas não coincidem. Digite novamente.' }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: 'Erro ao atualizar a senha. Tente novamente.' }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
