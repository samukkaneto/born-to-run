# Pendências e ponto de retomada

Atualizar este arquivo após cada bloco.

## Em andamento

- Bloco 5: PR, CI hospedado, preview final e auditoria pesada antes de decidir o merge/release.

## Concluído neste ciclo

- Bloco 0: pacote canônico de relatórios criado e publicado na branch.
- Bloco 1: vazamento de metadados de perfil e integridade de referências de mídia resolvidos no código e no Supabase remoto.
- Bloco 2: callback, regras locais de senha, oito templates e runbook SMTP preparados; ativação remota bloqueada de forma explícita pelo plano Free e pela ausência de domínio/credenciais.
- Bloco 3: PWA instalável, offline público seguro, headers, noindex privado, privacidade, termos e aceite versionado entregues.
- Bloco 4: health check, observabilidade anônima, audit no CI, Dependabot, política de segurança, estratégia de backup e checklist do piloto entregues.

## Próxima ação técnica

Criar PR da branch, aguardar CI e preview Git, validar o deployment hospedado e executar a auditoria final pesada. Testes de SMTP e usuários reais continuam aguardando as dependências do proprietário.

## Fila planejada

1. PR e CI do ciclo;
2. preview hospedado e métricas;
3. auditoria final pesada;
4. merge/release se todos os gates estiverem verdes;
5. SMTP e piloto real após o proprietário fornecer as dependências.

## Dependências do proprietário

- Provedor SMTP, domínio/remetente e credenciais SMTP;
- criação das contas reais para o piloto;
- decisão posterior sobre lojas Android/iOS;
- aprovação visual final da Fable 5.
- identificação formal e e-mail de privacidade;
- decisão entre Supabase Pro ou rotina externa de backup criptografado.

Essas dependências não impedem o Codex de adiantar código, documentação, testes e auditorias independentes delas.
