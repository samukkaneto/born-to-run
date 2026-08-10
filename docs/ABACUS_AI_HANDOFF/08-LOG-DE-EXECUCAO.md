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

## 09/08/2026 — Bloco 7, acesso administrativo e limpeza de credenciais

- Consulta somente leitura no Supabase confirmou exatamente um usuário ligado a perfil `admin/active`, com e-mail confirmado. O endereço exato foi informado diretamente ao proprietário e deliberadamente não foi copiado para o repositório.
- A recuperação de acesso já existe em `https://equipeborntorun.com/recuperar-senha`; não foi necessário nem desejável disparar um e-mail durante a simples identificação da conta.
- O painel da Resend mostrou duas chaves de envio: a credencial ativa e a chave redundante `Supabase Auth Born to Run v2`.
- A chave `v2` foi excluída com confirmação nominal. A releitura da tabela confirmou uma única credencial restante e nenhuma chave `v2`.
- Nenhum segredo, token completo ou senha foi copiado para terminal, relatório ou GitHub.
- O painel de API da Hostinger foi tentado novamente por página nova e por aba já autenticada. Em todas as tentativas, a página ficou presa no carregamento e a conexão de automação expirou. O registro continua honesto: exclusão enviada anteriormente, confirmação visual da tabela ainda pendente.
- O projeto, o Supabase, o DNS e o SMTP não foram alterados neste bloco. A próxima ação funcional continua sendo criar contas reais pelo `/cadastro`, confirmar os e-mails e aprová-las no painel do administrador.

## 09/08/2026 — Bloco 8, conteúdo correto, contato transacional e Hostinger MCP

- O proprietário esclareceu que “200 atletas” não representa o quadro atual e não deve ser publicado. O dado foi retirado da home, Sobre, telas de autenticação, fonte institucional e documentação; foram preservados “desde 2015” e “mais de 200 participações em corridas”.
- O formulário anterior apenas montava um link `mailto:` e dependia de um aplicativo de e-mail no dispositivo do visitante.
- Foi criado `POST /api/contact` com validação compartilhada cliente/servidor, limite de tamanho, honeypot, limite básico por origem, conteúdo HTML escapado, `reply_to` do visitante, resposta sem cache e mensagens de falha sem expor a Resend.
- Uma chave `Born to Run Contact Form` foi criada na Resend com `Sending access`, restrita ao domínio verificado `equipeborntorun.com`; a credencial SMTP do Supabase foi preservada.
- A Vercel recebeu `RESEND_API_KEY` como variável sensível em Production e Preview. O valor nunca foi impresso nem versionado.
- O Aviso de Privacidade passou a registrar nome, e-mail e mensagem do contato, além do papel da Resend na entrega ao canal oficial.
- A tela de instalação esclarece que a versão atual é PWA e não fornece APK. O Android nativo fica para fase posterior ao piloto.
- O MCP remoto oficial da Hostinger (`https://mcp.hostinger.com`) foi adicionado à configuração compartilhada do Codex e autenticado via OAuth. Ele será carregado depois de reiniciar o aplicativo Codex.
- Gates locais antes da publicação: lint limpo, TypeScript aprovado, unitários 52/52, build de 32 rotas e E2E 26/26 em Desktop Chrome e Pixel 7, sem violações axe sérias/críticas.
- O commit funcional `0c43ec135b042e6f7a6c00b6d76b9e89eca9c691` foi publicado na PR draft `#13`; o workflow `Qualidade` `31332097287` concluiu com sucesso.
- O preview Vercel `dpl_HPogUkbXQdytroGL9Kn2v2RZCaib`, em `https://born-to-dpvozi1qi-shabuneto.vercel.app`, ficou `READY` e recebeu a variável sensível de Preview.
- Um envio real foi executado pela tela `/contato`, com uma mensagem técnica identificada. A interface confirmou a entrega e o painel da Resend registrou o e-mail para `contato@equipeborntorun.com` com status `delivered`.
- Os Runtime Logs desse deployment não apresentaram `error`, `warning` ou `fatal` nos 30 minutos auditados; o agrupamento exibiu somente respostas `200`, `204` e `304`.
- Próxima ação exata: incorporar este registro documental, aguardar o CI do commit final, mesclar a PR #13 e validar o mesmo fluxo no domínio de produção.

### Fechamento e produção do Bloco 8

