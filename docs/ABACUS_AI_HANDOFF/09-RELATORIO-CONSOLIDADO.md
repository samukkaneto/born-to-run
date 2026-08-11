# Born to Run — relatório consolidado para Abacus AI

Atualizado em 09/08/2026 após a conclusão do ciclo de prontidão para piloto.

## Resumo

Born to Run é um site institucional e aplicativo privado para uma equipe real de corrida. A área interna funciona como comunidade fechada, rede social de treinos e canal de prescrição treinador–atleta.

> Atualização 10/08/2026: o Bloco 10 está implementado no Supabase e publicado em produção pelo merge `bd738177`. Foram adicionados editor da galeria para admin/treinador, arquivo Tanita privado, 12 missões, dez níveis de jornada, resultados/conquistas, loja conceitual, ícone PWA oficial, logo maior no rodapé e remoção do indicador duplicado da home. Para contexto completo de uma IA sem histórico, usar `15-CONTEXTO-COMPLETO-PARA-IA-SEM-HISTORICO.md`; para detalhes técnicos, usar `16-GALERIA-TANITA-MISSOES-E-LOJA.md`.

O MVP web está publicado em https://born-to-run-seven.vercel.app. O código está no GitHub `samukkaneto/born-to-run`, o Supabase remoto está sincronizado e a integração automática GitHub→Vercel funciona.

## Entregue no baseline

- autenticação e aprovação de membros;
- feed com fotos privadas, métricas, curtidas e comentários;
- perfil;
- comunicados;
- grupos;
- treinos para equipe, grupos e atletas;
- painel do treinador;
- RLS, RPCs, Storage privado e migrations versionadas;
- CI, unitários, E2E, pgTAP e build de produção.

## Ciclo executado

O Codex iniciou a branch `codex/production-readiness` para:

1. consolidar relatórios;
2. resolver os P2 de perfis e mídia;
3. elevar configurações de Auth;
4. preparar SMTP;
5. preparar a matriz do piloto real;
6. completar a prontidão PWA/mobile;
7. revisar privacidade e operação;
8. executar auditoria final pesada e publicar.

## Progresso do ciclo

- Bloco 0 concluído: relatórios canônicos consolidados nesta pasta.
- Bloco 1 concluído: sexta migration aplicada; metadados administrativos de perfis estão ocultos dos membros e referências de mídia são verificadas contra objetos reais do Storage.
- Bloco 2 preparado: callback e templates concluídos; ativação remota de senhas vazadas/SMTP depende de plano Pro, domínio e credenciais.
- Bloco 3 concluído: instalação PWA, offline sem cache privado, headers, noindex, privacidade, termos e aceite versionado.
- Bloco 4 concluído: health check, métricas anônimas com sanitização, audit no CI, Dependabot, política de segurança, plano de backup e checklist do piloto/release.
- Bloco 5 concluído: auditoria final sem P0/P1, PR #2 mesclado, CI do merge verde e produção validada.
- Bloco 6 concluído: domínio oficial em produção, `www` canônico, e-mail profissional preservado, Resend autenticada, SMTP/templates ativos no Supabase e recuperação testada.
- Complemento do Bloco 6: o e-mail oficial passou a aparecer na página de contato, o formulário prepara a mensagem para esse endereço e o aviso de privacidade usa o mesmo canal durante o piloto.
- Release final do Bloco 6: PR #11 mesclada, CI de PR e merge verdes, deployment `dpl_HXgGgXEqjK12Vnib7ELczsRJx4Md` `READY` e domínio público validado.
- Bloco 7 concluído: conta administradora localizada e ativa, recuperação disponível no próprio aplicativo e chave redundante da Resend excluída sem tocar na credencial SMTP em uso. A única conferência operacional ainda sem evidência visual é a tabela de tokens da Hostinger, cujo painel continuou congelando.
- Bloco 8 concluído tecnicamente: retirou a alegação incorreta de 200 atletas, implementou envio transacional do formulário para `contato@equipeborntorun.com`, configurou uma chave Resend exclusiva na Vercel, comprovou uma entrega real e autorizou o Hostinger MCP oficial.
- Release do Bloco 8 concluído: PR #13 mesclada no commit `7323340`, CI do merge `31332711070` verde e produção `dpl_DU27nprYJu1VN24kgQd6kgDeB6RF` `READY`, sem erro de alias ou runtime.
- Bloco 9 concluído e publicado: novo acervo de nove fotos, destaque institucional atualizado, papel exclusivo `coach`, treinos sempre privados, avaliações de bioimpedância e pré-autorização segura de `ralves4101@gmail.com`. Supabase aplicado e 72/72 pgTAP; 53/53 unitários, build de 34 rotas e matriz equivalente a 26/26 E2E. PR #15 mesclada em `0c17f86`, CI do merge `31352438060` verde e produção `dpl_5Ef5i65VmCNTAQ1zGM2ZqRcqXJhe` validada em desktop/mobile e logs. Consulte `14-TREINADOR-FOTOS-E-AVALIACOES.md`.

