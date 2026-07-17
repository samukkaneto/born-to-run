import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Users, Trophy, CalendarHeart, HeartPulse, Footprints, Target,  } from 'lucide-react'
import InstagramIcon from '@/components/ui/InstagramIcon'
import Section from '@/components/ui/Section'
import { site } from '@/lib/site'

export const metadata = {
  title: 'Born to Run — Treinamento e Saúde | Corrida de rua em Descalvado-SP',
}

const stats = [
  { icon: Users, value: site.stats.athletes, label: site.stats.athletesLabel },
  { icon: Trophy, value: site.stats.races, label: site.stats.racesLabel },
  { icon: CalendarHeart, value: `Desde ${site.stats.since}`, label: site.stats.sinceLabel },
]

const pillars = [
  {
    icon: Footprints,
    title: 'Corrida e caminhada',
    text: 'Treinos de corrida de rua e caminhada para todos os níveis — do primeiro passo de quem está começando ao atleta que busca performance.',
  },
  {
    icon: HeartPulse,
    title: 'Saúde em primeiro lugar',
    text: 'Orientação de um educador físico registrado, com progressão respeitando o corpo, o histórico e o ritmo de cada aluno.',
  },
  {
    icon: Target,
    title: 'Objetivos individuais',
    text: 'Cada atleta tem sua meta: qualidade de vida, emagrecimento, os primeiros 5 km ou provas de fundo. O treino se adapta a você.',
  },
]

export default function HomePage() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden bg-[#F9F7F5]">
        <div className="absolute inset-0">
          <Image
            src="/team-group.jpg"
            alt="Equipe Born to Run reunida"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
            sizes="100vw"
          />
          <div className="absolute inset-0 hero-overlay" aria-hidden="true" />
        </div>

        <div className="container-main relative z-10 py-20 md:py-28">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 badge badge-red mb-6">
              Equipe de corrida · {site.location}
            </span>
            <h1 className="font-display font-black uppercase leading-[0.95] text-[#1C1917] text-4xl sm:text-5xl md:text-6xl lg:text-7xl">
              Transformando vidas{' '}
              <span className="text-[#DC2626]">através da corrida</span> desde
              2015
            </h1>
            <p className="mt-6 text-lg md:text-xl text-[#44403C] leading-relaxed max-w-xl">
              Somos a Born to Run — Treinamento e Saúde: uma equipe de corrida
              de rua e caminhada de {site.location} que acredita que todo mundo
              nasceu para correr. Venha treinar com a gente.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/cadastro" className="btn-primary text-base px-8 py-3.5">
                Comece Agora
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link href="/sobre" className="btn-outline text-base px-8 py-3.5 bg-white/70">
                Conheça a equipe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── NÚMEROS ── */}
      <section className="bg-[#DC2626]">
        <div className="container-main py-12 md:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4 justify-center sm:justify-start">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-white" aria-hidden="true" />
                </div>
                <div>
                  <p className="font-display font-black text-3xl md:text-4xl text-white leading-none">
                    {value}
                  </p>
                  <p className="text-red-100 text-sm mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUEM SOMOS ── */}
      <Section
        title="Nascemos para correr"
        subtitle={`Fundada em ${site.foundedYear} em ${site.location}, a Born to Run é mais que uma assessoria esportiva: é uma equipe que treina, compete e comemora junto.`}
      >
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card-lg">
            <Image
              src="/robson-running.jpg"
              alt="Treinador Robson Alves correndo"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-[#44403C] leading-relaxed mb-4">
              Ao longo de quase uma década reunimos cerca de{' '}
              <strong>{site.stats.athletes} atletas</strong> e somamos{' '}
              <strong>{site.stats.races} participações em corridas</strong> por
              todo o estado. Aqui, iniciantes e experientes dividem o mesmo
              percurso — cada um no seu ritmo, todos com o mesmo incentivo.
            </p>
            <p className="text-[#44403C] leading-relaxed mb-8">
              O comando técnico é do educador físico{' '}
              <strong>{site.coach.name}</strong> ({site.coach.cref}),
              especialista em corridas de meio fundo e fundo e treinador nível
              1 pela World Athletics.
            </p>
            <Link href="/sobre" className="btn-primary">
              Nossa história completa
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Section>

      {/* ── PILARES ── */}
      <Section
        className="bg-white"
        title="Treino sério, para todo mundo"
        subtitle="Do sedentarismo à linha de chegada: nosso trabalho é construir o caminho com segurança e consistência."
        centered
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card card-lift p-8">
              <div className="w-12 h-12 rounded-xl bg-[#FEE2E2] flex items-center justify-center mb-5">
                <Icon size={22} className="text-[#DC2626]" aria-hidden="true" />
              </div>
              <h3 className="font-display font-bold text-xl text-[#1C1917] uppercase mb-2">
                {title}
              </h3>
              <p className="text-[#57534E] text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── ÁREA DE MEMBROS ── */}
      <Section className="bg-[#1C1917]">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="section-title text-white heading-accent">
              Área exclusiva da equipe
            </h2>
            <p className="text-[#A8A29E] leading-relaxed mt-6 mb-8">
              Quem faz parte da Born to Run tem acesso à nossa área de membros:
              feed da equipe para compartilhar treinos e conquistas, planilhas
              de treino publicadas pelo treinador e comunicados oficiais — tudo
              em um só lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href="/cadastro" className="btn-primary">
                Criar minha conta
              </Link>
              <Link
                href="/login"
                className="btn-outline border-[#57534E] text-[#D6D3D1] hover:border-white hover:text-white"
              >
                Já sou da equipe
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { title: 'Feed', text: 'Compartilhe suas corridas' },
              { title: 'Treinos', text: 'Planilhas do treinador' },
              { title: 'Equipe', text: 'Comunicados oficiais' },
            ].map(({ title, text }) => (
              <div key={title} className="rounded-2xl bg-[#292524] p-5">
                <p className="font-display font-black text-white text-lg uppercase">
                  {title}
                </p>
                <p className="text-[#A8A29E] text-xs mt-1 leading-snug">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── CTA FINAL ── */}
      <Section className="bg-white" containerClassName="text-center">
        <span className="inline-flex mb-5">
          <InstagramIcon className="text-[#DC2626]" />
        </span>
        <h2 className="section-title heading-accent-center mb-6">
          Pronto para o primeiro passo?
        </h2>
        <p className="section-subtitle mx-auto mb-9">
          Acompanhe o dia a dia da equipe no Instagram{' '}
          <a
            href={site.social.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#DC2626] hover:underline"
          >
            @{site.social.instagramHandle}
          </a>{' '}
          ou fale com a gente pela página de contato.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cadastro" className="btn-primary text-base px-8 py-3.5">
            Comece Agora
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/contato" className="btn-outline text-base px-8 py-3.5">
            Falar com a equipe
          </Link>
        </div>
      </Section>
    </>
  )
}
