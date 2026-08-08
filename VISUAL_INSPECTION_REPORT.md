# ARQUIVO HISTÓRICO — Relatório de Inspeção Visual — Born to Run

> Inspeção da versão anterior. A direção visual vigente está em `README-FABLE5.md` e nas imagens de `design-refs/`.

**Data:** 17/07/2026  
**Projeto:** Born to Run — Treinamento e Saúde  
**Stack:** Next.js 16, React 19, Tailwind CSS v4, Supabase  
**Ambiente:** `npm run dev` (modo desenvolvimento, sem backend Supabase funcional)  
**Viewports testados:** Mobile (375px), Tablet (768px), Desktop (1440px)

---

## Resumo Executivo

O projeto apresenta uma base visual sólida com design profissional na maioria das páginas públicas. No entanto, foram identificados **problemas críticos** de conteúdo (imagens de stock irrelevantes, números de WhatsApp placeholder), **navegação inconsistente** (links de âncora vs. rotas reais), e **imagens quebradas** na galeria. A responsividade é geralmente boa, mas há detalhes a corrigir.

### Classificação Geral: ⚠️ Parcialmente Profissional — Precisa de Correções Antes de Produção

---

## Páginas Inspecionadas

### 1. `/` — Página Inicial (Home)

**Status:** ✅ Renderiza corretamente

