import type { Metadata } from 'next'
import Image from 'next/image'
import { Award, Flag, HeartHandshake, MapPin, Target, Users } from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
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
      {/* História */}
      <Section
        title="Nossa história"
        subtitle={`Desde ${site.foundedYear}, transformando vidas através da corrida em ${site.location}.`}
      >
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-5 text-lg leading-relaxed text-neutral-700">
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
              <div className="flex items-center gap-2 text-neutral-600">
                <MapPin className="h-5 w-5 text-[var(--color-red)]" />
                <span>
                  {site.city} - {site.state}
                </span>
              </div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-card-lg">
              <Image
                src="/images/team-group.jpg"
                alt="Atletas da equipe Born to Run reunidos"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Treinador */}
      <Section
        title="Nosso treinador"
        subtitle="Orientação profissional em cada passo da sua evolução."
        className="bg-[var(--color-bg)]"
      >
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative order-2 aspect-[3/4] max-h-[560px] overflow-hidden rounded-2xl shadow-card-lg lg:order-1">
              <Image
                src="/images/robson-portrait.jpg"
                alt={`${site.coach.name}, treinador da Born to Run`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
            <div className="order-1 lg:order-2">
              <Badge variant="red">Treinador responsável</Badge>
              <h3 className="mt-4 font-[family-name:var(--font-barlow)] text-3xl font-bold uppercase tracking-wide text-neutral-900 sm:text-4xl">
                {site.coach.name}
              </h3>
              <p className="mt-1 text-lg font-medium text-[var(--color-red)]">
                {site.coach.title} — {site.coach.cref}
              </p>
              <ul className="mt-6 space-y-4">
                {site.coach.credentials.map((credential) => (
                  <li key={credential} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50">
                      <Award className="h-4 w-4 text-[var(--color-red)]" />
                    </span>
                    <span className="text-neutral-700">{credential}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 leading-relaxed text-neutral-600">
                À frente da equipe desde a fundação, Robson acompanha de perto a
                evolução de cada atleta, unindo formação acadêmica e
                certificação internacional para orientar treinos de meio fundo e
                fundo com segurança e resultado.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Valores */}
      <Section
        title="O que nos move"
        subtitle="Os valores que guiam a equipe dentro e fora das pistas."
        centered
      >
        <Container>
          <div className="grid gap-8 md:grid-cols-3">
            {values.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card p-8 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
                  <Icon className="h-7 w-7 text-[var(--color-red)]" />
                </span>
                <h3 className="mt-5 font-[family-name:var(--font-barlow)] text-xl font-bold uppercase tracking-wide text-neutral-900">
                  {title}
                </h3>
                <p className="mt-3 leading-relaxed text-neutral-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <section className="bg-neutral-950 py-20">
        <Container className="text-center">
          <Users className="mx-auto h-10 w-10 text-[var(--color-red)]" />
          <h2 className="mt-4 font-[family-name:var(--font-barlow)] text-3xl font-bold uppercase tracking-wide text-white sm:text-4xl">
            Venha correr com a gente
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-neutral-300">
            Faça parte de uma equipe que já transformou a rotina de cerca de 200
            atletas em {site.location}.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button href="/cadastro" size="lg">
              Comece agora
            </Button>
            <Button href="/contato" variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-neutral-900">
              Fale conosco
            </Button>
          </div>
        </Container>
      </section>
    </main>
  )
}
