'use server'

import { revalidatePath } from 'next/cache'
import { getAccessContext } from '@/lib/auth/access'
import { removeMedia } from '@/lib/supabase/media'
import {
  cleanText,
  isUuid,
  parseOptionalInteger,
  parseOptionalPositiveNumber,
  parsePace,
  validateImageFile,
} from '@/lib/validation'

export type FeedActionResult = {
  success?: boolean
  error?: string
  liked?: boolean
}

async function requireActiveMember() {
  const context = await getAccessContext()
  if (!context.user) return { ...context, accessError: 'Não autenticado.' }
  if (context.profile?.membership_status !== 'active') {
    return { ...context, accessError: 'Seu acesso à comunidade não está ativo.' }
  }
  return { ...context, accessError: null }
}

export async function createPost(formData: FormData): Promise<FeedActionResult> {
  const { supabase, user, accessError } = await requireActiveMember()
  if (accessError || !user) return { error: accessError ?? 'Não autenticado.' }

  const caption = cleanText(formData.get('caption'), 1000)
  const distance = parseOptionalPositiveNumber(formData.get('distance'), 999.99)
  const duration = parseOptionalInteger(formData.get('duration'), 10080)
  const pace = parsePace(formData.get('pace'))
  const fileEntry = formData.get('photo')
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null

  if (distance === 'invalid') return { error: 'Informe uma distância válida de até 999,99 km.' }
  if (duration === 'invalid') return { error: 'Informe uma duração válida em minutos.' }
  if (pace === 'invalid') return { error: 'Informe o pace no formato mm:ss, por exemplo 05:30.' }
  if (!caption && distance === null && duration === null && pace === null && !file) {
    return { error: 'Escreva algo, envie uma foto ou adicione os dados do treino.' }
  }

  let photoPath: string | null = null
  if (file) {
    const validation = await validateImageFile(file, 10 * 1024 * 1024)
    if ('error' in validation) return { error: validation.error }

    photoPath = `${user.id}/${crypto.randomUUID()}.${validation.extension}`
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(photoPath, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) return { error: 'Erro ao enviar a foto. Tente novamente.' }
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      user_id: user.id,
      caption: caption || null,
      photo_url: photoPath,
      distance_km: distance,
      duration_minutes: duration,
      pace,
    })
    .select('id')
    .single()

  if (error) {
    await removeMedia(supabase, 'post-images', photoPath)
    return { error: 'Erro ao publicar. A foto enviada foi descartada com segurança.' }
  }

  revalidatePath('/dashboard/feed')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function toggleLike(postId: string): Promise<FeedActionResult> {
  if (!isUuid(postId)) return { error: 'Publicação inválida.' }
  const { supabase, user, accessError } = await requireActiveMember()
  if (accessError || !user) return { error: accessError ?? 'Não autenticado.' }

  const { data: existing, error: lookupError } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (lookupError) return { error: 'Não foi possível atualizar a curtida.' }

  if (existing) {
    const { data, error } = await supabase
      .from('likes')
      .delete()
      .eq('id', existing.id)
      .select('id')
      .maybeSingle()
    if (error || !data) return { error: 'Não foi possível remover a curtida.' }
  } else {
    const { error } = await supabase
      .from('likes')
      .insert({ post_id: postId, user_id: user.id })
    if (error) return { error: 'Não foi possível curtir a publicação.' }
  }

  revalidatePath('/dashboard/feed')
  return { success: true, liked: !existing }
}

export async function addComment(formData: FormData): Promise<FeedActionResult> {
  const { supabase, user, accessError } = await requireActiveMember()
  if (accessError || !user) return { error: accessError ?? 'Não autenticado.' }

  const postId = String(formData.get('post_id') ?? '')
  const content = cleanText(formData.get('content'), 500)
  if (!isUuid(postId)) return { error: 'Publicação inválida.' }
  if (!content) return { error: 'Escreva um comentário antes de enviar.' }

  const { error } = await supabase
    .from('comments')
    .insert({ post_id: postId, user_id: user.id, content })

  if (error) return { error: 'Erro ao comentar. Tente novamente.' }

  revalidatePath('/dashboard/feed')
  return { success: true }
}

export async function deleteComment(commentId: string): Promise<FeedActionResult> {
  if (!isUuid(commentId)) return { error: 'Comentário inválido.' }
  const { supabase, user, accessError } = await requireActiveMember()
  if (accessError || !user) return { error: accessError ?? 'Não autenticado.' }

  const { data, error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .select('id')
    .maybeSingle()

  if (error || !data) return { error: 'Você não pode excluir este comentário.' }

  revalidatePath('/dashboard/feed')
  return { success: true }
}

export async function deletePost(postId: string): Promise<FeedActionResult> {
  if (!isUuid(postId)) return { error: 'Publicação inválida.' }
  const { supabase, user, accessError } = await requireActiveMember()
  if (accessError || !user) return { error: accessError ?? 'Não autenticado.' }

  const { data: post, error: lookupError } = await supabase
    .from('posts')
    .select('id, photo_url')
    .eq('id', postId)
    .maybeSingle()
  if (lookupError || !post) return { error: 'Publicação não encontrada.' }

  const { data: deleted, error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .select('id')
    .maybeSingle()
  if (error || !deleted) return { error: 'Você não pode excluir esta publicação.' }

  await removeMedia(supabase, 'post-images', post.photo_url)
  revalidatePath('/dashboard/feed')
  revalidatePath('/dashboard')
  return { success: true }
}
