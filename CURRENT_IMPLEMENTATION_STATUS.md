# CURRENT_IMPLEMENTATION_STATUS.md — Status de Implementação

> Status funcionalidade por funcionalidade do projeto **Born to Run**, no estado atual. Cada item recebe uma classificação objetiva. Este documento existe para que ninguém confunda "tem tela" com "funciona".

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
| `npm install` | 🟢 Concluído | Instala; 2 vulnerabilidades moderadas (postcss transitivo). |
| `npm run dev` | 🔵 Parcial | Sobe, mas várias páginas internas quebram/estilo ausente. |
| `npm run build` | 🔴 Quebrado | Falha em `TS2613` (PostCard sem default export). **Não deployável.** |
| `npm run lint` | 🔴 Quebrado | 12 erros + 12 warnings. |
| `npx tsc --noEmit` | 🔴 Quebrado | 1 erro visível; muitos mascarados por falta de tipos `Database`. |
| Tipos `Database` do Supabase | ⚫ Ausente | Client sem tipagem → erros de coluna só em runtime. |
| Variáveis de ambiente | 🔵 Parcial | `.env.local` só com placeholders; `.env.example` criado nesta branch. |
| PWA / manifest | 🟢 Concluído | `manifest.json` válido, ícones 192/512, atalhos. |
| `error.tsx` / `not-found.tsx` / `loading.tsx` | ⚫ Ausente | Sem boundaries de erro nem estados de carregamento. |
| Testes (unit/integração/e2e) | ⚫ Ausente | Nenhum teste no projeto. |

---

## 2. Design System / Estilização

| Funcionalidade | Status | Observações |
|---|---|---|
| Tokens de cor `--color-btr-*` | 🟢 Concluído | Definidos no `globals.css` (Tailwind v4). |
| Tipografia (Inter + Barlow Condensed) | 🔵 Parcial | Carregada no layout, mas config diverge (Outfit no `tailwind.config`). |
| Classes utilitárias custom (`card`, `btn-*`, `badge*`, `section-title`, `input-base`, `divider-*`) | 🔴 Quebrado | **Não definidas** → estilo quebrado em muitas páginas. |
| `tailwind.config.ts` | ⚫ Ausente (efetivo) | Formato v3, não carregado sob v4 → código morto. |
| Animações/utilitários (`animate-*`, `card-lift`, `heading-accent`) | 🟢 Concluído | Definidos no `globals.css`. |
| Consistência de fontes | 🟠 Precisa reconstruir | Barlow/Inter vs Outfit — decidir e unificar. |

---

## 3. Páginas Públicas

| Funcionalidade | Status | Observações |
|---|---|---|
| Home `/` | 🔵 Parcial | Renderiza (hex hardcoded); estatísticas fictícias; H1 sem espaço; CTAs inconsistentes. |
| Sobre `/sobre` | 🟡 Mockado | Conteúdo real mas estático; classes CSS indefinidas. |
| Equipe `/equipe` | 🟡 Mockado | Bio do Robson (dados oficiais ok); CSS indefinido. |
| Galeria `/galeria` | 🔴 Quebrado | 3 imagens quebradas + fotos irrelevantes (Torre Eiffel, panquecas, natação). |
| Resultados `/resultados` | 🔵 Parcial | Renderiza; contraste insuficiente nas estatísticas. |
| Contato `/contato` | 🟣 Visual sem funcionalidade | Formulário sem backend confirmado; contatos placeholder. |
| História `/historia` | ⚫ Ausente | Retorna 404; conteúdo embutido em `/sobre`. |
| Header (navegação) | 🟠 Precisa reconstruir | Âncoras `#sobre` só funcionam na home; WhatsApp placeholder. |
| Footer | 🟠 Precisa reconstruir | CTAs/telefones inconsistentes. |

---

## 4. Autenticação

