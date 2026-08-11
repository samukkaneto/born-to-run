# Born to Run — briefing oficial para Abacus AI / Fable 5

> Se esta execução do Fable 5 estiver no supercomputador isolado da Abacus AI e não possuir histórico, leia primeiro `docs/ABACUS_AI_HANDOFF/15-CONTEXTO-COMPLETO-PARA-IA-SEM-HISTORICO.md`. Abacus AI é a plataforma; Fable 5 é o modelo. O proprietário concede carta branca visual e espera uma reformulação premium substancial, não apenas retoques.

Este é o documento principal de contexto visual e de produto. Ele deve ser lido junto das seis pranchas presentes em `design-refs/`, do status técnico em `CURRENT_IMPLEMENTATION_STATUS.md` e do índice de entrega `docs/ABACUS_AI_HANDOFF/00-LEIA-PRIMEIRO.md`.

## 1. O produto que deve ser construído

Born to Run é o aplicativo privado da equipe de corrida **Born to Run — Treinamento e Saúde**. Ele combina três experiências:

1. **Comunidade esportiva fechada:** somente pessoas aprovadas pela equipe entram na área interna.
2. **Rede social de treinos:** atletas publicam treinos e fotos, acompanham o feed, curtem, comentam e veem a evolução dos colegas.
3. **Canal treinador–atleta:** o treinador prescreve treinos privados para grupos ou atletas específicos e registra avaliações físicas; o administrador publica comunicados.

Garmin Connect, Strava e Sports Tracker são **referências de experiência e organização**, especialmente para feed, atividade esportiva e interação social. Eles **não são integrações obrigatórias nesta fase**. Não implementar importação de treinos ou APIs dessas plataformas agora.

## 2. Natureza do aplicativo

O produto deve parecer e se comportar como um aplicativo esportivo nativo premium, principalmente no celular:

- navegação simples, persistente e apropriada para uso com uma mão;
- feed social como parte central da experiência;
- estados de toque, loading, vazio, sucesso e erro completos;
- hierarquia visual forte, conteúdo escaneável e controles com pelo menos 44–48 px;
- experiência responsiva também disponível pelo navegador no desktop;
- manifesto de PWA presente; instalação, offline e notificações ainda precisam de uma fase própria de validação.

O site institucional público e o aplicativo privado fazem parte do mesmo projeto, mas têm funções diferentes. O site apresenta a equipe; a área autenticada é o produto usado diariamente pelos atletas e treinador.

## 3. Liberdade criativa da Fable 5

A Fable 5 tem liberdade para elevar composição, grid, tipografia, densidade, componentes, microinterações e responsividade. As pranchas são uma **direção de qualidade**, não uma obrigação de cópia pixel a pixel.

Não alterar, remover ou simular funcionalidades para acomodar o layout. O design deve representar corretamente:

- cadastro com aprovação pendente;
- conta ativa, suspensa e rejeitada;
- feed com foto opcional, métricas, curtidas e comentários;
- treinos privados destinados a grupos ou atletas;
- grupos administrados pelo treinador;
- comunicados;
- perfil, evolução esportiva e avaliações de bioimpedância;
- painel do treinador com aprovação, treinos e avaliações;
- painel administrativo separado para papéis, acessos e comunicados.

Preservar os contratos e regras de segurança do Supabase. Mudanças visuais não devem reintroduzir atualizações diretas de papel/status, buckets públicos ou acesso interno para qualquer usuário apenas autenticado.

## 4. Pranchas incluídas no repositório

As imagens são seis arquivos PNG separados em `design-refs/`; elas não ficam incorporadas dentro deste Markdown. Não é necessário enviá-las separadamente quando a Abacus AI tiver acesso ao repositório completo. Se apenas este arquivo `.md` for enviado, anexe também a pasta `design-refs/`.

1. `01-brand-home-design-system.png` — identidade, homepage desktop/mobile, header, footer, tokens e componentes.
2. `02-authentication-flow.png` — login, cadastro, recuperação, redefinição e estados de formulário.
3. `03-athlete-dashboard-feed-navigation.png` — dashboard, feed, sidebar e bottom navigation.
4. `04-workouts-announcements-profile.png` — treinos, comunicados, perfil e estados de interface.
5. `05-public-pages-responsive-menu.png` — Sobre, Equipe, Galeria, Contato e menu responsivo.
6. `06-admin-coach-panel.png` — visão geral admin, treinos, comunicados, membros, modal, confirmação e mobile.

## 5. Direção visual desejada

- Editorial esportivo premium, autêntico, enérgico e humano; evitar aparência de SaaS genérico.
- Off-white `#F7F4EF`, carbono `#171717`, vermelho `#DC2626`, verde `#16A34A` e laranja são referências da identidade atual, não uma prisão criativa. A Fable pode refinar tokens, contrastes e proporções mantendo reconhecimento da marca.
- Títulos condensados atléticos; texto de interface neutro e altamente legível.
- Fotografia real da equipe com recortes editoriais; não alterar identidades.
- Grades assimétricas, linhas técnicas/rotas, bordas finas, sombras contidas e raios de 8–12 px.
- Mobile-first em 375–390 px, contraste WCAG AA, foco visível e redução de movimento respeitada.
- O feed deve ter a fluidez de uma rede social, sem perder a personalidade da equipe de corrida.

