import { redirect } from 'next/navigation'
import { getAccessContext } from '@/lib/auth/access'

export default async function LojaAccessGateway() {
  const { user, profile } = await getAccessContext()

  if (!user) redirect('/login')
  if (!profile || profile.membership_status === 'pending') redirect('/acesso-pendente')
  if (profile.membership_status !== 'active') redirect('/acesso-bloqueado')
  if (profile.role !== 'admin' && profile.role !== 'coach') redirect('/dashboard')

  redirect('/admin/loja')
}
