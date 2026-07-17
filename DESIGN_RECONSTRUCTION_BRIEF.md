# DESIGN_RECONSTRUCTION_BRIEF.md — Brief de Reconstrução Visual

> Direção visual completa para a reconstrução do **Born to Run — Treinamento e Saúde**. Este brief define a identidade, os tokens, os componentes e os estados de tela. É a referência da **Fase 3 (Design System)** e das fases de UI do `FABLE_REBUILD_PLAN.md`. **Objetivo:** um visual esportivo, humano e confiável — não um SaaS genérico.

## Princípios de design

1. **Claro, não escuro.** Fundo branco/off-white, texto escuro. **Light mode é a aparência principal.**
2. **Vermelho é a marca.** Vermelho como cor de ação/energia; verde como apoio (saúde/positivo); laranja apenas como detalhe pontual.
3. **Humano e real.** Fotos reais da equipe, linguagem próxima, nada de bancos de imagem fora de contexto.
4. **Mobile-first.** A maioria dos atletas usa o celular; desenhe para 375px primeiro.
5. **Discreto e sólido.** Sombras suaves, cantos arredondados moderados, hierarquia clara. Sem exageros visuais.

---

## 1. Problemas Visuais Atuais (a corrigir)

- **Galeria com imagens de banco fora de contexto** (Torre Eiffel, panquecas, natação, academia) e **3 URLs quebradas** → credibilidade zero.
- **Contatos placeholder** (dois WhatsApps falsos, e-mails fictícios).
- **Navegação por âncoras** (`#sobre`) que só funciona na home; páginas internas órfãs.
- **Estilo quebrado** em páginas internas por classes utilitárias custom indefinidas.
- **Estatísticas fictícias** ("500+", "98%") que contradizem os dados oficiais.
- **Contraste insuficiente** em estatísticas (vermelho sobre bege).
- **H1 sem espaço** entre palavras (acessibilidade).
- **Inconsistência tipográfica** (Inter/Barlow vs Outfit).
- **CTAs divergentes** ("Comece Agora" com destinos diferentes).

---

## 2. Proposta de Identidade

- **Personalidade:** esportiva, acolhedora, profissional, local (Descalvado-SP), autêntica.
- **Tom visual:** energia (vermelho) equilibrada com saúde/leveza (verde e neutros claros).
- **Referências de sensação:** clube de corrida real, foco em pessoas comuns melhorando de vida — não fitness "hardcore" nem tech frio.
- **Logo:** PNG transparente oficial, sempre sobre fundo claro, sem distorção, com área de respiro mínima ao redor. Nunca esticar, recolorir ou aplicar sombra pesada.

---

## 3. Tipografia

| Uso | Fonte | Observações |
|---|---|---|
| Títulos / display | **Barlow Condensed** | condensada, atlética; para H1–H3 e números de destaque |
| Corpo / UI | **Inter** | legível, neutra; para parágrafos, labels, botões |

- **Remover** a referência a `Outfit` (só existe no `tailwind.config.ts` morto).
- Escala sugerida (mobile → desktop): H1 32→48px, H2 24→36px, H3 20→28px, corpo 16px, legenda 13–14px.
- Peso: títulos 600–700; corpo 400–500. Altura de linha confortável (1.4–1.6 no corpo).

---

## 4. Cores (tokens)

Base já existente em `globals.css` (`--color-btr-*`). Consolidar assim:

| Papel | Token | Hex |
|---|---|---|
| Vermelho principal | `--color-btr-red` | `#DC2626` |
| Vermelho escuro (hover) | `--color-btr-red-dark` | `#B91C1C` |
| Vermelho claro (fundo suave) | `--color-btr-red-light` | `#FEE2E2` |
| Verde secundário | `--color-btr-green` | `#16A34A` |
| Verde escuro | `--color-btr-green-dark` | `#15803D` |
| Laranja (detalhe pontual) | `--color-btr-orange` | `#EA580C` |
| Off-white (fundo) | `--color-btr-offwhite` | `#F9F7F5` |
| Branco (cards) | `--color-btr-white` | `#FFFFFF` |
| Texto principal | `--color-btr-stone-900` | `#1C1917` |
| Texto secundário | `--color-btr-stone-600` | `#57534E` |
| Bordas | `--color-btr-stone-200` | `#E7E5E4` |