## Estado operacional após o Bloco 4

- zero vulnerabilidades no `npm audit`;
- lint, TypeScript, 48/48 unitários e build de 31 rotas aprovados;
- E2E 24/24 em desktop e Pixel 7, sem violações axe sérias/críticas;
- preview Vercel anterior `READY`, sem erros de runtime encontrados;
- banco ainda sem conteúdo real de atletas;
- Supabase Free exige upgrade Pro ou exportações criptografadas antes de depender de recuperação;
- SMTP está concluído; senhas vazadas (Pro), identificação formal do controlador e piloto real seguem como dependências explícitas do proprietário.
- a instalação atual é PWA e não gera APK; Android nativo é uma fase futura separada.
- Samuel permanece administrador; Robson fará o cadastro com o e-mail pré-autorizado e se tornará automaticamente o único treinador após a confirmação.
- gates atualizados do Bloco 8: 52/52 unitários, 26/26 E2E desktop/mobile, build de 32 rotas, CI `31332097287` verde e preview `dpl_HPogUkbXQdytroGL9Kn2v2RZCaib` `READY`;
- o formulário real foi enviado pelo preview e a Resend confirmou `delivered`; não houve erro, warning ou fatal nos Runtime Logs auditados.
- o domínio oficial foi revalidado após o merge: cinco rotas públicas/health `200`, área privada `307` para login, validação negativa do contato `400` e HSTS ativo.

## Release final do ciclo

- PR #2: https://github.com/samukkaneto/born-to-run/pull/2, mesclado;
- CI final do PR `31294328656` e CI do merge `31314115269`: aprovados;
- produção `dpl_4SjYHKJriBnHY82Q8qYpzfjt7aYB`: `READY/PROMOTED`, revisão `7f66eb8`;
- rotas públicas/health/PWA/métricas: 200; dashboard anônimo: 307;
- Web Analytics habilitado e Speed Insights configurado;
- Vercel sem erros de runtime no pós-release e Supabase sem erros críticos conhecidos.

## Fable 5

A Fable 5 tem carta branca visual e deve elevar de forma marcante o sistema inteiro. Ela deve ler `README-FABLE5.md`, `15-CONTEXTO-COMPLETO-PARA-IA-SEM-HISTORICO.md`, este pacote e as seis imagens em `design-refs/`, preservando os contratos funcionais e de segurança.

## Retomada

Se o ciclo for interrompido, leia `07-PENDENCIAS-E-RETOMADA.md` e a entrada mais recente de `08-LOG-DE-EXECUCAO.md`.

Para o proprietário: as contas do piloto são criadas em `https://equipeborntorun.com/cadastro`, confirmadas pelo e-mail recebido e aprovadas pelo administrador dentro do aplicativo. Se o administrador não lembrar a senha, deve usar `https://equipeborntorun.com/recuperar-senha` com o e-mail informado diretamente a ele.

Para a Abacus/Fable: não reintroduzir qualquer quantidade atual de atletas. Usar somente fundação em 2015 e mais de 200 participações em corridas até nova confirmação expressa do proprietário.

## Adendo visual do e-mail — 11/08/2026

A fotografia inicial do e-mail de recuperação foi rejeitada por mutilar a marca nos uniformes. A correção está em `public/email/recovery-athletes-v2.jpg` e mantém, em todas as quatro estampas, o símbolo multicolorido, o nome `BORN TO RUN` e o slogan `Treinamento e Saúde`. A PR #19, CI e produção Vercel foram concluídas; a URL oficial da imagem está pública e validada. O arquivo `supabase/templates/recovery.html` usa a URL versionada para evitar cache. Ao retomar, falta somente atualizar o template Reset Password no Supabase hospedado e executar um teste real de recuperação.
