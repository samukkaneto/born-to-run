# Roadmap de produto e aplicativo nativo

## Fase A — piloto fechado

- criar contas reais no cadastro oficial;
- confirmar e-mails;
- Robson criar a própria conta com o e-mail pré-autorizado;
- validar aprovação, feed, galeria, treinos privados, avaliações, missões e resultados;
- coletar feedback sem dados fictícios.

## Fase B — Fable 5 e autonomia editorial

- Fable 5 executa redesign integral com carta branca visual e testes de regressão;
- transformar também home, Sobre, treinador, estatísticas e blocos institucionais em conteúdo gerenciável;
- considerar CMS visual como Sanity, Storyblok ou Payload, ou um editor próprio restrito, sem dar acesso ao código;
- manter histórico, preview e publicação para evitar alterações acidentais.

## Fase C — Tanita assistida

- obter 2–5 relatórios reais anonimizados em PDF e imagem;
- mapear modelo/versão Tanita e todos os campos;
- criar extração determinística para PDF textual e OCR somente como fallback;
- mostrar confiança por campo e exigir revisão humana;
- gerar relatório premium em português, comparativos, gráficos e PDF imprimível;
- evitar diagnóstico médico automático.

## Fase D — aplicativo Android profissional

A PWA atual não é APK nativo. Depois do piloto, escolher:

- React Native/Expo para aplicativo realmente nativo e compartilhamento de regras TypeScript; ou
- Capacitor como transição mais rápida, aceitando experiência mais próxima da web.

Para padrão profissional recomendado: Expo/React Native, push notifications, câmera/galeria, deep links, biometria opcional, distribuição interna, testes em aparelhos reais, política da Play Store e publicação gradual.

## Fase E — loja real

- validar demanda e fornecedores antes de programar checkout;
- definir SKU, tamanho, cor, custo, margem e estoque;
- escolher plataforma: Shopify/Nuvemshop integrada ou catálogo/pedidos próprios com Stripe/Mercado Pago;
- implementar frete, trocas, privacidade, fiscal e suporte;
- nunca ativar pagamento antes de homologação financeira e jurídica.

## Fase F — Garmin e Strava

- verificar APIs oficiais, termos de uso, aprovação do aplicativo e limites;
- OAuth individual e consentimento granular;
- importar apenas atividades autorizadas e evitar duplicidade;
- respeitar exclusão/revogação;
- não usar scraping nem credenciais pessoais dos atletas.
