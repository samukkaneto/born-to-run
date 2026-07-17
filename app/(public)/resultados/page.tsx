import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { TrendingUp, Heart, Scale, Clock, Users, ArrowRight, CheckCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Resultados',
  description:
    'Veja os resultados reais da equipe Born to Run: evolução em saúde, emagrecimento, disciplina e qualidade de vida dos atletas de Descalvado-SP.',
}

const pillars = [
  {
    icon: Heart,
    title: 'Saúde Cardiovascular',
    desc: 'A prática regular de corrida e caminhada melhora a saúde do coração, reduz pressão arterial e aumenta a capacidade cardiorrespiratória.',
    color: 'text-[var(--color-red)]',
    bg: 'bg-red-50',
  },
  {
    icon: Scale,
    title: 'Emagrecimento Saudável',
    desc: 'Com treino orientado e consistência, nossos atletas alcançam perda de peso sustentável, sem dietas radicais ou exageros.',
    color: 'text-[var(--color-green)]',
    bg: 'bg-green-50',
  },
  {
    icon: TrendingUp,
    title: 'Evolução de Performance',
    desc: 'Do primeiro 1km sem parar até correr 10km, 21km e além — acompanhamos cada evolução de perto.',
    color: 'text-[var(--color-orange)]',
    bg: 'bg-orange-50',
  },
  {
    icon: Clock,
    title: 'Disciplina e Constância',
    desc: 'O maior resultado que cultivamos é o hábito. Atletas que treinam regularmente transformam sua rotina e sua mentalidade.',
    color: 'text-[var(--color-red)]',
    bg: 'bg-red-50',
  },
  {
    icon: Users,
    title: 'Bem-estar Social',
    desc: 'Treinar em grupo cria laços, motivação e pertencimento. Nossos atletas relatam melhora significativa no humor e na qualidade das relações.',
    color: 'text-[var(--color-green)]',
    bg: 'bg-green-50',
  },
  {
    icon: Heart,
    title: 'Qualidade de Vida',
    desc: 'Mais energia, melhor sono, menos estresse. A corrida e a caminhada têm impacto direto em todas as áreas da vida.',
    color: 'text-[var(--color-orange)]',
    bg: 'bg-orange-50',
  },
]

const journeySteps = [
  { step: '01', title: 'Avaliação inicial', desc: 'Entendemos seu condicionamento, histórico e objetivos antes de começar.' },
  { step: '02', title: 'Plano personalizado', desc: 'Receba um plano de treino feito para o seu nível e sua meta.' },
  { step: '03', title: 'Treinos em grupo', desc: 'Treine com a equipe, com suporte do Prof. Robson em cada sessão.' },
  { step: '04', title: 'Acompanhamento contínuo', desc: 'Ajustes periódicos no plano conforme sua evolução.' },
  { step: '05', title: 'Corridas e eventos', desc: 'Participe de corridas de rua com toda a equipe ao seu lado.' },
]

export default function ResultadosPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-16 border-b border-stone-100">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <div className="badge badge-green mb-4">Resultados</div>
              <h1 className="section-title mb-4">
                Resultados que vão{' '}
                <span className="text-[var(--color-red)]">além da corrida</span>
              </h1>
              <p className="section-subtitle text-stone-500">
                Na Born to Run, medimos sucesso em saúde conquistada, quilos perdidos, 
                km rodados e vidas transformadas — não em troféus ou rankings.
              </p>
            </div>
            <div className="relative h-72 md:h-80 rounded-2xl overflow-hidden shadow-card-lg">
              <Image
                src="/robson-running.jpg"
                alt="Robson Alves e atletas em corrida de rua"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Pilares de Resultado */}
      <section className="py-16 bg-[var(--color-bg)]">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="divider-red mx-auto mb-4" />
            <h2 className="section-title">Em quê nossos atletas evoluem</h2>
            <p className="section-subtitle mt-3 text-stone-500">
              Cada pessoa tem sua jornada. Aqui estão os pilares em que acompanhamos a evolução de cada atleta.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="card p-6">
                <div className={`${bg} w-12 h-12 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={24} className={color} />
                </div>
                <h3 className="font-display font-bold text-stone-800 mb-2">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Números */}
      <section className="py-14 bg-[var(--color-green)]">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center text-white">
            {[
              { value: '~200', label: 'Atletas atendidos' },
              { value: '+200', label: 'Corridas de rua' },
              { value: '10+',  label: 'Anos de experiência' },
              { value: '100%', label: 'Foco em saúde' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-display text-4xl font-black">{value}</div>
                <p className="text-green-100 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jornada do atleta */}
      <section className="py-16 bg-white">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="divider-orange mx-auto mb-4" />
            <h2 className="section-title">A jornada do seu atleta</h2>
            <p className="section-subtitle mt-3 text-stone-500">
              Do primeiro contato até as corridas de rua — veja como funciona fazer parte da Born to Run.
            </p>
          </div>
          <div className="max-w-2xl mx-auto space-y-4">
            {journeySteps.map(({ step, title, desc }) => (
              <div key={step} className="card p-5 flex items-start gap-4">
                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-black text-[var(--color-red)] text-sm">{step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800 mb-1">{title}</h3>
                  <p className="text-stone-500 text-sm">{desc}</p>
                </div>
                <CheckCircle size={18} className="text-[var(--color-green)] flex-shrink-0 mt-0.5 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-stone-50 border-t border-stone-100">
        <div className="container-main text-center">
          <h2 className="section-title mb-4">Comece sua transformação hoje</h2>
          <p className="section-subtitle text-stone-500 mb-8 max-w-lg mx-auto">
            Não espere o momento perfeito. O melhor momento para começar a correr é agora, 
            com a equipe certa ao seu lado.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contato" className="btn-primary">
              Quero começar
              <ArrowRight size={16} />
            </Link>
            <Link href="/sobre" className="btn-outline">
              Conhecer a equipe
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
