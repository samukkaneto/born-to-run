# Status técnico atual

Baseline registrado em 08/08/2026 no início do ciclo de prontidão para piloto.

## Produção

- Site: https://born-to-run-seven.vercel.app
- GitHub: `samukkaneto/born-to-run`
- Branch de produção: `main`
- Baseline de código: `46001fa5a1ebc16fb28cdb742d21e66f77ccc8a6`
- Deployment do baseline: `dpl_A2GZxDdUvqphcLt8MYrCYvdq4Zuz`, `READY` e `PROMOTED`
- Supabase: `nmcaejrmmfffzeclmuob`, `ACTIVE_HEALTHY`

## Estado por área

| Área | Estado no baseline |
|---|---|
| Institucional | Implementado e publicado |
| Comunidade fechada | Implementada e protegida por RLS |
| Feed social | MVP funcional com Storage privado e paginação |
| Painel do treinador | Implementado |
| Grupos e treinos dirigidos | Implementados |
| CI/CD | GitHub Actions e GitHub→Vercel funcionando |
| Supabase | Seis migrations aplicadas e 1 admin ativo |
| SMTP próprio | Código, templates e runbook prontos; ativação remota depende de domínio/provedor/credenciais |
| Senhas vazadas | Bloqueada pelo plano Free; ativar após upgrade Pro |
| Privacidade de metadados de revisão | Resolvida no Bloco 1 |
| Existência física de mídia | Resolvida no Bloco 1 |
| PWA instalável/offline/push | Instalação e offline público entregues; push não implementado |
| Aplicativo nativo em lojas | Não iniciado |

## Banco no baseline

- 1 usuário Auth;
- 1 perfil `admin/active`;
- zero órfãos;
- zero posts, comentários, curtidas, comunicados, grupos, integrantes, treinos e atribuições técnicas.

## Veredito

O produto está pronto como MVP web publicado. Os Blocos 1–3 elevaram banco, Auth preparado, PWA instalável e transparência LGPD. Permanecem dependências externas de plano/SMTP/dados jurídicos e o piloto com usuários reais, sem alterar a direção visual definida pela Fable 5.
