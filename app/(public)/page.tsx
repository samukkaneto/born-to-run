import type { Metadata } from 'next'
import Image from 'next/image'
import {
  Users,
  Trophy,
  Calendar,
  ArrowRight,
  Heart,
  TrendingUp,
  Zap,
  MessageCircle,
  CheckCircle,
  Star,
  MapPin,
  Clock,
  ChevronRight,
  Footprints,
  Award,
  Shield,
  Sunrise,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Born to Run — Treinamento e Saúde | Corrida de Rua e Caminhada',
}

// ── Data ──────────────────────────────────────────────────────────────

const stats = [
  { value: '500+', label: 'Atletas Ativos', icon: Users },
  { value: '8 anos', label: 'de Experiência', icon: Trophy },
  { value: '120+', label: 'Eventos Realizados', icon: Calendar },
  { value: '98%', label: 'de Satisfação', icon: Heart },
]

const services = [
  {
    icon: Footprints,
    title: 'Corrida de Rua',
    description:
      'Treinamentos periodizados para 5 km, 10 km, meia maratona e maratona. Para iniciantes e atletas experientes.',
    tag: 'mais popular',
    color: 'red',
  },
  {
    icon: Sunrise,
    title: 'Caminhada Orientada',
    description:
      'Grupos de caminhada com foco em saúde cardiovascular, condicionamento e qualidade de vida para todas as idades.',
    tag: null,
    color: 'green',
  },
  {
    icon: TrendingUp,
    title: 'Assessoria Online',
    description:
      'Planilhas de treino personalizadas, acompanhamento remoto por aplicativo e suporte direto com o treinador.',
    tag: null,
    color: 'green',
  },
  {
    icon: Zap,
    title: 'Treino Funcional',
    description:
      'Sessões de fortalecimento muscular específico para corredores: core, mobilidade e prevenção de lesões.',
    tag: null,
    color: 'red',
  },
  {
    icon: Users,
    title: 'Grupos de Treino',
    description:
      'Treinos em grupo nas manhãs e finais de semana. Comunidade vibrante, motivação coletiva e amizades duradouras.',
    tag: null,
    color: 'green',
  },
  {
    icon: Award,
    title: 'Preparação para Provas',
    description:
      'Planejamento completo de pico de forma para a sua prova alvo: carga, recuperação, estratégia de pace e nutrição.',
    tag: null,
    color: 'red',
  },
]

const steps = [
  {
    number: '01',
    title: 'Avaliação Inicial',
    description:
      'Conversamos sobre seus objetivos, histórico de treino e disponibilidade de tempo. Sem julgamentos, só evolução.',
    icon: Shield,
  },
  {
    number: '02',
    title: 'Plano Personalizado',
    description:
      'Montamos um plano de treinamento sob medida para o seu ritmo, nível e objetivo. Semanal, periodizado e realista.',
    icon: Calendar,
  },
  {
    number: '03',
    title: 'Treine com a Equipe',
    description:
      'Você passa a fazer parte da nossa equipe. Treinos presenciais ou online, sempre com acompanhamento de perto.',
    icon: Users,
  },
  {
    number: '04',
    title: 'Evolua e Supere-se',
    description:
      'Acompanhe sua evolução, bata seus recordes pessoais e alcance a linha de chegada com saúde e confiança.',
    icon: Trophy,
  },
]

const testimonials = [
  {
    name: 'Fernanda Rocha',
    role: 'Corredora — 10 km',
    text:
      'Comecei sem conseguir correr 1 km sequer. Em 6 meses completei minha primeira corrida de 10 km. A equipe me deu toda a estrutura e o incentivo que eu precisava.',
    rating: 5,
    location: 'São Paulo, SP',
  },
  {
    name: 'Carlos Mendes',
    role: 'Maratonista',
    text:
      'O planejamento para a minha maratona foi impecável. Cheguei no dia da prova na melhor forma da minha vida. Treinamento sério, equipe humana e comprometida.',
    rating: 5,
    location: 'Belo Horizonte, MG',
  },
  {
    name: 'Ana Beatriz Lima',
    role: 'Caminhada e saúde',
    text:
      'Não tinha jeito para esportes, mas a Born to Run me mostrou que todo mundo tem um ritmo. Os grupos de caminhada mudaram minha rotina e minha saúde.',
    rating: 5,
    location: 'Rio de Janeiro, RJ',
  },
]

