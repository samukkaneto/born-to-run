# Born to Run — entrega técnica para Abacus AI / Fable 5

Atualizado em 08/08/2026. Esta pasta é o ponto de entrada canônico para uma IA ou pessoa retomar o projeto sem depender do histórico da conversa no Codex.

## Ordem de leitura

1. `01-ESCOPO-DO-PRODUTO.md` — produto, usuários, funcionalidades e limites de escopo.
2. `02-STATUS-TECNICO-ATUAL.md` — o que está implementado, publicado e pendente.
3. `03-SUPABASE-AUTH-E-SEGURANCA.md` — banco, Auth, RLS, Storage e migrations.
4. `04-GITHUB-VERCEL-E-DEPLOY.md` — repositório, CI/CD, ambientes e rollback.
5. `05-FABLE5-DESIGN-BRIEF.md` — direção visual e contratos que o redesign deve preservar.
6. `06-TESTES-E-EVIDENCIAS.md` — gates automatizados e verificações reais.
7. `07-PENDENCIAS-E-RETOMADA.md` — próxima ação exata e dependências externas.
8. `08-LOG-DE-EXECUCAO.md` — cronologia dos blocos executados.
9. `09-RELATORIO-CONSOLIDADO.md` — resumo único para anexar quando só for possível enviar um arquivo.
10. `10-AUTH-SMTP-E-TEMPLATES.md` — configuração de Auth, SMTP, templates e matriz do piloto.
11. `11-PWA-LGPD-E-OPERACAO.md` — instalação, offline seguro, privacidade, termos e dependências jurídicas.
12. `12-OPERACAO-PILOTO-E-RELEASE.md` — observabilidade, saúde, backup, segurança contínua e checklist de liberação.

## Fontes complementares no repositório

- `README-FABLE5.md` contém o briefing visual detalhado e o mapa completo de telas.
- `CURRENT_IMPLEMENTATION_STATUS.md` registra o estado técnico resumido.
- `SUPABASE_OPERATIONS.md` contém a runbook operacional do banco.
- `design-refs/` contém seis pranchas PNG de referência visual.
- `supabase/migrations/` e `supabase/schema.sql` são as fontes versionadas do banco.

Documentos de auditoria datados de julho de 2026 são históricos. Não devem substituir esta pasta nem os três documentos atuais acima.

## Regras de uso

- Nenhum arquivo desta pasta contém senhas, tokens, chaves privadas ou valores de variáveis de ambiente.
- A cada bloco técnico concluído, atualizar pelo menos `02`, `07`, `08` e `09`.
- A Fable 5 tem liberdade visual ampla, mas não pode enfraquecer autorização, Storage privado ou audiência de treinos.
- Garmin, Strava e Sports Tracker são referências de experiência, não integrações obrigatórias desta fase.

## Estado deste pacote

O pacote acompanha a branch `codex/production-readiness`. Consulte `08-LOG-DE-EXECUCAO.md` para a cronologia e `07-PENDENCIAS-E-RETOMADA.md` para o ponto exato de retomada.
