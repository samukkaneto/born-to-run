# ARQUIVO HISTÓRICO — RECONSTRUCTION_ROADMAP.md

> **Plano encerrado/substituído.** Não usar como backlog atual. Consulte `CURRENT_IMPLEMENTATION_STATUS.md`.

> **Propósito:** documento vivo que registra o que já foi executado, o que está pendente e como cada etapa será abordada. Destinado a **agentes de IA e desenvolvedores** que precisem auditar, continuar ou revisar este projeto. Pode ser excluído após a conclusão total.
>
> **Última atualização:** 21 de julho de 2026 — após conclusão do Bloco 2.

---

## Visão geral do projeto

| Campo | Valor |
|---|---|
| **Nome** | Born to Run — Treinamento e Saúde |
| **Fundação** | 2015, Descalvado-SP |
| **Público** | Equipe de corrida e caminhada; quantidade atual não divulgada |
| **Treinador** | Robson Alves — Educador Físico, CREF 119911-G/SP, especialização meio fundo/fundo, Treinador nível 1 World Athletics |
| **Instagram** | @equipeborntorun |
| **Stack** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Supabase (Auth + Postgres + Storage) |
| **Branch de trabalho** | `abacus-fable-rebuild` |

---

## Organização em blocos

O plano original (`FABLE_REBUILD_PLAN.md`) definiu 16 fases técnicas. Para execução prática, agrupamos em **4 blocos**:

| Bloco | Fases originais | Escopo resumido | Status | Commit |
|---|---|---|---|---|
| **1** | 1–4 | Arquitetura/limpeza, banco/segurança, design system, componentes globais e páginas públicas | ✅ Concluído | `a8dd2db` |
| **2** | 5–7 (+ parte de 8, 10) | Autenticação completa, área do aluno, dashboard, feed social, comunicados do aluno | ✅ Concluído | `6c768fa` |
| **3** | 9, 11 (+ resto de 8, 10) | Painel admin reconstruído, edição de treinos/comunicados, moderação, gestão de membros + redesign visual premium (Fable 5) em todo o site | ✅ Concluído | branch `abacus-fable-rebuild` |
| **4** | 12–16 | PWA, acessibilidade, desempenho, testes, deploy na Vercel | ⏳ Pendente | — |

---

## O que já foi feito

### Bloco 1 — Fundação (Fases 1–4) ✅

**Commit:** `a8dd2db` • **Validação:** build/lint/typecheck zero erros

| Entrega | Detalhes |
|---|---|
| **Limpeza arquitetural** | Eliminada duplicação de actions (`app/actions/` removido), rotas (`/treinos`, `/perfil`, `/fotos` removidas) e componentes (`CreatePost`, `ProfileForm` removidos). `lib/actions/` é a fonte única. |
| **Banco e segurança** | Migration `0002_correcoes_rls_fase2.sql`: policy DELETE em `profiles` (admin), `WITH CHECK` em update admin. Decisão: manter `member`/`admin` (sem `treinador`); treinos visíveis a todos (decisão de produto documentada). |
| **Design system** | Tailwind v4 puro (CSS); `tailwind.config.ts` removido. Tokens: off-white `#F9F7F5`, vermelho `#DC2626`, verde `#16A34A`. Fontes: Inter (corpo) + Barlow Condensed (títulos). Componentes de UI em `components/ui/` (Button, Card, Input, Badge, Avatar, Container, Section). |
| **Páginas públicas** | Home, Sobre, Galeria, Contato reconstruídas com dados oficiais. Header com rotas reais. Footer consistente. Galeria apenas com fotos reais. Contato via Instagram (sem inventar telefone/email). Rotas legado (`/equipe`, `/historia`, `/resultados`) redirecionam. |

### Bloco 2 — Autenticação e Área do Aluno (Fases 5–7) ✅

**Commit:** `6c768fa` • **Validação:** build/lint/typecheck zero erros, 23 rotas geradas