const highlights = [
  { icon: MapPin, text: 'Treinos ao ar livre e em parques' },
  { icon: Clock, text: 'Horários flexíveis: manhã, tarde e noite' },
  { icon: Shield, text: 'Acompanhamento com profissional certificado' },
  { icon: MessageCircle, text: 'Suporte direto pelo WhatsApp' },
]

const WHATSAPP_URL = 'https://wa.me/5519900000000'

// ── Page ──────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────── */}
        <section
          id="inicio"
          className="relative w-full min-h-[100svh] flex items-end md:items-center overflow-hidden"
          aria-label="Seção de destaque"
        >
          {/* Background photo */}
          <div className="absolute inset-0">
            <Image
              src="/team-group.jpg"
              alt="Equipe Born to Run treinando ao ar livre"
              fill
              style={{ objectFit: 'cover', objectPosition: 'center 20%' }}
              priority
              quality={90}
              sizes="100vw"
            />
            {/* Overlay */}
            <div className="absolute inset-0 hero-overlay" aria-hidden="true" />
          </div>

          <div className="container-main relative z-10 pb-16 pt-28 md:pt-0 md:py-0">
            <div className="max-w-2xl animate-slide-up">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#DC2626]/10 border border-[#DC2626]/20 mb-6">
                <span className="w-2 h-2 rounded-full bg-[#DC2626] animate-pulse" aria-hidden="true" />
                <span className="text-xs font-bold text-[#DC2626] uppercase tracking-wider">
                  Assessoria Esportiva
                </span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black text-[#1C1917] leading-[0.95] tracking-tight mb-6 text-balance">
                Sua transformação
                <br />
                começa com o{' '}
                <span className="text-[#DC2626]">primeiro passo</span>
              </h1>

              <p className="text-lg text-[#44403C] mb-8 leading-relaxed max-w-xl font-medium">
                A Born to Run é a equipe de corrida e caminhada que une saúde,
                comunidade e performance. Para quem quer começar ou ir mais longe.
              </p>

              {/* Highlights list */}
              <ul className="flex flex-col gap-2 mb-10" aria-label="Diferenciais">
                {highlights.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-center gap-2.5 text-sm font-medium text-[#44403C]">
                    <Icon size={16} className="text-[#DC2626] shrink-0" aria-hidden="true" />
                    {text}
                  </li>
                ))}
              </ul>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="#modalidades"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-base bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors duration-200 shadow-md"
                >
                  Ver Modalidades
                  <ChevronRight size={18} aria-hidden="true" />
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full font-bold text-base bg-white text-[#16A34A] border-2 border-[#16A34A] hover:bg-[#16A34A] hover:text-white transition-all duration-200 shadow-sm"
                >
                  <MessageCircle size={18} aria-hidden="true" />
                  Fale Conosco
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS BAR ─────────────────────────────────── */}
        <section aria-label="Números da equipe" className="bg-[#DC2626]">
          <div className="container-main py-0">
            <ul className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#B91C1C]/40 divide-y md:divide-y-0">
              {stats.map(({ value, label, icon: Icon }) => (
                <li
                  key={label}
                  className="flex flex-col items-center justify-center gap-1.5 py-8 px-4 text-center"
                >
                  <Icon size={22} className="text-white/70" aria-hidden="true" />
                  <span className="font-display font-black text-4xl text-white leading-none">
                    {value}
                  </span>
                  <span className="text-xs font-semibold text-white/75 uppercase tracking-wider">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── ABOUT ──────────────────────────────────────── */}
        <section id="sobre" className="bg-[#F9F7F5] py-20 md:py-28">
          <div className="container-main">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Image side */}
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/team-group.jpg"
                    alt="Equipe Born to Run em treino coletivo"
                    fill
                    style={{ objectFit: 'cover', objectPosition: 'center 30%' }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-5 -right-4 md:-right-8 bg-white rounded-2xl shadow-xl p-5 max-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className="text-[#EA580C] fill-[#EA580C]"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-[#1C1917] leading-tight">
                    &quot;Mudou minha vida por completo!&quot;
                  </p>
                  <p className="text-xs text-[#57534E] mt-1">— Mariana S.</p>
                </div>
                {/* Red accent bar */}
                <div
                  className="absolute -left-3 top-8 w-1.5 h-24 bg-[#DC2626] rounded-full"
                  aria-hidden="true"
                />
              </div>

              {/* Text side */}
              <div>
                <p className="text-xs font-bold text-[#DC2626] uppercase tracking-widest mb-3">
                  Quem Somos
                </p>
                <h2 className="font-display font-black text-4xl md:text-5xl text-[#1C1917] leading-tight mb-6 text-balance heading-accent">
                  Mais do que correr.<br />É sobre viver melhor.
                </h2>
                <p className="text-base text-[#57534E] leading-relaxed mb-5">
                  A Born to Run nasceu da paixão pela corrida de rua e pelo impacto
                  que ela tem na vida das pessoas. Somos uma equipe de treinadores
                  certificados, corredores de elite e apaixonados por saúde que
                  acreditam que qualquer pessoa pode ser um atleta.
                </p>
                <p className="text-base text-[#57534E] leading-relaxed mb-8">
                  Nossa missão é proporcionar treinamentos de excelência, com
                  metodologia científica, ambiente acolhedor e foco total na
                  evolução de cada atleta — seja ele um iniciante ou alguém que
                  quer quebrar seu recorde pessoal.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="#como-funciona"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors"
                  >
                    Como Funciona
                    <ArrowRight size={16} aria-hidden="true" />
                  </a>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm border-2 border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626] hover:text-white transition-all"
                  >
                    Fale com um Treinador
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES ───────────────────────────────────── */}
        <section id="modalidades" className="bg-white py-20 md:py-28">
          <div className="container-main">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-[#DC2626] uppercase tracking-widest mb-3">
                Modalidades
              </p>
              <h2 className="font-display font-black text-4xl md:text-5xl text-[#1C1917] leading-tight mb-4 heading-accent-center">
                Treinamento para cada objetivo
              </h2>
              <p className="text-base text-[#57534E] max-w-xl mx-auto leading-relaxed">
                Do primeiro treino à maratona, temos o programa certo para você
                evoluir no seu próprio ritmo.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(({ icon: Icon, title, description, tag, color }) => (
                <li key={title}>
                  <article className="bg-white rounded-2xl border border-[#E7E5E4] p-7 card-lift h-full flex flex-col shadow-sm">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                        color === 'red'
                          ? 'bg-[#FEE2E2] text-[#DC2626]'
                          : 'bg-[#DCFCE7] text-[#16A34A]'
                      }`}
                    >
                      <Icon size={24} aria-hidden="true" />
                    </div>

                    {tag && (
                      <span className="inline-block mb-3 px-2.5 py-0.5 rounded-full bg-[#EA580C]/10 text-[#EA580C] text-xs font-bold uppercase tracking-wide">
                        {tag}
                      </span>
                    )}

                    <h3 className="font-display font-black text-xl text-[#1C1917] mb-2 leading-tight">
                      {title}
                    </h3>
                    <p className="text-sm text-[#57534E] leading-relaxed flex-1">{description}</p>

                    <a
                      href={WHATSAPP_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-6 inline-flex items-center gap-1.5 text-sm font-bold transition-colors ${
                        color === 'red'
                          ? 'text-[#DC2626] hover:text-[#B91C1C]'
                          : 'text-[#16A34A] hover:text-[#15803D]'
                      }`}
                    >
                      Saber mais
                      <ArrowRight size={14} aria-hidden="true" />
                    </a>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────── */}
        <section id="como-funciona" className="bg-[#F9F7F5] py-20 md:py-28">
          <div className="container-main">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-[#DC2626] uppercase tracking-widest mb-3">
                Passo a Passo
              </p>
              <h2 className="font-display font-black text-4xl md:text-5xl text-[#1C1917] leading-tight mb-4 heading-accent-center">
                Como funciona?
              </h2>
              <p className="text-base text-[#57534E] max-w-xl mx-auto leading-relaxed">
                Entrar para a equipe é simples. Veja como você começa sua jornada.
              </p>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {steps.map(({ number, title, description, icon: Icon }, idx) => (
                <li key={number} className="relative">
                  {idx < steps.length - 1 && (
                    <div
                      className="hidden lg:block absolute top-8 left-[calc(50%+32px)] w-[calc(100%-64px)] h-px bg-[#E7E5E4]"
                      aria-hidden="true"
                    />
                  )}
                  <div className="bg-white rounded-2xl border border-[#E7E5E4] p-7 shadow-sm h-full flex flex-col card-lift">
                    <div className="flex items-center gap-3 mb-5">
                      <span className="font-display font-black text-4xl text-[#E7E5E4] leading-none">
                        {number}
                      </span>
                      <div className="w-10 h-10 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0">
                        <Icon size={20} className="text-[#DC2626]" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="font-display font-black text-xl text-[#1C1917] mb-2 leading-tight">
                      {title}
                    </h3>
                    <p className="text-sm text-[#57534E] leading-relaxed">{description}</p>
                  </div>
                </li>
              ))}
            </ol>

            <div className="text-center mt-12">
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-base bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors shadow-md"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Quero começar agora
              </a>
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────── */}
        <section id="depoimentos" className="bg-white py-20 md:py-28">
          <div className="container-main">
            <div className="text-center mb-14">
              <p className="text-xs font-bold text-[#DC2626] uppercase tracking-widest mb-3">
                Depoimentos
              </p>
              <h2 className="font-display font-black text-4xl md:text-5xl text-[#1C1917] leading-tight mb-4 heading-accent-center">
                Quem já correu com a gente
              </h2>
              <p className="text-base text-[#57534E] max-w-xl mx-auto leading-relaxed">
                Histórias reais de atletas que transformaram sua saúde e sua vida
                com a Born to Run.
              </p>
            </div>

            <ul className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map(({ name, role, text, rating, location }) => (
                <li key={name}>
                  <article className="bg-[#F9F7F5] rounded-2xl border border-[#E7E5E4] p-7 card-lift h-full flex flex-col">
                    <div className="flex items-center gap-1 mb-4" aria-label={`${rating} de 5 estrelas`}>
                      {[...Array(rating)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className="text-[#EA580C] fill-[#EA580C]"
                          aria-hidden="true"
                        />
                      ))}
                    </div>

                    <blockquote className="text-sm text-[#44403C] leading-relaxed flex-1 mb-6">
                      &ldquo;{text}&rdquo;
                    </blockquote>

                    <footer className="flex items-center gap-3 pt-5 border-t border-[#E7E5E4]">
                      <div
                        className="w-10 h-10 rounded-full bg-[#DC2626] flex items-center justify-center text-white font-black text-sm shrink-0"
                        aria-hidden="true"
                      >
                        {name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#1C1917]">{name}</p>
                        <p className="text-xs text-[#57534E]">{role}</p>
                        <p className="text-xs text-[#A8A29E] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} aria-hidden="true" />
                          {location}
                        </p>
                      </div>
                    </footer>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        </section>
    </>
  )
}
