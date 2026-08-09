# Pendências e ponto de retomada

Atualizar este arquivo após cada bloco.

## Em andamento

- Bloco 0: consolidar o pacote de relatórios para a Abacus AI.

## Próxima ação técnica

Auditar todas as leituras de `profiles`, desenhar uma interface pública mínima de perfil e resolver o vazamento P2 de `status_note`, `reviewed_at` e `reviewed_by` sem quebrar os guards de acesso ou o painel administrativo.

## Fila planejada

1. privacidade de metadados de perfis;
2. integridade/existência de mídia;
3. proteção contra senhas vazadas;
4. SMTP e templates;
5. piloto com usuários reais;
6. PWA/mobile;
7. privacidade/LGPD e operação;
8. auditoria final e release.

## Dependências do proprietário

- Provedor SMTP, domínio/remetente e credenciais SMTP;
- criação das contas reais para o piloto;
- decisão posterior sobre lojas Android/iOS;
- aprovação visual final da Fable 5.

Essas dependências não impedem o Codex de adiantar código, documentação, testes e auditorias independentes delas.
