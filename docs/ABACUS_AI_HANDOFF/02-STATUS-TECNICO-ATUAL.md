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
| SMTP próprio | Pendente de provedor/credenciais |
| Senhas vazadas | Recurso desativado; exige plano Pro ou superior |
| Privacidade de metadados de revisão | Resolvida no Bloco 1 |
| Existência física de mídia | Resolvida no Bloco 1 |
| PWA instalável/offline/push | Parcial |
| Aplicativo nativo em lojas | Não iniciado |

## Banco no baseline

- 1 usuário Auth;
- 1 perfil `admin/active`;
- zero órfãos;
- zero posts, comentários, curtidas, comunicados, grupos, integrantes, treinos e atribuições técnicas.

## Veredito

O produto está pronto como MVP web publicado. O Bloco 1 elevou a segurança do banco: membros não leem mais metadados administrativos de outros perfis e referências novas de avatar/foto precisam existir no Storage. O ciclo continua com Auth, e-mail, piloto e prontidão PWA sem alterar a direção visual definida pela Fable 5.