| Entrega | Detalhes |
|---|---|
| **Autenticação completa** | Login com redirecionamento por papel (admin→`/admin`, aluno→`/dashboard`). `resetPassword` corrigido (redirectTo usava domínio do Supabase, agora usa origem do site). Nova action `updatePassword` + página `/recuperar-senha/nova`. Helper `getSiteOrigin()` para funcionar em dev e produção. |
| **Dashboard do aluno** | Página inicial real (antes era redirect): boas-vindas personalizadas, atalhos rápidos, próximos 3 treinos, últimos 3 comunicados, atividade recente da equipe (4 posts), contagem de publicações próprias. Tudo via `Promise.all` com 4 queries paralelas. |
| **Comunicados do aluno** | Nova rota `/dashboard/comunicados` com destaque no comunicado mais recente e estado vazio. |
| **Perfil de membros** | Nova rota `/dashboard/membros/[id]`: avatar, bio, cidade, objetivo, badge Treinador (para admin), stats (posts, km somados), últimas 10 atividades. Redireciona para `/dashboard/perfil` se for o próprio usuário. |
| **Feed social aprimorado** | `createPost` valida conteúdo vazio e foto >10MB com erro visível. Nova action `deleteComment` (autor ou admin, RLS garante). PostCard: autor clicável (link para perfil), botão de excluir comentário. |
| **Navegação** | `DashboardSidebarNav` (desktop) + `DashboardBottomNav` (mobile) com estado ativo por `usePathname`. 5 itens: Início, Feed, Treinos, Comunicados, Perfil. |
| **Upload de avatar** | Validação de 5MB com erro visível (antes falhava silencioso). |

### Bloco 3 — Painel Admin, CRUD Completo e Redesign Premium (Fases 9, 11) ✅

**Branch:** `abacus-fable-rebuild` • **Validação:** build/lint/typecheck zero erros, 24 rotas geradas, smoke test das rotas públicas (200) e protegidas (redirect correto para /login)

Este bloco entregou duas frentes: o painel do treinador completo e um **redesign visual premium** de todo o site, guiado pelas pranchas de referência do usuário (`design-refs/`) e pelo `README-FABLE5.md`.

#### Redesign visual premium (identidade editorial esportiva)

| Entrega | Detalhes |
|---|---|
| **Nova paleta** | Off-white `#F7F4EF` (fundo), carbono `#171717` (header, sidebars, painéis), vermelho `#DC2626` (ação), verde `#16A34A` (êxito/stats), laranja `#F97316` (traço/aviso). |
| **Nova tipografia** | Bebas Neue (títulos display), Oswald (rótulos condensados, navegação), Inter (corpo). Substitui a Barlow Condensed. |
| **Linguagem editorial** | Kickers numerados (“01 · Sobre”), tagline “CORRA COM PROPÓSITO. EVOLUA EM EQUIPE.”, molduras vermelhas deslocadas nas fotos, faixas de estatísticas em carbono. |
| **Header/rodapé carbono** | O logo tem texto branco e só funciona em fundo escuro — todos os headers, sidebars e o footer agora são carbono. |
| **Páginas públicas** | Home, Sobre, Galeria e Contato reescritas no novo padrão (hero editorial, seções numeradas, CTA em painel carbono). |
| **Autenticação** | Layout dividido: painel esquerdo com foto real, overlay carbono, logo e tagline; formulários no novo design. |
| **Dashboard do aluno** | Sidebar carbono fixa no desktop, topbar mobile carbono, bottom nav com botão central vermelho “+”, saudação editorial. |

#### Painel do treinador (CRUD completo)

| Entrega | Detalhes |
|---|---|
| **Layout admin sem CSS inline** | `app/(admin)/layout.tsx` reescrito com o design system: sidebar carbono com selo “Painel do Treinador”, nav mobile horizontal, tudo dentro de `ToastProvider`. Novos `components/admin/AdminNav.tsx` e `app/(admin)/admin/loading.tsx` (skeleton). |
| **Edição de treinos** | Nova action `updateWorkout` com validação de formulário; `WorkoutsManager` com busca, filtro por nível, modal criar/editar pré-preenchido, confirmação de exclusão e toasts. |
| **Edição de comunicados** | Nova action `updateAnnouncement`; `AnnouncementsManager` com o mesmo padrão (busca, modal, confirmação, toasts). |
| **Gestão de membros** | `MembersTable`: busca, badges de papel, link “Ver perfil” (`/dashboard/membros/[id]`), promover/rebaixar e remover com `ConfirmDialog` + toasts; proteção contra auto-remoção/auto-rebaixamento (na UI e nas actions). |
| **Segurança das actions** | `requireAdmin()` em todas as actions de `lib/actions/admin.ts`; validação de campos; retorno padronizado `{ success | error }`; `revalidatePath` nas rotas afetadas. |
| **Novos componentes de UI** | `Toaster` (toasts com auto-dismiss), `ConfirmDialog` (confirmação acessível com Escape/foco), `AdminModal`, `AdminForm` com valores padrão para edição. |
| **Moderação do feed** | Mantida inline no feed (admin exclui qualquer post/comentário via PostCard) — decisão: tela separada não é necessária nesta fase. |

