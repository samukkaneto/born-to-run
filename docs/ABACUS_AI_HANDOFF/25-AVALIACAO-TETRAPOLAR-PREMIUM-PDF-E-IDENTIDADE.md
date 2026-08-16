# Avaliação Tetrapolar premium, PDF completo e identidade

Atualizado em 15/08/2026. Este documento registra o bloco visual executado depois que a calibração do OCR Tanita foi aprovada pelo proprietário.

> **Correção posterior de 16/08/2026:** este documento preserva o histórico do que foi publicado, mas a silhueta geométrica do mapa corporal e a variante `logo-on-light.png` foram rejeitadas pelo proprietário. Também foi relatado um valor segmentar incorreto que precisa ser reproduzido. Não usar esses pontos como referência aprovada. O backlog substitutivo e os critérios de aceite estão em `26-HANDOFF-IMEDIATO-ANATOMIA-OCR-TREINOS-E-MARCA.md`.

## Decisões obrigatórias do produto

- o nome oficial da tela e do documento é **Avaliação Tetrapolar Segmentada**;
- a frase sobre acompanhamento presencial pelo Prof. Robson Alves foi removida da avaliação;
- os gráficos de faixas já aprovados foram preservados;
- a leitura segmentar deve mostrar braços, pernas e tronco em um corpo humano, além do equilíbrio entre lados;
- a avaliação precisa mostrar evolução histórica do atleta;
- o PDF deve conter todos os resultados gerais, todos os segmentos e a evolução, sem voltar ao relatório Tanita visualmente fraco;
- a foto do atleta deve usar recorte circular e moldura profissional;
- o acesso deve usar o logotipo oficial transparente apropriado ao fundo claro, sem sombra, filtro, painel ou pixels adulterados;
- o navegador/PWA deve exibir um ícone real da equipe;
- o rótulo visível é somente **Meta**;
- a loja permaneceu fora deste bloco.

As referências Tanita fornecidas foram usadas apenas para entender organização e densidade: cartões de resultado, mapa segmentar, balanço bilateral e histórico. A paleta, a hierarquia e a identidade visual continuaram sendo da Born to Run.

## Avaliação no aplicativo

`/dashboard/avaliacoes` passou a usar largura maior e uma apresentação dividida em três camadas:

1. identidade da avaliação, atleta e medição mais recente;
2. resultados gerais e faixas de referência já existentes;
3. mapa corporal segmentado e evolução histórica.

O novo `SegmentedBodyMap` apresenta:

- silhueta humana responsiva;
- braço esquerdo, braço direito, tronco, perna esquerda e perna direita;
- gordura corporal e massa muscular em cada uma das cinco regiões, totalizando 10 leituras;
- marcadores corporais e legenda cromática;
- quatro indicadores de equilíbrio bilateral: gordura e músculo nos braços e nas pernas;
- estado vazio explícito quando uma avaliação antiga não possuir dados segmentais.

O novo `AssessmentEvolution` apresenta seis indicadores principais em gráficos de linha:

- peso;
- gordura corporal;
- massa muscular;
- água corporal;
- IMC;
- gordura visceral.

Cada gráfico usa todas as avaliações disponíveis, mostra primeira e última data, valor atual e variação. Uma única medição mostra corretamente que a próxima avaliação iniciará a linha de evolução.

## PDF de três páginas

O gerador em `lib/assessments/pdf.ts` foi reconstruído. O arquivo agora possui três páginas A4:

1. **Resultados gerais:** logo, título oficial, atleta, data, foto circular com anel vermelho, 15 indicadores gerais, faixa de gordura corporal, protocolo e observações;
2. **Mapa segmentado:** corpo humano, quatro chamadas laterais, tronco, as 10 leituras segmentares e quadro completo de equilíbrio;
3. **Evolução:** os seis gráficos históricos e as quatro medições mais recentes em tabela comparativa.

