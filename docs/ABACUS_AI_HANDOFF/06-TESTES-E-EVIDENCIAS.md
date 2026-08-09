# Testes e evidências

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
