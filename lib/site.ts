/**
 * Dados oficiais da Born to Run — Treinamento e Saúde.
 * FONTE ÚNICA DA VERDADE para informações institucionais.
 *
 * Regra inviolável (AGENTS.md): NUNCA inventar endereço, telefone,
 * CNPJ, e-mail, depoimentos, títulos ou dados de alunos.
 * Campos ainda não fornecidos pelo cliente ficam como `null` e a
 * interface deve tratá-los como "pendentes/configuráveis".
 */
export const site = {
  name: 'Born to Run — Treinamento e Saúde',
  shortName: 'Born to Run',
  tagline: 'Transformando vidas através da corrida desde 2015',
  foundedYear: 2015,
  city: 'Descalvado',
  state: 'SP',
  location: 'Descalvado - SP',

  stats: {
    races: '+200',
    racesLabel: 'participações em corridas',
    since: '2015',
    sinceLabel: 'transformando vidas',
  },

  coach: {
    name: 'Robson Alves',
    title: 'Educador Físico',
    cref: 'CREF 119911-G/SP',
    credentials: [
      'Graduação em Educação Física',
      'Pós-graduação em Treinamento Desportivo',
      'Pós-graduação em Fisiologia do Exercício',
      'Pós-graduação em Treinamento especializado e funcional para corrida',
      'Treinador nível 1 — World Athletics',
    ],
  },

  social: {
    instagramHandle: 'equipeborntorun',
    instagramUrl: 'https://instagram.com/equipeborntorun',
  },

  /**
   * Contato oficial confirmado para o projeto piloto.
   * Telefone e WhatsApp permanecem opcionais e nunca recebem valores fictícios.
   */
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? null,
    whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? null,
    email:
      process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contato@equipeborntorun.com",
  },
} as const
