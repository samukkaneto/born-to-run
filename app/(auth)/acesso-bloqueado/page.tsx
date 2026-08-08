import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Ban, LogOut } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { destinationForStatus, getAccessContext } from '@/lib/auth/access'

export default async function AcessoBloqueadoPage() {
  const { user, profile } = await getAccessContext()
  if (!user) redirect('/login')
  if (profile?.membership_status === 'active' || profile?.membership_status === 'pending') {
    redirect(destinationForStatus(profile.membership_status, profile.role))
  }

  const rejected = profile?.membership_status === 'rejected'

  return (
    <div className="card w-full space-y-7 p-8 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-[#DC2626]">
        <Ban size={30} aria-hidden="true" />
      </div>
      <div>
        <p className="section-kicker mb-3">Acesso indisponível</p>
        <h1 className="font-display text-3xl uppercase text-[#171717]">
          Conta sem acesso à equipe
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
          {rejected
            ? 'Seu cadastro não foi aprovado para a comunidade Born to Run. Fale diretamente com o treinador se precisar revisar a solicitação.'
            : 'Seu acesso à área reservada está suspenso. Fale diretamente com o treinador caso acredite que isso aconteceu por engano.'}
        </p>
        {profile?.status_note && (
          <p className="mt-4 rounded-xl bg-[#FAFAF9] p-4 text-sm text-[#44403C]">
            {profile.status_note}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <form action={logout}>
          <button type="submit" className="btn-primary w-full sm:w-auto">
            <LogOut size={16} /> Sair da conta
          </button>
        </form>
        <Link href="/" className="btn-outline">
          Ir para o site
        </Link>
      </div>
    </div>
  )
}
