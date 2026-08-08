import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Clock3, LogOut, ShieldCheck } from 'lucide-react'
import { logout } from '@/lib/actions/auth'
import { destinationForStatus, getAccessContext } from '@/lib/auth/access'

export default async function AcessoPendentePage() {
  const { user, profile } = await getAccessContext()

  if (user && profile?.membership_status !== 'pending') {
    redirect(destinationForStatus(profile?.membership_status, profile?.role))
  }

  return (
    <div className="card w-full space-y-7 p-8 text-center sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
        <Clock3 size={30} aria-hidden="true" />
      </div>
      <div>
        <p className="section-kicker mb-3">Comunidade fechada</p>
        <h1 className="font-display text-3xl uppercase text-[#171717]">
          Cadastro recebido
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
          Seu pedido está aguardando a aprovação do treinador da Born to Run.
          Assim que o acesso for liberado, você poderá entrar no feed, ver seus
          treinos e participar da equipe.
        </p>
      </div>
      <div className="flex items-start gap-3 rounded-xl border border-[#E5E1D8] bg-[#FAFAF9] p-4 text-left">
        <ShieldCheck className="mt-0.5 shrink-0 text-[#16A34A]" size={19} />
        <p className="text-sm text-[#57534E]">
          Esta verificação mantém fotos, atividades e orientações de treino
          acessíveis somente aos integrantes autorizados.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        {user ? (
          <form action={logout}>
            <button type="submit" className="btn-outline w-full sm:w-auto">
              <LogOut size={16} /> Sair da conta
            </button>
          </form>
        ) : (
          <Link href="/login" className="btn-primary">
            Voltar ao login
          </Link>
        )}
        <Link href="/" className="btn-outline">
          Ir para o site
        </Link>
      </div>
    </div>
  )
}