| Funcionalidade | Status | Observações |
|---|---|---|
| Cadastro (`/cadastro`) | 🟢 Concluído | Via client Supabase; trigger cria profile. |
| Login (`/login`) | 🔵 Parcial | Funciona; "Esqueceu a senha?" (`#`) e "Lembrar de mim" mortos. |
| Recuperar senha (envio) | 🔴 Quebrado | `redirectTo` aponta p/ domínio Supabase, não do app. |
| Recuperar senha (nova senha) | ⚫ Ausente | Rota `/recuperar-senha/nova` não existe. |
| Logout (aluno) | 🔴 Quebrado | POST p/ `/auth/signout` inexistente; `logout()` correta não usada. |
| Logout (admin) | 🔵 Parcial | Import de `logout` presente mas não usado (warning). |
| Callback de auth | 🟢 Concluído | `app/auth/callback/route.ts` troca code por sessão. |
| Proteção de rotas (middleware) | 🟢 Concluído | Redireciona não autenticados de `/dashboard` e `/admin`. |
| Reforço de admin no middleware | ⚫ Ausente | Só o layout admin checa role (sem defesa em profundidade). |
| Actions de auth (`lib/actions/auth.ts`) | 🔵 Parcial | Corretas, mas páginas usam client direto (duplicação). |

---

## 5. Área do Aluno (Dashboard)

| Funcionalidade | Status | Observações |
|---|---|---|
| Feed principal `/dashboard` | 🔴 Quebrado | FK inexistente + colunas `content`/`image_url`; likes/comentários hardcoded 0. |
| Feed alternativo `/dashboard/feed` | 🔴 Quebrado | Query ok, mas import default do PostCard quebra o build. |
| Criar post (`lib/actions/feed.createPost`) | 🟣 Visual sem funcionalidade | Action correta existe, mas nenhum componente ativo a chama. |
| Criar post (`app/actions/post.ts`) | 🔴 Quebrado | Insere colunas inexistentes. |
| Curtir (`toggleLike`) | 🟣 Visual sem funcionalidade | Action correta; botão sem `onClick`. |
| Comentar (`addComment`) | 🟣 Visual sem funcionalidade | Action correta; sem UI conectada. |
| Excluir post (`deletePost`) | 🟣 Visual sem funcionalidade | Action correta; não chamada. |
| Treinos `/dashboard/treinos` | 🔵 Parcial | Leitura funciona; sem privacidade por aluno. |
| Treinos `/treinos` (linkada) | 🔴 Quebrado | FK inexistente + checa papel `treinador`. |
| Criar treino (aluno via `app/actions/workouts.ts`) | 🔴 Quebrado | `assigned_to`/`treinador` inexistentes. |
| Fotos `/fotos` | 🔴 Quebrado | Consulta coluna `image_url` (inexistente). |
| Perfil `/dashboard/perfil` (`PerfilForm`) | 🟢 Concluído | Edição + upload de avatar. |
| Perfil `/perfil` (`ProfileForm`) | 🔵 Parcial | Funciona; usa `any` (lint); duplica o anterior. |
| Comunicados (aluno) | ⚫ Ausente | Sem tela dedicada; `/dashboard/comunicados` retorna 404. |
| Logout no layout do dashboard | 🔴 Quebrado | Ver §4. |

---

## 6. Feed Social (detalhe)

| Funcionalidade | Status | Observações |
|---|---|---|
| Listar posts | 🔴 Quebrado | Ambas as rotas de feed falham (colunas/import). |
| Publicar post com foto | 🟣 Visual sem funcionalidade | Upload p/ `post-images` implementado na action correta, não conectado. |
| Publicar métricas (distância/tempo/pace) | 🟣 Visual sem funcionalidade | Colunas existem; UI não conectada. |
| Curtir / descurtir | 🟣 Visual sem funcionalidade | Sem handler no PostCard. |
| Comentar | 🟣 Visual sem funcionalidade | Sem UI de comentários conectada. |
| Excluir post (dono/admin) | 🟣 Visual sem funcionalidade | Action pronta, não chamada. |
| Componentes de criação | 🟠 Precisa reconstruir | `CreatePost` vs `NewPostForm` (duplicados). |
| PostCard | 🟠 Precisa reconstruir | Só named export; props estáticas; botões inertes. |

---

## 7. Treinos (detalhe)

