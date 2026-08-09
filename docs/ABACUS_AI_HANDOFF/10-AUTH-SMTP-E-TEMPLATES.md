# Auth, SMTP e templates de e-mail

Atualizado em 08/08/2026 durante o Bloco 2 de prontidão.

## Estado comprovado

- Organização Supabase: `born-to-run`.
- Plano atual: `Free`.
- A proteção contra senhas vazadas exige plano Pro ou superior e, por isso, não pode ser ativada no plano atual.
- O SMTP padrão do Supabase é demonstrativo, tem limite baixo e não atende um piloto com usuários externos.
- O callback do aplicativo é `/auth/callback` e o cadastro agora informa explicitamente `emailRedirectTo`.
- A configuração local exige senha com 8 caracteres, letra e número, confirmação de e-mail e callbacks exatos.
- Oito templates em português foram versionados em `supabase/templates/`.

## Recomendação de SMTP

Usar Resend via SMTP é a opção preferencial para este projeto na Vercel. Isso não exige SDK novo no aplicativo: o próprio Supabase Auth envia os e-mails.

Credenciais documentadas pelo provedor:

- host: `smtp.resend.com`;
- porta recomendada: `465` com TLS implícito ou `587` com STARTTLS;
- usuário: `resend`;
- senha: API key do Resend;
- remetente: endereço de um domínio verificado pelo proprietário.

Nunca colocar a API key no Git, em `.env*` versionado, em variável `NEXT_PUBLIC_*` ou neste relatório.

## Dependências do proprietário

1. possuir ou adquirir um domínio que possa receber registros DNS;
2. criar/conectar uma conta Resend;
3. verificar o domínio no Resend por SPF/DKIM;
4. definir o remetente, por exemplo `Born to Run <acesso@seudominio.com.br>`;
5. fornecer a credencial diretamente no painel seguro do Supabase, nunca pelo repositório.

Sem domínio verificado, o Resend oferece apenas remetente de teste e limita destinatários; isso não deve ser tratado como produção.

## Procedimento no Supabase Dashboard

1. Abrir **Authentication → Emails → SMTP Settings**.
2. Ativar SMTP personalizado.
3. Preencher remetente, host, porta, usuário e senha do provedor.
4. Abrir **Authentication → Email Templates**.
5. Copiar assunto e HTML dos arquivos em `supabase/templates/` para os templates correspondentes.
6. Ativar notificações de senha alterada e e-mail alterado.
7. Em **Authentication → URL Configuration**, usar:
   - Site URL: `https://born-to-run-seven.vercel.app`;
   - redirect de produção: `https://born-to-run-seven.vercel.app/auth/callback`;
   - previews: autorizar somente URLs exatas usadas em testes.
8. Em **Authentication → Rate Limits**, ajustar o limite de e-mails ao tamanho do piloto sem criar uma janela de abuso.
9. Desativar tracking de links no provedor SMTP, porque ele pode reescrever links de confirmação.

## Proteção de senha

Após upgrade para Pro:

1. abrir **Authentication → Sign In / Password Security**;
2. manter mínimo de 8 caracteres e requisito de letra + número;
3. ativar **Leaked Password Protection**;
4. executar novamente o Security Advisor e confirmar que o warning desapareceu;
5. testar cadastro com uma senha conhecida como comprometida e confirmar a rejeição sem registrar a senha.

O código já valida 8 caracteres, letra e número, mas a configuração do Auth também precisa impor a regra para bloquear chamadas diretas à API.

## Matriz de teste do piloto

1. cadastro real recebe o e-mail com identidade Born to Run;
2. link confirma o e-mail e termina em `/acesso-pendente`;
3. usuário não acessa o dashboard antes da aprovação;
4. treinador aprova e o usuário consegue entrar;
5. recuperação chega à caixa real e termina em `/recuperar-senha/nova`;
6. nova senha funciona e a antiga deixa de funcionar;
7. notificação de alteração de senha é recebida;
8. links não são reescritos pelo provedor;
9. bounce, spam e logs do provedor são verificados;
10. nenhum segredo aparece no browser, logs, GitHub ou Vercel.

## Fontes oficiais

- https://supabase.com/docs/guides/auth/auth-smtp
- https://supabase.com/docs/guides/auth/auth-email-templates
- https://supabase.com/docs/guides/auth/password-security
- https://resend.com/docs/send-with-supabase-smtp
- https://resend.com/docs/send-with-smtp
