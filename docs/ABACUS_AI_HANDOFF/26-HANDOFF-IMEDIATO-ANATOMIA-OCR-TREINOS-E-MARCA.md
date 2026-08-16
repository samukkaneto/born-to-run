# Handoff imediato: anatomia, OCR, treinos e marca

Atualizado em 16/08/2026. Este é o documento operacional prioritário para qualquer IA que assumir o projeto.

## Instrução principal

Blocos **A (OCR)**, **C (anatomia)**, **D (gerenciamento de treinos)** e **E (logo/âncora)** já foram **concluídos e mesclados na `main`** (ver seções de status abaixo). O único bloco pendente é **B (exportação Tanita)**. Não confundir o release publicado descrito no documento `25` com aprovação visual definitiva.

A próxima IA deve primeiro ler, nesta ordem:

1. `00-LEIA-PRIMEIRO.md`;
2. `15-CONTEXTO-COMPLETO-PARA-IA-SEM-HISTORICO.md`;
3. este documento `26`;
4. `23`, `24` e `25`, que explicam prescrição, OCR e avaliação;
5. `03-SUPABASE-AUTH-E-SEGURANCA.md` antes de qualquer migration;
6. `05-FABLE5-DESIGN-BRIEF.md` antes de alterar interface ou ativos visuais.

## Regras permanentes

- Treino prescrito é privado entre equipe técnica e atleta/grupo destinatário.
- Treino executado poderá futuramente ser publicado no feed; não misturar os dois conceitos.
- Robson é o treinador operacional. Samuel é administrador e aluno; recebe todas as ferramentas técnicas para testar, auditar e corrigir bugs.
- Toda ferramenta de gerenciamento de treinos disponível ao treinador deve estar disponível também ao administrador.
- Os modos esportivos continuam separados dos modos de gestão. Não misturar menus de Aluno/Administrador nem Atleta/Treinador.
- Avaliações são dados sensíveis. OCR nunca pode salvar silenciosamente um valor clínico sem revisão humana.
- Não alterar RLS, Storage ou autorização apenas para facilitar a interface.
- Toda alteração concluída deve atualizar os relatórios e ser enviada ao GitHub.
- A loja continua pausada. Não gastar tempo ou créditos com catálogo ou mockups neste bloco.

## Status dos blocos (16/08/2026)

- **Bloco A (OCR Tanita): concluído.** PR #38 mesclado: extração determinística de blocos, correção dos segmentos braço/perna (`undefined` no layout Healthy Edge Lite), orientação esquerda/direita pela pessoa avaliada e sanity check de soma de massa muscular. Ground truth em `OCR_TANITA_GROUND_TRUTH.md` (fora do Git).
- **Bloco C (anatomia): concluído.** Família própria de 6 masters transparentes 1536×2304 em `public/brand/anatomy-{male,female}-{lean,mid,large}.png` (geração própria a partir de referências do proprietário, sem copiar terceiros). Colunas `sex`/`biotype` adicionadas a `body_assessments` (migration `20260816200000_body_assessments_physique_type.sql`), RPC `staff_save_body_assessment_v5` (`20260816200100_staff_save_body_assessment_v5.sql`), helper `lib/assessments/anatomy-assets.ts`. O app (`SegmentedBodyMap.tsx`) e o PDF (`lib/assessments/pdf.ts`) usam o **mesmo ativo** por variante. Seletores explícitos de sexo/biotipo no app e no modal de edição; nenhum rótulo de gordura/músculo fica dentro do PNG (componentes React, vermelho/verde). Marcadores calibrados sobre a arte real. Apropriado visualmente pelo proprietário (amostra masculina intermediária aprovada antes da família).
- **Bloco E (logo/âncora): concluído.** PR #37 mesclado: `logo-on-light.png` substituído por `logo-com-contorno.png` nos layouts de autenticação, âncora `#treinador` na `/sobre` com `scroll-margin` e CTA da home apontando para `/sobre#treinador`.
- **Bloco B: pendente** (não iniciar importador antes de confirmar software/equipamento no computador de medição).
- **Bloco D: concluído.** PR #40 mesclado: campo `level` de treino/mesociclo removido de toda a experiência de prescrição (modal, importador de planilha e plano do atleta). O campo permanece na tabela `workouts` como legado interno (migration `20260816210000_treino_sem_nivel.sql`, já aplicada em produção, sem migração de dados e sem editar migrations históricas); RPCs `staff_save_workout_v3`, `staff_import_training_cycle_v2` e `get_my_assigned_workouts` (sem expor `level` ao atleta) criados; `admin.ts` migrado para v3/v2. O nível de jornada da gamificação permanece intacto. `WorkoutsManager.tsx` reorganizado com painel de filtros: atleta, grupo, mesociclo, tipo/cor, período de datas (de/até), treinos sem data, sem mesociclo e busca textual, com contador de resultados e botão de limpar filtros; os cards exibem nomes de destinatários e mesociclo vinculado.