#### Desktop (1440px)
- **Header:** Logo Born to Run visível e correto. Navegação horizontal com links: Sobre, Modalidades, Como Funciona, Depoimentos, Contato, Entrar, Comece Agora, WhatsApp.
- **Hero Section:** Imagem de fundo com equipe real da Born to Run. Título "Sua transformação começa com o primeiro passo" com destaque em vermelho. CTAs "Ver Modalidades" e "Fale Conosco" presentes.
- **Seção de Estatísticas:** ~200 Atletas, +200 Corridas, 10+ Anos, 100% Foco em saúde — grid 4 colunas.
- **Seção Sobre:** Texto descritivo com imagem da equipe.
- **Modalidades:** Cards com ícones para diferentes modalidades de treino.
- **Como Funciona:** Timeline/steps com ícones.
- **Depoimentos:** Carousel com depoimentos de alunos.
- **Footer:** Logo, links de navegação, redes sociais (Instagram), WhatsApp, e-mail.
- **Cores:** Fundo bege claro (#F9F7F5), texto escuro (#1C1917), vermelho (#DC2626) como cor de destaque.
- **Tipografia:** Inter (sans-serif) + Barlow Condensed para títulos. Boa hierarquia.

#### Mobile (375px)
- Header com logo e menu hamburger ✅
- Hero section adapta bem, texto legível ✅
- Estatísticas em grid 2x2 ✅
- Cards de modalidades empilhados verticalmente ✅
- Footer empilhado corretamente ✅

#### Tablet (768px)
- Navegação horizontal visível (sem hamburger) ✅
- Layout adapta bem entre mobile e desktop ✅

#### 🐛 Problemas Encontrados:
1. **H1 sem espaço no textContent:** O `<br>` entre "transformação" e "começa" faz com que leitores de tela leiam "Sua transformaçãocomeça com o primeiro passo" — problema de acessibilidade.
2. **Navegação usa apenas âncoras (#sobre, #modalidades, etc.):** Funciona na home, mas se o usuário estiver em `/galeria` e clicar "Sobre" no header, vai para `/galeria#sobre` que não existe.
3. **Dois números de WhatsApp diferentes:** Header usa `5519999999999`, footer e demais links usam `5519900000000` — ambos parecem ser placeholders.
4. **Botão "Comece Agora" inconsistente:** No header aponta para `/cadastro`, no footer aponta para `#modalidades`.

---

### 2. `/sobre` — Sobre a Equipe

**Status:** ✅ Renderiza corretamente

- **Conteúdo:** "A Nossa História" — texto sobre a fundação em 2015 por Robson Alves.
- **Imagem:** Foto real da equipe sob arco de chegada (legítima).
- **Layout:** Texto à esquerda, imagem à direita em desktop. Empilhado em mobile.
- **Footer:** Presente e consistente.
- **Qualidade:** Profissional, conteúdo relevante.

#### 🐛 Problemas:
- Nenhum problema visual significativo encontrado.

---

### 3. `/historia` — História

**Status:** ❌ Retorna 404

- A rota `/historia` não existe no projeto. A página de história está integrada em `/sobre`.
- O 404 do Next.js é exibido (página padrão).

---

### 4. `/galeria` — Galeria de Fotos

**Status:** ⚠️ Renderiza com problemas graves

#### Desktop (1440px)
- **Header:** Presente e funcional.
- **Título:** "Galeria — Momentos que contam nossa história"
- **Filtros:** Treinos, Corridas, Medalhas, Equipe Unida — botões de filtro funcionais visualmente.
- **Grid de imagens:** Layout masonry/grid com 15 imagens.

#### Mobile (375px)
- Filtros de categoria em linha horizontal com scroll — funcional mas apertado.
- Grid adapta para 1-2 colunas.

#### 🐛 Problemas CRÍTICOS:
1. **3 imagens quebradas (broken):**
   - "Treino de resistência" (unsplash photo-1486218119243) — `naturalWidth: 0`
   - "Atletas em corrida de rua" (unsplash photo-1460468527990) — `naturalWidth: 0`
   - "Atleta com medalha" (unsplash photo-1551958219) — `naturalWidth: 0`
   - Exibem ícone de imagem quebrada no lugar da foto.

2. **Imagens de stock completamente irrelevantes:**
   - **Amigos sentados olhando a Torre Eiffel** (unsplash photo-1529156069898) — rotulada como "Grupo de atletas unidos"
   - **Panquecas com frutas e calda** (unsplash photo-1455853659719) — rotulada como "Equipe celebrando juntos"
   - **Pessoa nadando em piscina** — fora do contexto de corrida de rua
   - **Sala de musculação/academia** — não é o foco da equipe

3. **Todas as imagens são de stock do Unsplash** exceto 2 fotos reais (team-group.jpg e robson-running.jpg). Para uma galeria que deveria mostrar "momentos reais", isso é enganoso.

---

### 5. `/contato` — Contato

**Status:** ✅ Renderiza corretamente

#### Desktop (1440px)
- **Formulário:** Nome, E-mail, Telefone, Mensagem — campos bem formatados.
- **Informações de contato:** Endereço, telefone, e-mail, horário de funcionamento.
- **Mapa:** Placeholder ou embed (não funcional sem API key).
- **Layout:** Formulário à esquerda, informações à direita.

#### Mobile (375px)
- Formulário empilhado verticalmente ✅
- Campos de tamanho adequado para touch ✅

#### 🐛 Problemas:
- Nenhum problema visual significativo.

---

### 6. `/login` — Login

**Status:** ✅ Renderiza corretamente

#### Desktop (1440px)
- **Layout split-screen:** Painel vermelho à esquerda com logo, citação e estatísticas. Formulário branco à direita.
- **Formulário:** E-mail, Senha, "Lembrar de mim", "Esqueceu a senha?", botão "Entrar no Painel".
- **Link para cadastro:** "Ou faça seu cadastro agora" — funcional.
- **Qualidade:** Profissional e polido.

#### Mobile (375px)
- Painel vermelho oculto, apenas formulário visível ✅
- Formulário centralizado e legível ✅

#### Tablet (768px)
- Formulário centralizado sem painel lateral ✅

#### 🐛 Problemas:
- Nenhum problema visual significativo.

---

### 7. `/cadastro` — Cadastro

**Status:** ✅ Renderiza corretamente

- **Layout:** Idêntico ao login (split-screen).
- **Formulário:** Nome Completo, E-mail, Senha, botão "Criar minha conta".
- **Link para login:** "Junte-se a nós ou faça login se já tem conta".
- **Qualidade:** Consistente com a página de login.

#### 🐛 Problemas:
- Nenhum problema visual significativo.

---

### 8. `/recuperar-senha` — Recuperar Senha

**Status:** ✅ Renderiza corretamente

- **Layout:** Split-screen consistente com login/cadastro.
- **Formulário:** Apenas campo de e-mail + botão "Enviar link de redefinição".
- **Link "Voltar ao login"** presente.
- **Qualidade:** Profissional.

#### 🐛 Problemas:
- Nenhum problema visual significativo.

---

### 9. `/equipe` — Equipe Técnica

**Status:** ✅ Renderiza corretamente

- **Conteúdo:** "Responsável Técnico" — Prof. Robson Alves.
- **Foto:** Imagem real do professor (robson-running.jpg).
- **Bio:** Detalhada com certificações (World Athletics Nível 1).
- **Qualidade:** Profissional e autêntico.

#### 🐛 Problemas:
- Nenhum problema visual significativo.

---

### 10. `/resultados` — Resultados

**Status:** ⚠️ Renderiza com problemas menores

- **Hero:** Texto + imagem de corrida real.
- **Estatísticas:** ~200 Atletas, +200 Corridas, 10+ Anos, 100% Foco em saúde.
- **Jornada do atleta:** Steps com ícones (Avaliação inicial, etc.).

#### 🐛 Problemas:
1. **Legibilidade das estatísticas:** Números em vermelho (#DC2626) sobre fundo bege claro — contraste pode ser insuficiente para acessibilidade (WCAG AA).

---

### 11. `/dashboard/*` — Área do Aluno (Todas as sub-rotas)

**Status:** 🔒 Redirecionam para `/login` (307)

Rotas testadas:
- `/dashboard` → 307 → `/login`
- `/dashboard/feed` → 307 → `/login`
- `/dashboard/treinos` → 307 → `/login`
- `/dashboard/fotos` → 307 → `/login`
- `/dashboard/perfil` → 307 → `/login`
- `/dashboard/comunicados` → 404 (rota não existe no filesystem)

O middleware de autenticação funciona corretamente, redirecionando usuários não autenticados.

---

### 12. `/admin/*` — Área Administrativa (Todas as sub-rotas)

**Status:** 🔒 Redirecionam para `/login` (307)

Rotas testadas:
- `/admin` → 307 → `/login`
- `/admin/membros` → 307 → `/login`
- `/admin/treinos` → 307 → `/login`
- `/admin/comunicados` → 307 → `/login`

O middleware de autenticação funciona corretamente.

---

## Problemas Globais

### 🔴 Críticos

| # | Problema | Páginas Afetadas | Impacto |
|---|---------|-----------------|---------|
| 1 | **3 imagens quebradas na galeria** — URLs do Unsplash retornam erro, exibindo ícone de imagem quebrada | `/galeria` | Visual quebrado, impressão amadora |
| 2 | **Imagens de stock irrelevantes** — Torre Eiffel, panquecas, natação em galeria de corrida | `/galeria` | Credibilidade zero, conteúdo enganoso |
| 3 | **Números de WhatsApp placeholder** — `5519900000000` e `5519999999999` são claramente falsos | Todas as páginas | Usuário não consegue contato |
| 4 | **Navegação por âncoras quebrada fora da home** — Links do header (#sobre, #modalidades) não funcionam em páginas internas | Todas exceto `/` | Navegação inutilizável em páginas internas |

### 🟡 Moderados

| # | Problema | Páginas Afetadas | Impacto |
|---|---------|-----------------|---------|
| 5 | **Páginas existentes inacessíveis pela navegação** — `/sobre`, `/galeria`, `/equipe`, `/resultados`, `/contato` existem mas não há links diretos no menu | Todas | Usuário não descobre essas páginas |
| 6 | **Botão "Comece Agora" inconsistente** — Header → `/cadastro`, Footer → `#modalidades` | Home | Confusão do usuário |
| 7 | **Rota `/historia` não existe** — Retorna 404 | `/historia` | Página esperada ausente |
| 8 | **H1 sem espaço entre palavras** para leitores de tela | `/` | Acessibilidade |
| 9 | **Contraste insuficiente** nas estatísticas de `/resultados` — vermelho sobre bege | `/resultados` | Acessibilidade WCAG |

### 🟢 Menores

| # | Problema | Páginas Afetadas |
|---|---------|-----------------|
| 10 | Rota `/dashboard/comunicados` não existe (404 em vez de redirect) | Dashboard |
| 11 | Instagram link aponta para `instagram.com/equipeborntorun` — verificar se existe | Footer |

---

## Avaliação por Viewport

### Mobile (375px)
**Nota: 8/10** — Responsividade geralmente boa. Header com hamburger, conteúdo empilhado, formulários adaptados. Filtros da galeria um pouco apertados mas funcionais.

### Tablet (768px)
**Nota: 8/10** — Navegação horizontal funcional. Layout intermediário bem adaptado. Login/cadastro mostram apenas formulário (sem painel lateral).

### Desktop (1440px)
**Nota: 7/10** — Layout completo e profissional. Problemas de conteúdo (imagens, WhatsApp) mais visíveis em tela grande. Navegação por âncoras funciona apenas na home.

---

## Avaliação de Design

### Pontos Positivos
- **Paleta de cores consistente:** Bege (#F9F7F5), vermelho (#DC2626), texto escuro (#1C1917) — identidade visual coerente.
- **Tipografia profissional:** Inter + Barlow Condensed — boa hierarquia e legibilidade.
- **Logo presente e correto** em todas as páginas.
- **Layout split-screen** nas páginas de auth (login/cadastro/recuperar-senha) — moderno e profissional.
- **Fotos reais da equipe** na home e equipe — autenticidade.
- **Footer completo** com informações de contato, redes sociais e links.
- **Responsividade sólida** — breakpoints bem definidos.

### Pontos Negativos
- **Galeria é o ponto mais fraco** — imagens de stock genéricas destroem a credibilidade.
- **Navegação é uma landing page** — não funciona como site multi-página.
- **Dados placeholder** (WhatsApp) indicam que o site não está pronto para produção.
- **Páginas internas órfãs** — existem mas não são acessíveis pela navegação.

---

## Recomendações para Reconstrução Visual

1. **Corrigir navegação:** Substituir âncoras (#sobre) por rotas reais (/sobre) no header e footer, ou criar um menu que combine ambos.
2. **Substituir imagens de stock:** Usar apenas fotos reais da equipe na galeria. Remover imagens irrelevantes (Torre Eiffel, panquecas, natação).
3. **Corrigir imagens quebradas:** Atualizar ou remover as 3 URLs do Unsplash que retornam erro.
4. **Atualizar números de WhatsApp:** Substituir placeholders por números reais.
5. **Unificar CTAs:** Garantir que "Comece Agora" tenha o mesmo destino em todo o site.
6. **Adicionar rota `/historia`** ou redirecionar para `/sobre`.
7. **Melhorar contraste** das estatísticas em `/resultados`.
8. **Adicionar espaço no H1** para acessibilidade (usar `\n` ou CSS em vez de `<br>` sem espaço).
9. **Criar menu de navegação completo** que inclua todas as páginas existentes (/sobre, /equipe, /galeria, /resultados, /contato).
10. **Verificar e corrigir** a rota `/dashboard/comunicados` que retorna 404 em vez de redirect.

---

*Relatório gerado em 17/07/2026 por inspeção visual automatizada.*
