import type { Metadata } from 'next'
import { MapPin, Users } from 'lucide-react'
import InstagramIcon from '@/components/ui/InstagramIcon'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import ContactForm from '@/components/contact/ContactForm'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Contato | Born to Run — Treinamento e Saúde',
  description:
    'Fale com a equipe Born to Run de Descalvado-SP pelo Instagram @equipeborntorun ou envie sua mensagem.',
}

export default function ContatoPage() {
  return (
    <main>
      <Section
        title="Fale com a gente"
        subtitle="Quer começar a correr ou entrar para a equipe? Manda uma mensagem."
        centered
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
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <InstagramIcon className="h-6 w-6 text-[var(--color-red)]" />
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-barlow)] text-lg font-bold uppercase tracking-wide text-neutral-900">
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

              <div className="card flex items-start gap-4 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-50">
                  <MapPin className="h-6 w-6 text-[var(--color-green)]" />
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-barlow)] text-lg font-bold uppercase tracking-wide text-neutral-900">
                    Onde estamos
                  </h3>
                  <p className="text-neutral-600">{site.location}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    Treinos e encontros da equipe acontecem na cidade e região.
                  </p>
                </div>
              </div>

              <div className="card flex items-start gap-4 p-6">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50">
                  <Users className="h-6 w-6 text-[var(--color-orange)]" />
                </span>
                <div>
                  <h3 className="font-[family-name:var(--font-barlow)] text-lg font-bold uppercase tracking-wide text-neutral-900">
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
