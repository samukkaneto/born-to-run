import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { LockKeyhole, ShoppingBag, Sparkles } from 'lucide-react'
import Container from '@/components/ui/Container'
import Section from '@/components/ui/Section'

export const metadata: Metadata = {
  title: 'Loja — prévia | Born to Run',
  description: 'Conceito da futura coleção oficial da equipe Born to Run.',
}

const products = [
  { name: 'Camiseta técnica', category: 'Vestuário', price: 89.9, image: '/shop-preview/apparel-main.webp' },
  { name: 'Regata performance', category: 'Vestuário', price: 99.9, image: '/shop-preview/apparel-main.webp' },
  { name: 'Top feminino', category: 'Vestuário', price: 109.9, image: '/shop-preview/apparel-premium.webp' },
  { name: 'Short de corrida', category: 'Vestuário', price: 99.9, image: '/shop-preview/apparel-premium.webp' },
  { name: 'Manga longa técnica', category: 'Vestuário', price: 139.9, image: '/shop-preview/apparel-premium.webp' },
  { name: 'Moletom premium', category: 'Vestuário', price: 189.9, image: '/shop-preview/apparel-premium.webp' },
  { name: 'Garrafa térmica', category: 'Hidratação', price: 89.9, image: '/shop-preview/accessories.webp' },
  { name: 'Boné de corrida', category: 'Acessórios', price: 79.9, image: '/shop-preview/accessories.webp' },
  { name: 'Viseira esportiva', category: 'Acessórios', price: 69.9, image: '/shop-preview/accessories.webp' },
  { name: 'Mochila saco', category: 'Acessórios', price: 59.9, image: '/shop-preview/accessories.webp' },
  { name: 'Toalha esportiva', category: 'Acessórios', price: 49.9, image: '/shop-preview/accessories.webp' },
  { name: 'Caneca oficial', category: 'Casa', price: 39.9, image: '/shop-preview/accessories.webp' },
  { name: 'Copo térmico', category: 'Casa', price: 69.9, image: '/shop-preview/accessories.webp' },
]

export default function LojaPreviewPage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-[#171717] pb-16 pt-32 text-white md:pb-24 md:pt-40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(220,38,38,0.2),transparent_35%)]" />
        <Container className="relative">
          <span className="inline-flex items-center gap-2 rounded-md border border-[#DC2626]/40 bg-[#DC2626]/15 px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.16em] text-[#FCA5A5]"><Sparkles size={13} /> Prévia conceitual</span>
          <h1 className="mt-6 max-w-4xl font-display text-6xl uppercase leading-[0.88] sm:text-7xl lg:text-8xl">Vista a <span className="text-[#DC2626]">jornada.</span></h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-[#D6D3D1] sm:text-lg">Uma primeira visão da futura coleção oficial Born to Run. Produtos, fornecedores, valores finais e pagamentos ainda serão definidos.</p>
        </Container>
      </section>

      <Section className="route-texture">
        <Container>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#171717] shadow-card-lg lg:col-span-2"><Image src="/shop-preview/apparel-main.webp" alt="Conceito de roupas de corrida Born to Run em modelos" fill priority className="object-cover" sizes="100vw" /></div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#171717] shadow-card-lg"><Image src="/shop-preview/apparel-premium.webp" alt="Conceito premium de tops, shorts e moletom Born to Run" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /></div>
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-[#171717] shadow-card-lg"><Image src="/shop-preview/accessories.webp" alt="Conceito de acessórios personalizados Born to Run" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" /></div>
          </div>

          <div className="mb-5 mt-16 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="section-kicker mb-2">Catálogo inicial</p><h2 className="font-display text-4xl uppercase text-[#171717]">Produtos imaginados</h2></div><p className="max-w-md text-xs leading-relaxed text-[#78716C]">Valores apenas estimativos para validar a ideia. Não constituem oferta comercial.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <article key={product.name} className="card overflow-hidden">
                <div className="relative aspect-[16/9] bg-[#171717]"><Image src={product.image} alt="" fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" /></div>
                <div className="flex items-end justify-between gap-3 p-4"><div><p className="font-condensed text-[11px] uppercase tracking-[0.14em] text-[#DC2626]">{product.category}</p><h3 className="mt-1 font-semibold text-[#171717]">{product.name}</h3></div><p className="shrink-0 font-display text-xl text-[#171717]">R$ {product.price.toFixed(2).replace('.', ',')}</p></div>
              </article>
            ))}
          </div>

          <div className="mt-12 flex flex-col items-center rounded-2xl bg-[#171717] p-8 text-center text-white sm:p-12">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/10"><LockKeyhole className="text-[#F87171]" /></span>
            <h2 className="mt-5 font-display text-4xl uppercase">Vendas ainda não estão ativas</h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#D6D3D1]">A próxima fase inclui fornecedores, estoque, tamanhos, frete, política de trocas, checkout, pagamentos e pedidos. Esta página serve para apresentar o conceito ao Prof. Robson.</p>
            <Link href="/contato" className="btn-primary mt-6"><ShoppingBag size={16} /> Quero demonstrar interesse</Link>
          </div>
        </Container>
      </Section>
    </main>
  )
}
