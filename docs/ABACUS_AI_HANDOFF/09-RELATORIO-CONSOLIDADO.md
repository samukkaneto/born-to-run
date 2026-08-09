# Born to Run — relatório consolidado para Abacus AI

Atualizado em 08/08/2026 no início do ciclo de prontidão para piloto.

## Resumo

Born to Run é um site institucional e aplicativo privado para uma equipe real de corrida. A área interna funciona como comunidade fechada, rede social de treinos e canal de prescrição treinador–atleta.

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

## Ciclo em execução

O Codex iniciou a branch `codex/production-readiness` para:

1. consolidar relatórios;
2. resolver os P2 de perfis e mídia;
3. elevar configurações de Auth;
4. preparar SMTP;
5. testar o piloto real;
6. completar a prontidão PWA/mobile;
7. revisar privacidade e operação;
8. executar auditoria final pesada e publicar.

## Progresso do ciclo

- Bloco 0 concluído: relatórios canônicos consolidados nesta pasta.
- Bloco 1 concluído: sexta migration aplicada; metadados administrativos de perfis estão ocultos dos membros e referências de mídia são verificadas contra objetos reais do Storage.
- Bloco 2 preparado: callback e templates concluídos; ativação remota de senhas vazadas/SMTP depende de plano Pro, domínio e credenciais.
- Bloco 3 concluído: instalação PWA, offline sem cache privado, headers, noindex, privacidade, termos e aceite versionado.
- Bloco 4 concluído: health check, métricas anônimas com sanitização, audit no CI, Dependabot, política de segurança, plano de backup e checklist do piloto/release.
- Bloco 5 em andamento: PR, CI/preview hospedado e auditoria final pesada.

## Estado operacional após o Bloco 4

- zero vulnerabilidades no `npm audit`;
- lint, TypeScript, 48/48 unitários e build de 31 rotas aprovados;
- E2E 24/24 em desktop e Pixel 7, sem violações axe sérias/críticas;
- preview Vercel anterior `READY`, sem erros de runtime encontrados;
- banco ainda sem conteúdo real de atletas;
- Supabase Free exige upgrade Pro ou exportações criptografadas antes de depender de recuperação;
- SMTP, senhas vazadas, identificação formal do controlador e piloto real seguem como dependências explícitas do proprietário.

## Fable 5

A Fable 5 mantém liberdade visual. Ela deve ler `README-FABLE5.md`, este pacote e as seis imagens em `design-refs/`, preservando os contratos funcionais e de segurança.

## Retomada

Se o ciclo for interrompido, leia `07-PENDENCIAS-E-RETOMADA.md` e a entrada mais recente de `08-LOG-DE-EXECUCAO.md`.
