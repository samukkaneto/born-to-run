import type { Metadata } from 'next'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import InstagramIcon from '@/components/ui/InstagramIcon'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Galeria | Born to Run — Treinamento e Saúde',
  description:
    'Momentos da equipe Born to Run de Descalvado-SP: treinos, provas e a energia do grupo.',
}

const photos = [
  {
    src: '/team-group.jpg',
    alt: 'Atletas da equipe Born to Run reunidos',
    caption: 'A equipe reunida — a força do grupo em cada encontro',
    wide: true,
  },
  {
    src: '/robson-running.jpg',
    alt: 'Robson Alves correndo',
    caption: 'Robson Alves, nosso treinador, dando o exemplo na pista',
    wide: false,
  },
  {
    src: '/robson-portrait.jpg',
    alt: 'Retrato de Robson Alves, treinador da Born to Run',
    caption: 'Robson Alves — Educador Físico e treinador da equipe',
    wide: false,
  },
]

export default function GaleriaPage() {
  return (
    <main>
      <Section
        kicker="04 · Galeria"
        title="Momentos da equipe"
        subtitle="Treinos, provas e a energia do grupo que conta a nossa história."
        centered
        className="route-texture"
      >
        <Container>
          <div className="grid gap-6 md:grid-cols-2">
            {photos.map((photo) => (
              <figure
                key={photo.src}
                className={`group overflow-hidden rounded-xl shadow-card-lg ${
                  photo.wide ? 'md:col-span-2' : ''
                }`}
              >
                <div
                  className={`relative w-full ${
                    photo.wide ? 'aspect-[16/8]' : 'aspect-[4/3]'
                  }`}
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes={photo.wide ? '100vw' : '(max-width: 768px) 100vw, 50vw'}
                  />
                </div>
                <figcaption className="bg-white px-5 py-4 font-condensed text-sm font-medium uppercase tracking-[0.08em] text-[#44403C]">
                  {photo.caption}
                </figcaption>
              </figure>
            ))}
          </div>

          {/* Mais fotos em breve / Instagram */}
          <div className="card mt-12 flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#FEE2E2]">
              <Camera className="h-7 w-7 text-[var(--color-red)]" />
            </span>
            <h3 className="font-display text-3xl uppercase text-[#171717]">
              Mais momentos em breve
            </h3>
            <p className="max-w-xl text-[#57534E]">
              Novas fotos de treinos e provas serão adicionadas pela equipe.
              Enquanto isso, acompanhe o dia a dia da Born to Run no nosso
              Instagram.
            </p>
            <Button
              href={site.social.instagramUrl}
              variant="outline"
              className="mt-2"
            >
              <InstagramIcon className="h-4 w-4" />
              @{site.social.instagramHandle}
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  )
}
