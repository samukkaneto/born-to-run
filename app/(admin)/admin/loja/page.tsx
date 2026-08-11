import type { Metadata } from 'next'
import Image from 'next/image'
import { Palette, ShieldCheck, Sparkles } from 'lucide-react'
import { catalogProducts } from '@/lib/shop/catalog'

export const metadata: Metadata = {
  title: 'Coleção Born to Run | Gestão',
  description: 'Catálogo reservado da coleção oficial Born to Run.',
}

const currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export default function AdminStorePage() {
  return (
    <div className="space-y-10 pb-8">
      <section className="relative isolate overflow-hidden rounded-[2rem] bg-[#171717] text-white shadow-card-lg">
        <Image
          src="/shop-preview/apparel-color-collection.webp"
          alt="Coleção esportiva colorida Born to Run"
          fill
          priority
          className="-z-20 object-cover object-center"
          sizes="(max-width: 768px) 100vw, 1024px"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/75 to-black/10" />
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
          <p className="flex max-w-sm items-center gap-2 text-sm leading-relaxed text-[#57534E]">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#16A34A]" aria-hidden="true" />
            Curadoria reservada à administração e ao treinador.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {catalogProducts.map((product) => (
            <article key={product.name} className="card group overflow-hidden">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#171717]">
                <Image
                  src={product.image}
                  alt=""
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  style={{ objectPosition: product.imagePosition ?? 'center' }}
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-condensed text-[11px] font-semibold uppercase tracking-[0.15em] text-[#DC2626]">
                      {product.category}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-[#171717]">{product.name}</h3>
                  </div>
                  <p className="shrink-0 font-display text-2xl text-[#171717]">
                    {currency.format(product.price)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-[#57534E]">{product.description}</p>
                <p className="mt-3 text-xs leading-relaxed text-[#78716C]">{product.material}</p>
                <div className="mt-5 flex items-center gap-2" aria-label={`Cores de ${product.name}`}>
                  <Palette className="mr-1 h-4 w-4 text-[#78716C]" aria-hidden="true" />
                  {product.colors.map((color) => (
                    <span
                      key={color.name}
                      className="h-5 w-5 rounded-full border border-black/15 shadow-sm"
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      <span className="sr-only">{color.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden rounded-[2rem] bg-[#171717] shadow-card-lg">
        <div className="relative aspect-[16/9] min-h-[300px] sm:aspect-[21/9]">
          <Image
            src="/shop-preview/accessories-color-collection.webp"
            alt="Acessórios coloridos da coleção Born to Run"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 1024px"
          />
        </div>
      </section>
    </div>
  )
}