## Correções posteriores ao release 25 (arquivo original)

O release `6a38acc` entregou mapa segmentado, PDF e identidade, mas o proprietário rejeitou pontos visuais e de precisão depois de testar:

1. A silhueta geométrica de `SegmentedBodyMap.tsx` foi considerada muito ruim. Ela não deve ser refinada; deve ser substituída integralmente.
2. A ilustração do PDF é diferente da ilustração do aplicativo. Essa divergência foi rejeitada.
3. A variante `public/brand/logo-on-light.png` usada no login foi rejeitada porque as letras não correspondem ao logotipo original.
4. O desenho multicolorido do logo está correto; o problema percebido está nas letras reconstruídas/adaptadas.
5. A legenda precisa mostrar explicitamente **GORDURA** em vermelho e **MÚSCULO** em verde no aplicativo e no PDF. Nenhum dos dois rótulos pode desaparecer no responsivo.
6. Foi percebido pelo proprietário pelo menos um valor segmentar absurdo e incorreto. Ele não conseguiu identificar depois se era gordura/músculo nem o lado. A próxima IA deve reproduzir com as três imagens originais e descobrir o campo exato; não deve adivinhar.

## Bloco A — segurança e confiabilidade da avaliação

### Objetivo

Transformar o OCR em preenchimento assistido e auditável, nunca em fonte de verdade automática.

### Trabalho obrigatório

- Reabrir as três imagens Healthy Edge Lite usadas na calibração e comparar campo a campo com os valores extraídos.
- Construir uma matriz com 25 campos: valor visual original, valor OCR bruto, valor normalizado, origem Foto 1/2/3 e resultado final.
- Confirmar a orientação dos lados: `esquerdo` e `direito` devem representar o lado da pessoa avaliada, não o lado de quem olha a tela.
- Confirmar que nenhum valor de gordura é gravado em campo de músculo e vice-versa.
- Adicionar validação individual e cruzada. Exemplos: massa de gordura compatível com peso × percentual; massa livre próxima de peso − gordura; massa de água compatível com percentual; somas e segmentos dentro de faixas plausíveis.
- Valores estranhos devem produzir aviso visível e exigir confirmação. Não corrigir silenciosamente nem inventar número ausente.
- A equipe técnica deve conseguir editar manualmente todos os campos antes de salvar e também corrigir uma avaliação posteriormente.
- Destacar quais campos vieram do OCR, quais foram alterados manualmente e quais estão vazios.
- Uma nova leitura não pode apagar correções manuais sem confirmação explícita.
- Manter as três imagens originais privadas e acessíveis durante a conferência.
- Adicionar testes com as três imagens reais sem versionar dados pessoais ou arquivos privados no Git.

## Bloco D — resultado final (PR #40)

Decisão de arquitetura sobre o campo `level`: **mantido como legado interno** na tabela `workouts` (mesociclos importados herdam `'iniciante'`, preservando a constraint existente). Racional: dados históricos intactos, nenhuma migração de dados, rollout seguro (RPCs v2 continuam executáveis enquanto o front antigo roda) e zero risco na constraint `CHECK`. O resultado final atende aos critérios de aceite: nenhum fluxo exige, edita ou exibe nível para criar treino ou importar mesociclo, e a intensidade continua representada exclusivamente pelas seis categorias cromáticas do Prof. Robson.

### Critérios de aceite

- 25 campos comparados com a fonte, incluindo 10 segmentos;
- zero troca entre lado esquerdo/direito e gordura/músculo;
- frequência cardíaca vazia continua vazia;
- valor fora de faixa não passa sem aviso;
- revisão e edição funcionam em desktop e Android;
- salvar exige confirmação humana clara;
- RLS continua permitindo somente atleta avaliado, administrador e treinador.

## Bloco B — pesquisa de exportação Tanita

### Hipótese atual

O documento `24` identificou as telas como Healthy Edge Lite e registrou que Tanita PRO moderno exporta formatos estruturados, mas a compatibilidade do equipamento/software real ainda não foi comprovada. Não assumir que Healthy Edge Plus, TANITA PRO ou outra licença está instalada.

### Pesquisa obrigatória