**Regras de cor:**
- Vermelho para ações primárias, destaques e energia — com moderação (não tingir tudo de vermelho).
- Verde para sucesso, saúde e ações positivas secundárias.
- Laranja **só** para detalhes pontuais (badge/realce ocasional), nunca como base.
- **Contraste:** garantir AA. Números/estatísticas em vermelho **não** devem ficar sobre bege claro sem reforço (usar texto escuro + acento vermelho, ou vermelho mais escuro).
- **Proibido:** dark mode principal, gradientes arco-íris, neon, cores saturadas em excesso.

---

## 5. Grid, Layout e Espaçamentos

- **Container:** `max-w-7xl` centralizado, padding lateral `px-4` (mobile) → `px-6/8` (desktop) — já existe `.container-main`.
- **Grid:** 4/8/12 colunas conforme viewport; cards em grid responsivo (1 col mobile → 2–3 tablet → 3–4 desktop).
- **Escala de espaçamento** (base 4px): 4, 8, 12, 16, 24, 32, 48, 64. Seções com respiro vertical generoso (48–80px).
- **Raios:** `sm 6px`, `md 8px`, `lg 12px`, `xl 16px`, `2xl 24px` (já em tokens).

---

## 6. Botões

Definir como classes reais (hoje ausentes):

- **`btn-primary`:** fundo vermelho, texto branco, hover vermelho-escuro, foco com ring vermelho, cantos `lg`, padding confortável para toque (mín. 44px de altura).
- **`btn-secondary`:** fundo verde, texto branco (para ações positivas secundárias).
- **`btn-outline`:** borda + texto vermelho, fundo transparente, hover com fundo vermelho-claro.
- Estados: hover, focus-visible (ring), disabled (opacidade + cursor), loading (spinner + texto).
- Ícones (lucide-react) alinhados ao texto, tamanho coerente (16–20px).

---

## 7. Cards

- **`card`:** fundo branco, borda sutil (`stone-200`), sombra discreta, raio `lg/xl`, padding interno consistente.
- **`card-lift`** (hover): leve elevação (`-translate-y-1` + sombra maior) — já existe.
- Uso: modalidades, treinos, posts do feed, comunicados, membros.
- **`badge`** e variantes (`badge-red/green/orange/gray`): pílulas pequenas para nível de treino, status, categorias.

---

## 8. Navegação

- **Header público:** logo à esquerda; links de **rotas reais** (Início, Sobre, Equipe, Galeria, Resultados, Contato); CTA "Entrar" e "Comece Agora" (destino único = `/cadastro`); menu hambúrguer no mobile.
- **Âncoras** só para seções internas da home; nunca como navegação entre páginas.
- **Footer:** logo, navegação secundária, redes (Instagram real `@equipeborntorun`), contatos **reais ou marcados como pendência**, sem placeholders falsos.
- **Sidebar do dashboard:** apenas rotas válidas (`/dashboard`, feed, treinos, comunicados, perfil); item ativo destacado.
- **Bottom nav mobile** no dashboard para acesso rápido.

---

## 9. Dashboard (aluno)

- Tela inicial com **resumo**: próximos treinos, últimos comunicados, atalho ao feed e ao perfil.
- Cards claros, hierarquia por seção, saudação personalizada (nome do aluno).
- Estados vazios amigáveis ("Você ainda não tem treinos designados").

---

## 10. Feed

- **PostCard:** avatar + nome + tempo relativo; foto (se houver); legenda; métricas (distância/tempo/pace) em badges; ações **curtir/comentar** com contadores reais e estado ativo (coração preenchido quando curtido).
- **Criar post:** campo de legenda, upload de foto (preview), métricas opcionais; feedback de sucesso/erro.
- **Comentários:** lista enxuta, input com envio; respeitar limite de 500 chars do schema.
- Estado vazio ("Seja o primeiro a publicar um treino!").

