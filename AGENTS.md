<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Born to Run — instruções para agentes

Leia este arquivo antes de alterar o projeto. As fontes atuais são:

1. `docs/ABACUS_AI_HANDOFF/00-LEIA-PRIMEIRO.md` — pacote canônico de entrega e retomada por IA.
2. `README-FABLE5.md` — produto, direção visual e briefing para Abacus/Fable.
3. `CURRENT_IMPLEMENTATION_STATUS.md` — estado técnico, evidências e pendências.

Os documentos de auditoria/reconstrução datados de julho de 2026 são registros históricos. Eles não descrevem o código atual.

## Produto

Born to Run é o site institucional e o aplicativo privado da equipe Born to Run — Treinamento e Saúde. A área interna é uma comunidade esportiva fechada com feed, fotos, métricas, curtidas, comentários, comunicados, treinos privados e avaliações de bioimpedância.

Garmin Connect, Strava e Sports Tracker são referências de experiência. Não implementar integrações nesta fase sem uma decisão nova e explícita.

## Dados oficiais

- Fundação em 2015, Descalvado — SP.
- Mais de 200 participações em corridas.
- Instagram `@equipeborntorun`.
- Robson Alves — Educador Físico, CREF 119911-G/SP.
- Especialização em corridas de meio-fundo e fundo; Treinador Nível 1 World Athletics.

Não inventar telefone, WhatsApp, endereço, e-mail, CNPJ, depoimentos, atletas, provas, resultados, títulos, patrocinadores ou eventos.

## Contratos técnicos que não podem ser enfraquecidos

- Novos cadastros ficam `pending`; conteúdo privado exige `membership_status = active`.
- Papéis são `member`, `coach` e `admin`; somente o administrador define o único treinador e nenhum cliente atualiza `role` ou status diretamente.
- Operações administrativas usam RPCs e checagem server-side.
- RLS permanece habilitado em todas as tabelas de negócio.
- `avatars` e `post-images` são privados; o código guarda paths e usa URLs assinadas.
- Somente o treinador publica treinos; todo treino exige grupo ou atleta destinatário e não é visível ao administrador.
- Avaliações físicas são privadas entre treinador e atleta avaliado.
- `proxy.ts` é a convenção ativa do Next 16; não recriar `middleware.ts`.
- As migrations até `20260811163511_permite_avaliacao_de_todos_perfis_ativos.sql` já foram aplicadas. Nunca editar ou reaplicar migrations registradas; mudanças futuras entram em uma nova migration timestampada.
- Tipos de treino têm semântica fixa: azul-claro descanso, amarelo contínuo, roxo intervalado rápido, verde leve/moderado, mostarda potência aeróbia e vermelho competição.
- Nunca expor `service_role`, segredos ou arquivos `.env*`.

## Arquivos sensíveis

Mudanças visuais podem ter liberdade ampla, mas alterações nestes caminhos exigem revisão técnica e testes:

- `supabase/migrations/`, `supabase/schema.sql`, `supabase/tests/`;
- `types/database.types.ts`;
- `lib/auth/`, `lib/actions/`, `lib/supabase/`;
- `proxy.ts` e layouts protegidos.

## Stack e comandos atuais

- Next.js 16.3.0, React 19.2.4, TypeScript, Tailwind CSS 4 e Supabase.
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- `npm run test:e2e`
- `npm run build`
- `npm run check`

Não declarar uma função concluída somente porque a tela renderiza. Validar erros, autorização, loading/vazio/sucesso, mobile/desktop e o gate automatizado adequado.

## Direção visual

Preservar a linguagem premium da Fable 5: editorial esportivo, off-white, carbono e vermelho Born to Run, fotografia real, mobile-first e WCAG AA. Evitar visual genérico de SaaS, neon, glassmorphism e conteúdo fictício.

Interface e mensagens ao usuário são em português do Brasil. Código e identificadores podem permanecer em inglês.
