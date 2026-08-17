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
  colorImages?: Partial<Record<string, string>>
  colors: CatalogColor[]
}

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function ProductCard({ product }: { product: StorefrontProduct }) {
  const availableColors = product.colors.filter((color) => Boolean(product.colorImages?.[color.name]))
  const [selectedName, setSelectedName] = useState(availableColors[0]?.name)
  const selectedColor = availableColors.find((color) => color.name === selectedName)
  const imageSrc = selectedColor ? product.colorImages?.[selectedColor.name] ?? product.image : product.image

  return (
    <article className="card group overflow-hidden">
      <div className={`relative aspect-[4/3] overflow-hidden ${product.imageFit === 'contain' ? 'bg-[#F4F1EC]' : 'bg-[#171717]'}`}>
        <Image
          key={`${product.name}-${imageSrc}`}
          src={imageSrc}
          alt={`${product.name}${selectedColor ? ` na cor ${selectedColor.name}` : ''}`}
          fill
          className={`${product.imageFit === 'contain' ? 'object-contain' : 'object-cover'} transition-transform duration-300`}
          style={{
            objectPosition: product.imagePosition ?? 'center',
            transformOrigin: product.imagePosition ?? 'center',
            transform: `scale(${product.imageZoom ?? (product.category === 'Vestuário' ? 2.7 : 3.2)})`,
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
        {availableColors.length > 0 && (
          <div className="mt-5 flex items-center gap-2" role="group" aria-label={`Escolher cor disponível de ${product.name}`}>
            <Palette className="mr-1 h-4 w-4 text-[#78716C]" aria-hidden="true" />
            {availableColors.map((color) => (
              <button key={color.name} type="button" onClick={() => setSelectedName(color.name)} aria-label={`${color.name} disponível`} aria-pressed={selectedName === color.name} title={`${color.name} — imagem disponível`} className="h-7 w-7 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor: color.hex, borderColor: selectedName === color.name ? '#DC2626' : 'rgba(0,0,0,.15)' }} />
            ))}
            {selectedColor && <span className="ml-1 text-xs text-[#57534E]">{selectedColor.name}</span>}
          </div>
        )}
      </div>
    </article>
  )
}

export default function ProductCatalog({ products }: { products: StorefrontProduct[] }) {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{products.map((product) => <ProductCard key={product.name} product={product} />)}</div>
}
