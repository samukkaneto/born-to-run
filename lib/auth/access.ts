import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Profile } from '@/types'
export { destinationForStatus } from '@/lib/auth/destination'

export type AccessProfile = Pick<
  Profile,
  'user_id' | 'full_name' | 'avatar_url' | 'role' | 'membership_status' | 'status_note'
>

export async function getAccessContext() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (!user || userError) {
    return { supabase, user: null, profile: null, error: userError }
  }

  const { data: profile, error: profileError } = await supabase
    .rpc('get_my_access_profile')
    .maybeSingle()

  if (profileError) throw profileError

  return {
    supabase,
    user,
    profile: profile as AccessProfile | null,
    error: null,
  }
}
