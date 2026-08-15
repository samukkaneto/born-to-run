'use server'

import { revalidatePath } from 'next/cache'
import { getAccessContext } from '@/lib/auth/access'
import { removeMedia } from '@/lib/supabase/media'
import { cleanText, isUuid, validateImageFile } from '@/lib/validation'

export type GalleryActionResult = {
  success?: boolean
  error?: string
  id?: string
}

async function requireGalleryStaff() {
  const context = await getAccessContext()
  if (!context.user) return { ...context, accessError: 'Não autenticado.' }
  if (
    context.profile?.membership_status !== 'active' ||
    !['admin', 'coach'].includes(context.profile.role)
  ) {
    return { ...context, accessError: 'Somente administrador e treinador podem editar a galeria.' }
  }
  return { ...context, accessError: null }
}

function optionalCalendarDate(value: FormDataEntryValue | null): string | null | 'invalid' {
  const raw = String(value ?? '').trim()
  if (!raw) return null
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw)
  if (!match) return 'invalid'
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(Date.UTC(year, month - 1, day))
  return date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
    ? raw
    : 'invalid'
}

function parseSortOrder(value: FormDataEntryValue | null): number | 'invalid' {
  const raw = String(value ?? '0').trim()
  const parsed = Number(raw)
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= 10000
    ? parsed
    : 'invalid'
}

export async function saveGalleryItem(
  itemId: string | null,
  formData: FormData,
): Promise<GalleryActionResult> {
  if (itemId && !isUuid(itemId)) return { error: 'Foto inválida.' }
  const { supabase, user, accessError } = await requireGalleryStaff()
  if (accessError || !user) return { error: accessError ?? 'Não autenticado.' }

  const title = cleanText(formData.get('title'), 120)
  const caption = cleanText(formData.get('caption'), 500)
  const altText = cleanText(formData.get('alt_text'), 250) || 'Foto da equipe Born to Run'
  const takenAt = optionalCalendarDate(formData.get('taken_at'))
  const layout = String(formData.get('layout') ?? 'standard')
  const sortOrder = parseSortOrder(formData.get('sort_order'))
  const isPublished = formData.get('is_published') === 'on'
  const consentConfirmed = formData.get('consent_confirmed') === 'on'
  const fileEntry = formData.get('photo')
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null

  if (title && title.length < 2) return { error: 'O título precisa ter pelo menos 2 caracteres.' }
  if (takenAt === 'invalid') return { error: 'Informe uma data válida.' }
  if (!['standard', 'wide'].includes(layout)) return { error: 'Formato de exibição inválido.' }
  if (sortOrder === 'invalid') return { error: 'A ordem deve ser um número entre 0 e 10000.' }
  if (isPublished && !consentConfirmed) {
    return { error: 'Confirme a autorização de uso de imagem antes de publicar.' }
  }

  let previousPath: string | null = null
  if (itemId) {
    const { data, error } = await supabase
      .from('gallery_items')
      .select('storage_path')
      .eq('id', itemId)
      .maybeSingle()
    if (error || !data) return { error: 'Foto não encontrada.' }
    previousPath = data.storage_path
  }

  if (!file && !previousPath) return { error: 'Selecione uma foto.' }

  let nextPath = previousPath
  let uploadedPath: string | null = null
  if (file) {
    const validation = await validateImageFile(file, 12 * 1024 * 1024)
    if ('error' in validation) return { error: validation.error }
    uploadedPath = `${user.id}/${crypto.randomUUID()}.${validation.extension}`
    const { error } = await supabase.storage.from('gallery').upload(uploadedPath, file, {
      cacheControl: '31536000',
      contentType: file.type,
      upsert: false,
    })
    if (error) return { error: 'Não foi possível enviar a foto.' }
    nextPath = uploadedPath
  }

  const { data, error } = await supabase.rpc('staff_save_gallery_item', {
    target_item_id: itemId as string,
    target_storage_path: nextPath as string,
    target_title: title,
    target_caption: caption,
    target_alt_text: altText,
    target_taken_at: takenAt as string,
    target_layout: layout,
    target_sort_order: sortOrder,
    target_is_published: isPublished,
    target_consent_confirmed: consentConfirmed,
  })

  if (error || !data) {
    await removeMedia(supabase, 'gallery', uploadedPath)
    return { error: 'Não foi possível salvar a foto. Revise os dados e tente novamente.' }
  }

  if (uploadedPath && previousPath && uploadedPath !== previousPath) {
    await removeMedia(supabase, 'gallery', previousPath)
  }
  revalidatePath('/galeria')
  revalidatePath('/admin/galeria')
  return { success: true, id: data }
}

export async function deleteGalleryItem(itemId: string): Promise<GalleryActionResult> {
  if (!isUuid(itemId)) return { error: 'Foto inválida.' }
  const { supabase, user, accessError } = await requireGalleryStaff()
  if (accessError || !user) return { error: accessError ?? 'Não autenticado.' }

  const { data, error } = await supabase.rpc('staff_delete_gallery_item', {
    target_item_id: itemId,
  })
  if (error || !data) return { error: 'Não foi possível remover a foto.' }

  await removeMedia(supabase, 'gallery', data)
  revalidatePath('/galeria')
  revalidatePath('/admin/galeria')
  return { success: true }
}
