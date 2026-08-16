# Born to Run — entrega técnica para Abacus AI / Fable 5

Atualizado em 15/08/2026. Esta pasta é o ponto de entrada canônico para uma IA ou pessoa retomar o projeto sem depender do histórico da conversa no Codex.

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
13. `13-HOSTINGER-MCP-CONTATO-E-APP-NATIVO.md` — conexão Hostinger, formulário Resend e distinção entre PWA e futuro APK nativo.
14. `14-TREINADOR-FOTOS-E-AVALIACOES.md` — papel exclusivo de treinador, acervo de fotos, treinos privados e bioimpedância.
15. `15-CONTEXTO-COMPLETO-PARA-IA-SEM-HISTORICO.md` — documento obrigatório para uma instância isolada do Fable 5 que nunca viu o projeto.
16. `16-GALERIA-TANITA-MISSOES-E-LOJA.md` — implementação do ciclo atual, decisões de produto, banco e ponto de publicação.
17. `17-ROADMAP-PRODUTO-E-APP-NATIVO.md` — fases futuras: OCR Tanita, aplicativo nativo, loja real e integrações esportivas.
18. `18-LOGIN-E-IDENTIDADE-DE-EMAIL.md` — redesign do login, ativos oficiais de marca e plano correto para avatar do remetente/BIMI.
19. `19-LOJA-RESTRITA-PRECOS-E-IDENTIDADE.md` — restrição da loja, catálogo colorido, referências de custo e correção do logotipo oficial no login.
20. `20-PERFIS-TANITA-CORES-DE-TREINO-E-LOJA.md` — correção do perfil, avaliações de todos os papéis, contrato de cores do treinador e catálogo/fornecedores revisados.
21. `21-OCR-PDF-E-IMPORTACAO-DE-TREINOS.md` — OCR Tanita assistido, PDF premium, importação atômica do cronograma XLSX e distinção entre prescrição e atividade concluída.
22. `22-MODOS-METAS-EVOLUCAO-E-LOJA.md` — modos de usuário, poderes técnicos temporários do administrador, metas privadas, evolução do atleta e fornecedores protegidos.
23. `23-PRESCRICAO-PRIVADA-MESOCICLO-E-TANITA-3-FOTOS.md` — destinatários técnicos no modo atleta, calendário/mesociclo privado, Tanita padronizada em três imagens e galeria sem legenda obrigatória.
24. `24-MODOS-SEPARADOS-MOBILE-E-OCR-TANITA-CALIBRADO.md` — separação integral entre gestão e atleta, correção do modal Android, OCR posicional calibrado nas três telas reais e pesquisa de exportação Tanita.
25. `25-AVALIACAO-TETRAPOLAR-PREMIUM-PDF-E-IDENTIDADE.md` — mapa corporal segmentado, evolução, PDF completo em três páginas, logo transparente e favicon oficial.
26. `26-HANDOFF-IMEDIATO-ANATOMIA-OCR-TREINOS-E-MARCA.md` — backlog prioritário ainda não implementado, com correções anatômicas, segurança do OCR, gestão de treinos, logo original e âncora do treinador.

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
- Abacus AI é a plataforma; Fable 5 é o modelo visual usado dentro dela. Não tratar os dois nomes como produtos equivalentes.
- A Fable 5 tem carta branca e a obrigação de elevar radicalmente o visual, mas não pode enfraquecer autorização, Storage privado, avaliações de saúde nem a privacidade dos treinos.
- Garmin, Strava e Sports Tracker são referências de experiência, não integrações obrigatórias desta fase.

## Estado deste pacote

O pacote acompanha a evolução da `main` e das PRs ativas. Consulte `08-LOG-DE-EXECUCAO.md` para a cronologia e `07-PENDENCIAS-E-RETOMADA.md` para o ponto exato de retomada.
