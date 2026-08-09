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

## 08/08/2026 — Bloco 2 preparado

- API do Supabase confirmou organização `born-to-run` no plano `Free`.
- Proteção contra senhas vazadas não foi ativada porque o recurso exige Pro; nenhuma promessa falsa foi registrada.
- O cadastro passou a enviar `emailRedirectTo` explícito para `/auth/callback?next=/acesso-pendente`.
- Configuração local alinhada: confirmação de e-mail, senha mínima de 8 caracteres com letra e número e callbacks exatos.
- Oito templates premium em português foram criados em `supabase/templates/` para confirmação, recuperação, convite, magic link, mudança de e-mail, reautenticação e avisos de segurança.
- Runbook `10-AUTH-SMTP-E-TEMPLATES.md` criado com recomendação Resend SMTP, campos, URLs, segurança e matriz do piloto.
- Templates 8/8 e config validados; Docker não está instalado, então o ambiente Supabase local não foi iniciado.
- ESLint, TypeScript e Vitest 48/48 passaram.
- Dependências externas restantes: upgrade Pro; domínio verificável; conta/chave SMTP; remetente aprovado.
- Próximo ponto exato: PWA/mobile, LGPD e operação independente do piloto real.

## 09/08/2026 — Bloco 3 concluído

- Manifesto completado e service worker público criado com registro somente em produção.
- Cache limitado a páginas/arquivos públicos; área privada recebe `/offline` sem dados quando não há rede.
- Página `/instalar` criada para Android, desktop e instruções iOS; `/offline` criada.
- Metadados Apple, headers de segurança e `noindex/nocache` das rotas privadas adicionados.
- `/privacidade` e `/termos` publicados com conteúdo aderente ao produto real e avisos de revisão jurídica.
- Cadastro passou a exigir ciência no cliente e servidor e registra versão/instante em metadata do Auth.
- Nenhum banner de cookies foi adicionado porque não há analytics, publicidade ou cookies não essenciais.
- Build aprovado com 31 rotas; lint e TypeScript aprovados.
- E2E consolidado 22/22 após repetir isoladamente um timeout ambiental de fechamento do Chromium.
- Teste offline comprovou que dashboard privado nunca é servido do cache em desktop ou Pixel 7.
- Próximo ponto exato: observabilidade, backup, dependências e preparação final do piloto/release.

## 09/08/2026 — Bloco 4 concluído

- `@vercel/analytics` e `@vercel/speed-insights` adicionados para visitação agregada e Core Web Vitals.
- Queries, fragmentos e UUIDs são removidos antes do envio; scripts carregam apenas em deployments Vercel reais.
- Aviso de Privacidade e Termos atualizados; nenhum dado social, e-mail ou métrica esportiva é enviado.
- `/api/health` criado com resposta mínima, revisão e `no-store`.
- `npm audit` continuou com zero vulnerabilidades; CI passou a bloquear vulnerabilidades altas/críticas.
- Dependabot semanal para npm/Actions e `SECURITY.md` com relato privado adicionados.
- `12-OPERACAO-PILOTO-E-RELEASE.md` criado com recuperação, piloto e release.
- Plano Free não tem backup automático restaurável; como ainda não há dados reais de negócio/Storage, nenhum dump pessoal foi criado. Antes do piloto, escolher Pro ou exportação criptografada fora do GitHub.
- Primeira matriz E2E: 22/24; as duas falhas identificaram scripts Vercel 404 no `next start` local. A condição foi corrigida no servidor.
- Gate final local: lint, TypeScript, 48/48 unitários, build de 31 rotas e E2E 24/24 em Desktop Chrome/Pixel 7.
- Preview anterior `c007fb9`: `READY`, sem clusters de runtime em sete dias nem warning/error/fatal em 24 horas.
- Próximo ponto exato: commit/push do Bloco 4, PR, CI/preview hospedado e auditoria final pesada.

## Convenção

Cada entrada futura deve registrar:

- arquivos e serviços alterados;
- migrations e deployments;
- testes executados e resultados;
- dados técnicos criados/removidos;
- riscos, bloqueios e próxima ação exata.