- O commit documental `2b015c233b06c987ac98b31fae45109db94bcc73` foi publicado; o workflow `Qualidade` `31332586740` concluiu com sucesso e o preview final `dpl_4T9q4BVJhZUyENzQhTi4TwvMUyPa` ficou `READY`.
- A PR `#13` saiu de draft somente depois dos gates verdes e foi mesclada por squash no commit `7323340080f6bdc35f8b7fd28390d7a6b99f515f`.
- O workflow do merge `31332711070` concluiu com sucesso.
- A Vercel publicou automaticamente o commit correto em produção no deployment `dpl_DU27nprYJu1VN24kgQd6kgDeB6RF`, estado `READY`, sem `aliasError`, atendendo `equipeborntorun.com`, `www.equipeborntorun.com` e os aliases Vercel do projeto.
- A compilação remota usou Next.js 16.3.0, gerou 32 rotas e terminou sem erro. A fase “Deploying outputs” demorou mais que o padrão, mas concluiu normalmente; o status oficial da Vercel estava operacional e nenhum rollback foi necessário.
- Smoke test público: `/`, `/sobre`, `/contato`, `/instalar` e `/api/health` retornaram `200`; `/dashboard` anônimo retornou `307` para `/login?next=%2Fdashboard`; payload vazio em `/api/contact` retornou `400`; HSTS estava ativo.
- As páginas públicas auditadas não contêm “200 atletas”; home e Sobre apresentam mais de 200 participações em corridas e a fundação em 2015.
- Runtime Logs do deployment de produção: nenhum `error`, `warning` ou `fatal` no período auditado.
- Estado final do bloco: concluído e publicado. Próxima atividade funcional é o piloto assistido com contas reais; Android nativo/APK permanece uma fase posterior, deliberadamente separada.

## 09/08/2026 — Bloco 9, treinador exclusivo, fotos e bioimpedância

- Nove fotografias reais recebidas foram preservadas em `public/team-archive/`; a foto horizontal `team-race-palace.jpg` foi selecionada para substituir o destaque antigo da home e da página Sobre.
- A home passou a destacar Robson Alves em seção própria, com `robson-running.jpg`, CREF e World Athletics; o texto junto da foto fala somente sobre ele.
- Foi criado o papel `coach`, separado de `admin`, com índice que impede mais de um treinador.
- Administrador e treinador podem revisar acessos. Somente administrador muda papéis; somente treinador gerencia grupos, treinos e avaliações.
- A audiência aberta `team` foi removida: treino exige atleta ou grupo e permanece invisível para administrador e não destinatários.
- Foi criada `body_assessments` com validações, RLS, RPCs, painel técnico e histórico privado do atleta.
- A política de privacidade passou a registrar dados sensíveis de bioimpedância e versão jurídica `2026-08-09`.
- Migration `20260810021549_treinador_e_avaliacoes_privadas` passou em preflight com rollback e foi aplicada.
- Migration `20260810025223_preautoriza_treinador` criou convites privados de equipe e adaptou o trigger Auth; passou em preflight e foi aplicada.
- O Advisor apontou a chave estrangeira do convite sem índice; `20260810030102_indexa_convite_treinador` foi aplicada e removeu o alerta estrutural sem mudar comportamento.
- `ralves4101@gmail.com` foi pré-autorizado como `coach`. O teste transacional criou e reverteu um usuário simulado, confirmando papel ativo e consumo do convite; a conta real continua inexistente e a pré-autorização permanece aguardando.
- pgTAP remoto: comunidade 49/49, ciclo de destinatários 7/7 e treinador/avaliações/convite 16/16, total 72/72.
- Gates locais: TypeScript, ESLint, Vitest 53/53 e build de 34 rotas aprovados. E2E teve 24 casos comuns aprovados em dev; os dois timeouts de service worker foram repetidos no build de produção e passaram 2/2, consolidando a matriz 26/26.
- Ponto de retomada: finalizar relatórios, commit/PR, CI, preview visual, merge e produção. Depois Robson faz o cadastro real e confirma o e-mail.

### Checkpoint de publicação do Bloco 9 — 10/08/2026

- Commit funcional `c1f111a027d1a5c87e109de3089eb7e14cd8a49d` enviado para `codex/coach-assessments-team-media`.
- PR draft [#15](https://github.com/samukkaneto/born-to-run/pull/15) criada com escopo, banco, validações e procedimento da conta do treinador.
- Workflow `Qualidade` `31351998723` terminou com sucesso; todas as etapas, incluindo audit, lint, TypeScript, 53 unitários, build e navegador, ficaram verdes.
- Preview Vercel `dpl_8PYatkCt2jUCQMKK1VjmwSVJkTTA` ficou `READY` no commit correto, em `https://born-to-qlnisgqpt-shabuneto.vercel.app`.
- O bypass oficial `vercel curl` confirmou home 200, foto nova `team-race-palace.jpg`, seção exclusiva de Robson e conteúdo novo no artefato remoto.
- Próxima ação: publicar este checkpoint, aguardar o CI documental, retirar a PR do modo draft, mesclar e auditar produção.
