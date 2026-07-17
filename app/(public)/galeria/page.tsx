'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Filter } from 'lucide-react'

type Category = 'todos' | 'treinos' | 'corridas' | 'medalhas' | 'equipe'

const photos: { src: string; alt: string; category: Exclude<Category, 'todos'>; span?: string }[] = [
  // Treinos
  { src: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800&q=80', alt: 'Treino de corrida ao ar livre', category: 'treinos' },
  { src: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&q=80', alt: 'Atletas em treino de corrida', category: 'treinos' },
  { src: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80', alt: 'Corredor em pista', category: 'treinos' },
  { src: 'https://images.unsplash.com/photo-1486218119243-13301343a01d?w=800&q=80', alt: 'Treino de resistência', category: 'treinos', span: 'col-span-2' },
  // Corridas
  { src: '/robson-running.jpg', alt: 'Robson Alves em corrida de rua', category: 'corridas', span: 'row-span-2' },
  { src: 'https://images.unsplash.com/photo-1460468527990-3f15e53c9a1a?w=800&q=80', alt: 'Atletas em corrida de rua', category: 'corridas' },
  { src: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&q=80', alt: 'Linha de chegada em corrida', category: 'corridas' },
  { src: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?w=800&q=80', alt: 'Grupo de corredores', category: 'corridas' },
  // Medalhas
  { src: 'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=800&q=80', alt: 'Medalhas de corrida', category: 'medalhas', span: 'col-span-2' },
  { src: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80', alt: 'Troféu de corrida', category: 'medalhas' },
  { src: 'https://images.unsplash.com/photo-1551958219-acbc18d1f01c?w=800&q=80', alt: 'Atleta com medalha', category: 'medalhas' },
  // Equipe
  { src: '/team-group.jpg', alt: 'Equipe Born to Run reunida em corrida', category: 'equipe', span: 'col-span-2 row-span-2' },
  { src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80', alt: 'Grupo de atletas unidos', category: 'equipe' },
  { src: 'https://images.unsplash.com/photo-1455853659719-4b521eebc76d?w=800&q=80', alt: 'Equipe celebrando juntos', category: 'equipe' },
]

const categories: { key: Category; label: string }[] = [
  { key: 'todos',    label: 'Todos' },
  { key: 'treinos',  label: 'Treinos' },
  { key: 'corridas', label: 'Corridas' },
  { key: 'medalhas', label: 'Medalhas' },
  { key: 'equipe',   label: 'Equipe Unida' },
]

export default function GaleriaPage() {
  const [active, setActive] = useState<Category>('todos')

  const filtered = active === 'todos'
    ? photos
    : photos.filter((p) => p.category === active)

  return (
    <>
      {/* Hero */}
      <section className="bg-white py-16 border-b border-stone-100">
        <div className="container-main">
          <div className="badge badge-orange mb-4">Galeria</div>
          <h1 className="section-title mb-3">
            Momentos que{' '}
            <span className="text-[var(--color-red)]">contam nossa história</span>
          </h1>
          <p className="section-subtitle text-stone-500 max-w-2xl">
            Cada foto registra uma conquista, um treino, uma corrida. 
            Aqui estão os momentos que fazem da Born to Run muito mais do que uma equipe esportiva.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-white border-b border-stone-100 sticky top-16 z-30">
        <div className="container-main py-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Filter size={16} className="text-stone-400 flex-shrink-0" />
            {categories.map(({ key, label }) => (
              <button
                key={key}
                id={`gallery-filter-${key}`}
                onClick={() => setActive(key)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active === key
                    ? 'bg-[var(--color-red)] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grade de Fotos */}
      <section className="py-12 bg-[var(--color-bg)]">
        <div className="container-main">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
            {filtered.map(({ src, alt, span }, i) => (
              <div
                key={i}
                className={`relative rounded-xl overflow-hidden group cursor-pointer ${span ?? ''}`}
              >
                <Image
                  src={src}
                  alt={alt}
                  fill
                  style={{ objectFit: 'cover' }}
                  className="group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-end p-3">
                  <p className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    {alt}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-stone-400 py-20">
              Nenhuma foto nesta categoria ainda.
            </p>
          )}
        </div>
      </section>
    </>
  )
}
