# Modos separados, mobile e OCR Tanita calibrado

Atualizado em 15/08/2026. Este documento registra a correção solicitada após o primeiro teste móvel real do fluxo de avaliações.

## Decisão de produto

Samuel e Robson possuem duas experiências independentes dentro da mesma conta autenticada:

| Pessoa | Modo de gestão | Modo esportivo |
|---|---|---|
| Samuel | Administrador, com ferramentas técnicas para teste e auditoria | Aluno, igual a qualquer aluno |
| Robson Alves | Treinador, responsável pela operação esportiva real | Atleta, igual a qualquer atleta |

O papel técnico continua armazenado em `profiles.role`; não foram criadas contas duplicadas nem papéis conflitantes. A separação acontece por contexto protegido:

- `/admin/*` contém somente gestão;
- `/dashboard/*` contém somente a experiência do aluno/atleta;
- `RoleModeSwitcher` é a única passagem explícita entre os dois contextos;
- o menu do atleta não contém atalho administrativo;
- o menu da gestão não contém `Meu perfil` nem `Voltar ao dashboard`;
- nos seletores de destinatário, Samuel aparece como `Perfil de aluno` e Robson como `Perfil de atleta`.

O administrador mantém as ferramentas do treinador somente para teste, verificação de bugs e suporte. Isso não muda a operação normal: Robson é o treinador que prescreve de verdade.

## Correção do enquadramento móvel

O problema estava no modal genérico de gestão. Ele era alinhado ao rodapé com `max-height: 92vh`; em navegadores Android com barra dinâmica, `vh` podia representar uma área maior que o espaço realmente visível. O topo do modal ficava fora da tela, escondendo o título e quase toda a seleção de pessoa avaliada.

`AdminModal` passou a usar:

- `100dvh`, que acompanha a altura visual dinâmica do navegador;
- modal em tela inteira no mobile e centralizado somente a partir de `sm`;
- cabeçalho fixo como item `shrink-0`;
- corpo independente com `overflow-y-auto`, `min-height: 0` e `overscroll-contain`;
- áreas seguras `env(safe-area-inset-top/bottom)`;
- rolagem explicitamente reiniciada no topo sempre que o modal abre;
- bloqueio da rolagem do documento enquanto a janela está aberta.

Validação Playwright em viewport móvel `390 × 844`:

- título iniciou em `top = 17`;
- seletor `Pessoa avaliada` ficou integralmente entre `120` e `168`;
- rolagem iniciou em `0`;
- o corpo rolou até o máximo de `734`;
- o botão final ficou integralmente visível entre `777,5` e `822,5`, dentro de `844`;
- o título permaneceu no topo durante a rolagem.

A rota temporária usada para essa inspeção foi removida e não faz parte do produto.

## Mapa confirmado das três imagens

As três imagens originais foram relidas localmente. Elas pertencem ao **Tanita Healthy Edge Lite**, em tela 16:9, e seguem posição estável:

- **Foto 1 · Resumo:** data, peso, IMC, gordura corporal, massa de gordura, faixa de gordura, massa livre de gordura, gordura visceral, água corporal, massa de água, massa muscular, massa óssea, frequência cardíaca quando preenchida, metabolismo basal, idade metabólica, ingestão calórica diária e classificação física;
- **Foto 2 · Faixas:** data e os quatro indicadores redundantes de IMC, gordura corporal, água corporal e gordura visceral;
- **Foto 3 · Segmentos:** cinco regiões com gordura e massa muscular: braços esquerdo/direito, tronco e pernas esquerda/direita.

O arquivo de referência possui 14 indicadores gerais preenchidos, 10 valores segmentais e frequência cardíaca vazia. Campo vazio permanece vazio; o sistema não inventa medida.

## Calibração avançada do OCR

O OCR antigo tratava cada screenshot inteiro como texto corrido, em tons de cinza e com uma única estratégia de segmentação. O fundo preto, as caixas claras e os gráficos coloridos faziam o Tesseract perder dígitos e associações.

O novo fluxo mantém OCR geral como fallback, mas acrescenta uma leitura por template:

1. confirma a proporção 16:9 do Healthy Edge Lite;
2. recorta cada célula pela posição normalizada na tela de referência 1280 × 720;
3. amplia cada célula entre 20× e 24× sem alterar o arquivo privado;
4. usa leitura de linha única e conjunto de caracteres adequado ao campo;
5. restaura a casa decimal que o OCR frequentemente omite em células pequenas;
6. lê data, faixa e classificação física com tratamento próprio;
7. cruza massa de gordura, massa livre, massa de água e massa muscular com as relações redundantes do relatório;
8. restringe cada foto ao conjunto de campos que ela deve preencher, evitando que a Foto 3 sobrescreva o resumo;
9. mantém revisão humana obrigatória antes de salvar.

