# CURRENT_IMPLEMENTATION_STATUS.md — Status de Implementação

> Status funcionalidade por funcionalidade do projeto **Born to Run**, no estado atual. Cada item recebe uma classificação objetiva. Este documento existe para que ninguém confunda "tem tela" com "funciona".

## Progresso da reconstrução (branch `abacus-fable-rebuild`)

| Bloco | Escopo | Status |
|---|---|---|
| **Bloco 1** (Fases 1–4) | Arquitetura/limpeza, banco/segurança, design system, páginas públicas | ✅ Concluído |
| **Bloco 2** (Fases 5–7) | Autenticação completa, área do aluno (dashboard), mini rede social/feed | ✅ Concluído |
| **Bloco 3** | Treinos, comunicados (admin), painel do treinador reconstruído | ⏳ Pendente |
| **Bloco 4** | PWA, acessibilidade, desempenho, testes, deploy | ⏳ Pendente |

> **Nota importante:** as validações dos Blocos 1 e 2 foram feitas via build/typecheck/lint (zero erros) e renderização das rotas em modo dev. O `.env.local` contém apenas placeholders — o teste ponta a ponta com o Supabase real (login, posts, uploads) acontecerá quando as credenciais reais forem configuradas (previsto para o Bloco 4/deploy).

## Legenda de status

| Símbolo | Status | Significado |
|---|---|---|
| 🟢 | **Concluído** | Funciona de ponta a ponta, alinhado ao schema. |
| 🔵 | **Parcial** | Funciona em parte; falta completar ou tem ressalva. |
| 🟣 | **Visual sem funcionalidade** | A tela existe e renderiza, mas não executa a ação prometida. |
| 🟡 | **Mockado / Estático** | Conteúdo hardcoded, sem backend real. |
| 🔴 | **Quebrado** | Erro de build/runtime; não funciona. |
| ⚫ | **Ausente** | Não existe no projeto. |
| 🟠 | **Precisa reconstruir** | Existe, mas em estado tal que reescrever é melhor que remendar. |

---

## 1. Infraestrutura e Build

| Funcionalidade | Status | Observações |
|---|---|---|
| `npm install` | 🟢 Concluído | Instala sem erros. |
| `npm run dev` | 🟢 Concluído | Sobe; rotas públicas e de auth renderizam; rotas protegidas redirecionam corretamente. |
| `npm run build` | 🟢 Concluído | Build limpo, 23 rotas geradas. |
| `npm run lint` | 🟢 Concluído | Zero erros, zero warnings. |
| `npx tsc --noEmit` | 🟢 Concluído | Zero erros. |
| Tipos `Database` do Supabase | ⚫ Ausente | Client sem tipagem gerada; queries usam tipos manuais de `types/index.ts`. Melhoria prevista. |
| Variáveis de ambiente | 🔵 Parcial | `.env.example` documentado (inclui `NEXT_PUBLIC_SITE_URL`); `.env.local` só com placeholders. |
| PWA / manifest | 🟢 Concluído | `manifest.json` válido, ícones 192/512, atalhos. |
| `error.tsx` / `not-found.tsx` / `loading.tsx` | 🔵 Parcial | `notFound()` usado em rotas dinâmicas; boundaries globais previstos para o Bloco 4. |
| Testes (unit/integração/e2e) | ⚫ Ausente | Previsto para o Bloco 4. |

---

## 2. Design System / Estilização

| Funcionalidade | Status | Observações |
|---|---|---|
| Tokens de cor `--color-btr-*` | 🟢 Concluído | Off-white `#F9F7F5`, vermelho `#DC2626`, verde `#16A34A` no `globals.css` (Tailwind v4). |
| Tipografia (Inter + Barlow Condensed) | 🟢 Concluído | Unificada; config morta (Outfit) removida no Bloco 1. |
| Componentes de UI (`Button`, `Card`, `Input`, `Badge`, `Avatar`, `Container`, `Section`) | 🟢 Concluído | Biblioteca própria em `components/ui/`. |
| Animações/utilitários | 🟢 Concluído | Definidos no `globals.css`. |
| Consistência de fontes | 🟢 Concluído | Barlow Condensed (títulos) + Inter (texto). |

---

## 3. Páginas Públicas

