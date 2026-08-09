# Pendências e ponto de retomada

Atualizar este arquivo após cada bloco.

## Estado do ciclo técnico

Todos os blocos que independiam de credenciais, plano pago, dados formais ou usuários reais foram concluídos. A auditoria final deu **GO**, o PR #2 foi mesclado e a produção foi validada no commit `7f66eb8`.

## Concluído neste ciclo

- Bloco 0: pacote canônico de relatórios criado e publicado na branch.
- Bloco 1: vazamento de metadados de perfil e integridade de referências de mídia resolvidos no código e no Supabase remoto.
- Bloco 2: callback, regras locais de senha, oito templates e runbook SMTP preparados; ativação remota bloqueada de forma explícita pelo plano Free e pela ausência de domínio/credenciais.
- Bloco 3: PWA instalável, offline público seguro, headers, noindex privado, privacidade, termos e aceite versionado entregues.
- Bloco 4: health check, observabilidade anônima, audit no CI, Dependabot, política de segurança, estratégia de backup e checklist do piloto entregues.
- Bloco 5: auditoria pesada sem P0/P1, PR #2 mesclado, CI do merge verde e deployment de produção `READY/PROMOTED` validado.

## Próxima ação

Domínio, SSL, URL oficial de Auth, Resend, SMTP e templates já estão concluídos. O ponto exato de retomada é publicar esta branch, acompanhar CI/deploy e então executar a matriz do piloto com contas reais em `12-OPERACAO-PILOTO-E-RELEASE.md`.

## Fila planejada

1. publicar e validar a atualização de domínio/e-mail;
2. executar o piloto com usuários reais;
3. depois do piloto, escolher Supabase Pro ou rotina externa de backup criptografado;
4. completar a identificação formal do controlador quando houver os dados jurídicos;
5. solicitar à Fable 5 a aprovação/refinação visual final sem alterar os contratos técnicos.

## Dependências do proprietário

- criação das contas reais para o piloto;
- decisão posterior sobre lojas Android/iOS;
- aprovação visual final da Fable 5.
- identificação formal do controlador; o canal piloto é `contato@equipeborntorun.com`;
- decisão entre Supabase Pro ou rotina externa de backup criptografado.

Essas dependências não impedem o Codex de adiantar código, documentação, testes e auditorias independentes delas.
