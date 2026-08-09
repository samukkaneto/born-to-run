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

## 09/08/2026 — Bloco 5, checkpoint hospedado

- Commit `4dae905` publicado e PR draft `#2` criado.
- GitHub Actions run `31293700511`: audit, lint, tipos, 48 unitários, build e 24 E2E aprovados em 1m38s.
- Vercel criou `dpl_CjisHx5g4zL8Q2gDqABQkuDNwtfK`, `READY`, com build de 31 rotas e sem erros de runtime.
- A API revelou Web Analytics configurado porém desativado; o comando oficial `vercel project web-analytics` foi executado e a confirmação passou para `true`.
- Speed Insights já possuía configuração e foi preservado.
- `vercel curl` validou respostas 200 de páginas públicas, health, manifesto e scripts das duas métricas; dashboard anônimo respondeu 307.
- Supabase rechecado: `ACTIVE_HEALTHY`, seis migrations, RLS nas nove tabelas, 1 admin ativo, zero órfãos e zero dados/arquivos de negócio.
- Advisors: seis avisos intencionais de RPCs `SECURITY DEFINER`, proteção de senhas vazadas bloqueada pelo Free e índices ainda sem uso na base vazia.
- Inspeção visual via navegador não conectou neste host; não foi declarada como aprovada. A evidência disponível é build/check hospedado, HTTP autenticado e Playwright.
- Próximo ponto exato: commit documental, auditoria final, merge e verificação de produção se o veredito for GO.

## 09/08/2026 — Bloco 5 concluído e release validado

- Commit documental `61e3888` publicado; CI do PR `31294328656` e preview `dpl_C1PtqEHA9cYT6qbpNy6pPwRv8qTF` ficaram verdes.
- Auditoria pesada do delta completo confirmou `git diff --check` limpo, worktree limpo, nenhum segredo/`.env` privado/artefato versionado e nenhum P0/P1.
- PR #2 marcada pronta e mesclada com proteção pelo SHA auditado.
- Merge em `main`: `7f66eb82db99ddbbb2edc33b26c579225509a8e6`.
- GitHub Actions do merge: run `31314115269`, concluída com sucesso.
- Deployment automático de produção: `dpl_4SjYHKJriBnHY82Q8qYpzfjt7aYB`, `READY/PROMOTED`, build de 31 rotas e aliases corretos.
- Domínio público validado: páginas, manifesto, service worker e scripts de métricas 200; dashboard anônimo 307 para login; health 200 na revisão `7f66eb8`.
- Headers de segurança e HSTS confirmados; nenhum cluster de runtime nem warning/error/fatal no deployment após os testes.
- Veredito final técnico: pronto para piloto fechado. Restam somente as dependências externas enumeradas no arquivo `07`.

## 09/08/2026 — manutenção final do CI

- A primeira execução da PR documental expôs aviso de depreciação do Node 20 interno de `actions/checkout@v4` e `actions/setup-node@v4`.
- O Dependabot abriu atualizações isoladas para v7 e ambas passaram no pipeline completo.
- As duas actions foram incorporadas juntas à PR final; upgrades major de TypeScript/ESLint não foram misturados porque seus checks falharam.

## 09/08/2026 — Bloco 6, domínio e e-mail iniciados

- Caixa piloto `contato@equipeborntorun.com` criada e DNS de e-mail confirmado publicamente: MX `mx1.hostinger.com`/`mx2.hostinger.com` e SPF Hostinger presentes.
- Domínio oficial `equipeborntorun.com` e variante `www` anexados ao projeto Vercel correto `prj_yvAfSxZgL4nNZuwq1R0WK9JOT5Hx`.
- A Vercel confirmou propriedade no escopo `shabuneto` e informou configuração externa pendente.
- DNS solicitado: A `@` → `216.198.79.1` e `64.29.17.1`; CNAME `www` → `ec527bb85ae46632.vercel-dns-017.com`.
- Decisão de segurança operacional: manter nameservers na Hostinger e não tocar em MX/TXT, evitando interromper o e-mail profissional.
- O contato público do app passou a ter fallback versionado para `contato@equipeborntorun.com`.
- A configuração versionada do Supabase passou a aceitar callbacks de `equipeborntorun.com` e `www.equipeborntorun.com`, mantendo o callback legado da Vercel durante a transição.
- Resend localizada no onboarding; a etapa de API foi deliberadamente adiada. A sequência adotada é domínio/SSL do app → URLs Auth → domínio Resend → integração Supabase, que cria a chave de envio.
- Bloqueio momentâneo: a conexão do Chrome conseguiu abrir a zona DNS da Hostinger, mas as interações profundas expiraram. Nenhuma alteração parcial de DNS foi enviada.
- Próxima ação exata: concluir os três registros web na Hostinger e revalidar Vercel antes de mudar a URL oficial de Auth.