Na calibração local das imagens reais:

- Foto 1: todos os 14 indicadores gerais preenchidos foram recuperados; frequência cardíaca permaneceu corretamente vazia;
- Foto 2: os quatro gráficos funcionam como segunda fonte para os indicadores repetidos;
- Foto 3: **10/10 valores segmentais** foram recuperados corretamente;
- nenhum arquivo original, nome da pessoa avaliada ou dado clínico identificável foi adicionado ao Git.

Os testes unitários cobrem restauração decimal, rejeição de valores impossíveis e reconciliação das massas truncadas.

## Exportação do software Tanita

Pesquisa feita em fontes oficiais em 15/08/2026:

- o suporte oficial mantém o [manual do Healthy Edge Lite](https://support.tanita.eu/support/solutions/articles/60000716476-how-does-healthy-edge-lite-software-work-), mas não documenta nessa página uma exportação CSV do Lite;
- o [TANITA PRO 2.0](https://tanita.eu/tanita-pro-software) atual oferece CSV, Excel, HL7, GDT, API e Thedex, porém a lista oficial de compatibilidade cita MC-980, MC-780, MC-580, DC-430, DC-360 e DC-240, não o BC-1500 mostrado nas imagens;
- a TANITA documenta [exportação para Excel no TANITA PRO](https://support.tanita.eu/support/solutions/articles/60001525812-how-to-export-measurement-data-from-tanita-pro-software-to-excel);
- existe uma página oficial do [Healthy Edge Plus](https://tanita.com/products/healthy-edge-plus), produto historicamente associado a exportação CSV, mas não se deve assumir que a licença Plus está instalada ou disponível no computador do treinador.

Decisão atual: manter as três imagens como entrada oficial já funcional. Antes de comprar outro software, verificar no computador que realiza a medição se o menu **File** do Healthy Edge Lite oferece exportação e se a licença/equipamento permitem upgrade para Healthy Edge Plus. Se um CSV real for obtido, ele deve virar uma entrada adicional mais precisa, sem remover o fluxo de imagens.

## Arquivos alterados

- `components/admin/AdminModal.tsx`;
- `components/admin/AdminNav.tsx`;
- `components/dashboard/DashboardNav.tsx`;
- `components/navigation/RoleModeSwitcher.tsx` permanece como passagem única;
- `app/(dashboard)/layout.tsx`;
- `components/admin/AssessmentManager.tsx`;
- `components/admin/WorkoutsManager.tsx`;
- `lib/assessments/ocr-client.ts`;
- `lib/assessments/tanita-template.ts`;
- `tests/unit/tanita-ocr.test.ts`.

Não houve alteração de banco, migration, RLS, Storage, loja, catálogo, logotipos ou mockups neste bloco.

## Evidências antes da publicação

- TypeScript: aprovado;
- ESLint direcionado: aprovado;
- ESLint completo: aprovado;
- unitários: 14 arquivos e 76 testes aprovados;
- build Next.js 16.3: aprovado, com 40 rotas;
- Playwright de produção: 28/28 em Desktop Chrome e Pixel 7, incluindo PWA e acessibilidade pública;
- calibração privada: Foto 1 completa nos campos preenchidos e Foto 3 em 10/10;
- inspeção mobile: viewport 390 × 844 aprovada, com topo e rodapé acessíveis.

Os identificadores de PR, CI, merge e Vercel devem ser acrescentados ao fechamento desta seção após a publicação.

## Próximo teste real

1. entrar como Samuel e alternar entre Administrador e Aluno, conferindo que os menus não se misturam;
2. entrar como Robson e alternar entre Treinador e Atleta;
3. no modo Administrador, abrir `Nova avaliação` em Android real;
4. selecionar a pessoa avaliada e anexar Foto 1, Foto 2 e Foto 3 nessa ordem;
5. comparar os 24 valores preenchidos com o Healthy Edge Lite;
6. corrigir manualmente qualquer leitura atípica antes de salvar;
7. abrir a avaliação no modo aluno/atleta e validar gráficos, segmentos, imagens privadas e PDF.

Somente depois desse piloto o bloco da loja deve ser retomado.