## 6. Conteúdo oficial obrigatório

- Born to Run — Treinamento e Saúde.
- Fundação em 2015, Descalvado — SP.
- Mais de 200 participações em corridas.
- Instagram: `@equipeborntorun`.
- Robson Alves — Educador Físico, CREF 119911-G/SP.
- Especialização em corridas de meio-fundo e fundo; Treinador Nível 1 World Athletics.

## 7. Conteúdo que não pode ser inventado

As pranchas são mockups gerados por IA. Textos de cards, datas, métricas, avisos, eventos e mensagens nelas são somente demonstrações espaciais.

É proibido inventar telefone, WhatsApp, endereço, e-mail, CNPJ, depoimentos, atletas, provas, resultados, títulos, patrocinadores ou eventos. Use os dados oficiais acima e placeholders neutros até validação do cliente.

## 8. Prompt-base visual

`Crie uma interface premium para uma equipe brasileira real de corrida, combinando revista esportiva editorial e aplicativo de performance. A área interna é uma comunidade fechada com feed social, fotos, métricas, curtidas, comentários, treinos privados prescritos pelo treinador para grupos ou atletas e avaliações de bioimpedância privadas entre treinador e atleta. Use fotografia autêntica, grid assimétrico, títulos condensados, off-white, carbono e vermelho Born to Run. Produza layouts desktop e mobile implementáveis em Next.js/Tailwind, com navegação acessível e estados completos. Evite SaaS genérico, glassmorphism, neon e dados inventados.`

Geração das pranchas realizada pelo Codex com o logotipo e fotografias reais do repositório como referências visuais.

## 9. Fonte da verdade e proteção técnica

`README-FABLE5.md` define o produto e a direção visual. `CURRENT_IMPLEMENTATION_STATUS.md` define o estado técnico atual. Os documentos de auditoria e reconstrução datados de julho de 2026 são registros históricos e não devem ser usados como descrição do código atual.

A Fable 5 pode redesenhar componentes, composição, tipografia, navegação e microinterações, mas não deve remover ou substituir sem revisão técnica:

- `supabase/migrations/`, `supabase/schema.sql` e `supabase/tests/`;
- `types/database.types.ts`;
- `lib/auth/`, `lib/actions/` e `lib/supabase/`;
- `proxy.ts`;
- regras de RLS, buckets privados e RPCs administrativas.

## 10. Estados obrigatórios no redesign

O visual final deve representar em desktop e mobile:

1. visitante público;
2. cadastro aguardando aprovação;
3. cadastro rejeitado;
4. membro suspenso;
5. membro ativo;
6. feed vazio, carregando, com erro e com publicações;
7. publicação com foto, métricas, curtidas e comentários;
8. treino privado destinado a grupos ou atletas;
9. grupo ativo e arquivado;
10. painel com pendências de aprovação;
11. avaliação mais recente e histórico físico privado;
12. separação visual entre administrador e treinador.

Não esconder estados nem remover controles apenas para simplificar o layout.

### Mapa completo de telas

- Institucional: `/`, `/sobre`, `/historia`, `/resultados`, `/equipe`, `/galeria` e `/contato`.
- Autenticação e acesso: `/login`, `/cadastro`, `/recuperar-senha`, `/recuperar-senha/nova`, `/acesso`, `/acesso-pendente` e `/acesso-bloqueado`.
- Atleta: `/dashboard`, `/dashboard/feed`, `/dashboard/treinos`, `/dashboard/avaliacoes`, `/dashboard/comunicados`, `/dashboard/perfil` e `/dashboard/membros/[id]`.
- Treinador: `/admin`, `/admin/membros`, `/admin/treinos` e `/admin/avaliacoes`, incluindo grupos.
- Administrador: `/admin`, `/admin/membros` e `/admin/comunicados`.
- Sistema: loading, vazio, erro, acesso negado e página não encontrada.

## 11. Limitações atuais que o visual não deve mascarar

- O feed já possui paginação keyset por cursor. A otimização da renovação/cache de URLs assinadas pode evoluir quando houver volume real.
- A avaliação física já possui indicadores e histórico; gráficos e tendências são visão futura e não devem ser apresentados como existentes.
- Notificações push, funcionamento offline completo e integrações Garmin/Strava não fazem parte da entrega atual.
- A implementação atual é um Next.js responsivo e instalável como PWA, já validado em desktop e mobile. Ela não gera APK e ainda não existe aplicativo nativo publicado na App Store ou Google Play; essa será uma fase posterior.

## 12. Direção específica para o login

- O login não deve voltar a usar uma grande faixa preta com o logotipo reduzido.
- Usar fotografia real da equipe como ambiente, com tratamento que preserve contraste e leitura.
- Exibir o logotipo oficial completo, grande e sem redesenho, usando `public/logo.png`. A adaptação `public/brand/logo-on-light.png` foi reprovada e não deve ser utilizada.
- A implementação local de referência está documentada em `docs/ABACUS_AI_HANDOFF/18-LOGIN-E-IDENTIDADE-DE-EMAIL.md`. A Fable 5 pode superá-la visualmente, preservando formulário, acessibilidade e contratos de autenticação.