| Funcionalidade | Status | Observações |
|---|---|---|
| Listar treinos | 🔵 Parcial | `/dashboard/treinos` lê; sem filtro por aluno. |
| Criar treino (admin) | 🟢 Concluído | `lib/actions/admin.createWorkout` alinhado ao schema. |
| Excluir treino (admin) | 🟢 Concluído | `deleteWorkout` funciona. |
| Privacidade por aluno (`assigned_to`) | ⚫ Ausente | Coluna não existe; RLS mostra todos os treinos a todos. |
| Modal de criação (`CreateWorkoutModal`) | 🟠 Precisa reconstruir | Texto de privacidade falso; `any`. |
| WorkoutCard | 🟢 Concluído | Exibição correta. |
| Papel `treinador` | ⚫ Ausente | CHECK do schema só permite `member`/`admin`. |

---

## 8. Comunicados

| Funcionalidade | Status | Observações |
|---|---|---|
| Criar comunicado (admin) | 🟢 Concluído | `createAnnouncement` alinhado ao schema. |
| Excluir comunicado (admin) | 🟢 Concluído | `deleteAnnouncement` funciona. |
| Listar comunicados (admin) | 🟢 Concluído | Tela admin funcional. |
| Consumo pelo aluno | ⚫ Ausente | Sem tela dedicada e funcional no fluxo do aluno. |

---

## 9. Painel Administrativo

| Funcionalidade | Status | Observações |
|---|---|---|
| Autorização admin | 🟢 Concluído | Layout server-side checa `role='admin'`. |
| Dashboard admin `/admin` | 🟢 Concluído | Contadores e atalhos. |
| CRUD de treinos | 🟢 Concluído | Via `lib/actions/admin.ts`. |
| CRUD de comunicados | 🟢 Concluído | Via `lib/actions/admin.ts`. |
| Listar membros | 🟢 Concluído | `/admin/membros`. |
| Promover/rebaixar admin | 🟢 Concluído | `toggleAdminRole` (UPDATE tem policy admin). |
| Remover membro | 🔴 Quebrado | `deleteMember` bloqueado silenciosamente (sem policy DELETE em `profiles`). |
| Import morto `logout` no layout | 🟡 Mockado (ruído) | Warning de lint. |

---

## 10. Perfis e Uploads

| Funcionalidade | Status | Observações |
|---|---|---|
| Editar perfil (nome, bio, cidade, objetivo) | 🟢 Concluído | Ambos os formulários casam com o schema. |
| Upload de avatar (`avatars`) | 🟢 Concluído | Restrito à pasta do usuário. |
| Dois formulários de perfil | 🟠 Precisa reconstruir | `PerfilForm` vs `ProfileForm` — consolidar. |

---

## 11. Banco de Dados e Segurança

| Item | Status | Observações |
|---|---|---|
| Schema (tabelas/índices/triggers) | 🟢 Concluído | Bem modelado. |
| RLS habilitado | 🟢 Concluído | Em todas as tabelas. |
| Policy DELETE em `profiles` | ⚫ Ausente | Remover membro falha. |
| `WITH CHECK` em `profiles_update_admin` | 🔵 Parcial | Só `USING`; falta `WITH CHECK`. |
| Privacidade de treinos (RLS) | 🟠 Precisa reconstruir | `USING (true)` expõe tudo. |
| Storage buckets | 🟢 Concluído | `avatars` e `post-images` com policies. |
| Segredos versionados | 🟢 Concluído (ok) | Nenhuma chave real no repo; `.env*` ignorado. |

---

## 12. Resumo Quantitativo

| Status | Contagem aproximada de itens |
|---|---|
| 🟢 Concluído | ~22 |
| 🔵 Parcial | ~12 |
| 🟣 Visual sem funcionalidade | ~7 |
| 🟡 Mockado / Estático | ~3 |
| 🔴 Quebrado | ~16 |
| ⚫ Ausente | ~11 |
| 🟠 Precisa reconstruir | ~9 |

> **Leitura rápida:** o painel administrativo e a fundação de dados estão majoritariamente **prontos**; a **área do aluno** (feed, treinos, fotos) e o **build** estão majoritariamente **quebrados**; o **site público** está **estático e com falhas de conteúdo/navegação**. A prioridade é: (1) fazer o build passar, (2) consolidar duplicações, (3) reconectar as actions corretas à UI, (4) corrigir conteúdo/navegação pública.

---

*Fim do CURRENT_IMPLEMENTATION_STATUS.md.*