- Confirmar com o computador que realiza a avaliação o nome exato do software, versão, licença e modelo da balança.
- Verificar menus `File`, `Export`, `Reports` e equivalentes.
- Procurar exportação oficial em `CSV`, `XLS`, `XLSX`, PDF estruturado ou API.
- Confirmar se o arquivo exportado contém os dados gerais e os 10 dados segmentares.
- Priorizar documentação oficial Tanita e testar um arquivo real antes de escrever importador.
- Se houver CSV/XLS/XLSX, criar importação adicional com prévia editável; não remover o fluxo atual de três imagens até o novo caminho ser validado.
- Não comprar licença nem alterar o computador de medição sem aprovação do proprietário.

### Resultado esperado

Produzir uma tabela objetiva: software/versão, equipamento compatível, formatos disponíveis, campos presentes, limitações e recomendação. Se um arquivo real puder ser exportado, anexar uma cópia anonimizada apenas com autorização.

## Bloco C — nova ilustração anatômica

### O que deve substituir o boneco atual

- Ilustração original, frontal, anatômica e moderna, com qualidade de livro científico.
- Aparência profissional e limpa, sem nudez explícita e sem estética infantil, genérica ou de boneco geométrico.
- Anatomia muscular legível em braços, tronco e pernas.
- Versões masculina e feminina.
- Variações coerentes de biotipo: mais magro, intermediário e maior volume corporal.
- O biotipo automático pode considerar IMC e gordura corporal, mas não deve apresentar diagnóstico. Quando os dados forem insuficientes, a equipe técnica deve escolher manualmente.
- Sexo/modelo visual precisa vir de seleção explícita ou dado autorizado; nunca inferir pelo nome, fotografia ou aparência.

### Produção do ativo

- As imagens fornecidas pelo proprietário servem apenas como referência visual. Não copiar ativos de terceiros nem presumir licença comercial.
- Criar uma família própria de imagens com enquadramento, pose, escala, iluminação e anatomia consistentes.
- Preferir masters de alta resolução com fundo transparente e sem texto incorporado.
- Texto, valores e marcadores devem ser componentes do sistema para permitir tradução, acessibilidade e correções.
- Definir um único arquivo mestre por variante e reutilizar exatamente o mesmo ativo no aplicativo e no PDF.
- O PDF não pode redesenhar a figura com primitivas diferentes.

### Dados sobre a figura

- Mostrar braço esquerdo, braço direito, tronco, perna esquerda e perna direita.
- Exibir gordura e músculo de cada região, totalizando 10 valores.
- Mostrar **GORDURA** em vermelho e **MÚSCULO** em verde, com contraste e legenda completos.
- Preservar leitura em 390 × 844 sem cortar texto ou reduzir a anatomia a tamanho inútil.
- Usar gráficos de evolução e equilíbrio como informação, não como decoração.
- Preservar o estilo dos gráficos de faixa já aprovado pelo proprietário.

### Critérios de aceite

- aprovação visual explícita do proprietário antes de integrar todos os variantes;
- mesma anatomia no app e no PDF;
- versões homem/mulher e três faixas visuais de biotipo;
- nenhuma região trocada;
- legendas completas no desktop, mobile e PDF;
- PDF renderizado página a página e screenshots desktop/mobile inspecionados.

## Bloco D — gerenciamento profissional dos treinos prescritos

### Problema atual

`WorkoutsManager.tsx` carrega todos os treinos e oferece apenas busca textual e filtro por nível. Os destinatários aparecem resumidos por quantidade, o que dificulta administrar o histórico por atleta e mesociclo.

### Experiência exigida

- Visão organizada por atleta, mesociclo e período.
- Filtros mínimos: atleta, mesociclo, intervalo de datas, grupo, tipo/cor do treino e busca textual.
- Quando tecnicamente disponível, permitir também filtrar por responsável que prescreveu e treinos sem data/sem mesociclo.
- Exibir claramente atleta(s), grupo(s), mesociclo, data, tipo/intensidade cromática e ações de editar/remover.
- Permitir limpar filtros e mostrar quantidade de resultados.
- Manter criação, edição e remoção eficientes em desktop e mobile.
- Considerar paginação ou consulta filtrada no servidor para não carregar indefinidamente todo o histórico.
- Preservar privacidade e histórico de destinatários.

### Paridade administrador/treinador

Administrador e treinador devem usar o mesmo componente e as mesmas funções técnicas protegidas. Não duplicar implementações divergentes. O administrador possui esse acesso para QA e gestão; isso não transforma o modo Aluno de Samuel em painel administrativo.

### Remoção de “nível” do treino

Remover da experiência de prescrição as opções `Iniciante`, `Intermediário` e `Avançado`. Cada treino já é individualizado e sua intensidade/tipo é representada pelas seis categorias cromáticas definidas pelo Prof. Robson:

- azul-claro: descanso;
- amarelo: ritmo contínuo;
- roxo: intervalado rápido;
- verde: leve a moderado;
- mostarda: potência aeróbia;
- vermelho: competição.

