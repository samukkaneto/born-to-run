# Hostinger MCP, formulário de contato e aplicativo nativo

Atualizado em 09/08/2026. Este documento explica três assuntos que não devem ser confundidos pela Abacus AI/Fable 5.

## 1. Hostinger MCP

- servidor oficial remoto: `https://mcp.hostinger.com`;
- configuração local compartilhada entre Codex Desktop e CLI: `C:\Users\ander\.codex\config.toml`;
- autenticação: OAuth concluído com a conta Hostinger do proprietário;
- escopo solicitado pelo proprietário: acesso completo às ferramentas oferecidas pelo servidor, incluindo sites, domínios/DNS, e-mail, VPS, pagamentos/assinaturas e demais módulos disponibilizados pela Hostinger;
- não existe programa local adicional da Hostinger instalado: o MCP é remoto;
- a configuração entrou durante uma sessão ativa. Reiniciar o Codex é necessário para o inventário de ferramentas desta conversa carregar o novo servidor.

Segredos da Hostinger não entram no repositório. Operações futuras continuam limitadas ao pedido explícito do proprietário e devem preservar os registros do Business Email ao alterar DNS.

## 2. Formulário de contato real

Destino oficial: `contato@equipeborntorun.com`.

Fluxo implementado:

1. visitante preenche nome, e-mail e mensagem em `/contato`;
2. o cliente valida os campos e envia JSON para `POST /api/contact`;
3. o servidor repete a validação, rejeita payload excessivo/origem cross-site, aplica honeypot e limite básico;
4. o servidor chama a API da Resend com uma chave exclusiva e privada;
5. a mensagem é enviada de e para o endereço oficial e usa o endereço do visitante em `reply_to`;
6. a tela confirma a entrega sem abrir Gmail, Outlook ou outro aplicativo no dispositivo.

Proteções e operação:

- `RESEND_API_KEY` existe apenas na Vercel, marcada como sensível para Production e Preview;
- chave Resend `Born to Run Contact Form`: permissão somente de envio, restrita a `equipeborntorun.com`;
- a chave separada do Supabase Auth permanece dedicada ao SMTP de autenticação;
- corpo HTML recebe escape; o endpoint não devolve detalhes internos da Resend;
- uma chave de idempotência evita duplicar a mesma mensagem em tentativas repetidas;
- o link direto `mailto:` permanece somente como fallback quando o serviço estiver indisponível;
- o Aviso de Privacidade registra os dados do contato e o processamento pela Resend.

Quando o volume crescer, trocar o limite em memória por rate limiting distribuído/Firewall sem alterar o contrato do formulário.

## 3. Conteúdo institucional corrigido

Não afirmar que a equipe tem 200 atletas atuais. A informação foi removida de todas as telas e fontes encontradas.

Dados numéricos autorizados atualmente:

- fundada em 2015;
- mais de 200 participações em corridas.

Premiações e troféus poderão ser adicionados mais tarde somente depois que o proprietário fornecer números, nomes, imagens e contexto verificáveis.

## 4. PWA não é APK

O botão “Instalar aplicativo” instala uma PWA:

- ícone na tela inicial;
- abertura em janela própria;
- atualização automática pela web;
- experiência responsiva no Android, iOS e desktop.

Isso não produz um arquivo `.apk`, não cria um binário Android nativo e não publica na Google Play. A futura fase Android deve decidir tecnologia, identidade de pacote, assinatura, conta Google Play, notificações, ciclo de releases, telemetria, privacidade e estratégia de reutilização do backend Supabase. Não iniciar essa fase durante o piloto sem uma decisão nova do proprietário.

## 5. Evidências e retomada

- domínio Resend `equipeborntorun.com`: verificado;
- variável Vercel `RESEND_API_KEY`: presente em Preview e Production, valor criptografado;
- gates locais do bloco: lint, TypeScript, 52/52 unitários, build de 32 rotas e 26/26 E2E desktop/mobile aprovados;
- build, E2E, CI, deployment e teste de entrega real devem ser consultados na entrada mais recente de `08-LOG-DE-EXECUCAO.md`.
