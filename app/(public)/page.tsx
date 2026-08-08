import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  Trophy,
  Flag,
  HeartPulse,
  Footprints,
  Target,
} from 'lucide-react'
import InstagramIcon from '@/components/ui/InstagramIcon'
import { site } from '@/lib/site'

export const metadata = {
  title: 'Born to Run — Treinamento e Saúde | Corrida de rua em Descalvado-SP',
}

const stats = [
  {
    icon: Users,
    value: site.stats.athletes,
    label: site.stats.athletesLabel,
    color: '#16A34A',
  },
  {
    icon: Trophy,
    value: site.stats.races,
    label: site.stats.racesLabel,
    color: '#DC2626',
  },
  {
    icon: Flag,
    value: `Desde ${site.stats.since}`,
    label: site.stats.sinceLabel,
    color: '#F97316',
  },
]

const pillars = [
  {
    icon: Footprints,
    number: '01',
    title: 'Corrida e caminhada',
    text: 'Treinos de corrida de rua e caminhada para todos os níveis — do primeiro passo de quem está começando ao atleta que busca performance.',
  },
  {
    icon: HeartPulse,
    number: '02',
    title: 'Saúde em primeiro lugar',
    text: 'Orientação de um educador físico registrado, com progressão respeitando o corpo, o histórico e o ritmo de cada aluno.',
  },
  {
    icon: Target,
    number: '03',
    title: 'Objetivos individuais',
    text: 'Cada atleta tem sua meta: qualidade de vida, emagrecimento, os primeiros 5 km ou provas de fundo. O treino se adapta a você.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* ══ HERO EDITORIAL ══ */}
      <section className="relative overflow-hidden bg-[#F7F4EF] route-texture">
        {/* linha técnica vertical decorativa */}
        <div
          className="hidden lg:block absolute top-0 bottom-0 left-[62%] w-px bg-[#171717]/10"
          aria-hidden="true"
        />
        <div className="container-main relative z-10 pt-12 pb-16 md:pt-20 md:pb-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Texto */}
            <div className="lg:col-span-7">
              <p className="section-kicker mb-6">
                Equipe de corrida · {site.location} · desde {site.foundedYear}
              </p>
              <h1 className="hero-title">
                Corra com propósito.
                <br />
                <span className="accent">Evolua em equipe.</span>
              </h1>
              <p className="mt-7 text-lg md:text-xl text-[#44403C] leading-relaxed max-w-xl">
                Somos a {site.name}: uma equipe de corrida de rua e caminhada
                de {site.location} que acredita que todo mundo nasceu para
                correr — cada um no seu ritmo, todos juntos.
              </p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3">
                <Link href="/cadastro" className="btn-primary text-base px-8 py-3.5">
                  Comece agora
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <Link href="/sobre" className="btn-outline text-base px-8 py-3.5">
                  Conheça a equipe
                </Link>
              </div>
              {/* Assinatura técnica */}
              <p className="mt-10 font-condensed text-xs uppercase tracking-[0.22em] text-[#57534E]">
                Corrida de rua · Caminhada · Saúde e performance
              </p>
            </div>

            {/* Foto editorial com moldura deslocada */}
            <div className="lg:col-span-5">
              <div className="relative max-w-md mx-auto lg:max-w-none">
                <div
                  className="absolute -top-3 -left-3 w-full h-full border-2 border-[#DC2626] rounded-xl"
                  aria-hidden="true"
                />
                <div className="relative aspect-[4/5] rounded-xl overflow-hidden shadow-card-lg">
                  <Image
                    src="/team-group.jpg"
                    alt="Equipe Born to Run reunida antes do treino"
                    fill
                    priority
                    style={{ objectFit: 'cover', objectPosition: 'center' }}
                    sizes="(max-width: 1024px) 100vw, 40vw"
                  />
                </div>
                {/* Selo carbono sobreposto */}
                <div className="absolute -bottom-5 left-4 sm:left-6 panel-carbon rounded-lg px-5 py-3 shadow-card-lg">
                  <p className="font-display text-2xl leading-none text-white">
                    {site.stats.athletes}
                  </p>
                  <p className="font-condensed text-[11px] uppercase tracking-[0.15em] text-[#A8A29E] mt-1">
                    atletas na equipe
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAIXA DE NÚMEROS (carbono) ══ */}
      <section className="bg-[#171717]" aria-label="Números da equipe">
        <div className="container-main py-10 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
            {stats.map(({ icon: Icon, value, label, color }, i) => (
              <div
                key={label}
                className={`flex items-center gap-4 justify-center sm:justify-start ${
                  i > 0 ? 'sm:border-l sm:border-[#2E2E2E] sm:pl-8' : ''
                }`}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${color}1F` }}
                >
                  <Icon size={22} style={{ color }} aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display text-4xl md:text-5xl text-white leading-none">
                    {value}
                  </p>
                  <p className="font-condensed text-xs uppercase tracking-[0.15em] text-[#A8A29E] mt-1.5">
                    {label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 01 · QUEM SOMOS ══ */}
      <section className="py-16 md:py-24 bg-[#F7F4EF]">
        <div className="container-main">
          <div className="grid md:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="md:col-span-5 order-2 md:order-1">
              <div className="relative">
                <div
                  className="absolute -bottom-3 -right-3 w-full h-full border-2 border-[#171717] rounded-xl"
                  aria-hidden="true"
                />
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-card-lg">
                  <Image
                    src="/robson-running.jpg"
                    alt="Treinador Robson Alves correndo"
                    fill
                    style={{ objectFit: 'cover' }}
                    sizes="(max-width: 768px) 100vw, 42vw"
                  />
                </div>
              </div>
            </div>
            <div className="md:col-span-7 order-1 md:order-2">
              <p className="section-kicker mb-5">01 · Quem somos</p>
              <h2 className="section-title">
                Nascemos <span className="accent">para correr</span>
              </h2>
              <p className="text-[#44403C] leading-relaxed mt-6 mb-4">
                Fundada em {site.foundedYear} em {site.location}, a Born to Run
                é mais que uma assessoria esportiva: é uma equipe que treina,
                compete e comemora junto. Ao longo de quase uma década reunimos
                cerca de <strong>{site.stats.athletes} atletas</strong> e
                somamos <strong>{site.stats.races} participações em corridas</strong>{' '}
                por todo o estado.
              </p>
              <p className="text-[#44403C] leading-relaxed mb-8">
                O comando técnico é do educador físico{' '}
                <strong>{site.coach.name}</strong> ({site.coach.cref}),
                especialista em corridas de meio fundo e fundo e treinador
                nível 1 pela World Athletics.
              </p>
              <Link href="/sobre" className="btn-dark">
                Nossa história completa
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 02 · METODOLOGIA ══ */}
      <section className="py-16 md:py-24 bg-white border-y border-[#E5E1D8]">
        <div className="container-main">
          <div className="max-w-2xl mb-12">
            <p className="section-kicker mb-5">02 · Metodologia</p>
            <h2 className="section-title">
              Treino sério, <span className="accent">para todo mundo</span>
            </h2>
            <p className="section-subtitle mt-5">
              Do sedentarismo à linha de chegada: nosso trabalho é construir o
              caminho com segurança e consistência.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map(({ icon: Icon, number, title, text }) => (
              <div
                key={title}
                className="card card-lift p-8 relative overflow-hidden"
              >
                <span
                  className="absolute top-4 right-6 font-display text-5xl text-[#78716C] select-none"
                  aria-hidden="true"
                >
                  {number}
                </span>
                <div className="w-12 h-12 rounded-lg bg-[#FEE2E2] flex items-center justify-center mb-5">
                  <Icon size={22} className="text-[#DC2626]" aria-hidden="true" />
                </div>
                <h3 className="font-condensed font-semibold text-lg text-[#171717] uppercase tracking-wide mb-2">
                  {title}
                </h3>
                <p className="text-[#57534E] text-sm leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 03 · ÁREA DA EQUIPE (painel carbono) ══ */}
      <section className="bg-[#171717] py-16 md:py-24">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="section-kicker section-kicker-on-dark mb-5">03 · Área da equipe</p>
              <h2 className="section-title text-white">
                Sua central <span className="accent">de atleta</span>
              </h2>
              <p className="text-[#A8A29E] leading-relaxed mt-6 mb-8">
                Quem faz parte da Born to Run tem acesso à área de membros:
                feed da equipe para compartilhar treinos e conquistas,
                planilhas publicadas pelo treinador e comunicados oficiais —
                tudo em um só lugar.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/cadastro" className="btn-primary">
                  Criar minha conta
                </Link>
                <Link
                  href="/login"
                  className="btn-outline border-[#57534E] text-[#D6D3D1] hover:bg-white hover:text-[#171717] hover:border-white"
                >
                  Já sou da equipe
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { title: 'Feed', text: 'Compartilhe suas corridas e conquistas' },
                { title: 'Treinos', text: 'Planilhas publicadas pelo treinador' },
                { title: 'Avisos', text: 'Comunicados oficiais da equipe' },
              ].map(({ title, text }) => (
                <div
                  key={title}
                  className="rounded-lg bg-[#232323] border border-[#2E2E2E] p-5 group hover:border-[#DC2626] transition-colors"
                >
                  <ArrowUpRight
                    size={18}
                    className="text-[#DC2626] mb-3"
                    aria-hidden="true"
                  />
                  <p className="font-display text-xl text-white uppercase leading-none">
                    {title}
                  </p>
                  <p className="text-[#A8A29E] text-xs mt-2 leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ 04 · COMUNIDADE / CTA FINAL ══ */}
      <section className="py-16 md:py-24 bg-[#F7F4EF]">
        <div className="container-main text-center">
          <p className="section-kicker mb-5 justify-center">04 · Comunidade</p>
          <h2 className="section-title mx-auto">
            Pronto para <span className="accent">o primeiro passo?</span>
          </h2>
          <p className="section-subtitle mx-auto mt-5 mb-9">
            Acompanhe o dia a dia da equipe no Instagram{' '}
            <a
              href={site.social.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#B91C1C] hover:underline inline-flex items-center gap-1"
            >
              <InstagramIcon className="inline-block" />@
              {site.social.instagramHandle}
            </a>{' '}
            ou fale com a gente pela página de contato.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/cadastro" className="btn-primary text-base px-8 py-3.5">
              Comece agora
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/contato" className="btn-outline text-base px-8 py-3.5">
              Falar com a equipe
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
