<!-- BEGIN:nextjs-agent-rules -->
# Este NÃO é o Next.js que você conhece

Este projeto usa **Next.js 16** (App Router + Turbopack). Esta versão tem mudanças que quebram compatibilidade — APIs, convenções e estrutura de arquivos podem diferir do que você aprendeu. **Leia o guia relevante em `node_modules/next/dist/docs/` antes de escrever qualquer código.** Respeite os avisos de descontinuação (ex.: `middleware` → `proxy`).
<!-- END:nextjs-agent-rules -->

---

# AGENTS.md — Guia Obrigatório para Agentes de IA

> **Leia este documento inteiro antes de tocar em qualquer arquivo.** Ele define a identidade do projeto, os dados oficiais imutáveis, as regras invioláveis, a stack real (que diverge da documentação legada) e a ordem de leitura dos demais documentos de auditoria. Ignorar estas instruções vai reintroduzir bugs já mapeados e comprometer a credibilidade de um cliente real.

---

## 1. Identidade do Projeto

- **Nome oficial:** Born to Run — Treinamento e Saúde
- **O que é:** Plataforma web para uma equipe real de corrida e caminhada de rua. Combina um **site institucional público** (marketing/captação) com uma **área de membros autenticada** (feed social, treinos, perfil) e um **painel administrativo** para o treinador gerenciar treinos, comunicados e membros.
- **Público-alvo:** atletas amadores e iniciantes de corrida/caminhada, além do treinador responsável.
- **Natureza:** projeto de cliente real, não é um protótipo descartável. Toda informação exibida precisa ser verídica ou claramente marcada como conteúdo a ser preenchido pelo cliente.

---

## 2. Dados Oficiais (IMUTÁVEIS — nunca inventar, nunca alterar)

Estes dados são verdadeiros e confirmados. Use-os exatamente como estão. **Não invente nada além do que está aqui.**