Essa remoção não é apenas visual. O campo `level` existe hoje em:

- `components/admin/WorkoutsManager.tsx`;
- `components/admin/WorkoutWorkbookImporter.tsx`;
- `lib/actions/admin.ts`;
- tipos `Workout`/`TrainingCycle`;
- tabela `workouts` e `training_cycles`;
- RPCs de criação, atualização, importação e leitura;
- constraints das migrations históricas.

Não editar migrations antigas. Criar migration nova e compatível, atualizar RPCs, tipos, testes e dados históricos. Definir antes se a coluna será removida ou mantida temporariamente como legado interno sem aparecer na interface. O resultado final não pode exigir nível para criar treino ou importar mesociclo.

**Atenção:** não remover o nível de jornada da gamificação, missões ou conquistas. O pedido se refere somente ao nível redundante de treino/mesociclo.

## Bloco E — marca e navegação pública

### Logotipo

- `public/logo.png` é a referência canônica indicada pelo proprietário.
- A variante atual `public/brand/logo-on-light.png` foi rejeitada por alterar as letras.
- Não redesenhar, vetorizar, reconstruir tipografia, recolorir, aplicar filtro, sombra ou transformação destrutiva.
- Se o logo original perder contraste, adaptar o fundo e o espaço ao redor, não os pixels do logo.
- Preservar proporção, transparência e conteúdo completo: desenho, `BORN TO RUN` e `Treinamento e Saúde`.
- Antes de substituir, abrir os arquivos lado a lado e confirmar visualmente com o proprietário qual PNG é o original.
- Validar login e cadastro em desktop/mobile e atualizar os testes que hoje exigem `logo-on-light.png`.

### “Conheça o treinador”

Na home, o botão atual aponta para `/sobre`, cujo topo começa pela equipe. Ele deve levar diretamente ao bloco do Prof. Robson Alves. Implementação esperada: âncora estável como `/sobre#treinador`, `id="treinador"` no bloco correto e compensação de cabeçalho com `scroll-margin`. Testar navegação direta, teclado, desktop e mobile.

## Referências locais fornecidas

Estes arquivos ficam fora do repositório e podem não existir em outra máquina. Se a próxima IA não estiver neste notebook, o proprietário deverá anexá-los novamente:

- `C:\Users\ander\Downloads\3d-rendem-de-uma-figura-masculina-com-um-mapa-detalhado-do-musculo_1048-5345.avif`;
- `C:\Users\ander\Downloads\partesdocorpo.webp`;
- `C:\Users\ander\OneDrive\Imagens\Screenshots\Captura de tela 2026-08-15 235359.png`, evidência do logo rejeitado no login;
- as três imagens Healthy Edge Lite originais já descritas no documento `24`.

Referências web fornecidas pelo proprietário:

- `https://www.amazon.com/Tanita-Healthy-Edge-Plus/dp/B00DK8ET5Q`;
- `https://www.mercadolivre.com.br/software-de-bioimpedancia-tanita-rd545-pro-web-2021-3-anos/up/MLBU1963753829`.

Não versionar imagens de referência externas sem confirmar direitos de uso.

## Ordem recomendada de execução

1. Fazer backup lógico e criar branch `codex/...`; reler regras de segurança.
2. Confirmar o PNG original e corrigir logo/âncora, que são alterações pequenas e isoladas.
3. Reproduzir o erro segmentar e tornar a revisão manual segura antes de qualquer refinamento visual.
4. Pesquisar e testar exportação Tanita estruturada.
5. Produzir uma única amostra anatômica e pedir aprovação antes de gerar toda a família.
6. Integrar os ativos aprovados no app e no PDF usando a mesma fonte visual.
7. Reorganizar o gerenciamento de treinos e remover o nível com migration compatível.
8. Executar lint, TypeScript, unitários, pgTAP quando houver banco, build e Playwright desktop/mobile.
9. Renderizar o PDF para PNG e inspecionar todas as páginas.
10. Atualizar `02`, `06`, `07`, `08`, `09`, `15`, este documento e o status raiz; abrir PR, esperar CI/Vercel e validar produção.

## Fora de escopo

- refazer mockups ou catálogo da loja;
- checkout, pagamento, frete ou estoque;
- integração Strava;
- aplicativo Android nativo;
- diagnóstico médico automático;
- mudança de identidade do logo original.

## Definição de concluído

O bloco só está concluído quando o proprietário aprovar a anatomia e o logo, um fluxo real de três imagens permitir revisão/correção segura, o painel técnico filtrar treinos por atleta/mesociclo, o nível redundante deixar de ser exigido, app e PDF usarem a mesma ilustração, todos os gates estiverem verdes e os relatórios/GitHub refletirem exatamente o release.
