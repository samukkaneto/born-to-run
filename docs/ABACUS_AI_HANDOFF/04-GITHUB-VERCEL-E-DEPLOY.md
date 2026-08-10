# GitHub, Vercel e deploy

## GitHub

- Repositório: `https://github.com/samukkaneto/born-to-run`
- Branch padrão: `main`
- Baseline: `46001fa5a1ebc16fb28cdb742d21e66f77ccc8a6`
- PR de reconstrução: `#1`, mesclado.
- PR do ciclo de prontidão: `#2`, auditado, marcado pronto e mesclado em `main` no commit `7f66eb82db99ddbbb2edc33b26c579225509a8e6`.
- Workflow: `.github/workflows/ci.yml`.
- Dependabot: npm e GitHub Actions, semanal.
- Relato privado de segurança: `SECURITY.md` e GitHub Security Advisory.
- Bloco 9: PR [#15](https://github.com/samukkaneto/born-to-run/pull/15), commit funcional `c1f111a`, CI inicial `31351998723` verde.
- Fechamento do Bloco 9: PR #15 mesclada em `main` no commit `0c17f86995a4e88e1a8d04a0d68b3242b5d3acc7`; CI final da PR `31352323034` e CI do merge `31352438060` verdes.

## Vercel

- Equipe: `shabuneto`
- Projeto: `born-to-run`
- Project ID: `prj_yvAfSxZgL4nNZuwq1R0WK9JOT5Hx`
- Domínio: https://born-to-run-seven.vercel.app
- Branch de produção: `main`
- Integração Git ligada ao repo ID atual `1304308095`.
- Preview final auditado: `dpl_C1PtqEHA9cYT6qbpNy6pPwRv8qTF`, `READY`, commit `61e3888`.
- Produção do ciclo: `dpl_4SjYHKJriBnHY82Q8qYpzfjt7aYB`, `READY/PROMOTED`, commit verificado `7f66eb8` da branch `main`.
- Auditoria pós-release em 09/08/2026: zero clusters de erro e zero warning/error/fatal no deployment consultado.
- Web Analytics: habilitado remotamente e com ID configurado.
- Speed Insights: configurado; a instrumentação já chegou à produção e começará a formar histórico com visitas reais.
- Plano Vercel: Hobby; previews protegidos e domínio customizado público.
- Preview do Bloco 9: `dpl_8PYatkCt2jUCQMKK1VjmwSVJkTTA`, `READY`, commit `c1f111a`, URL protegida `https://born-to-qlnisgqpt-shabuneto.vercel.app`.
- Preview final documental: `dpl_A5j5aEmoEebST2DeYkmQiAUXPwfw`, `READY`, commit `5229bbb`.
- Produção atual: `dpl_5Ef5i65VmCNTAQ1zGM2ZqRcqXJhe`, `READY`, target `production`, commit `0c17f86`, domínio `https://equipeborntorun.com`.
- Smoke/visual pós-release: home, Sobre, cadastro, login e health 200; rotas privadas 307; desktop/mobile sem overlay; logs sem warning/error/fatal.

Variáveis públicas cadastradas, sem registrar valores nesta documentação:

- `NEXT_PUBLIC_SUPABASE_URL`: Production, Preview e Development;
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Production, Preview e Development;
- `NEXT_PUBLIC_SITE_URL`: Production.

Não adicionar `service_role` ou qualquer segredo em variável `NEXT_PUBLIC_*`.

## Baselines de rollback

- `dpl_A2GZxDdUvqphcLt8MYrCYvdq4Zuz`: baseline Git automático anterior ao ciclo, ainda `READY` e candidato conhecido de rollback.
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

O endpoint `/api/health` e as métricas Vercel passam a integrar o gate do Bloco 4. Ambos os produtos de métricas estão habilitados/configurados no projeto.
