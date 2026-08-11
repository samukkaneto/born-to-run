# Status técnico atual

> Atualização mais recente — OCR Tanita assistido, PDF A4 e importação atômica do XLSX foram implementados. O remoto está em 17 migrations, terminando em `20260811191007_importa_planilha_treinos_prescritos`. Consulte `21-OCR-PDF-E-IMPORTACAO-DE-TREINOS.md`; esta nota substitui qualquer menção abaixo de que OCR/importação ainda seriam futuros.

> Atualização 11/08/2026 — bloco de perfis/Tanita/treinos publicado: o erro de perfil foi corrigido no Supabase, Robson já possui perfil `coach/active`, administrador e treinador podem receber avaliações, e os treinos agora possuem as seis categorias cromáticas definidas pelo treinador. O remoto contém 16 migrations, terminando em `20260811163511_permite_avaliacao_de_todos_perfis_ativos`. PR #25, CI da PR/merge e produção Vercel foram concluídos. Consulte `20-PERFIS-TANITA-CORES-DE-TREINO-E-LOJA.md`; esta nota substitui contagens e o estado “convite aguardando” mantidos abaixo como cronologia.

> Atualização 11/08/2026: a antiga loja conceitual pública foi retirada. O catálogo profissional fica em `/admin/loja`, protegido pelo layout server-side e disponível somente para administrador e treinador. O login voltou a usar diretamente `public/logo.png`, sem a adaptação de cor reprovada. A PR #23, CI do merge e produção Vercel foram concluídos. Detalhes em `19-LOJA-RESTRITA-PRECOS-E-IDENTIDADE.md`.

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

## Conteúdo, formulário e Hostinger MCP — atualização de 09/08/2026

- Toda alegação de “200 atletas” foi removida do site, das fontes atuais e dos documentos históricos consultáveis. Os únicos números institucionais preservados são fundação em 2015 e mais de 200 participações em corridas.
- O formulário de contato deixou de depender de `mailto:`: `POST /api/contact` valida os campos, aplica honeypot e limite básico, envia pela API da Resend e define o e-mail do visitante como `reply_to`.
- O destinatário e remetente são `contato@equipeborntorun.com`; o domínio já está verificado na Resend.
- A Vercel recebeu `RESEND_API_KEY` sensível e separada para Production e Preview. A chave possui somente permissão de envio e está restrita a `equipeborntorun.com`.
- O Hostinger MCP remoto oficial foi adicionado ao Codex em `https://mcp.hostinger.com` e o OAuth foi concluído. Como a configuração foi adicionada durante a sessão, suas ferramentas ficam disponíveis depois de reiniciar o Codex.
- “Instalar aplicativo” continua significando PWA. Não existe APK neste ciclo; aplicativo Android nativo, assinatura e publicação na Play Store permanecem uma fase futura explícita.
- Release final: PR `#13` mesclada no commit `7323340080f6bdc35f8b7fd28390d7a6b99f515f`; CI do merge `31332711070` aprovada; produção Vercel `dpl_DU27nprYJu1VN24kgQd6kgDeB6RF` em estado `READY`, sem erro de alias ou de runtime.
- Validação pública no domínio oficial: home, Sobre, Contato, Instalar e Health `200`; dashboard anônimo `307` para login; payload inválido do contato `400`; HSTS ativo; nenhuma ocorrência pública de “200 atletas”.

## Treinador, fotos e avaliações — atualização de 09/08/2026

- O papel `coach` foi separado do administrador. `samuelspeedy@gmail.com` permanece administrador; `ralves4101@gmail.com` está pré-autorizado como único treinador e ainda aguarda cadastro/confirmacão reais.
- Administrador e treinador aprovam contas; somente o administrador define o papel técnico; somente o treinador gerencia grupos, publica treinos privados e registra avaliações.
- Todo treino exige atleta ou grupo destinatário. O administrador e atletas não destinados não conseguem consultar o conteúdo.
- A tabela `body_assessments` e as telas `/admin/avaliacoes` e `/dashboard/avaliacoes` entregam o MVP privado da bioimpedância.
- Nove fotos reais foram arquivadas em `public/team-archive/`; `team-race-palace.jpg` substitui a imagem antiga de destaque. A home ganhou bloco dedicado exclusivamente a Robson Alves.
- Supabase está em nove migrations, terminando em `20260810030102_indexa_convite_treinador`; suíte remota transacional 72/72.
- Gates locais: ESLint, TypeScript, 53/53 unitários, build de 34 rotas e matriz equivalente a 26/26 E2E desktop/mobile.
- Código e interface ainda aguardam PR, CI, preview e merge; o banco já recebeu as três migrations deste bloco e o convite técnico.

