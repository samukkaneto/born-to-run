import { redirect } from 'next/navigation'
import { destinationForStatus, getAccessContext } from '@/lib/auth/access'

export default async function AccessRouterPage() {
  const { user, profile } = await getAccessContext()
  if (!user) redirect('/login')
  redirect(destinationForStatus(profile?.membership_status, profile?.role))
}