| Funcionalidade | Status | Observações |
|---|---|---|
| Home `/` | 🟢 Concluído | Reconstruída com dados oficiais; estatísticas reais (desde 2015, ~200 atletas, +200 corridas). |
| Sobre `/sobre` | 🟢 Concluído | Conteúdo oficial; design system aplicado. |
| Equipe `/equipe` | 🟢 Concluído | Bio do Robson Alves (CREF 119911-G/SP, World Athletics nível 1). |
| Galeria `/galeria` | 🟢 Concluído | Apenas fotos reais da equipe; imagens irrelevantes removidas. |
| Resultados `/resultados` | 🟢 Concluído | Contraste corrigido. |
| Contato `/contato` | 🟢 Concluído | Formulário funcional; sem contatos inventados. |
| Header (navegação) | 🟢 Concluído | Navegação por rotas reais; sem âncoras quebradas. |
| Footer | 🟢 Concluído | Consistente; Instagram oficial @equipeborntorun. |

---

## 4. Autenticação

| Funcionalidade | Status | Observações |
|---|---|---|
| Cadastro (`/cadastro`) | 🟢 Concluído | Server action; trigger cria profile. |
| Login (`/login`) | 🟢 Concluído | Redireciona por papel: admin → `/admin`, aluno → `/dashboard`. |
| Recuperar senha (envio) | 🟢 Concluído | `redirectTo` corrigido: usa a origem do site (`NEXT_PUBLIC_SITE_URL` ou headers) + callback. |
| Recuperar senha (nova senha) | 🟢 Concluído | Rota `/recuperar-senha/nova` criada; `updatePassword` valida senha (mín. 6) e confirmação. |
| Logout (aluno e admin) | 🟢 Concluído | Server action `logout()` conectada aos layouts. |
| Callback de auth | 🟢 Concluído | `app/auth/callback/route.ts` troca code por sessão, respeita `?next=`. |
| Proteção de rotas (middleware) | 🟢 Concluído | Redireciona não autenticados de `/dashboard` e `/admin`. |
| Reforço de admin | 🟢 Concluído | Layout admin checa `role='admin'` server-side. |
| Actions de auth (`lib/actions/auth.ts`) | 🟢 Concluído | Fonte única: login, cadastro, logout, reset e atualização de senha. |

---

## 5. Área do Aluno (Dashboard)

| Funcionalidade | Status | Observações |
|---|---|---|
| Início `/dashboard` | 🟢 Concluído | Dashboard real: boas-vindas, atalhos, próximos treinos, últimos comunicados, atividade da equipe, contagem de posts. |
| Feed `/dashboard/feed` | 🟢 Concluído | Lista posts com autor, foto, métricas, curtidas e comentários reais. |
| Treinos `/dashboard/treinos` | 🟢 Concluído | Leitura de treinos agendados (visíveis a toda a equipe, conforme RLS atual). |
| Comunicados `/dashboard/comunicados` | 🟢 Concluído | Central do aluno com destaque no mais recente e estado vazio. |
| Perfil `/dashboard/perfil` | 🟢 Concluído | Edição de nome, bio, cidade, objetivo + upload de avatar (com validação de 5MB e erro visível). |
| Perfil de membro `/dashboard/membros/[id]` | 🟢 Concluído | Perfil público: avatar, bio, badge de treinador, stats (posts, km) e últimas atividades. |
| Navegação (sidebar + bottom nav mobile) | 🟢 Concluído | Estado ativo por rota; 5 itens: Início, Feed, Treinos, Comunicados, Perfil. |

---

## 6. Feed Social (detalhe)

| Funcionalidade | Status | Observações |
|---|---|---|
| Listar posts | 🟢 Concluído | Query alinhada ao schema (caption, photo_url, métricas). |
| Publicar post com foto | 🟢 Concluído | Upload p/ `post-images`; valida conteúdo vazio e foto >10MB; erro de upload visível. |
| Publicar métricas (distância/tempo/pace) | 🟢 Concluído | Campos conectados. |
| Curtir / descurtir | 🟢 Concluído | `toggleLike` conectado com atualização otimista. |
| Comentar | 🟢 Concluído | `addComment` conectado; comentários listados no card. |
| Excluir comentário | 🟢 Concluído | `deleteComment` (autor ou admin; RLS garante autorização). |
| Excluir post (dono/admin) | 🟢 Concluído | `deletePost` conectado. |
| Autor clicável | 🟢 Concluído | Nome/avatar linkam para o perfil do membro. |

---

## 7. Treinos (detalhe)

