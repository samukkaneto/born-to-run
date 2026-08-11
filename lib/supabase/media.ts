import 'server-only'

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

type Bucket = 'avatars' | 'post-images' | 'gallery' | 'assessment-files'

export async function createMediaUrl(
  supabase: SupabaseClient<Database>,
  bucket: Bucket,
  path: string | null | undefined,
): Promise<string | null> {
  if (!path) return null
  // Compatibilidade temporária com eventuais registros antigos.
  if (/^https?:\/\//i.test(path)) return path

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60)

  return error ? null : data.signedUrl
}
export async function removeMedia(
  supabase: SupabaseClient<Database>,
  bucket: Bucket,
  path: string | null | undefined,
): Promise<void> {
  if (!path || /^https?:\/\//i.test(path)) return
  await supabase.storage.from(bucket).remove([path])
}
