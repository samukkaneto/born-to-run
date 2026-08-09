import type { Metadata } from 'next'
import Link from 'next/link'
import { LEGAL_VERSION, OFFICIAL_PRIVACY_CHANNEL } from '@/lib/legal'

export const metadata: Metadata = {
  title: 'Aviso de Privacidade | Born to Run',
  description: 'Como a Born to Run utiliza e protege os dados pessoais da comunidade.',
}

export default function PrivacidadePage() {
  return (
    <article className="container-main py-16 sm:py-20">
      <div className="mx-auto max-w-3xl space-y-9">
        <header><p className="section-kicker mb-3">Versão {LEGAL_VERSION}</p><h1 className="font-display text-5xl uppercase sm:text-6xl">Aviso de Privacidade</h1><p className="mt-5 leading-relaxed text-stone-600">Este aviso explica, de forma objetiva, como a Born to Run — Treinamento e Saúde trata dados no site e na comunidade privada.</p></header>
        <LegalSection title="Quem toma as decisões"><p>A Born to Run — Treinamento e Saúde, equipe sediada em Descalvado - SP, determina as finalidades do tratamento realizado neste aplicativo. Antes da abertura pública, o responsável deverá complementar este aviso com identificação jurídica e canal de privacidade dedicado.</p></LegalSection>
        <LegalSection title="Dados tratados"><ul><li>nome, e-mail, credenciais protegidas pelo Supabase Auth e registros técnicos de acesso;</li><li>foto, cidade, objetivo esportivo e biografia informados no perfil;</li><li>publicações, fotos, métricas de treino, curtidas e comentários;</li><li>estado de associação, grupos, comunicados e treinos atribuídos pelo treinador;</li><li>métricas agregadas e anônimas de visitação, dispositivo e desempenho da aplicação;</li><li>cookies estritamente necessários à autenticação e segurança.</li></ul></LegalSection>
        <LegalSection title="Para que usamos"><p>Autenticar e aprovar integrantes, operar a comunidade fechada, entregar treinos e comunicados, permitir interação entre atletas, prevenir abuso e manter segurança e disponibilidade. Não vendemos dados pessoais.</p></LegalSection>
        <LegalSection title="Com quem os dados são processados"><p>Supabase processa autenticação, banco e arquivos; Vercel hospeda a aplicação e recebe métricas anônimas de visitação e Core Web Vitals; o provedor SMTP processará e-mails de autenticação quando configurado. Cada fornecedor atua dentro da finalidade técnica contratada e pode processar dados fora do Brasil conforme seus próprios termos e salvaguardas.</p></LegalSection>
        <LegalSection title="Métricas de uso e desempenho"><p>Vercel Web Analytics e Speed Insights medem páginas visitadas e desempenho de forma agregada, sem cookies de publicidade e sem associação a uma pessoa ou endereço IP. Parâmetros de consulta, fragmentos e identificadores UUID são removidos antes do envio. Não enviamos e-mail, nome, conteúdo do feed ou métricas esportivas para esses serviços.</p></LegalSection>
        <LegalSection title="Visibilidade na equipe"><p>Nome, avatar, bio, cidade, objetivo e conteúdo publicado podem ser vistos por integrantes ativos. Observações administrativas e metadados de revisão não são expostos aos demais membros.</p></LegalSection>
        <LegalSection title="Conservação e segurança"><p>Os dados são mantidos enquanto a conta e a finalidade da comunidade existirem, além dos períodos necessários para segurança, exercício de direitos e obrigações aplicáveis. O sistema usa comunidade fechada, RLS, Storage privado, URLs temporárias e permissões mínimas. Nenhum sistema elimina todos os riscos.</p></LegalSection>
        <LegalSection title="Seus direitos"><p>Você pode solicitar confirmação, acesso, correção, informação sobre compartilhamento e, quando aplicável, anonimização, bloqueio, exclusão, portabilidade, oposição ou revogação de consentimento. A identidade poderá ser verificada antes do atendimento.</p></LegalSection>
        <LegalSection title="Como falar conosco"><p>Enquanto o canal de privacidade dedicado não for fornecido, use o <a href={OFFICIAL_PRIVACY_CHANNEL} target="_blank" rel="noreferrer" className="font-semibold text-red-700 underline-offset-2 hover:underline">Instagram oficial @equipeborntorun</a> ou a <Link href="/contato" className="font-semibold text-red-700 underline-offset-2 hover:underline">página de contato</Link>. Para o lançamento público, um e-mail oficial deve substituir esse canal provisório.</p></LegalSection>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">Este texto é um aviso operacional baseado no produto implementado e precisa de revisão jurídica e dos dados formais do controlador antes de uma abertura pública ampla.</p>
      </div>
    </article>
  )
}

function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="space-y-3 text-sm leading-relaxed text-stone-600 [&_li]:ml-5 [&_li]:list-disc [&_li]:py-1"><h2 className="font-display text-3xl uppercase text-stone-900">{title}</h2>{children}</section>
}
