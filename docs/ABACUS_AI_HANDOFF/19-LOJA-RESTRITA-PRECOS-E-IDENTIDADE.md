# Loja restrita, preços pesquisados e identidade oficial

Atualizado em 11/08/2026. Este documento substitui o estado de loja descrito no registro histórico `16-GALERIA-TANITA-MISSOES-E-LOJA.md`.

## Decisão do proprietário

- A loja não pode ser pública enquanto ainda estiver em curadoria.
- Somente o administrador e o treinador podem visualizá-la.
- A interface precisa se comportar como produto profissional, sem frases de demonstração, próximos passos técnicos ou recados destinados ao proprietário/Prof. Robson.
- Preto continua na coleção, mas não pode dominar todos os produtos. Verde lima, rosa, amarelo, azul royal, turquesa, branco e laranja fazem parte da apresentação esportiva.
- O preço sugerido deve ser exatamente o dobro do custo de referência pesquisado: custo × 2, isto é, acréscimo de 100% sobre o custo.

## Autorização implementada

- A rota pública `/loja` não renderiza catálogo.
- Sem sessão: redireciona para `/login`.
- Perfil pendente: redireciona para `/acesso-pendente`.
- Perfil suspenso/rejeitado: redireciona para `/acesso-bloqueado`.
- Atleta ativo: redireciona para `/dashboard`.
- Administrador ou treinador ativo: redireciona para `/admin/loja`.
- `/admin/loja` também herda a proteção server-side do layout administrativo. Esconder o link não é o mecanismo de segurança.
- Os links da loja foram removidos do cabeçalho e rodapé públicos e adicionados ao painel de gestão para os dois papéis autorizados.

## Conteúdo e apresentação

Foram removidas da experiência visível as frases `Loja — prévia`, `Prévia conceitual`, `Produtos imaginados`, `Vendas ainda não estão ativas`, `Não constituem oferta comercial` e o texto que explicava etapas futuras ao Prof. Robson.

O catálogo reservado usa linguagem institucional, cards de produto, material esportivo, preço final e paleta disponível. Dois novos mockups WebP ampliam as cores:

- `public/shop-preview/apparel-color-collection.webp`;
- `public/shop-preview/accessories-color-collection.webp`.

Os mockups são referência visual, não contrato de fabricação. Antes da venda real, amostras físicas precisam confirmar tecido, cor, tamanho, resistência da estampa e fidelidade do logotipo.

## Referências e preços em 11/08/2026

| Produto | Custo de referência | Preço sugerido (× 2) | Fonte pesquisada |
|---|---:|---:|---|
| Camiseta técnica dry-fit | R$ 81,99 | R$ 163,98 | FuturaIM |
| Regata performance | R$ 42,00 | R$ 84,00 | Referência pública do Governo do Ceará |
| Top feminino em poliamida | R$ 79,90 | R$ 159,80 | D21 Fitness |
| Short de corrida em tactel | R$ 46,17 | R$ 92,34 | Referência pública de Macuco/RJ |
| Manga longa Dry Performance | R$ 58,00 | R$ 116,00 | ST47 |
| Moletom personalizado | R$ 89,99 | R$ 179,98 | FuturaIM |
| Garrafa térmica 550 ml | R$ 62,80 | R$ 125,60 | Brussax/Shopee |
| Boné esportivo | R$ 38,90 | R$ 77,80 | Mercado Livre |
| Viseira dry-fit | R$ 45,00 | R$ 90,00 | Mercado Livre |
| Mochila saco em microfibra | R$ 18,40 | R$ 36,80 | Brindes Mil, referência de lote |
| Toalha esportiva | R$ 32,00 | R$ 64,00 | Elo7 |
| Caneca 325 ml | R$ 30,00 | R$ 60,00 | Nedd Publicidade |
| Copo térmico 500 ml | R$ 59,90 | R$ 119,80 | Teremaq |

As URLs, a data de consulta, o custo e a fórmula permanecem versionados em `lib/shop/catalog.ts`. Os preços não devem ser alterados manualmente em JSX.

## O que ainda não foi implementado

Não existem carrinho, pedido, estoque, grade de tamanhos, cálculo de frete, checkout, pagamento, nota fiscal ou política comercial operacional. Esses recursos pertencem à fase futura de loja transacional. Até lá, a restrição deve permanecer.

## Correção urgente do logotipo no login

O ciclo anterior usava `public/brand/logo-on-light.png`, uma adaptação de cor que o proprietário considerou uma deturpação visual. Ela foi removida do código do login e está marcada como proibida para reutilização.

`app/(auth)/layout.tsx` agora usa diretamente `public/logo.png`, o arquivo oficial original e completo, tanto no mobile quanto no desktop. Nenhum pixel do logotipo é redesenhado: batimento, corredores, nome `BORN TO RUN` e slogan `Treinamento e Saúde` são preservados. A legibilidade sobre a fotografia usa somente `drop-shadow` CSS e dimensões maiores, sem o antigo retângulo preto.

## Validações do bloco

- Vitest: 60/60 testes aprovados, incluindo fórmula de preço, fontes datadas e variedade de cores.
- TypeScript: aprovado.
- ESLint direcionado: aprovado.
- Screenshot mobile local do login confirmou o logotipo original completo, sem a versão adaptada.
- E2E atualizado para exigir que `/loja` anônima termine em `/login` e que o antigo aviso interno não exista.
- Playwright em modo equivalente ao CI: 28/28 testes aprovados em Desktop Chrome e Pixel 7, incluindo acessibilidade, PWA, login com o arquivo oficial e bloqueio da loja.
- Build de produção: 38 rotas geradas, incluindo `/admin/loja` e o portão dinâmico `/loja`.

## Checkpoint GitHub/Vercel

- Branch: `codex/restrict-store-fix-official-logo`.
- Commit funcional: `008928d`.
- Pull request: `#23`.
- GitHub Actions: run `31468117855`, aprovado.
- Preview Vercel: `dpl_CF4Usg4S1Tp3Wv99R4bbm1jM9R9t`, URL `https://born-to-3ndbm8mln-shabuneto.vercel.app`, estado `READY`.
- O HTML remoto do login contém `/logo.png`, não contém `logo-on-light` e mantém o formulário esperado.
- A rota `/loja` anônima responde `307` para `/login`, sem cache e com `X-Robots-Tag: noindex`.

## Fechamento de produção

- PR `#23` mesclada por squash em `1f37f2e5848a972973691ab209c6533cc5907f43`.
- CI do merge: `31468553109`, aprovado em todas as etapas.
- Vercel Production: `dpl_AJkfB6nyag24AMzKgL5qs6nQT3tT`, URL `https://born-to-3ilhoivzw-shabuneto.vercel.app`, estado `READY`.
- Domínio oficial: `https://equipeborntorun.com` apontando para o deployment novo.
- Smoke remoto: login com `/logo.png` e sem `logo-on-light`; loja e painel sem sessão redirecionam ao login; health na revisão `1f37f2e`.
- Observabilidade: nenhuma entrada `error` ou `fatal` encontrada nos 15 minutos auditados.

Estado do bloco: concluído e publicado. A loja transacional continua deliberadamente fora deste escopo.
