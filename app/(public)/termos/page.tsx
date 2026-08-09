import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_VERSION } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Termos de Uso | Born to Run',
  description: 'Regras de uso do site e da comunidade privada Born to Run.',
}

export default function TermosPage() {
  return (
    <article className="container-main py-16 sm:py-20">
      <div className="mx-auto max-w-3xl space-y-9">
        <header><p className="section-kicker mb-3">Versão {LEGAL_VERSION}</p><h1 className="font-display text-5xl uppercase sm:text-6xl">Termos de Uso</h1><p className="mt-5 leading-relaxed text-stone-600">Estas regras organizam o uso do site institucional e da comunidade fechada Born to Run.</p></header>
        <TermSection title="Acesso à comunidade"><p>O cadastro não garante entrada imediata. O treinador analisa cada solicitação e pode aprovar, rejeitar, suspender ou reativar o acesso conforme o vínculo com a equipe e a segurança da comunidade.</p></TermSection>
        <TermSection title="Sua conta"><p>Forneça informações verdadeiras, mantenha a senha em sigilo e avise a equipe sobre uso não autorizado. A conta é pessoal e não pode ser compartilhada.</p></TermSection>
        <TermSection title="Convivência e conteúdo"><p>Publique apenas conteúdo próprio ou autorizado. Não use o aplicativo para assédio, discriminação, fraude, spam, exposição indevida de terceiros ou material ilegal. Fotos de outras pessoas exigem respeito à imagem e à privacidade delas.</p></TermSection>
        <TermSection title="Treinos e saúde"><p>Treinos e informações do aplicativo apoiam o acompanhamento da equipe, mas não substituem diagnóstico, atendimento médico ou avaliação individual de saúde. Informe ao treinador limitações relevantes e procure um profissional de saúde diante de sintomas ou riscos.</p></TermSection>
        <TermSection title="Moderação"><p>Conteúdo que viole estas regras pode ser removido. O acesso pode ser limitado para proteger atletas, dados e operação. Histórico de treinos poderá ser preservado quando necessário para continuidade e segurança.</p></TermSection>
        <TermSection title="Disponibilidade"><p>Buscamos manter o serviço seguro e disponível, mas manutenções, falhas de rede ou fornecedores podem causar interrupções. Funcionalidades podem evoluir, com comunicação adequada quando a mudança afetar direitos ou uso essencial.</p></TermSection>
        <TermSection title="Privacidade"><p>O tratamento de dados está explicado no <Link href="/privacidade" className="font-semibold text-red-700 underline-offset-2 hover:underline">Aviso de Privacidade</Link>. O aplicativo utiliza apenas cookies necessários à sessão e à segurança; qualquer analytics ou publicidade futura deverá ser avaliada antes de ser ativada.</p></TermSection>
        <TermSection title="Contato e atualização"><p>Dúvidas podem ser enviadas pela <Link href="/contato" className="font-semibold text-red-700 underline-offset-2 hover:underline">página de contato</Link>. A versão vigente aparece no topo; mudanças relevantes devem ser apresentadas aos usuários.</p></TermSection>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">Antes de abertura pública ampla ou cobrança de serviços, estes termos devem receber os dados formais do responsável e revisão jurídica.</p>
      </div>
    </article>
  )
}

function TermSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 text-sm leading-relaxed text-stone-600"><h2 className="font-display text-3xl uppercase text-stone-900">{title}</h2>{children}</section>
}
