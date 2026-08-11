# Testes e evidências

> Bloco 10: TypeScript aprovado, ESLint direcionado aprovado, Vitest 57/57, build Next.js 16.3 com 37 rotas e E2E público 28/28 em Desktop Chrome/Pixel 7 sem violações axe sérias/críticas. O CI final do PR é `31451093854` e o preview Vercel é `dpl_5iugxLc26VFU1F3gP59D8jQM9pKU`, ambos aprovados/`READY` no commit `131b879`.

## Baseline automatizado

- ESLint: aprovado.
- TypeScript: aprovado.
- Vitest: 48/48.
- Build Next.js 16.3.0: aprovado, 27 rotas.
- E2E público: 12/12 em Desktop Chrome e Pixel 7.
- axe: nenhuma violação séria/crítica no baseline.
- pgTAP: 56/56 asserções no preflight remoto do Bloco 1, com rollback integral confirmado.
- `npm audit`: zero vulnerabilidades conhecidas no baseline.

## CIs verdes do ciclo anterior

- `31275354335`
- `31275507684`
- `31276114847`
- `31276224015`

## Fluxos hospedados já validados

- login e erro de credencial;
- bloqueio de área interna sem sessão;
- publicação, curtida e comentário;
- painel administrativo;
- criação de grupo;
- treino dirigido ao atleta correto;
- limpeza dos dados técnicos ao final.

## Critério para o ciclo atual

Nenhum bloco será declarado concluído somente por compilar. Alterações de Auth/RLS/Storage exigem testes de autorização e Advisors; alterações de UI exigem desktop/mobile e console limpo; publicação exige CI, domínio e logs.

## Evidências do Bloco 9 — checkpoint local

- Supabase: três migrations aplicadas e catálogo de 9 migrations sincronizado.
- pgTAP remoto transacional: 72/72 — 49 comunidade, 7 ciclo histórico e 16 treinador/avaliações/convite.
- Convite de Robson: simulação transacional confirmou `coach/active` e consumo único; rollback deixou zero usuário artificial.
- ESLint: aprovado.
- TypeScript: aprovado.
- Vitest: 53/53.
- Build Next.js 16.3.0: aprovado, 34 rotas.
- Navegador: 24/24 casos comuns em dev e 2/2 PWA no build de produção; matriz funcional equivalente a 26/26.
- Axe: nenhuma violação séria/crítica nas páginas públicas cobertas.
- GitHub Actions da PR #15: run `31351998723`, concluída integralmente com sucesso.
- Preview Vercel da PR #15: `dpl_8PYatkCt2jUCQMKK1VjmwSVJkTTA`, `READY`, commit `c1f111a`.
- `vercel curl`: home 200; foto `team-race-palace.jpg`, seção de Robson e conteúdo atualizado confirmados no artefato remoto.
- Merge e auditoria de produção: pendentes neste checkpoint; ver arquivo `14`.
- CI final da PR #15: `31352323034`, aprovado integralmente.
- Merge: `0c17f86995a4e88e1a8d04a0d68b3242b5d3acc7`; CI de `main` `31352438060`, aprovado integralmente.
- Produção: `dpl_5Ef5i65VmCNTAQ1zGM2ZqRcqXJhe`, `READY`, health `0c17f86`, sem erro de alias.
- Inspeção desktop/mobile da home: foto e seção de Robson corretas, conteúdo não vazio e zero overlay de framework.
- Runtime Logs: zero warning/error/fatal no intervalo pós-publicação consultado.

## Evidências do Bloco 1

- `next typegen`: aprovado.
- ESLint: aprovado.
- TypeScript: aprovado.
- Vitest: 48/48.
- Build Next.js 16.3.0: aprovado, 27 rotas.
- Migration aplicada: `20260809021316_protege_metadados_e_referencias_de_midia`.
- Catálogo remoto: privilégios por coluna, RPC, helper, triggers e policies confirmados.
- Banco após aplicação: 1 perfil administrador, zero objetos técnicos no Storage.

## Evidências do Bloco 2

- Plano Supabase consultado pela API: `Free`.
- Oito templates validados, incluindo tokens de confirmação, recuperação, mudança de e-mail e reautenticação.
- `supabase/config.toml` foi carregado com sucesso pelo CLI; o comando parou somente ao procurar Docker, ausente no host.
- Callback explícito de confirmação adicionado ao cadastro.
- ESLint, TypeScript e Vitest 48/48 aprovados após as alterações.

## Evidências do Bloco 3