#### Critérios de conclusão do Bloco 3
- [x] Build, lint e typecheck: zero erros
- [x] Painel admin com design system aplicado (sem CSS inline)
- [x] CRUD completo de treinos: criar, editar, excluir
- [x] CRUD completo de comunicados: criar, editar, excluir
- [x] Gestão de membros com confirmação e feedback
- [x] Commit + push para GitHub

---

## O que falta fazer

### Bloco 4 — Qualidade e Deploy (Fases 12–16) ⏳

**Estimativa de créditos:** 7.000–10.000

Este é o bloco final: polimento, qualidade e publicação.

#### 4.1 — PWA e mobile

**O que será feito:**
- Revisar `manifest.json` (atalhos apontando para rotas válidas após a reconstrução).
- Verificar theme-color alinhado à paleta atual (#171717, #DC2626 ou #F7F4EF).
- Testar instalabilidade e experiência mobile em 375px.
- Verificar que a navegação inferior do dashboard (feita no Bloco 2) funciona corretamente em contexto PWA.

**Arquivos afetados:**
- `public/manifest.json`
- `app/layout.tsx` (metadados, viewport)

#### 4.2 — Acessibilidade (WCAG AA)

**O que será feito:**
- Auditar contraste de cores em todas as páginas (ferramenta axe ou Lighthouse).
- Garantir `alt` significativo em todas as imagens.
- Foco visível em todos os elementos interativos.
- Labels em todos os inputs de formulário.
- Navegação completa por teclado nos fluxos principais.
- Atributos `aria-*` onde necessário (modais, toasts, navegação).

**Arquivos afetados:** componentes de UI, páginas públicas e logadas (pontual).

#### 4.3 — Desempenho

**O que será feito:**
- Otimizar imagens com `next/image` (tamanhos, formatos, priority no LCP).
- Revisar server vs client components (minimizar JavaScript no cliente).
- Paginar feed se necessário (hoje carrega todos os posts).
- Remover domínios desnecessários em `next.config.ts` (ex.: `images.unsplash.com`).
- Verificar e resolver vulnerabilidades de dependências.

**Arquivos afetados:**
- `next.config.ts`
- Páginas com imagens grandes
- `app/(dashboard)/dashboard/feed/page.tsx` (paginação)

#### 4.4 — Boundaries de erro e estados de carregamento

**O que será feito:**
- Criar `error.tsx` e `loading.tsx` globais (e por segmento onde necessário).
- Criar `not-found.tsx` global para 404s amigáveis.
- Garantir que erros de servidor não exponham informação sensível.

**Arquivos afetados:**
- `app/error.tsx`, `app/not-found.tsx`, `app/loading.tsx` (novos)
- Possíveis boundaries por segmento: `app/(dashboard)/error.tsx`, `app/(admin)/error.tsx`

#### 4.5 — Testes

**O que será feito:**
- Configurar framework de testes (Vitest ou Jest + React Testing Library).
- Testes unitários para server actions (`lib/actions/*`).
- Testes de integração para fluxos de auth.
- Testes e2e dos caminhos críticos (Playwright ou Cypress), se viável com o ambiente.
- Pipeline de CI básico (GitHub Actions) rodando lint + typecheck + build + testes.

**Arquivos afetados:**
- `vitest.config.ts` ou `jest.config.ts` (novo)
- `__tests__/` ou `*.test.ts` (novos)
- `.github/workflows/ci.yml` (novo)

#### 4.6 — Deploy na Vercel

**Pré-requisitos (a serem fornecidos pelo usuário):**
- Acesso ao projeto Supabase de produção (URL + anon key)
- Acesso ao projeto Vercel (ou conta para criar)
- Domínio desejado (se houver)

**O que será feito:**
- Configurar variáveis de ambiente na Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`).
- Aplicar migrações no Supabase de produção.
- Definir o treinador Robson como admin no banco (via SQL após primeiro cadastro).
- Validar build de produção.
- Smoke test completo em produção (público + auth + dashboard + admin).
- Atualizar README com instruções de manutenção.

**Arquivos afetados:**
- `README.md` (atualização)
- Configuração na Vercel (fora do repo)

#### Critérios de conclusão do Bloco 4
- [ ] Build, lint e typecheck: zero erros
- [ ] PWA instalável com atalhos corretos
- [ ] Lighthouse acessibilidade ≥ 90 nos fluxos principais
- [ ] Lighthouse performance ≥ 80 em mobile
- [ ] Boundaries de erro e loading states em todas as rotas
- [ ] Suíte de testes verde (cobertura mínima dos caminhos críticos)
- [ ] App publicado e funcional na Vercel
- [ ] Smoke test de produção aprovado

---

## Decisões de projeto tomadas (registro)

| # | Decisão | Bloco | Justificativa |
|---|---|---|---|
| 1 | Papéis: `member` e `admin` (sem `treinador`) | 1 | Schema real só tem esses dois; simplifica RLS e evita refatoração de CHECK constraints. |
| 2 | Treinos visíveis a todos os membros autenticados | 1 | Decisão histórica posteriormente substituída pela audiência para equipe, grupos e atletas. |
| 3 | Tailwind v4 puro (CSS, sem `tailwind.config.ts`) | 1 | Config v3 era código morto no v4; tokens definidos diretamente no CSS. |
| 4 | Fontes: Inter (corpo) + Barlow Condensed (títulos) | 1 | Referências a Outfit removidas; identidade visual consolidada. |
| 5 | Contato via Instagram (sem inventar telefone/email) | 1 | Regra do projeto: nunca fabricar dados de contato. |
| 6 | `lib/actions/` como fonte única de server actions | 1 | `app/actions/` estava desalinhada do schema e duplicava lógica. |
| 7 | `NEXT_PUBLIC_SITE_URL` para URLs de redirect (auth) | 2 | Necessário para que os links de email funcionem em qualquer ambiente (dev/produção). |

---

## Riscos conhecidos e pendências

| Risco/Pendência | Impacto | Mitigação | Bloco |
|---|---|---|---|
| `.env.local` com placeholders (sem credenciais reais do Supabase) | Funcionalidades testáveis apenas via build/renderização; sem teste ponta a ponta | Configurar credenciais reais no deploy (Bloco 4) | 4 |
| Tipos `Database` do Supabase não gerados | Erros de coluna só aparecem em runtime, não em compile-time | Gerar tipos quando houver acesso ao Supabase real | 4 |
| Painel admin com CSS inline | Visual divergente do design system | Reconstruir no Bloco 3 | 3 |
| Sem testes automatizados | Regressões só detectáveis manualmente | Implementar no Bloco 4 | 4 |
| Sem boundaries de erro globais | Erros de servidor mostram tela genérica do Next.js | Implementar no Bloco 4 | 4 |
| Feed sem paginação | Performance degradada com muitos posts | Implementar no Bloco 4 | 4 |
| Domínios de imagem desnecessários (`unsplash.com`) no `next.config.ts` | Nenhum funcional; vetor de ataque teórico | Remover no Bloco 4 | 4 |

---

## Dados imutáveis (regras para qualquer agente)

Estes dados são **oficiais e confirmados**. Nunca devem ser alterados, inventados ou complementados com informação não verificada:

- **Nome:** Born to Run — Treinamento e Saúde
- **Fundação:** 2015
- **Local:** Descalvado-SP
- **Equipe:** quantidade atual de atletas não divulgada
- **Corridas:** +200 participações
- **Instagram:** @equipeborntorun
- **Treinador:** Robson Alves — Educador Físico, CREF 119911-G/SP, especialização meio fundo/fundo, Treinador nível 1 World Athletics

**Proibido:**
- Inventar endereço, telefone, CNPJ, depoimentos ou títulos de corrida.
- Guardar credenciais/chaves no código.
- Publicar contatos não confirmados (usar Instagram como canal até que dados reais sejam fornecidos).

---

## Para agentes de IA: como continuar

1. **Leia primeiro:** `AGENTS.md` (regras do projeto), `CURRENT_IMPLEMENTATION_STATUS.md` (status atual), `FABLE_REBUILD_PLAN.md` (plano de 16 fases original).
2. **Identifique o bloco atual:** veja a tabela no topo deste documento.
3. **Respeite os critérios de conclusão** de cada bloco antes de marcar como concluído.
4. **Valide sempre:** `npx tsc --noEmit && npx eslint . && npm run build` — zero erros antes de qualquer commit.
5. **Commit em português**, referenciando a fase/bloco: ex. `feat(fases-9-11): painel admin reconstruído e CRUD completo`.
6. **Push para GitHub** ao finalizar cada bloco — o dono do projeto pediu explicitamente.
7. **Atualize este documento** e o `CURRENT_IMPLEMENTATION_STATUS.md` após cada bloco.

---

*Documento temporário — será removido após a conclusão do projeto.*
