import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Users, Calendar, Heart, Footprints, Target, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sobre a Equipe — Born to Run',
  description:
    'Conheça a história da Born to Run — Treinamento e Saúde, equipe de corrida e caminhada de Descalvado-SP fundada em 2015.',
}

const stats = [
  { icon: Calendar, value: '2015',  label: 'Ano de fundação' },
  { icon: Users,    value: '~200',  label: 'Atletas atendidos' },
  { icon: Target,   value: '+200',  label: 'Corridas disputadas' },
  { icon: MapPin,   value: 'DESC.', label: 'Descalvado - SP' },
]

const values = [
  {
    icon: Heart, title: 'Saúde em primeiro lugar',
    desc: 'Todo treino é planejado priorizando a saúde e integridade física de cada atleta, sem exageros.',
    color: '#e81010', bg: '#fff0f0',
  },
  {
    icon: Users, title: 'Comunidade e pertencimento',
    desc: 'Acreditamos no poder do grupo: ninguém treina sozinho e celebramos cada conquista juntos.',
    color: '#16a34a', bg: '#f0fdf4',
  },
  {
    icon: Footprints, title: 'Metodologia certificada',
    desc: 'Planejamento baseado na ciência do esporte e nas diretrizes oficiais da World Athletics.',
    color: '#c2410c', bg: '#fff7ed',
  },
  {
    icon: Target, title: 'Respeito à individualidade',
    desc: 'Cada atleta tem seu próprio ritmo, genética e meta. O treino adapta-se a você, não o contrário.',
    color: '#7c3aed', bg: '#f5f3ff',
  },
  {
    icon: Calendar, title: 'Consistência e disciplina',
    desc: 'A evolução verdadeira só vem com regularidade. Nossa missão é manter você focado no processo.',
    color: '#0284c7', bg: '#f0f9ff',
  },
  {
    icon: Heart, title: 'Qualidade de vida',
    desc: 'O esporte é a melhor ferramenta para viver bem. Queremos que você ganhe energia e longevidade.',
    color: '#e11d48', bg: '#fff1f2',
  },
]

export default function SobrePage() {
  return (
    <div className="bg-[var(--color-bg)] min-h-screen">
      
      {/* ═══════════════════════════════════════
          HERO & HISTÓRIA (SPLIT LAYOUT)
      ═══════════════════════════════════════ */}
      <section className="pt-24 pb-16 overflow-hidden">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="max-w-2xl">
              <div className="inline-flex items-center justify-center bg-green-50 text-[var(--color-green)] font-semibold text-sm px-5 py-2 rounded-full mb-6 border border-green-100">
                A Nossa História
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-black text-stone-900 leading-tight mb-8">
                Nascemos em Descalvado para{' '}
                <span className="text-[var(--color-red)]">transformar vidas</span>
              </h1>
              
              <div className="space-y-6 text-lg text-stone-600 leading-loose">
                <p>
                  A <strong>Born to Run — Treinamento e Saúde</strong> foi fundada em 
                  <strong> 2015</strong> pelo educador físico Robson Alves. A ideia nasceu de um 
                  desejo simples, porém poderoso: democratizar o acesso à prática da corrida 
                  e da caminhada com orientação profissional de alta qualidade em Descalvado-SP.
                </p>
                <p>
                  O que começou como um pequeno grupo de entusiastas se transformou em uma equipe 
                  consolidada que já impactou a vida de <strong>cerca de 200 atletas</strong>. 
                  Ao longo desta quase uma década, nossa camisa cruzou as linhas de chegada de 
                  <strong> mais de 200 corridas de rua</strong>.
                </p>
                <p>
                  Hoje, somos mais do que uma assessoria esportiva. Somos uma comunidade onde 
                  todo mundo encontra o seu ritmo. Não importa se você está dando os primeiros passos 
                  para sair do sedentarismo ou se busca quebrar seu recorde pessoal na maratona — 
                  há um lugar para você na Born to Run.
                </p>
              </div>
            </div>

            <div className="relative h-[600px] rounded-3xl overflow-hidden shadow-2xl">
              <Image
                src="/team-group.jpg"
                alt="Equipe Born to Run"
                fill
                style={{ objectFit: 'cover', objectPosition: 'center' }}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-10 left-10 right-10">
                <p className="text-white font-bold text-2xl italic">
                  "Correr transforma, mas correr em equipe te leva mais longe."
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          ESTATÍSTICAS EM DESTAQUE
      ═══════════════════════════════════════ */}
      <section className="py-16">
        <div className="container-main">
          <div className="bg-[var(--color-red)] rounded-3xl p-10 md:p-14 shadow-2xl overflow-hidden relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <Image src="/team-group.jpg" alt="" fill style={{ objectFit: 'cover' }} />
            </div>
            
            <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 text-center">
              {stats.map(({ icon: Icon, value, label }) => (
                <div key={label}>
                  <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="font-display text-4xl md:text-5xl font-black text-white mb-1">
                    {value}
                  </div>
                  <p className="text-red-100 font-medium uppercase tracking-wider text-xs">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          NOSSOS VALORES
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="container-main">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="divider-green mx-auto mb-6" />
            <h2 className="font-display text-4xl font-black text-stone-900 mb-4">O que nos guia</h2>
            <p className="text-stone-500 text-lg">
              Estes são os pilares inegociáveis que sustentam cada planilha de treino 
              e cada evento da nossa equipe.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map(({ icon: Icon, title, desc, color, bg }) => (
              <div key={title} className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 hover:shadow-lg transition-shadow">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ backgroundColor: bg }}>
                  <Icon size={28} style={{ color }} />
                </div>
                <h3 className="font-display text-xl font-bold text-stone-900 mb-3">{title}</h3>
                <p className="text-stone-600 leading-relaxed text-[15px]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CTA FINAL
      ═══════════════════════════════════════ */}
      <section className="py-24 bg-stone-900 text-center text-white">
        <div className="container-main">
          <h2 className="font-display text-4xl font-black mb-6">
            Faça parte da família <span className="text-[var(--color-red)]">Born to Run</span>
          </h2>
          <p className="text-stone-400 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
            Venha descobrir na prática como a corrida pode transformar sua vida. 
            Estamos em Descalvado-SP esperando por você.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/equipe" className="inline-flex items-center justify-center gap-2 bg-[var(--color-red)] text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-red-700 transition-colors">
              Conhecer o Treinador
              <ArrowRight size={20} />
            </Link>
            <a href="https://wa.me/5519900000000" target="_blank" rel="noopener noreferrer" 
               className="inline-flex items-center justify-center gap-2 bg-stone-800 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-stone-700 transition-colors">
              Entrar em contato
            </a>
          </div>
        </div>
      </section>

    </div>
  )
}
