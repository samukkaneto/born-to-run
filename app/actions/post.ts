'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Não autenticado')
  }

  const content = formData.get('content') as string
  const file = formData.get('image') as File | null

  let imageUrl = null

  if (file && file.size > 0) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('post-images')
      .upload(filePath, file)

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error('Falha ao enviar imagem')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('post-images')
      .getPublicUrl(filePath)
      
    imageUrl = publicUrl
  }

  const { error } = await supabase
    .from('posts')
    .insert({
      content,
      image_url: imageUrl,
      created_by: user.id
    })

  if (error) {
    console.error('Insert error:', error)
    throw new Error('Falha ao criar post')
  }

  revalidatePath('/dashboard')
  return { success: true }
}
