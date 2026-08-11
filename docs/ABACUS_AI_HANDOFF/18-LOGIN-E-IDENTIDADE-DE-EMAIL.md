# Login e identidade visual dos e-mails

Atualizado em 11/08/2026. Este documento registra o redesign do acesso e separa, sem promessas falsas, o visual interno do e-mail do avatar exibido pela caixa de entrada.

## Pedido do proprietário

1. remover o grande fundo preto que diminuía o logotipo na tela móvel de login;
2. usar o logotipo oficial puro e em tamanho digno;
3. colocar uma fotografia real da equipe ao fundo com opacidade reduzida;
4. deixar o acesso mais premium, vivo e coerente com o aplicativo;
5. fazer mensagens de `contato@equipeborntorun.com` aparecerem no Gmail com um avatar oficial, como marcas grandes;
6. no avatar do remetente, não usar fundo preto nem iniciais genéricas.

## Implementação local concluída

### Tela de login

- `app/(auth)/layout.tsx`: cenário responsivo com a fotografia real `public/team-archive/team-race-palace.jpg`, tratamento claro, marca maior, mensagem editorial no desktop e logo central no celular.
- `app/(auth)/login/page.tsx`: card branco, títulos de alta hierarquia, separador, estados de erro e carregamento acessíveis, foco visível e botão principal preservado.
- A caixa preta anterior foi removida integralmente.
- A fotografia é decorativa no HTML (`alt=""`) porque o conteúdo textual já apresenta a equipe; isso evita repetição para leitores de tela.
- A forma e o comportamento dos campos, Server Action de autenticação e rotas não foram alterados.

### Ativos de marca

- `public/brand/logo-on-light.png`: derivação mecânica de `public/logo.png`. Os elementos claros do nome e slogan foram convertidos para carbono; o batimento, corredores, contornos e desenho oficial foram preservados pixel a pixel.
- `public/brand/email-avatar-512.png`: arquivo 512 × 512, fundo branco, contorno neutro, acento vermelho e logotipo oficial completo. Ele foi pensado para a foto da conta do remetente, não como substituto do logotipo completo dentro do template.
- Nenhum desses arquivos foi gerado redesenhando a marca com inteligência artificial.

## Evidências locais

- TypeScript: aprovado.
- ESLint completo: aprovado.
- Vitest: 57/57 testes aprovados.
- Build de produção: 37 rotas aprovadas.
- `git diff --check`: aprovado antes da atualização documental.
- Mobile: 412 × 915, conteúdo completo, fotografia visível e formulário dentro da viewport longa.
- Desktop: 1440 × 1000, composição editorial à esquerda e formulário à direita.
- Browser: `/login` respondeu `200`, corpo com conteúdo, sem Next.js error overlay e link da marca navegou para `/`.
- Acessibilidade: axe WCAG A/AA sem violações no login inspecionado.
- Playwright direcionado em build de produção: 4/4 — home/login e redirecionamento privado em Desktop Chrome e Pixel 7.

A matriz E2E completa em modo de desenvolvimento não foi usada como gate deste bloco: o arquivo temporário de Preview ativou o Analytics da Vercel em localhost e o caso antigo do service worker excedeu o timeout. O CI do GitHub continua sendo o gate da matriz completa após o push.

## Por que o avatar não vem do HTML

O cabeçalho e a fotografia dentro de `supabase/templates/recovery.html` controlam o conteúdo depois que a mensagem é aberta. O círculo mostrado na lista da caixa de entrada é decidido pelo Gmail, Outlook, Yahoo, Apple Mail ou outro provedor. A Resend não possui um campo SMTP universal que force essa imagem.

## Caminho imediato para Gmail

1. criar uma Conta Google usando o endereço existente `contato@equipeborntorun.com` — isso não obriga contratar Google Workspace nem substituir a caixa Hostinger;
2. confirmar o código recebido na caixa Hostinger;
3. abrir as configurações da Conta Google e carregar `public/brand/email-avatar-512.png` como foto;
4. enviar uma nova recuperação e testar no Gmail mobile e dentro da mensagem aberta no desktop.

Limitações confirmadas pela Resend: a foto está ligada ao provedor e ao mesmo endereço remetente; a decisão final de exibi-la é do Gmail. Ela não garante avatar em todos os clientes. Um Gravatar gratuito pode ampliar cobertura em Thunderbird/Airmail/Postbox, mas também não é universal.

## Caminho corporativo: BIMI

Para exibir identidade de marca de forma mais ampla, o projeto precisa de BIMI. Situação pública em 11/08/2026:

- SPF do apex: `v=spf1 include:_spf.mail.hostinger.com ~all`;
- DMARC: `v=DMARC1; p=none`;
- `default._bimi`: inexistente.

Requisitos atuais para Gmail:

- DMARC com `p=quarantine` ou `p=reject` e `pct=100`;
- alinhamento real de SPF/DKIM de todos os emissores legítimos;
- logotipo em SVG Tiny PS;
- Common Mark Certificate (CMC) ou Verified Mark Certificate (VMC);
- registro DNS BIMI apontando para o logo e certificado.

O domínio usa Hostinger para a caixa e Resend para transacionais. Trocar `p=none` diretamente pode mandar mensagens legítimas para spam ou rejeição se o alinhamento não estiver completo. Portanto, BIMI deve ser um projeto posterior de entregabilidade, com monitoramento gradual de relatórios DMARC e orçamento para certificado.

## Supabase e template de recuperação

- O arquivo versionado correto continua sendo `supabase/templates/recovery.html`.
- O projeto usa SMTP próprio Resend; a restrição introduzida em junho de 2026 para customização em novos projetos Free com SMTP padrão não bloqueia este projeto.
- A configuração remota ainda precisa receber o HTML atualizado em **Authentication → Email Templates → Reset Password**.
- O conector Supabase disponível não expõe Auth config; a CLI não possui Personal Access Token e respondeu `Access token not provided`; o Chrome comum está autenticado, mas o controle do Codex não se conectou a ele.
- Não criar novo token permanente somente para esse ajuste. Preferir reconectar o controle do navegador ou fazer o salvamento assistido no painel já aberto.

## Liberdade futura da Fable 5

A Fable 5 pode elevar novamente tipografia, enquadramento, tratamento de fotografia, microinterações e composição do login. Deve preservar obrigatoriamente:

- fotografia real da equipe;
- logotipo oficial completo e sem deturpação;
- ausência do antigo retângulo preto desproporcional;
- legibilidade AA, foco de teclado e semântica do formulário;
- campos, rotas e Server Action atuais;
- identidade carbono, branco/off-white e vermelho, sem estética genérica de SaaS.

## Fontes oficiais consultadas

- Supabase Email Templates: `https://supabase.com/docs/guides/auth/auth-email-templates`
- Mudança Free Tier de 03/06/2026: `https://supabase.com/changelog/46599-changes-to-email-template-customisation-on-free-tier`
- Resend — avatar: `https://resend.com/docs/knowledge-base/how-do-i-send-with-an-avatar`
- Resend — BIMI: `https://resend.com/docs/dashboard/domains/bimi`
- Google — BIMI: `https://support.google.com/a/answer/10911320`
