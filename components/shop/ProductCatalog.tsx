'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Palette } from 'lucide-react'
import type { CatalogColor } from '@/lib/shop/catalog'

export type StorefrontProduct = {
  name: string
  category: string
  description: string
  material: string
  price: number
  image: string
  imagePosition?: string
  imageZoom?: number
  imageFit?: 'contain' | 'cover'
  colors: CatalogColor[]
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const colorFilters: Record<string, string> = {
  Carbono: 'grayscale(1) brightness(.38) contrast(1.15)',
  Branco: 'grayscale(1) brightness(1.32) contrast(.9)',
  'Verde lima': 'hue-rotate(0deg) saturate(1.08)',
  'Rosa corrida': 'hue-rotate(285deg) saturate(1.18)',
  'Amarelo energia': 'hue-rotate(325deg) saturate(1.2)',
  'Azul royal': 'hue-rotate(100deg) saturate(1.15)',
  'Azul turquesa': 'hue-rotate(70deg) saturate(1.08)',
  'Laranja': 'hue-rotate(300deg) saturate(1.15)',
}

function ProductCard({ product }: { product: StorefrontProduct }) {
  const [selected, setSelected] = useState(product.colors[0])

  return (
    <article className="card group overflow-hidden">
      <div className={`relative aspect-[4/3] overflow-hidden ${product.imageFit === 'contain' ? 'bg-[#F4F1EC]' : 'bg-[#171717]'}`}>
        <Image
          key={`${product.name}-${selected.name}`}
          src={product.image}
          alt={`${product.name} na cor ${selected.name}`}
          fill
          className={`${product.imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-[transform,filter] duration-300`}

          style={{
            objectPosition: product.imagePosition ?? 'center',
            transformOrigin: product.imagePosition ?? 'center',
            transform: `scale(${product.imageZoom ?? (product.category === 'Vestuário' ? 2.7 : 3.2)})`,
            filter: product.colors.length === 1 ? 'none' : colorFilters[selected.name] ?? 'none',
          }}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div><p className="font-condensed text-[11px] font-semibold uppercase text-[#DC2626]">{product.category}</p><h3 className="mt-1 text-lg font-semibold text-[#171717]">{product.name}</h3></div>
          <p className="shrink-0 font-display text-2xl text-[#171717]">{currency.format(product.price)}</p>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[#57534E]">{product.description}</p>
        <p className="mt-3 text-xs leading-relaxed text-[#78716C]">{product.material}</p>
        <div className="mt-5 flex items-center gap-2" role="group" aria-label={`Escolher cor de ${product.name}`}>
          <Palette className="mr-1 h-4 w-4 text-[#78716C]" aria-hidden="true" />
          {product.colors.map((color) => (
            <button key={color.name} type="button" onClick={() => setSelected(color)} aria-label={color.name} aria-pressed={selected.name === color.name} title={color.name} className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: color.hex, borderColor: selected.name === color.name ? '#DC2626' : 'rgba(0,0,0,.15)' }} />
          ))}
          <span className="ml-1 text-xs text-[#57534E]">{selected.name}</span>
        </div>
      </div>
    </article>
  )
}

export default function ProductCatalog({ products }: { products: StorefrontProduct[] }) {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.name} product={product} />)}</div>
}