## 09/08/2026 — Bloco 6, domínio e e-mail concluídos

- A zona DNS foi alterada pela API oficial da Hostinger com validação prévia. Foram substituídos somente A `@` e CNAME `www`; MX e SPF do Business Email foram preservados.
- Registros Resend adicionados: DKIM em `resend._domainkey`, MX em `send` com prioridade 10 e SPF em `send`. A resolução pública via `1.1.1.1` confirmou todos os valores.
- A Vercel declarou apex e `www` como `configured_correctly` e `verified`; certificado dedicado emitido para ambos os nomes.
- `https://equipeborntorun.com` retorna `200`; `www` retorna `308` para o apex; `/dashboard` anônimo retorna `307` para login e `/api/health` retorna `200`.
- Vercel Production recebeu `NEXT_PUBLIC_SITE_URL=https://equipeborntorun.com` e `NEXT_PUBLIC_CONTACT_EMAIL=contato@equipeborntorun.com`. Esses valores exigem novo build, a ser criado pela publicação desta branch.
- Supabase hospedado recebeu Site URL oficial e callbacks do apex, `www` e domínio Vercel legado.
- Resend recebeu chave de envio com acesso restrito ao domínio. O Supabase recebeu SMTP `smtp.resend.com:465`, remetente oficial, senha mínima de 8 caracteres, confirmação de e-mail obrigatória e oito templates em português.
- Notificações de alteração de senha e de e-mail foram habilitadas.
- Teste de recuperação executado contra `/auth/v1/recover` com retorno `200` e redirect oficial.
- Segurança operacional: tokens temporários de Hostinger e Supabase devem ser revogados ao final; chaves Resend redundantes devem ser removidas, preservando somente a credencial SMTP ativa.
- Pendências externas mantidas por decisão do proprietário: upgrade Supabase Pro/proteção contra senhas vazadas, dados jurídicos formais e piloto com usuários reais.

## 09/08/2026 — Publicação do domínio e correção final do contato

- PR #10 criada a partir do commit `8eee55b409de09502b885ebb4caf9265a0ce3d05`; CI de PR `31326683612` concluída com sucesso.
- PR #10 mesclada no commit `823af9155b7c1d7e376a452f76aa750a076f2617`; CI do merge `31327042491` concluída com sucesso.
- Vercel publicou `dpl_3S2U899w23ki3qyNVzaTiBRy2HFa` em produção. Apex e rotas públicas retornaram `200`, `www` retornou `308` para o apex e `/dashboard` anônimo retornou `307` para login.
- A validação da página `/contato` revelou que o formulário preservava o texto anterior à criação do e-mail e não enviava nada ao canal profissional.
- Correção implementada: cartão de e-mail oficial, botão `mailto:` com nome/e-mail/mensagem preenchidos, Instagram como alternativa e aviso de privacidade apontando para `contato@equipeborntorun.com`.
- PR #11 criada no commit `9f273d96886edae571f2a80b0ffb9e348983f41a`; CI `31327377193` passou por audit, lint, typecheck, 48 unitários, build e navegador.
- Preview da PR #11: `dpl_Bt5zJnftpJFVGGh8CBRkZsTxsURb`, `READY`.
- Segurança: os dois tokens pessoais temporários do Supabase foram excluídos e a lista ficou vazia. A confirmação de exclusão do token temporário da Hostinger foi enviada; falta apenas conferir a tabela porque o painel travou após a ação.

## 09/08/2026 — Fechamento do Bloco 6

- A documentação foi incorporada à PR #11 no commit `63e337dfd97ae7a98525e838d8104a648bfa3932`; CI final da PR `31327510592` concluída com sucesso.
- PR #11 mesclada no commit `18a7044f7be36364cb97453f7ee5b1f37d1965db`; CI do merge `31327590726` concluída com sucesso.
- Deployment Vercel de produção `dpl_HXgGgXEqjK12Vnib7ELczsRJx4Md` em estado `READY`, URL imutável `https://born-to-gz29vlt3x-shabuneto.vercel.app`.
- `https://equipeborntorun.com/contato` retorna `200`, contém `contato@equipeborntorun.com` e o link `mailto:`; a página de privacidade contém o mesmo canal e registra a Resend.
- `https://www.equipeborntorun.com` redireciona com `308`; `/dashboard` sem sessão redireciona com `307` para login; ambos apresentam HSTS.
- Estado de produto: pronto para criação das contas reais e execução assistida do piloto fechado. Upgrade Supabase Pro, dados jurídicos formais e aprovação visual Fable 5 permanecem decisões posteriores já registradas.
