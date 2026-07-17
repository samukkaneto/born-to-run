import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Award, MapPin, Dumbbell, GraduationCap, Star, ArrowRight, Shield } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Equipe Técnica — Born to Run',
  description:
    'Conheça Robson Alves, educador físico, CREF 119911-G/SP, treinador e responsável técnico da Born to Run em Descalvado-SP.',
}

const credentials = [
  {
    icon: GraduationCap,
    title: 'Formação Acadêmica',
    items: ['Graduação Plena em Educação Física'],
    color: '#e81010', bg: '#fff0f0'
  },
  {
    icon: Star,
    title: 'Especialização',
    items: ['Corridas de meio fundo e fundo', 'Fisiologia do Exercício'],
    color: '#fb923c', bg: '#fff7ed'
  },
  {
    icon: Award,
    title: 'Certificação Internacional',
    items: ['Treinador Nível 1 — World Athletics'],
    color: '#16a34a', bg: '#f0fdf4'
  },
  {
    icon: Dumbbell,
    title: 'Áreas de Atuação',
    items: ['Corrida de Rua', 'Caminhada Orientada', 'Emagrecimento'],
    color: '#7c3aed', bg: '#f5f3ff'
  },
]

export default function EquipePage() {
  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      {/* ═══════════════════════════════════════
          HERO
      ═══════════════════════════════════════ */}
      <section className="relative py-24 bg-white overflow-hidden border-b border-stone-100">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-50 rounded-full blur-[120px] opacity-50 -translate-y-1/2 translate-x-1/3" />
        <div className="container-main relative z-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center bg-red-50 text-[var(--color-red)] font-semibold text-sm px-5 py-2 rounded-full mb-6 border border-red-100">
            Responsável Técnico
          </div>
          <h1 className="font-display text-5xl md:text-6xl font-black text-stone-900 leading-tight mb-6">
            Liderança baseada na{' '}
            <span className="text-[var(--color-red)]">ciência e prática</span>
          </h1>
          <p className="text-lg text-stone-600 leading-relaxed">
            A Born to Run é liderada por um profissional qualificado, com formação 
            específica em atletismo e anos de experiência na pista e no asfalto.
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PERFIL PRINCIPAL
      ═══════════════════════════════════════ */}
      <section className="py-20">
        <div className="container-main">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Coluna Esquerda: Foto & Badges */}
            <div className="lg:col-span-5 space-y-6">
              <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/robson-portrait.jpg"
                  alt="Prof. Robson Alves"
                  fill
                  style={{ objectFit: 'cover', objectPosition: 'center top' }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>

              {/* Badges de Identificação */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                    <Shield size={24} className="text-[var(--color-red)]" />
                  </div>
                  <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mb-1">Registro</p>
                  <p className="text-stone-800 font-bold text-[15px]">CREF 119911-G/SP</p>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center mb-3">
                    <MapPin size={24} className="text-stone-600" />
                  </div>
                  <p className="text-[11px] text-stone-400 font-bold uppercase tracking-widest mb-1">Sede</p>
                  <p className="text-stone-800 font-bold text-[15px]">Descalvado - SP</p>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Conteúdo */}
            <div className="lg:col-span-7 pt-4">
              <div className="divider-red mb-6" />
              <h2 className="font-display text-4xl md:text-5xl font-black text-stone-900 mb-2">
                Prof. Robson Alves
              </h2>
              <p className="text-[var(--color-red)] font-semibold text-xl mb-10">
                Educador Físico & Fundador
              </p>

              <div className="space-y-6 text-stone-600 text-lg leading-loose mb-14">
                <p>
                  Robson Alves é a alma por trás da <strong>Born to Run</strong>. 
                  Como educador físico formado e especialista em corridas de meio fundo e fundo, 
                  ele transformou sua paixão incansável pela corrida em uma missão de vida: 
                  levar saúde, longevidade e superação para as pessoas através do esporte.
                </p>
                <p>
                  O diferencial da sua metodologia está na união entre prática empírica e a mais rigorosa ciência do esporte. 
                  Com a certificação internacional de <strong>Treinador Nível 1 da World Athletics</strong> 
                  (a federação global máxima do atletismo), Robson garante que cada aluno — do iniciante ao maratonista — 
                  receba um treinamento seguro, periodizado e altamente eficiente.
                </p>
                <p>
                  Desde 2015, ele já caminhou lado a lado com cerca de <strong>200 atletas</strong>, 
                  guiando-os em suas metas pessoais de perda de peso, qualidade de vida ou recordes de performance.
                </p>
              </div>

              <h3 className="font-display text-2xl font-bold text-stone-900 mb-6">
                Credenciais e Formação
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-5">
                {credentials.map(({ icon: Icon, title, items, color, bg }) => (
                  <div key={title} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: bg }}>
                        <Icon size={24} style={{ color }} />
                      </div>
                      <h4 className="font-bold text-stone-800">{title}</h4>
                    </div>
                    <ul className="space-y-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-[15px] text-stone-600">
                          <span className="w-5 h-5 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold text-stone-500">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SEÇÃO SECUNDÁRIA: FOTO EM AÇÃO
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-stone-900 text-white">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-display text-4xl font-black mb-6">
                Quem ensina, <span className="text-[var(--color-red)]">também pratica.</span>
              </h2>
              <p className="text-stone-400 text-lg leading-loose mb-8">
                Robson não apenas entrega planilhas — ele calça os tênis e vai para o asfalto. 
                A cultura da Born to Run é construída pelo exemplo: treinar com disciplina, 
                competir com garra e celebrar as conquistas em equipe, cruzando a mesma linha de chegada.
              </p>
              <Link href="https://wa.me/5519900000000" target="_blank" rel="noopener noreferrer" 
                    className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold px-8 py-4 rounded-xl hover:bg-red-700 transition-colors">
                Treine com o Robson
                <ArrowRight size={20} />
              </Link>
            </div>
            
            <div className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/robson-running.jpg"
                alt="Robson Alves competindo"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
