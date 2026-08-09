import type { Metadata } from 'next'
import { Mail, MapPin, Users } from 'lucide-react'
import InstagramIcon from '@/components/ui/InstagramIcon'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import ContactForm from '@/components/contact/ContactForm'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contato | Born to Run — Treinamento e Saúde',
  description:
    'Fale com a equipe Born to Run de Descalvado-SP pelo e-mail contato@equipeborntorun.com ou Instagram @equipeborntorun.',
}

export default function ContatoPage() {
  return (
    <main>
      <Section
        kicker="05 · Contato"
        title="Fale com a gente"
        subtitle="Quer começar a correr ou entrar para a equipe? Manda uma mensagem."
        centered
        className="route-texture"
      >
        <Container>
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Canais oficiais */}
            <div className="space-y-6 lg:col-span-2">
              <a
                href={site.social.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card flex items-start gap-4 p-6 transition-shadow hover:shadow-card-lg"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#FEE2E2]">
                  <InstagramIcon className="h-6 w-6 text-[var(--color-red)]" />
                </span>
                <div>
                  <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.08em] text-[#171717]">
                    Instagram
                  </h3>
                  <p className="text-neutral-600">
                    @{site.social.instagramHandle}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Nosso canal oficial — respondemos por lá.
                  </p>
                </div>
              </a>

              <a
                href={`mailto:${site.contact.email}`}
                className="card flex items-start gap-4 p-6 transition-shadow hover:shadow-card-lg"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#E0F2FE]">
                  <Mail className="h-6 w-6 text-sky-700" />
                </span>
                <div>
                  <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.08em] text-[#171717]">
                    E-mail
                  </h3>
                  <p className="break-all text-neutral-600">
                    {site.contact.email}
                  </p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Canal oficial do projeto piloto.
                  </p>
                </div>
              </a>

              <div className="card flex items-start gap-4 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7]">
                  <MapPin className="h-6 w-6 text-[var(--color-green)]" />
                </span>
                <div>
                  <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.08em] text-[#171717]">
                    Onde estamos
                  </h3>
                  <p className="text-neutral-600">{site.location}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Treinos e encontros da equipe acontecem na cidade e região.
                  </p>
                </div>
              </div>

              <div className="card flex items-start gap-4 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-[#FFEDD5]">
                  <Users className="h-6 w-6 text-[var(--color-orange)]" />
                </span>
                <div>
                  <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.08em] text-[#171717]">
                    Já é atleta?
                  </h3>
                  <p className="text-neutral-600">
                    Acesse a área de membros para acompanhar seus treinos e o
                    feed da equipe.
                  </p>
                </div>
              </div>
            </div>

            {/* Formulário */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </Container>
      </Section>
    </main>
  )
}