## Estado por área

| Área | Estado no baseline |
|---|---|
| Institucional | Implementado e publicado |
| Comunidade fechada | Implementada e protegida por RLS |
| Feed social | MVP funcional com Storage privado e paginação |
| Administração e treinador | Papéis e painéis separados; Bloco 10 publicado |
| Grupos e treinos dirigidos | Privados e exclusivos do treinador no banco; UI pendente de publicação |
| Avaliações de bioimpedância | MVP privado ampliado e publicado |
| CI/CD | GitHub Actions e GitHub→Vercel funcionando |
| Supabase | Nove migrations, 1 admin ativo e convite de treinador aguardando cadastro |
| SMTP próprio | Ativo com Resend, domínio autenticado, templates hospedados e recuperação testada |
| Formulário público | Endpoint Resend implementado e entrega real confirmada no preview (`delivered`) |
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
- zero posts, comentários, curtidas, comunicados, grupos, integrantes, treinos, atribuições e avaliações reais;
- 1 pré-autorização privada aguardando o cadastro do treinador.

## Veredito

O produto está pronto como MVP web publicado. Banco, Auth, SMTP, PWA, transparência LGPD, observabilidade e operação estão preparados. Permanecem como decisões posteriores o plano Supabase Pro, os dados jurídicos formais, o piloto com usuários reais, o refinamento Fable 5 e o aplicativo nativo.

## E-mail de recuperação — correção visual de 11/08/2026

- A fotografia anterior foi reprovada porque apresentava somente o símbolo da marca nos uniformes.
- A substituta publicada é `public/email/recovery-athletes-v2.jpg`: camisetas e shorts exibem símbolo, `BORN TO RUN` e `Treinamento e Saúde`, com contraste coerente para tecidos claros e pretos.
- PR `#19` mesclada no commit `37b75c6`; CI do merge `31456328022` aprovado e deployment Vercel `dpl_CzjmVrL8vjpTbAFWCF1gYGLHo74D` em produção, sem erros de runtime. A URL oficial da imagem responde `200` com JPEG de 100.351 bytes.
- O template versionado já referencia a URL nova. Falta somente copiar o HTML de `supabase/templates/recovery.html` para o template Reset Password do Supabase hospedado e fazer um envio real; o painel interno abriu a autenticação do GitHub, mas não havia sessão disponível para concluir a gravação automaticamente.

## Login e identidade do remetente — implementação local de 11/08/2026

- O login antigo usava um retângulo carbono desproporcional no celular e reduzia o logotipo oficial. O componente foi reconstruído em `app/(auth)/layout.tsx` e `app/(auth)/login/page.tsx`.
- A nova composição usa a foto real `public/team-archive/team-race-palace.jpg`, com tratamento claro para preservar a leitura, logo oficial grande sem bloco preto e formulário branco de alto contraste.
- O login usa diretamente o arquivo oficial completo `public/logo.png`; a adaptação `public/brand/logo-on-light.png` foi retirada de uso e não deve ser reutilizada.
- O avatar quadrado preparado para contas de e-mail está em `public/brand/email-avatar-512.png`, com fundo branco, logotipo completo e acento vermelho. O arquivo não ativa sozinho o avatar no Gmail.
- Verificação local: 412 × 915 e 1440 × 1000 renderizados; conteúdo presente; sem overlay de erro; home acessível pelo link da marca; axe WCAG A/AA sem violações; ESLint completo, TypeScript, 57/57 unitários, build de 37 rotas e E2E direcionado 4/4 aprovados.
- DNS observado: SPF do domínio presente, DMARC em `p=none` e nenhum registro BIMI. Não endurecer DMARC sem auditar conjuntamente os envios Hostinger e Resend.
- Para Gmail, o caminho imediato é usar `contato@equipeborntorun.com` como uma Conta Google e carregar o avatar preparado. A exibição não é universal. O caminho corporativo multicliente é BIMI com DMARC `quarantine/reject`, CMC/VMC e logo SVG Tiny PS.
- PR `#21` mesclada no commit `c1dc445`; CI final da PR `31461939571` e CI do merge `31462110659` aprovados por completo. A Vercel publicou `dpl_FaJKjbYHCFYGygVWTFzo1HMu4wii` em produção, `READY`, com os aliases oficiais. No domínio `equipeborntorun.com`, login e avatar responderam `200`, o health confirmou a revisão correta, a inspeção visual mobile não encontrou overlay nem violação axe e os Runtime Logs não apresentaram erros. Consulte `18-LOGIN-E-IDENTIDADE-DE-EMAIL.md`.
