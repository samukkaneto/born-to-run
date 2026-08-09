# GitHub, Vercel e deploy

## GitHub

- Repositório: `https://github.com/samukkaneto/born-to-run`
- Branch padrão: `main`
- Baseline: `46001fa5a1ebc16fb28cdb742d21e66f77ccc8a6`
- PR de reconstrução: `#1`, mesclado.
- Workflow: `.github/workflows/ci.yml`.
- Dependabot: npm e GitHub Actions, semanal.
- Relato privado de segurança: `SECURITY.md` e GitHub Security Advisory.

## Vercel

- Equipe: `shabuneto`
- Projeto: `born-to-run`
- Project ID: `prj_yvAfSxZgL4nNZuwq1R0WK9JOT5Hx`
- Domínio: https://born-to-run-seven.vercel.app
- Branch de produção: `main`
- Integração Git ligada ao repo ID atual `1304308095`.
- Preview PWA/LGPD: `dpl_HLmyjaZ9NQQjjwxw52kjh8tCEQeo`, `READY`, commit `c007fb9`.
- Auditoria em 09/08/2026: zero clusters de erro em sete dias e zero warning/error/fatal nas últimas 24 horas consultadas.

Variáveis públicas cadastradas, sem registrar valores nesta documentação:

- `NEXT_PUBLIC_SUPABASE_URL`: Production, Preview e Development;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Production, Preview e Development;
- `NEXT_PUBLIC_SITE_URL`: Production.

Não adicionar `service_role` ou qualquer segredo em variável `NEXT_PUBLIC_*`.

## Baselines de rollback

- `dpl_A2GZxDdUvqphcLt8MYrCYvdq4Zuz`: baseline Git automático no início deste ciclo.
- `dpl_BEEAsWK34yBunpBXvGUgznbQzDKk`: baseline manual anterior, validado e `READY` no último check.
- `dpl_3GyqEDBXYJcqndUWVRZGSzviMDik`: versão histórica anterior à reconstrução.

## Fluxo de publicação

1. trabalhar em branch `codex/*`;
2. executar gates locais;
3. revisar diff e segredos;
4. push e PR;
5. aguardar GitHub Actions;
6. validar preview/deployment;
7. mesclar em `main` somente com gates verdes;
8. conferir aliases, respostas HTTP e logs de produção.

O endpoint `/api/health` e as métricas Vercel passam a integrar o gate do Bloco 4. Web Analytics e Speed Insights exigem habilitação no painel do projeto além dos componentes já versionados.
