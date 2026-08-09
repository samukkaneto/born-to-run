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
- Bloco 8 em finalização: dado institucional corrigido, formulário transacional Resend implementado e Hostinger MCP autorizado.

## Próxima ação

Depois da publicação e do teste de entrega real do formulário, o ponto exato de retomada é executar a matriz do piloto com contas reais em `12-OPERACAO-PILOTO-E-RELEASE.md`.

O administrador foi localizado e está `active` com e-mail confirmado. O proprietário recebeu o identificador exato fora do repositório. Se não lembrar a senha, deve usar `https://equipeborntorun.com/recuperar-senha` com esse e-mail.

## Fila planejada

1. executar o piloto com usuários reais;
2. depois do piloto, escolher Supabase Pro ou rotina externa de backup criptografado;
3. completar a identificação formal do controlador quando houver os dados jurídicos;
4. solicitar à Fable 5 a aprovação/refinação visual final sem alterar os contratos técnicos.
5. planejar o aplicativo Android nativo e APK como fase separada somente após estabilizar o piloto web/PWA.

## Dependências do proprietário

- criação das contas reais para o piloto;
- decisão posterior sobre lojas Android/iOS;
- aprovação visual final da Fable 5.
- identificação formal do controlador; o canal piloto é `contato@equipeborntorun.com`;
- decisão entre Supabase Pro ou rotina externa de backup criptografado.

Essas dependências não impedem o Codex de adiantar código, documentação, testes e auditorias independentes delas.

## Limpeza operacional remanescente

- Os dois Personal Access Tokens temporários criados no Supabase foram revogados e o painel confirmou `No access tokens found`.
- A chave redundante `Supabase Auth Born to Run v2` foi removida da Resend em 09/08/2026. A credencial SMTP ativa, restrita ao domínio `equipeborntorun.com`, foi preservada.
- A exclusão do token temporário `Codex Born to Run DNS` foi confirmada anteriormente no modal da Hostinger. Três novas tentativas de abrir/reler `hpanel.hostinger.com/api` ficaram presas no carregamento e interromperam a conexão do painel. A confirmação visual da tabela continua pendente, sem impacto funcional no aplicativo.
- Se a Hostinger voltar a carregar normalmente, a única ação remanescente é verificar que não existe uma linha chamada `Codex Born to Run DNS`. Não criar novo token só para realizar essa conferência.
