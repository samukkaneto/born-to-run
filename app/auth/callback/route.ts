import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { safeInternalRedirectPath } from '@/lib/auth/destination'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).origin
    : origin
  const next = safeInternalRedirectPath(searchParams.get('next'), configuredOrigin)

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(new URL(next, configuredOrigin))
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(new URL('/login?error=true', configuredOrigin))
}
