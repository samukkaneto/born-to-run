import type { Metadata } from 'next'
import Image from 'next/image'
import { Camera } from 'lucide-react'
import InstagramIcon from '@/components/ui/InstagramIcon'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'
import Button from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/server'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Galeria | Born to Run — Treinamento e Saúde',
  description: 'Momentos da equipe Born to Run de Descalvado-SP: treinos, provas e a energia do grupo.',
}

const initialCollection = [
  {
    src: '/team-archive/team-race-palace.jpg',
    alt: 'Atletas da equipe Born to Run reunidos em uma prova',
    layout: 'wide',
  },
  {
    src: '/robson-running.jpg',
    alt: 'Robson Alves correndo e representando a Born to Run',
    layout: 'standard',
  },
  {
    src: '/robson-portrait.jpg',
    alt: 'Robson Alves, treinador da equipe Born to Run',
    layout: 'standard',
  },
] as const

export default async function GaleriaPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('gallery_items')
    .select('id, storage_path, title, caption, alt_text, layout')
    .eq('is_published', true)
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (error) throw new Error('Não foi possível carregar a galeria.')

  const managedPhotos = (data ?? []).map((item) => ({
    id: item.id,
    src: supabase.storage.from('gallery').getPublicUrl(item.storage_path).data.publicUrl,
    alt: item.alt_text,
    title: item.title,
    caption: item.caption,
    layout: item.layout,
  }))

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
            {(managedPhotos.length === 0 ? initialCollection : []).map((photo) => (
              <figure key={photo.src} className={`group overflow-hidden rounded-xl shadow-card-lg ${photo.layout === 'wide' ? 'md:col-span-2' : ''}`}>
                <div className={`relative w-full ${photo.layout === 'wide' ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}>
                  <Image src={photo.src} alt={photo.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes={photo.layout === 'wide' ? '100vw' : '(max-width: 768px) 100vw, 50vw'} />
                </div>
              </figure>
            ))}

            {managedPhotos.map((photo) => (
              <figure key={photo.id} className={`group overflow-hidden rounded-xl shadow-card-lg ${photo.layout === 'wide' ? 'md:col-span-2' : ''}`}>
                <div className={`relative w-full ${photo.layout === 'wide' ? 'aspect-[16/8]' : 'aspect-[4/3]'}`}>
                  <Image src={photo.src} alt={photo.alt} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes={photo.layout === 'wide' ? '100vw' : '(max-width: 768px) 100vw, 50vw'} />
                </div>
                {(photo.title || photo.caption) && (
                  <figcaption className="bg-white px-5 py-4 text-[#44403C]">
                    {photo.title && <strong className="block font-condensed text-sm uppercase tracking-[0.08em]">{photo.title}</strong>}
                    {photo.caption && <span className="mt-1 block text-sm leading-relaxed text-[#57534E]">{photo.caption}</span>}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>

          <div className="card mt-12 flex flex-col items-center gap-4 p-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#FEE2E2]">
              <Camera className="h-7 w-7 text-[var(--color-red)]" />
            </span>
            <h3 className="font-display text-3xl uppercase text-[#171717]">A história continua</h3>
            <p className="max-w-xl text-[#57534E]">
              A galeria pública é selecionada pelo administrador e pelo treinador. Os registros pessoais dos atletas permanecem no ambiente privado da comunidade.
            </p>
            <Button href={site.social.instagramUrl} variant="outline" className="mt-2">
              <InstagramIcon className="h-4 w-4" />
              @{site.social.instagramHandle}
            </Button>
          </div>
        </Container>
      </Section>
    </main>
  )
}
