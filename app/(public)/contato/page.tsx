import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle, AtSign, MapPin, Award, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Entre em contato com a equipe Born to Run em Descalvado-SP. WhatsApp, Instagram e mais informações sobre como fazer parte da equipe.',
}

export default function ContatoPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-white py-16 border-b border-stone-100">
        <div className="container-main">
          <div className="badge badge-red mb-4">Contato</div>
          <h1 className="section-title mb-3">
            Vamos{' '}
            <span className="text-[var(--color-red)]">conversar?</span>
          </h1>
          <p className="section-subtitle text-stone-500 max-w-xl">
            Ficou interessado em fazer parte da Born to Run? 
            Entre em contato pelo WhatsApp ou pelas redes sociais. 
            Vamos te ajudar a começar!
          </p>
        </div>
      </section>

      <section className="py-16 bg-[var(--color-bg)]">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-10">

            {/* Canais de Contato */}
            <div className="space-y-4">
              <h2 className="font-display text-2xl font-bold text-stone-800 mb-6">
                Canais de atendimento
              </h2>

              {/* WhatsApp */}
              <a
                href="https://wa.me/5519900000000"
                target="_blank"
                rel="noopener noreferrer"
                id="contato-whatsapp-btn"
                className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                  <MessageCircle size={28} className="text-[var(--color-green)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-800">WhatsApp</h3>
                  <p className="text-stone-400 text-sm">Clique para abrir uma conversa</p>
                </div>
                <ArrowRight size={18} className="text-stone-300 group-hover:text-[var(--color-green)] transition-colors" />
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com/equipeborntorun"
                target="_blank"
                rel="noopener noreferrer"
                id="contato-instagram-btn"
                className="card p-5 flex items-center gap-4 hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-100 transition-colors">
                  <AtSign size={28} className="text-[var(--color-orange)]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-800">Instagram</h3>
                  <p className="text-stone-400 text-sm">@equipeborntorun</p>
                </div>
                <ArrowRight size={18} className="text-stone-300 group-hover:text-[var(--color-orange)] transition-colors" />
              </a>

              {/* Localização */}
              <div className="card p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={28} className="text-[var(--color-red)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">Localização</h3>
                  <p className="text-stone-500 text-sm">Descalvado - SP</p>
                </div>
              </div>

              {/* Horários */}
              <div className="card p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock size={28} className="text-stone-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">Horários de treino</h3>
                  <p className="text-stone-500 text-sm">Consulte pelo WhatsApp ou Instagram</p>
                </div>
              </div>

              {/* CREF */}
              <div className="card p-5 flex items-center gap-4">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award size={28} className="text-[var(--color-red)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-800">Prof. Robson Alves</h3>
                  <p className="text-stone-500 text-sm">Educador Físico — CREF 119911-G/SP</p>
                </div>
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="space-y-6">
              <div className="card p-8">
                <h2 className="font-display text-2xl font-bold text-stone-800 mb-2">
                  Como fazer parte da equipe?
                </h2>
                <p className="text-stone-500 text-sm mb-6">
                  Você não precisa ser corredor experiente. A Born to Run recebe 
                  atletas de todos os níveis — do absoluto iniciante a quem já compete em provas.
                </p>
                <ol className="space-y-4">
                  {[
                    'Entre em contato pelo WhatsApp ou Instagram',
                    'Agende uma conversa com o Prof. Robson',
                    'Faça uma avaliação inicial gratuita',
                    'Comece a treinar com a equipe!',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-[var(--color-red)] text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-stone-600 text-sm pt-1">{step}</p>
                    </li>
                  ))}
                </ol>

                <div className="mt-8 pt-6 border-t border-stone-100">
                  <a
                    href="https://wa.me/5519900000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    id="contato-start-btn"
                    className="btn-primary w-full justify-center"
                  >
                    <MessageCircle size={18} />
                    Começar agora pelo WhatsApp
                  </a>
                </div>
              </div>

              {/* Área de membros */}
              <div className="card p-6 border-l-4 border-[var(--color-green)]">
                <h3 className="font-semibold text-stone-800 mb-1">Já é membro?</h3>
                <p className="text-stone-500 text-sm mb-4">
                  Acesse a área restrita para ver seus treinos, o feed da equipe e muito mais.
                </p>
                <Link href="/login" className="btn-secondary text-sm">
                  Acessar Área de Membros
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