| Campo | Valor oficial |
|---|---|
| Nome da equipe | Born to Run — Treinamento e Saúde |
| Ano de fundação | 2015 |
| Cidade / Estado | Descalvado — SP |
| Escala | ~200 atletas |
| Participações em corridas | +200 participações |
| Instagram | [@equipeborntorun](https://instagram.com/equipeborntorun) |
| Treinador responsável | Robson Alves |
| Formação do treinador | Educador Físico, CREF 119911-G/SP |
| Qualificações | Graduação em Educação Física; Especialização em corridas de meio-fundo e fundo; Treinador Nível 1 World Athletics |

### Proibições absolutas de conteúdo

**NUNCA invente, fabrique ou "preencha para parecer completo":**

- Endereço físico, CEP ou localização exata da sede.
- Números de telefone ou WhatsApp (os atuais no código — `5519900000000` e `5519999999999` — são **placeholders falsos** e devem ser tratados como pendência do cliente, jamais publicados como reais).
- E-mails de contato (os atuais são fictícios).
- CNPJ, razão social ou dados jurídicos.
- Depoimentos de alunos, nomes de atletas, histórias pessoais.
- Títulos, troféus, pódios, recordes, tempos ou resultados de provas.
- Estatísticas não confirmadas (ex.: "500+ atletas", "98% de satisfação" — números que aparecem hardcoded no código e **não** batem com os dados oficiais).

Quando um dado real for necessário mas não estiver disponível, **marque explicitamente como pendência** (ex.: placeholder visível com aviso, TODO no código, ou solicite ao cliente). Nunca disfarce um dado inventado como verdadeiro.

---

## 3. Regras Invioláveis

1. **Fonte da verdade do banco:** `supabase/schema.sql` define as colunas reais. O `HANDOVER.md` está **desatualizado e incorreto** em vários pontos (ver §5). Em caso de conflito, o schema vence.
2. **Não confie no HANDOVER.md.** Ele descreve funcionalidades que não existem no banco (papel `treinador`, coluna `assigned_to`, colunas `content`/`image_url` em posts). Trate-o como contexto histórico, não como especificação.
3. **Não reintroduza o código quebrado.** As actions em `app/actions/` referenciam colunas inexistentes e estão quebradas. As actions corretas estão em `lib/actions/`. Consolide para uma única fonte antes de estender.
4. **Não exponha segredos.** Nunca faça commit de `.env`, `.env.local` ou qualquer chave. Use `.env.example` com placeholders. Nunca imprima chaves em logs ou documentos.
5. **Preserve a identidade visual definida** (ver `DESIGN_RECONSTRUCTION_BRIEF.md`): fundo branco/off-white, texto escuro, vermelho como cor principal, verde secundário, laranja pontual. **Proibido:** dark mode como aparência principal, gradientes arco-íris, neon, visual genérico de SaaS.
6. **Mobile-first.** A maioria dos atletas acessa pelo celular. Toda tela precisa funcionar bem em 375px antes de pensar em desktop.
7. **Segurança por padrão.** Toda tabela tem RLS. Toda operação sensível (admin) precisa ser verificada no servidor, não só na UI. Nunca remova checagens de autorização.
8. **Não altere os dados oficiais** da §2 em nenhum arquivo, copy ou componente.
9. **Português em tudo que o usuário lê.** Interface, mensagens de erro, comunicados e conteúdo são em português do Brasil. Código, identificadores e comentários técnicos podem ficar em inglês.
10. **Verifique antes de afirmar "funciona".** Rode `lint`, `typecheck` e `build` antes de dar qualquer tarefa como concluída.

---

## 4. Comandos do Projeto

```bash
# Instalar dependências
npm install

# Desenvolvimento (Turbopack) — http://localhost:3000
npm run dev

# Build de produção (ATUALMENTE FALHA — ver auditoria)
npm run build

# Iniciar build de produção
npm run start

# Lint (ATUALMENTE FALHA — 12 erros)
npm run lint

# Type-check manual (não há script dedicado; ATUALMENTE FALHA)
npx tsc --noEmit
```

> **Estado atual conhecido:** `build`, `lint` e `typecheck` **falham**. Ver `ABACUS_PROJECT_AUDIT.md` e `CURRENT_IMPLEMENTATION_STATUS.md` para os motivos exatos. Fazer o build passar é um pré-requisito da Fase 1 do `FABLE_REBUILD_PLAN.md`.

---

## 5. Stack Real (o que está realmente instalado)

A stack **real** diverge do que o `HANDOVER.md` afirma. Use esta tabela como referência:

| Camada | Real (confirmado no `package.json`) | O que o HANDOVER diz (errado) |
|---|---|---|
| Framework | **Next.js 16.2.10** (App Router, Turbopack) | "Next.js 14" |
| UI | **React 19.2.4** | — |
| Linguagem | TypeScript ^5 | — |
| Estilização | **Tailwind CSS v4** (`@tailwindcss/postcss`) | "Tailwind CSS" (genérico) |
| Ícones | lucide-react ^1.24.0 | Lucide React |
| Backend/DB/Auth/Storage | Supabase (`@supabase/ssr` ^0.12.3, `@supabase/supabase-js` ^2.110.5) | Supabase |
| Deploy alvo | Vercel | — |

### Armadilha crítica de estilização

- O projeto usa **Tailwind v4**, cuja configuração vive em `app/globals.css` via `@import 'tailwindcss'` e bloco `@theme inline`.
- O arquivo `tailwind.config.ts` está em **formato v3** (define `brand.*`, fonte `Outfit`, `shadow-card`) e **não é carregado** — não há diretiva `@config` no CSS. Ele é praticamente **código morto**.
- Os tokens de cor `--color-btr-*` **estão** definidos no `globals.css`, mas dezenas de **classes utilitárias custom** usadas nas páginas **não existem** (`card`, `btn-primary`, `btn-secondary`, `btn-outline`, `badge*`, `section-title`, `input-base`, `divider-*`). Isso quebra o visual de várias páginas internas.
- Antes de estilizar: decida entre (a) definir todos os tokens/classes em `globals.css` (caminho v4) ou (b) reativar o `tailwind.config.ts` com `@config`. Ver `DESIGN_RECONSTRUCTION_BRIEF.md`.

---

## 6. Estrutura Principal

```
born-to-run/
├── app/
│   ├── (public)/     → Site público: /, /sobre, /equipe, /galeria, /resultados, /contato
│   ├── (auth)/       → /login, /cadastro, /recuperar-senha
│   ├── (dashboard)/  → Área do aluno (feed, treinos, perfil, fotos) — ROTAS DUPLICADAS/QUEBRADAS
│   ├── (admin)/      → Painel do treinador (/admin, /admin/treinos, /admin/comunicados, /admin/membros)
│   ├── actions/      → Server Actions QUEBRADAS (colunas inexistentes) — NÃO USAR sem corrigir
│   ├── auth/callback → Callback OAuth/e-mail do Supabase
│   ├── layout.tsx    → Layout raiz (fontes Inter + Barlow Condensed)
│   └── globals.css   → Tailwind v4 + tokens de tema
├── components/       → layout/, feed/, workouts/, profile/, admin/ (com duplicações concorrentes)
├── lib/
│   ├── actions/      → Server Actions CORRETAS (auth.ts, feed.ts, admin.ts) — FONTE DA VERDADE
│   ├── supabase/     → client.ts, server.ts, middleware.ts (middleware = código morto)
│   └── utils.ts      → helper cn()
├── supabase/schema.sql → FONTE DA VERDADE do banco (tabelas, RLS, storage, triggers)
├── types/index.ts    → Tipos globais (UserRole = 'member' | 'admin')
├── middleware.ts     → Middleware de auth ativo (convenção descontinuada no Next 16)
└── public/           → Imagens reais (logo, robson-*, team-group) + assets padrão a remover
```

> **Ver o mapa completo e comentado em `PROJECT_ARCHITECTURE_MAP.md`.**

---

## 7. Regras de Autenticação e Segurança

- **Auth:** Supabase Auth (e-mail/senha). O trigger `handle_new_user` cria o `profile` automaticamente no cadastro.
- **Papéis:** apenas `'member'` e `'admin'` existem no banco (CHECK do schema). **O papel `'treinador'` NÃO existe** — qualquer código que dependa dele é morto. O treinador Robson deve ter `role = 'admin'`.
- **Proteção de rotas:** o `middleware.ts` redireciona não autenticados de `/dashboard` e `/admin` para `/login`. A checagem de **admin** é feita no `app/(admin)/layout.tsx` (server-side). **Não** remova essa checagem; idealmente reforce também no middleware (defesa em profundidade).
- **RLS:** habilitado em todas as tabelas. Escritas sensíveis (treinos, comunicados) exigem `is_admin()`. **Falta uma policy de DELETE em `profiles`**, então "remover membro" falha silenciosamente — corrigir na Fase 2.
- **Storage:** buckets `avatars` e `post-images` (públicos para leitura). Uploads restritos por pasta do usuário.
- **Segredos:** as chaves ficam em `.env.local` (nunca versionado). O único exemplo versionado é `.env.example`. Só use as variáveis `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ambas públicas por natureza). **Nunca** exponha a `service_role` no cliente.

---

## 8. Ordem de Leitura Obrigatória dos Documentos

Antes de codar, leia nesta ordem:

1. **`AGENTS.md`** (este arquivo) — regras e identidade.
2. **`AUDIT_RAW_FINDINGS.md`** — achados técnicos brutos (evidências).
3. **`VISUAL_INSPECTION_REPORT.md`** — achados visuais (evidências).
4. **`ABACUS_PROJECT_AUDIT.md`** — avaliação consolidada e crítica do estado atual.
5. **`PROJECT_ARCHITECTURE_MAP.md`** — como tudo se conecta.
6. **`CURRENT_IMPLEMENTATION_STATUS.md`** — o que funciona / falta / está quebrado, por funcionalidade.
7. **`DATABASE_AND_SECURITY_REVIEW.md`** — banco, RLS, storage e riscos.
8. **`DESIGN_RECONSTRUCTION_BRIEF.md`** — direção visual detalhada.
9. **`FABLE_REBUILD_PLAN.md`** — **o plano mestre em 16 fases.** É o documento que guia toda a reconstrução; siga-o na ordem.

---

## 9. Princípios de Trabalho

- **Consolide antes de estender:** elimine duplicações (actions, rotas, componentes) antes de adicionar features novas.
- **Alinhe código ao schema, não o contrário** — a não ser que uma mudança de schema seja explicitamente planejada (com migração) no `DATABASE_AND_SECURITY_REVIEW.md`.
- **Nada de código morto:** remova imports, actions e arquivos não usados.
- **Commits pequenos e descritivos**, em português, referenciando a fase do plano quando aplicável.
- **Teste de verdade:** `lint` + `typecheck` + `build` verdes, e verificação manual dos fluxos afetados.
- **Honestidade:** se algo não foi testado ou não funciona, diga isso claramente. Nunca marque como concluído o que não foi verificado.