| Funcionalidade | Status | Observações |
|---|---|---|
| Listar treinos (aluno) | 🟢 Concluído | Por nível e data. |
| Criar treino (admin) | 🟢 Concluído | `createWorkout` alinhado ao schema. |
| Editar treino (admin) | ⚫ Ausente | Previsto para o Bloco 3. |
| Excluir treino (admin) | 🟢 Concluído | `deleteWorkout`. |
| Privacidade por aluno (`assigned_to`) | ⚫ Ausente | Decisão de produto pendente; RLS atual mostra treinos a todos os membros. |

---

## 8. Comunicados

| Funcionalidade | Status | Observações |
|---|---|---|
| Criar comunicado (admin) | 🟢 Concluído | `createAnnouncement`. |
| Editar comunicado (admin) | ⚫ Ausente | Previsto para o Bloco 3. |
| Excluir comunicado (admin) | 🟢 Concluído | `deleteAnnouncement`. |
| Consumo pelo aluno | 🟢 Concluído | `/dashboard/comunicados` + resumo no início do dashboard. |

---

## 9. Painel Administrativo

| Funcionalidade | Status | Observações |
|---|---|---|
| Autorização admin | 🟢 Concluído | Layout server-side checa `role='admin'`. |
| Dashboard admin `/admin` | 🔵 Parcial | Funcional, mas com estilo divergente (CSS inline). Reconstrução no Bloco 3. |
| CRUD de treinos | 🔵 Parcial | Create/delete ok; falta edição (Bloco 3). |
| CRUD de comunicados | 🔵 Parcial | Create/delete ok; falta edição (Bloco 3). |
| Listar membros | 🟢 Concluído | `/admin/membros`. |
| Promover/rebaixar admin | 🟢 Concluído | `toggleAdminRole`. |
| Remover membro | 🟢 Concluído | Policy DELETE em `profiles` adicionada na migration `0002`. |
| Layout admin | 🟠 Precisa reconstruir | CSS inline fora do design system — Bloco 3. |

---

## 10. Perfis e Uploads

| Funcionalidade | Status | Observações |
|---|---|---|
| Editar perfil (nome, bio, cidade, objetivo) | 🟢 Concluído | Formulário único (`PerfilForm`); duplicata removida no Bloco 1. |
| Upload de avatar (`avatars`) | 🟢 Concluído | Restrito à pasta do usuário; valida 5MB; erro visível. |
| Upload de foto de post (`post-images`) | 🟢 Concluído | Valida 10MB; erro visível. |

---

## 11. Banco de Dados e Segurança

| Item | Status | Observações |
|---|---|---|
| Schema (tabelas/índices/triggers) | 🟢 Concluído | `supabase/migrations/0001_schema_inicial.sql`. |
| RLS habilitado | 🟢 Concluído | Em todas as tabelas. |
| Policy DELETE em `profiles` | 🟢 Concluído | Migration `0002_correcoes_rls_fase2.sql`. |
| `WITH CHECK` em `profiles_update_admin` | 🟢 Concluído | Corrigido na migration `0002`. |
| Privacidade de treinos (RLS) | 🔵 Parcial | Treinos visíveis a todos os membros autenticados (decisão de produto pendente). |
| Storage buckets | 🟢 Concluído | `avatars` (5MB) e `post-images` (10MB) com policies por usuário. |
| Segredos versionados | 🟢 Concluído (ok) | Nenhuma chave real no repo; `.env*` ignorado. |

---

## 12. Resumo Quantitativo

| Status | Contagem aproximada de itens |
|---|---|
| 🟢 Concluído | ~55 |
| 🔵 Parcial | ~7 |
| 🟣 Visual sem funcionalidade | 0 |
| 🟡 Mockado / Estático | 0 |
| 🔴 Quebrado | 0 |
| ⚫ Ausente | ~5 |
| 🟠 Precisa reconstruir | ~1 |

> **Leitura rápida:** após os Blocos 1 e 2, o **build está limpo** (zero erros de build, lint e typecheck), o **site público**, a **autenticação**, a **área do aluno** e o **feed social** estão **concluídos e alinhados ao schema**. Restam: o **painel admin** (funcional, mas a reconstruir no Bloco 3, com edição de treinos/comunicados) e a fase de **qualidade/deploy** (Bloco 4: boundaries de erro, testes, acessibilidade, desempenho, deploy na Vercel com credenciais reais do Supabase).

---

*Fim do CURRENT_IMPLEMENTATION_STATUS.md.*
