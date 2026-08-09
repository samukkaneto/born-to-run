# Status técnico atual

Baseline registrado em 08/08/2026 no início do ciclo de prontidão para piloto.

## Produção

- Site oficial: https://equipeborntorun.com
- Alias legado Vercel: https://born-to-run-seven.vercel.app
- GitHub: `samukkaneto/born-to-run`
- Branch de produção: `main`
- Baseline de código: `46001fa5a1ebc16fb28cdb742d21e66f77ccc8a6`
- Deployment do baseline: `dpl_A2GZxDdUvqphcLt8MYrCYvdq4Zuz`, `READY` e `PROMOTED`
- Supabase: `nmcaejrmmfffzeclmuob`, `ACTIVE_HEALTHY`

## Domínio e e-mail — atualização de 09/08/2026

- Domínio oficial adquirido: `equipeborntorun.com`.
- Caixa piloto ativa: `contato@equipeborntorun.com` (Hostinger Business Email).
- DNS aplicado na Hostinger sem alterar os registros do Business Email: A `@` para `216.198.79.1` e `64.29.17.1`; CNAME `www` para `ec527bb85ae46632.vercel-dns-017.com`.
- `https://equipeborntorun.com` serve o aplicativo com certificado Vercel válido; `https://www.equipeborntorun.com` redireciona com `308` para o apex.
- URL oficial e os três callbacks de transição foram salvos no Supabase hospedado.
- Domínio de envio configurado na Resend com DKIM e SPF/MX públicos.
- SMTP customizado ativo no Supabase: remetente `Equipe Born to Run <contato@equipeborntorun.com>`, porta `465`, confirmação de e-mail obrigatória e senha mínima de 8 caracteres.
- Os oito templates versionados foram copiados para o Supabase hospedado; notificações de senha e e-mail alterados foram habilitadas.
- Teste real de recuperação retornou HTTP `200` depois da ativação do SMTP customizado.
- PR de infraestrutura: `#10`, mesclada no commit `823af9155b7c1d7e376a452f76aa750a076f2617`; CI do merge `31327042491` concluída com sucesso.
- Deployment oficial após a PR #10: `dpl_3S2U899w23ki3qyNVzaTiBRy2HFa`, `READY`, com apex, `www` e aliases Vercel apontando para o mesmo artefato.
- A auditoria pós-deploy encontrou o último texto provisório do contato: o formulário ainda encaminhava apenas ao Instagram. A PR `#11` corrigiu isso, mostrou o e-mail oficial, preparou uma mensagem `mailto:` e atualizou o aviso de privacidade.
- PR #11 mesclada no commit `18a7044f7be36364cb97453f7ee5b1f37d1965db`. CI final da PR `31327510592` e CI do merge `31327590726` concluídas com sucesso.
- Deployment final do ciclo: `dpl_HXgGgXEqjK12Vnib7ELczsRJx4Md`, `READY`, com todos os aliases oficiais apontando para ele.
- Validação pública final: `/contato` retorna `200`, contém o e-mail oficial e `mailto:`; `/privacidade` contém o canal e a Resend; `www` retorna `308`; `/dashboard` anônimo retorna `307`; HSTS ativo.

## Acesso administrativo — verificação de 09/08/2026

- O Supabase possui exatamente um perfil administrador `active`, ligado a um usuário Auth com e-mail confirmado.
- O identificador exato da conta foi entregue diretamente ao proprietário e não foi versionado neste relatório para evitar exposição desnecessária de um e-mail pessoal.
- A recuperação está disponível em `https://equipeborntorun.com/recuperar-senha`; o fluxo envia o e-mail pelo SMTP Resend já ativo e termina na tela de definição de nova senha.
- Nenhum e-mail de recuperação foi disparado nesta verificação, porque identificar a conta era suficiente e evita envio desnecessário.
- A chave de teste `Supabase Auth Born to Run v2` foi excluída da Resend. A única chave preservada é a credencial de envio usada pelo Supabase.
- A Hostinger recebeu anteriormente a confirmação de exclusão do token temporário `Codex Born to Run DNS`; o painel `/api` continuou congelando em novas tentativas, portanto a releitura visual da tabela permanece sem confirmação. Isso não afeta domínio, site, DNS nem e-mail.

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
| SMTP próprio | Ativo com Resend, domínio autenticado, templates hospedados e recuperação testada |
| Senhas vazadas | Bloqueada pelo plano Free; ativar após upgrade Pro |
| Privacidade de metadados de revisão | Resolvida no Bloco 1 |
| Existência física de mídia | Resolvida no Bloco 1 |
| PWA instalável/offline/push | Instalação e offline público entregues; push não implementado |
| Aplicativo nativo em lojas | Não iniciado |
| Observabilidade | Health check, Runtime Logs, Web Analytics e Speed Insights ativos no projeto Vercel |
| Segurança contínua | Audit no CI, Dependabot semanal e canal privado documentados |
| Backup | Base real ainda vazia; plano Free exige dump externo ou upgrade Pro antes de depender de recuperação |

## Banco no baseline

- 1 usuário Auth;
- 1 perfil `admin/active`;
- zero órfãos;
- zero posts, comentários, curtidas, comunicados, grupos, integrantes, treinos e atribuições técnicas.

## Veredito

O produto está pronto como MVP web publicado. Os Blocos 1–4 elevaram banco, Auth preparado, PWA, transparência LGPD, observabilidade e operação. Permanecem dependências externas de plano/SMTP/dados jurídicos e o piloto com usuários reais, sem alterar a direção visual definida pela Fable 5.
