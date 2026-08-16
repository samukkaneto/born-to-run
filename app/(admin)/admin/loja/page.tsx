import type { Metadata } from 'next'
import Image from 'next/image'
import { Download, ShieldCheck, Sparkles } from 'lucide-react'
import ProductCatalog from '@/components/shop/ProductCatalog'
import { catalogProducts } from '@/lib/shop/catalog'

export const metadata: Metadata = {
  title: 'Coleção Born to Run | Gestão',
  description: 'Catálogo reservado da coleção oficial Born to Run.',
}

export default function AdminStorePage() {
  return (
    <div className="space-y-10 pb-8">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#171717] text-white shadow-card-lg">
        <Image
          src="/shop-preview/apparel-premium.webp"
          alt="Coleção esportiva premium em preto Born to Run"
          fill
          priority
          className="-z-20 object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1024px"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/80 to-black/15" />
        <div className="max-w-xl px-6 py-12 sm:px-10 sm:py-16">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/30 px-3 py-1.5 font-condensed text-xs font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            <Sparkles size={14} aria-hidden="true" /> Coleção oficial

          </p>
          <h1 className="mt-5 font-display text-5xl uppercase leading-[0.88] sm:text-7xl">
            Corra com a <span className="text-[#FACC15]">nossa energia.</span>
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-[#E7E5E4] sm:text-base">
            Roupas e acessórios para levar a identidade Born to Run dos treinos à linha de chegada.
          </p>
        </div>
      </section>

      <section aria-labelledby="catalog-title">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="section-kicker mb-2">Identidade em movimento</p>
            <h2 id="catalog-title" className="font-display text-4xl uppercase text-[#171717] sm:text-5xl">
              Catálogo da equipe
            </h2>
          </div>
          <div className="flex flex-col items-start gap-3 sm:items-end"><p className="flex max-w-sm items-center gap-2 text-sm leading-relaxed text-[#57534E]"><ShieldCheck className="h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden="true" />Curadoria reservada à administração e ao treinador.</p><a href="/api/admin/shop/suppliers" className="btn-secondary text-sm"><Download size={16} aria-hidden="true" /> Relatório de fornecedores</a></div>
        </div>
        <ProductCatalog products={catalogProducts.map((product) => ({
          name: product.name,
          category: product.category,
          description: product.description,
          material: product.material,
          price: product.price,
          image: product.image,
          imagePosition: product.imagePosition,
          imageZoom: product.imageZoom,
          colors: product.colors,
        }))} />
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-[#171717] shadow-card-lg">
        <div className="grid md:grid-cols-2">
          <div className="relative aspect-[4/3]"><Image src="/shop-preview/accessories.webp" alt="Acessórios pretos da coleção Born to Run" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>
          <div className="relative aspect-[4/3]"><Image src="/shop-preview/accessories-color-collection.webp" alt="Acessórios coloridos da coleção Born to Run" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" /></div>
        </div>
      </section>
    </div>
  )
}
