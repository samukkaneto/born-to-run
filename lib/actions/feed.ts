'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const caption  = formData.get('caption') as string
  const distance = formData.get('distance') as string
  const duration = formData.get('duration') as string
  const pace     = formData.get('pace') as string
  const file     = formData.get('photo') as File

  if (!caption?.trim() && !distance && (!file || file.size === 0)) {
    return { error: 'Escreva algo ou adicione os dados do treino para publicar.' }
  }

  let photo_url: string | null = null

  // Upload da foto se existir
  if (file && file.size > 0) {
    if (file.size > 10 * 1024 * 1024) {
      return { error: 'A foto deve ter no máximo 10 MB.' }
    }
    const ext = file.name.split('.').pop()
    const path = `${user.id}/${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('post-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      return { error: 'Erro ao enviar a foto. Tente novamente.' }
    }
    const { data: urlData } = supabase.storage
      .from('post-images')
      .getPublicUrl(path)
    photo_url = urlData.publicUrl
  }

  const { error } = await supabase.from('posts').insert({
    user_id:          user.id,
    caption:          caption || null,
    photo_url,
    distance_km:      distance ? parseFloat(distance) : null,
    duration_minutes: duration ? parseInt(duration) : null,
    pace:             pace || null,
  })

  if (error) return { error: 'Erro ao publicar. Tente novamente.' }

  revalidatePath('/dashboard/feed')
  return { success: true }
}

export async function toggleLike(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
  } else {
    await supabase.from('likes').insert({ post_id: postId, user_id: user.id })
  }

  revalidatePath('/dashboard/feed')
}

export async function addComment(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  const postId  = formData.get('post_id') as string
  const content = formData.get('content') as string

  if (!content.trim()) return { error: 'Comentário vazio' }

  const { error } = await supabase.from('comments').insert({
    post_id: postId,
    user_id: user.id,
    content: content.trim(),
  })

  if (error) return { error: 'Erro ao comentar.' }

  revalidatePath('/dashboard/feed')
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado' }

  // A RLS garante que só o autor ou um admin consegue excluir.
  const { error } = await supabase.from('comments').delete().eq('id', commentId)
  if (error) return { error: 'Erro ao excluir comentário.' }

  revalidatePath('/dashboard/feed')
  return { success: true }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  const { data: post } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', postId)
    .single()

  if (!post) return
  if (post.user_id !== user.id && profile?.role !== 'admin') return

  await supabase.from('posts').delete().eq('id', postId)
  revalidatePath('/dashboard/feed')
}