Os 15 indicadores gerais são peso, gordura corporal, massa de gordura, massa livre de gordura, massa muscular, água corporal, massa de água, gordura visceral, IMC, idade metabólica, massa óssea, metabolismo basal, ingestão calórica diária, frequência cardíaca e classificação física.

O documento usa o nome e metadados **Avaliação Tetrapolar Segmentada**, gera nome de arquivo coerente e mantém a nota de que resultados de acompanhamento não substituem diagnóstico médico.

## Identidade visual

- `app/(auth)/layout.tsx` usa `public/brand/logo-on-light.png`, variante oficial com letras escuras e transparência para o fundo claro;
- os `drop-shadow` anteriores foram removidos completamente;
- o logo usa proporção natural e não fica dentro de painel artificial;
- `app/favicon.ico` foi regenerado em múltiplas resoluções a partir do ícone oficial completo;
- o metadata aponta para o PNG oficial de 192 × 192;
- o teste E2E protege o caminho da variante transparente e exige `filter: none`;
- rótulos visíveis de meta foram reduzidos para `Meta`, sem alterar a privacidade real do dado.

## Arquivos funcionais

- `components/assessments/SegmentedBodyMap.tsx`;
- `components/assessments/AssessmentEvolution.tsx`;
- `app/(dashboard)/dashboard/avaliacoes/page.tsx`;
- `components/admin/AssessmentManager.tsx`;
- `components/assessments/AssessmentPdfButton.tsx` permanece como acionador;
- `lib/assessments/pdf.ts`;
- `app/(auth)/layout.tsx`;
- `app/layout.tsx`;
- `app/favicon.ico`;
- `app/(dashboard)/dashboard/page.tsx`;
- `app/(dashboard)/dashboard/perfil/page.tsx`;
- `components/feed/PerfilForm.tsx`;
- `tests/unit/assessment-pdf.test.ts`;
- `tests/e2e/public.spec.ts`.

Não houve migration, alteração de schema, RLS, Storage, OCR, parsing Tanita, catálogo, fornecedores ou mockups da loja.

## Evidências

- `npm run check`: aprovado;
- ESLint e TypeScript: aprovados;
- unitários: 14 arquivos e 76 testes aprovados;
- build Next.js 16.3: aprovado com 40 rotas;
- matriz Playwright: 28 cenários aprovados entre Desktop Chrome e Pixel 7;
- screenshots locais: 1440 × 1000 e 390 × 844, sem overflow horizontal e sem erro de console;
- PDF: 3 páginas A4, 367.326 bytes na amostra, renderizadas a 150 DPI e inspecionadas individualmente;
- favicon de produção: `image/vnd.microsoft.icon`, 51.958 bytes;
- avaliação privada anônima: `307` para login.

## Publicação

- commit funcional da branch: `1a4c915c5b2567090a4f47097482fa43621416a7`;
- PR [#34](https://github.com/samukkaneto/born-to-run/pull/34);
- CI da PR: `31894121724`, aprovado;
- preview Vercel: `dpl_871fCLaaCNPhsrsymWC8zYqDdnSf`, `READY`;
- merge na `main`: `6a38acc49ab09de92d62d319d2e358ea37e7ea5f`;
- CI da `main`: `31894361903`, aprovado integralmente;
- produção Vercel: `dpl_DoAT7djHUS9JgJSBDZUP5Ew477ZS`, `READY`;
- domínio oficial e alias legado apontam para o mesmo artefato;
- `/api/health` confirmou revisão `6a38acc`.

## Próximo teste real

1. Samuel entra no modo Aluno e abre a própria avaliação;
2. Robson entra no modo Atleta e abre uma avaliação atribuída a ele;
3. comparar na tela os 25 valores com as três imagens Healthy Edge Lite;
4. baixar o PDF em Android e desktop e confirmar foto, três páginas e valores;
5. cadastrar uma segunda avaliação real para conferir as linhas de evolução;
6. registrar qualquer ajuste pontual antes de retomar a loja.

O OCR continua com revisão humana obrigatória. O PDF e os gráficos apresentam acompanhamento; não geram diagnóstico automático.
