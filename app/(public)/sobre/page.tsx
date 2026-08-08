import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  Award,
  Flag,
  HeartHandshake,
  MapPin,
  Target,
  Users,
} from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Badge from '@/components/ui/Badge'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Sobre | Born to Run — Treinamento e Saúde',
  description:
    'Conheça a história da Born to Run, equipe de corrida de Descalvado-SP fundada em 2015, e o treinador Robson Alves.',
}

const values = [
  {
    icon: HeartHandshake,
    title: 'Espírito de equipe',
    description:
      'Correr junto é mais forte do que correr sozinho. Cada atleta apoia e é apoiado pelo grupo, do iniciante ao mais experiente.',
  },
  {
    icon: Target,
    title: 'Treino com propósito',
    description:
      'Planilhas e orientações pensadas para a evolução de cada atleta, com acompanhamento profissional e metas realistas.',
  },
  {
    icon: Flag,
    title: 'Presença nas provas',
    description:
      'Somamos mais de 200 participações em corridas, levando a camisa da equipe para provas dentro e fora da região.',
  },
]

export default function SobrePage() {
  return (
    <main>
      {/* ══ 01 · NOSSA HISTÓRIA ══ */}
      <Section
        kicker="01 · Sobre"
        title="Nossa história"
        subtitle={`Desde ${site.foundedYear}, transformando vidas através da corrida em ${site.location}.`}
        className="route-texture"
      >
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="space-y-5 leading-relaxed text-[#44403C] lg:col-span-7">
            <p>
              A <strong>{site.name}</strong> nasceu em {site.foundedYear} em{' '}
              {site.location}, com um objetivo simples: mostrar que a corrida
              pode transformar a vida de qualquer pessoa — na saúde, na
              disciplina e nas amizades que se formam a cada treino.
            </p>
            <p>
              O que começou como um pequeno grupo de corredores cresceu e hoje
              reúne cerca de <strong>200 atletas</strong>, entre iniciantes
              dando os primeiros passos e corredores experientes em busca de
              novos recordes pessoais.
            </p>
            <p>
              Ao longo dessa trajetória, a equipe já soma mais de{' '}
              <strong>200 participações em corridas</strong>, sempre com o
              mesmo espírito: cada atleta importa, cada conquista é celebrada
              por todos.
            </p>
            <div className="flex items-center gap-2 font-condensed text-sm uppercase tracking-[0.15em] text-[#57534E]">
              <MapPin className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
              <span>
                {site.city} - {site.state} · Brasil
              </span>
            </div>
          </div>
          <div className="relative lg:col-span-5">
            <div
              className="absolute -top-3 -right-3 h-full w-full rounded-xl border-2 border-[#DC2626]"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl shadow-card-lg">
              <Image
                src="/team-group.jpg"
                alt="Atletas da equipe Born to Run reunidos"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
        </div>
      </Section>

      {/* ══ FAIXA DE NÚMEROS (carbono) ══ */}
      <section className="bg-[#171717]" aria-label="Números da equipe">
        <Container className="py-10 md:py-12">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-4">
            {[
              { value: site.stats.athletes, label: site.stats.athletesLabel, color: '#16A34A' },
              { value: site.stats.races, label: site.stats.racesLabel, color: '#DC2626' },
              { value: `Desde ${site.stats.since}`, label: site.stats.sinceLabel, color: '#F97316' },
            ].map(({ value, label, color }, i) => (
              <div
                key={label}
                className={`text-center sm:text-left ${
                  i > 0 ? 'sm:border-l sm:border-[#2E2E2E] sm:pl-8' : ''
                }`}
              >
                <p className="font-display text-4xl leading-none text-white md:text-5xl">
                  {value}
                </p>
                <p
                  className="mt-2 font-condensed text-xs uppercase tracking-[0.15em]"
                  style={{ color }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* ══ 02 · TREINADOR ══ */}
      <Section
        kicker="02 · Comando técnico"
        title="Nosso treinador"
        subtitle="Orientação profissional em cada passo da sua evolução."
        className="bg-white border-b border-[#E5E1D8]"
      >
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="relative order-2 lg:order-1 lg:col-span-5">
            <div
              className="absolute -bottom-3 -left-3 h-full w-full rounded-xl border-2 border-[#171717]"
              aria-hidden="true"
            />
            <div className="relative aspect-[3/4] max-h-[560px] overflow-hidden rounded-xl shadow-card-lg">
              <Image
                src="/robson-portrait.jpg"
                alt={`${site.coach.name}, treinador da Born to Run`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>
          <div className="order-1 lg:order-2 lg:col-span-7">
            <Badge variant="red">Treinador responsável</Badge>
            <h3 className="mt-4 font-display text-4xl uppercase text-[#171717] sm:text-5xl">
              {site.coach.name}
            </h3>
            <p className="mt-2 font-condensed text-base font-medium uppercase tracking-[0.08em] text-[#DC2626]">
              {site.coach.title} — {site.coach.cref}
            </p>
            <ul className="mt-6 space-y-4">
              {site.coach.credentials.map((credential) => (
                <li key={credential} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#FEE2E2]">
                    <Award className="h-4 w-4 text-[#DC2626]" aria-hidden="true" />
                  </span>
                  <span className="text-[#44403C]">{credential}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 leading-relaxed text-[#57534E]">
              À frente da equipe desde a fundação, Robson acompanha de perto a
              evolução de cada atleta, unindo formação acadêmica e certificação
              internacional para orientar treinos de meio fundo e fundo com
              segurança e resultado.
            </p>
          </div>
        </div>
      </Section>

      {/* ══ 03 · VALORES ══ */}
      <Section
        kicker="03 · Valores"
        title="O que nos move"
        subtitle="Os valores que guiam a equipe dentro e fora das pistas."
        centered
      >
        <div className="grid gap-6 md:grid-cols-3">
          {values.map(({ icon: Icon, title, description }, i) => (
            <div key={title} className="card card-lift relative overflow-hidden p-8 text-left">
              <span
                className="absolute top-4 right-6 select-none font-display text-5xl text-[#171717]/8"
                aria-hidden="true"
              >
                0{i + 1}
              </span>
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#FEE2E2]">
                <Icon className="h-6 w-6 text-[#DC2626]" aria-hidden="true" />
              </span>
              <h3 className="mt-5 font-condensed text-lg font-semibold uppercase tracking-wide text-[#171717]">
                {title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#57534E]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* ══ CTA (carbono) ══ */}
      <section className="bg-[#171717] py-16 md:py-20">
        <Container className="text-center">
          <Users className="mx-auto h-10 w-10 text-[#DC2626]" aria-hidden="true" />
          <h2 className="section-title mt-5 text-white">
            Venha correr <span className="accent">com a gente</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-[#A8A29E]">
            Faça parte de uma equipe que já transformou a rotina de cerca de
            200 atletas em {site.location}.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/cadastro" className="btn-primary px-8 py-3.5 text-base">
              Comece agora
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link
              href="/contato"
              className="btn-outline border-[#57534E] px-8 py-3.5 text-base text-[#D6D3D1] hover:border-white hover:bg-white hover:text-[#171717]"
            >
              Fale conosco
            </Link>
          </div>
        </Container>
      </section>
    </main>
  )
}
