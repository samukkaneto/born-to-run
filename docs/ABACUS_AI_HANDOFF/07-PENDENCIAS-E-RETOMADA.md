# Pendências e ponto de retomada

Atualizar este arquivo após cada bloco.

## Em andamento

- Bloco 2: configurações de Auth, proteção contra senhas vazadas e preparação de SMTP/templates.

## Concluído neste ciclo

- Bloco 0: pacote canônico de relatórios criado e publicado na branch.
- Bloco 1: vazamento de metadados de perfil e integridade de referências de mídia resolvidos no código e no Supabase remoto.

## Próxima ação técnica

Confirmar o plano da organização Supabase e a configuração atual do Auth. Habilitar proteção contra senhas vazadas se o plano permitir; preparar SMTP e templates sem registrar credenciais no Git. Se credenciais/domínio ainda não existirem, deixar runbook exato e gate de validação prontos.

## Fila planejada

1. proteção contra senhas vazadas;
2. SMTP e templates;
3. piloto com usuários reais;
4. PWA/mobile;
5. privacidade/LGPD e operação;
6. auditoria final e release.

## Dependências do proprietário

- Provedor SMTP, domínio/remetente e credenciais SMTP;
- criação das contas reais para o piloto;
- decisão posterior sobre lojas Android/iOS;
- aprovação visual final da Fable 5.

Essas dependências não impedem o Codex de adiantar código, documentação, testes e auditorias independentes delas.
