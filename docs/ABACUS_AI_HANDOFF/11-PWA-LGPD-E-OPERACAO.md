# PWA, privacidade/LGPD e operação

Atualizado em 09/08/2026 após o Bloco 3.

## PWA entregue

- manifesto com `id`, `scope`, nome, cores, ícones 192/512 e atalhos;
- metadados Apple Web App e ícone adequado;
- service worker versionado em `public/sw.js`;
- registro automático somente em produção;
- página `/instalar` com fluxo Android/desktop e instruções iOS;
- página `/offline`;
- cache restrito a páginas institucionais e assets públicos;
- navegação privada nunca é guardada: offline em `/dashboard` ou `/admin` recebe a página genérica sem dados da equipe.

Isso torna a experiência instalável como PWA. Não cria binário Android/iOS e não publica em Google Play ou App Store.

## Segurança web adicional

- `X-Content-Type-Options: nosniff`;
- `X-Frame-Options: DENY`;
- `Referrer-Policy: strict-origin-when-cross-origin`;
- `Permissions-Policy` bloqueando microfone, geolocalização, pagamento e USB não usados;
- `sw.js` sempre revalidado, sem cache do próprio worker;
- dashboard, admin e rotas de autenticação com `noindex`, `nofollow` e `nocache`.

A câmera não foi bloqueada porque o fluxo de publicação pode usar o seletor de fotos/câmera do dispositivo.

## Transparência e LGPD

- `/privacidade` descreve dados, finalidades, fornecedores, visibilidade, conservação, segurança e direitos do titular;
- `/termos` descreve acesso fechado, conta, convivência, conteúdo, treinos/saúde, moderação e disponibilidade;
- footer liga para privacidade, termos e instalação;
- cadastro exige ciência dos dois documentos no cliente e no Server Action;
- versão e instante de aceite são registrados em `auth.users.user_metadata` no cadastro;
- Web Analytics e Speed Insights da Vercel foram ativados/configurados no Bloco 5 para métricas anônimas, sem cookies de publicidade; queries, fragmentos e UUIDs são removidos antes do envio;
- não há publicidade nem rastreamento individual, então não foi criado um banner de consentimento sem finalidade real.

## Dependências jurídicas do proprietário

Antes de abertura pública ampla ou cobrança:

1. fornecer identificação formal do controlador (nome/razão social e CPF/CNPJ conforme aplicável);
2. fornecer canal oficial de privacidade, preferencialmente e-mail no domínio;
3. definir responsável/encarregado conforme orientação jurídica aplicável;
4. revisar prazos de retenção e hipóteses legais com profissional jurídico;
5. revisar termos comerciais se houver cobrança;
6. substituir os avisos de revisão provisória nas páginas após aprovação.

O canal provisório documentado é o Instagram oficial `@equipeborntorun`; nenhum contato foi inventado.

## Evidências

- sintaxe de `sw.js` aprovada por `node --check`;
- manifesto validado como JSON;
- lint e TypeScript aprovados;
- build Next.js 16.3.0 aprovado com 31 rotas;
- matriz E2E: 21/22 na execução paralela; o único timeout ocorreu ao fechar o Chromium na home desktop, sem falha de asserção;
- repetição isolada da home desktop: aprovada;
- PWA/offline em Desktop Chrome e Pixel 7: 2/2;
- privacidade/termos e axe em desktop/mobile: 4/4;
- resultado funcional consolidado: 22/22 casos cobertos, sem violação axe séria/crítica.

## Fontes oficiais

- https://web.dev/learn/pwa/web-app-manifest
- https://web.dev/learn/pwa/installation
- https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares
- https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm
