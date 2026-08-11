# Pendências e ponto de retomada

Atualizar este arquivo após cada bloco.

## Estado do ciclo técnico — atualização 10/08/2026

O Bloco 10 está implementado e publicado. As cinco migrations estão no Supabase remoto; PR #17 foi mesclada; CI do merge `31451446812` ficou verde; produção `dpl_AjXfjFgjZd92Vh4KXjoP99gfioex` foi validada no domínio oficial.

## Concluído neste ciclo

- Bloco 0: pacote canônico de relatórios criado e publicado na branch.
- Bloco 1: vazamento de metadados de perfil e integridade de referências de mídia resolvidos no código e no Supabase remoto.
- Bloco 2: callback, regras locais de senha, oito templates e runbook SMTP preparados; ativação remota bloqueada de forma explícita pelo plano Free e pela ausência de domínio/credenciais.
- Bloco 3: PWA instalável, offline público seguro, headers, noindex privado, privacidade, termos e aceite versionado entregues.
- Bloco 4: health check, observabilidade anônima, audit no CI, Dependabot, política de segurança, estratégia de backup e checklist do piloto entregues.
- Bloco 5: auditoria pesada sem P0/P1, PR #2 mesclado, CI do merge verde e deployment de produção `READY/PROMOTED` validado.
- Bloco 8 concluído e publicado: dado institucional corrigido, formulário transacional Resend entregue de verdade, Hostinger MCP autorizado e produção validada sem erros.

## Próxima ação exata

Robson cria a conta real pelo cadastro oficial e confirma o e-mail. A pré-autorização continua aguardando no Supabase. Depois, administrador e treinador executam o piloto assistido descrito neste pacote.

O administrador foi localizado e está `active` com e-mail confirmado. O proprietário recebeu o identificador exato fora do repositório. Se não lembrar a senha, deve usar `https://equipeborntorun.com/recuperar-senha` com esse e-mail.

## Fila planejada

1. executar o piloto com usuários reais;
2. depois do piloto, escolher Supabase Pro ou rotina externa de backup criptografado;
3. completar a identificação formal do controlador quando houver os dados jurídicos;
4. solicitar à Fable 5 a aprovação/refinação visual final sem alterar os contratos técnicos.
5. planejar o aplicativo Android nativo e APK como fase separada somente após estabilizar o piloto web/PWA.
6. após o piloto, evoluir as avaliações com gráficos e comparação por período se o proprietário aprovar.
7. fornecer um PDF/JPEG Tanita real anonimizado para calibrar extração automática;
8. ampliar o editor institucional além da galeria;
9. validar a prévia da loja com Robson antes de qualquer checkout;
10. seguir `17-ROADMAP-PRODUTO-E-APP-NATIVO.md` para APK e integrações.

## Dependências do proprietário

- criação das contas reais para o piloto;
- cadastro e confirmação do e-mail real do treinador; nenhuma senha deve ser criada por terceiros;
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
