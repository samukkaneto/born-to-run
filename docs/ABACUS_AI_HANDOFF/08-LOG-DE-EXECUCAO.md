# Log de execução

## 08/08/2026 — início do ciclo de prontidão

- Proprietário autorizou executar as pendências técnicas em blocos.
- Estratégia de raciocínio: Extra Alto na implementação; Ultra reservado para auditoria final.
- Baseline confirmado: `main` e `origin/main` em `46001fa`, worktree limpo.
- Produção inicial: `dpl_A2GZxDdUvqphcLt8MYrCYvdq4Zuz`, domínio público saudável.
- Supabase inicial: cinco migrations, 1 admin ativo, zero órfãos e zero conteúdo técnico.
- Documentação oficial consultada: proteção de senhas vazadas exige Supabase Pro ou superior; SMTP padrão não é adequado a usuários externos/produção.
- Branch de trabalho criada: `codex/production-readiness`.
- Bloco 0 iniciado com a criação desta pasta canônica.

## 08/08/2026 — Bloco 1 concluído

- Auditoria confirmou que `authenticated` ainda lia `status_note`, `reviewed_at` e `reviewed_by` diretamente em `profiles`.
- Todas as consultas de perfil do app passaram a usar a lista mínima `MEMBER_PROFILE_COLUMNS`; os Client Components recebem somente o DTO seguro `MemberProfile`.
- `getAccessContext()` passou a usar o RPC `get_my_access_profile()`, limitado ao próprio `auth.uid()`.
- Migration `20260809021316_protege_metadados_e_referencias_de_midia` aplicada ao projeto `nmcaejrmmfffzeclmuob`.
- O banco agora exige que avatar/foto existam no Storage e bloqueia a exclusão de objetos ainda referenciados.
- Preflight remoto combinado: 56/56 asserções; rollback de migration, funções, grants, usuários e arquivos técnicos confirmado antes da aplicação.
- Pós-aplicação: 1 perfil `admin/active`, zero objetos no Storage, privilégios/RPCs/triggers/policies confirmados.
- Advisors executados: seis warnings `SECURITY DEFINER` intencionais, proteção contra senhas vazadas ainda desativada e somente índices sem uso em uma base vazia.
- Gates locais: ESLint aprovado, TypeScript aprovado, Vitest 48/48 e build Next.js aprovado com 27 rotas.
- Próximo ponto exato: Bloco 2, Auth + proteção de senha + SMTP/templates.

## Convenção

Cada entrada futura deve registrar:

- arquivos e serviços alterados;
- migrations e deployments;
- testes executados e resultados;
- dados técnicos criados/removidos;
- riscos, bloqueios e próxima ação exata.