---

## 11. Perfis

- Foto (avatar) com upload e preview; nome, cidade, objetivo, bio.
- Formulário único (consolidar `PerfilForm`/`ProfileForm`).
- Exibir avatar padrão com iniciais quando não houver foto.

---

## 12. Admin (painel do treinador)

- Layout limpo, foco em produtividade: contadores no topo, listas com ações claras.
- Formulários (treino/comunicado) com o design system (hoje com classes indefinidas).
- Ações destrutivas (remover membro/treino) com **modal de confirmação** e feedback.
- Diferenciação visual sutil entre área admin e área do aluno (ex.: rótulo "Painel do Treinador").

---

## 13. Mobile vs Desktop

- **Mobile (375px):** navegação em hambúrguer + bottom nav no dashboard; cards empilhados; toques ≥44px; galeria em 1–2 colunas.
- **Tablet (768px):** navegação horizontal; grids de 2–3 colunas.
- **Desktop (1440px):** layout completo; split-screen nas telas de auth; grids de 3–4 colunas.
- Testar sempre nos três viewports antes de concluir uma tela.

---

## 14. Estados Vazios

- Ilustração/ícone simples + mensagem curta + CTA quando aplicável.
- Exemplos: feed sem posts, sem treinos designados, sem comunicados, galeria sem fotos reais (placeholder honesto, não imagem de banco).
- Tom acolhedor e específico ao contexto.

---

## 15. Carregamentos (loading)

- **Skeletons** para listas (feed, treinos, membros) — não spinners genéricos em tela cheia.
- `loading.tsx` por rota (hoje ausente) para transições suaves.
- Botões em estado de loading durante submissão (desabilitados + spinner).

---

## 16. Erros

- `error.tsx` (boundary) e `not-found.tsx` customizados com a identidade da marca.
- Mensagens claras e em português, com ação de recuperação ("Tentar novamente", "Voltar ao início").
- Feedback inline em formulários (campo a campo), não só alertas genéricos.
- Nunca falha silenciosa (ex.: remover membro deve informar sucesso/erro).

---

## 17. Microinterações

- Transições suaves (150–300ms) em hover/focus e mudanças de estado.
- Animações já disponíveis: `animate-fade-in`, `animate-slide-up`, `animate-scale-in`, `card-lift`, `heading-accent`.
- Feedback tátil visual em ações (curtir, enviar, salvar).
- Moderação: animação a serviço da clareza, sem excessos que distraiam.

---

## 18. Acessibilidade (WCAG AA)

- Contraste mínimo AA em texto e componentes; revisar vermelho sobre bege.
- Foco visível (ring) em todos os elementos interativos; navegação por teclado completa.
- `alt` significativo em imagens; `aria-label` em botões só com ícone.
- Labels associados a todos os inputs; mensagens de erro anunciáveis.
- Corrigir o H1 da home (espaço real entre palavras para leitores de tela).
- Respeitar `prefers-reduced-motion` nas animações.

---

## 19. Checklist Visual de Conclusão

- [ ] Todas as classes utilitárias custom definidas (nada indefinido).
- [ ] Light mode padrão; sem dark mode principal, neon ou gradientes arco-íris.
- [ ] Vermelho/verde/laranja aplicados conforme as regras de cor.
- [ ] Tipografia unificada (Inter + Barlow Condensed; sem Outfit).
- [ ] Navegação por rotas reais; nenhuma página órfã.
- [ ] Galeria só com fotos reais/placeholders honestos; zero imagem quebrada.
- [ ] Contatos reais ou marcados como pendência (sem placeholders falsos).
- [ ] Estados vazios, loading (skeletons) e erro cobertos.
- [ ] Responsivo e acessível (AA) nos três viewports.

---

*Fim do DESIGN_RECONSTRUCTION_BRIEF.md.*