- `node --check public/sw.js`: aprovado.
- Manifesto: JSON válido e headers verificados.
- Build: aprovado, 31 rotas.
- E2E paralelo: 21/22; único timeout ambiental no fechamento do Chromium da home desktop.
- Repetição isolada do caso: aprovada.
- PWA/offline desktop e Pixel 7: 2/2.
- Axe em privacidade/termos desktop/mobile: 4/4, sem violações sérias/críticas.
- Cobertura funcional consolidada: 22/22.

## Evidências do Bloco 4

- `npm audit`: zero vulnerabilidades em 416 pacotes auditados pelo comando de instalação e zero vulnerabilidades no relatório completo.
- `npm run check`: ESLint, TypeScript, Vitest 48/48 e build Next.js 16.3.0 aprovados.
- Build: 31 rotas, incluindo `/api/health` dinâmico.
- E2E sobre `next start`: 24/24 em Desktop Chrome e Pixel 7.
- Health: resposta 200, JSON mínimo e `Cache-Control: no-store` nos dois projetos.
- Axe: nenhuma violação séria/crítica nas páginas cobertas.
- Vercel antes do novo commit: preview `dpl_HLmyjaZ9NQQjjwxw52kjh8tCEQeo` `READY`, zero clusters de runtime em sete dias e zero warning/error/fatal em 24 horas.
- Uma primeira execução E2E detectou 404 dos scripts de métricas fora da Vercel; a condição foi corrigida no servidor e a repetição completa passou 24/24.
- ESLint passou a ignorar corretamente os artefatos locais `playwright-report`, `test-results` e `coverage`.

## Evidências hospedadas do PR #2

- PR: https://github.com/samukkaneto/born-to-run/pull/2.
- GitHub Actions: run `31293700511`, `quality` aprovado em 1m38s.
- Vercel check: aprovado.
- Preview: `dpl_CjisHx5g4zL8Q2gDqABQkuDNwtfK`, commit `4dae905`, 31 rotas e build `READY`.
- `vercel curl` com bypass oficial: `/`, `/login`, `/cadastro`, `/privacidade`, `/manifest.json`, Analytics e Speed Insights responderam 200; `/dashboard` anônimo respondeu 307; `/api/health` respondeu 200 com revisão `4dae905`.
- Build remoto: Next.js 16.3.0 compilado, TypeScript concluído e 31 páginas geradas.
- Runtime: zero clusters de erro em uma hora e zero warning/error/fatal no deployment consultado.
- Supabase final: seis migrations, 1 `admin/active`, zero órfãos, zero conteúdo/Storage e RLS habilitada nas nove tabelas de negócio.

## Auditoria final e produção

- Diff completo `46001fa...61e3888`: `git diff --check` aprovado; nenhum segredo, `.env` privado ou artefato de build versionado.
- PR #2: mergeável, sem P0/P1 e checks finais verdes no commit `61e3888`.
- CI final do PR: run `31294328656`, aprovado.
- Merge: commit `7f66eb82db99ddbbb2edc33b26c579225509a8e6` em `main`.
- CI do merge: run `31314115269`, aprovado.
- Produção: `dpl_4SjYHKJriBnHY82Q8qYpzfjt7aYB`, `READY/PROMOTED`, build Next.js 16.3.0 com TypeScript e 31 rotas.
- Domínio canônico: home, login, cadastro, privacidade, termos, instalação, manifesto, service worker, Analytics e Speed Insights responderam 200.
- Guarda: `/dashboard` anônimo respondeu 307 para `/login?next=%2Fdashboard`.
- Health: 200, `no-store`, revisão `7f66eb8` e headers de segurança esperados.
- Runtime pós-release: zero clusters de erro e zero warning/error/fatal no deployment consultado.

## Bloco perfis/Tanita/treinos — 11/08/2026

- grant remoto de `team_joined_at` confirmado para `authenticated`;
- consultas equivalentes ao app aprovadas para administrador e treinador;
- 16 migrations remotas, terminando em `20260811163511`;
- teste transacional provou avaliações para os dois papéis técnicos com rollback;
- pgTAP novo: 10/10;
- TypeScript: aprovado;
- ESLint completo: aprovado;
- Vitest: 64/64;
- build Next.js 16.3: aprovado, 38 rotas;
- Playwright completo: 28/28 em Desktop Chrome e Pixel 7; as rotas públicas cobertas não apresentaram violações axe sérias/críticas.
- PR #25: CI `31516494439` aprovado; merge: CI `31516776891` aprovado.
- Produção `dpl_42CnrorJzo91kgQGYVKGeSQXbRPA` `READY`; health em `119bc64`; zero logs `error`/`fatal` na janela auditada.
