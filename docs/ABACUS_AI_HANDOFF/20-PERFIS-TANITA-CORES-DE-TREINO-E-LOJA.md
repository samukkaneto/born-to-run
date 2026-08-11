# Perfis, Tanita, cores de treino e catálogo — bloco de 11/08/2026

Este é o relatório canônico do bloco iniciado após o proprietário fornecer exemplos reais da Tanita e a prescrição mensal de treino usada pelo Prof. Robson Alves. Ele deve ser lido por qualquer IA antes de alterar perfil, avaliações, treinos ou loja.

## Objetivos recebidos

- corrigir o erro genérico `ALGO SAIU DO RITMO` em Meu Perfil e Avaliações;
- permitir foto de perfil para atleta, treinador e administrador;
- tratar administrador e treinador também como pessoas avaliáveis, sem retirar seus privilégios;
- transformar as avaliações Tanita em uma apresentação privada, legível e em português;
- reproduzir no aplicativo a linguagem oficial de cores usada pelo treinador;
- eliminar o termo “planilha” do discurso institucional e destacar atendimento presencial e individual;
- acrescentar as três pós-graduações informadas ao currículo de Robson Alves;
- preservar o preto na coleção, equilibrar outras cores e aplicar sempre o logotipo completo com contraste correto;
- mostrar aos dois gestores as referências de fornecedores, custos pesquisados e preço calculado por custo × 2.

## Diagnóstico e correção do perfil

### Causa real

A migration anterior adicionou `profiles.team_joined_at`. As páginas passaram a selecionar essa coluna em `MEMBER_PROFILE_COLUMNS`, mas o papel `authenticated` não recebeu `SELECT` da nova coluna. O PostgREST recusava a consulta inteira. Por isso `/dashboard/perfil` e qualquer tela que reutilizasse esse conjunto de colunas caíam no error boundary.

### Correção aplicada

A migration remota `20260811162800_corrige_perfil_e_categorias_de_treino` concede somente a leitura da coluna necessária. Não amplia escrita de papel, status ou metadados administrativos.

Verificações realizadas:

- catálogo remoto confirmou a permissão;
- a consulta segura completa do perfil foi simulada para administrador e treinador;
- ambos retornaram todas as colunas previstas, incluindo `team_joined_at`;
- o Supabase continua com um administrador ativo e um treinador ativo;
- não existem avaliações, avatares ou arquivos Tanita reais no momento deste relatório.

### Foto de perfil

`/dashboard/perfil` permanece disponível para qualquer perfil ativo, inclusive `admin` e `coach`. O formulário aceita JPEG, PNG ou WebP de até 5 MB. O arquivo vai para o bucket privado `avatars`, na pasta do próprio UUID, e a interface usa URL assinada. O painel técnico ganhou link direto para “Meu perfil e foto”.

## Avaliações Tanita

### Privacidade

- o arquivo original é armazenado no bucket privado `assessment-files`;
- PDF, JPEG e PNG são aceitos até 15 MB;
- o path precisa pertencer ao UUID da pessoa avaliada e existir fisicamente no Storage;
- o atleta vê apenas as próprias avaliações;
- administrador e treinador podem registrar e revisar avaliações;
- o documento original continua acessível apenas por URL assinada temporária;
- imagens fornecidas como referência nesta conversa contêm dados pessoais de saúde e **não foram copiadas para o repositório**.

### Perfis avaliáveis

A migration remota `20260811163511_permite_avaliacao_de_todos_perfis_ativos` criou `staff_save_body_assessment_v2`. Ela preserva a autorização da equipe técnica, mas permite selecionar qualquer perfil `active`: atleta, treinador ou administrador. Isso atende ao requisito de que Samuel e Robson sejam usuários normais da comunidade, com acessos adicionais.

A suíte transacional comprovou que administrador e treinador podem receber uma avaliação sem deixar fixtures no banco.

### Fluxo atual implementado

1. equipe técnica seleciona a pessoa;
2. anexa o PDF/JPG/PNG original da Tanita;
3. confere e transcreve os valores para os campos em português;
4. publica a avaliação privada;
5. a pessoa vê foto, nome, medição atual, histórico, comparação com a medição anterior e acesso temporário ao original.

Indicadores atuais: peso, IMC, gordura corporal, gordura visceral, massa muscular, massa óssea, água corporal, idade metabólica, metabolismo basal, classificação física e observações.

As setas de comparação mostram somente variação numérica; não são diagnóstico, recomendação clínica nem julgamento automático de melhora/piora.

### OCR futuro

Extração automática de PDF/foto ainda não foi habilitada. Antes disso é necessário validar várias amostras reais da Tanita, revisar consentimento, definir correção humana obrigatória e impedir que OCR publique números incorretos. O MVP atual escolhe segurança: upload privado + transcrição conferida + relatório superior em português.

## Linguagem oficial de cores dos treinos

O Prof. Robson definiu o contrato abaixo. Ele não é decorativo: comunica a natureza do treino.

| Código | Cor | Significado |
|---|---|---|
| `rest` | azul-claro | descanso |
| `continuous` | amarelo | ritmo contínuo |
| `fast_interval` | roxo | treino intervalado rápido |
| `easy_moderate` | verde | treino leve a moderado |
| `aerobic_power` | mostarda | potência aeróbia |
| `competition` | vermelho | competição |

A migration adicionou `workouts.training_type` com constraint para exatamente esses seis valores. Somente o treinador salva treinos por `coach_save_workout`, que valida o tipo e reutiliza a autorização privada já existente.

O painel do treinador agora escolhe a categoria em um seletor com legenda. O atleta recebe cards com faixa, badge e descrição coerentes. Vermelho existe mesmo sem aparecer na amostra recebida, pois representa competições futuras.

O arquivo `MESOCICLO-08-DEIVID BANDARIQUE-AGOSTO-----SETEMBRO----2026 (1).xlsx` foi analisado localmente somente como referência de organização e cor. Ele contém prescrição identificável de um atleta e não foi versionado nem importado no banco. Dados reais só devem entrar pelo treinador e para o destinatário autorizado.

## Posicionamento institucional e Prof. Robson

Todo texto público que tratava “planilha” como diferencial foi removido. A mensagem atual destaca:

- acompanhamento presencial;
- treino individual;
- atenção próxima do treinador;
- adaptação aos objetivos e ao momento de cada pessoa.

O currículo público de Robson Alves registra:

- pós-graduação em Treinamento Desportivo;
- pós-graduação em Fisiologia do Exercício;
- pós-graduação em Treinamento especializado e funcional para corrida;
- formação e certificação World Athletics já existentes no projeto.

## Loja reservada e identidade

O catálogo continua visível somente para administrador e treinador. A coleção mantém o preto/carbono como base premium e também usa verde-lima, rosa, amarelo, azul, turquesa, branco e laranja de maneira equilibrada.

Regras obrigatórias da marca:

- peças pretas/escuras: logotipo oficial completo com nome e slogan em branco;
- amarelo, verde-lima e azul-turquesa: logotipo oficial completo com nome e slogan em preto;
- nunca remover `BORN TO RUN`, `Treinamento e Saúde` ou os corredores;
- mockups são referência de curadoria; amostra física deve ser aprovada antes de vender.

Foi criada `public/shop-preview/apparel-color-collection-v2.webp`, usando como referência os arquivos oficiais de logo claro e escuro. A página abre com campanha preta premium, mostra catálogo e encerra com acessórios pretos e coloridos lado a lado.

### Referências de fornecimento

As URLs clicáveis e a data da pesquisa estão em `lib/shop/catalog.ts` e aparecem na tabela interna de `/admin/loja`. O custo é uma referência unitária pesquisada; frete, arte, quantidade, impostos e negociação precisam ser reconfirmados antes da compra.

| Produto | Referência | Custo | Preço interno (× 2) |
|---|---|---:|---:|
| Camiseta técnica | FuturaIM | R$ 35,99 | R$ 71,98 |
| Regata performance | D21 Fitness | R$ 79,90 | R$ 159,80 |
| Top feminino | D21 Fitness | R$ 79,90 | R$ 159,80 |
| Short de corrida | D21 Fitness | R$ 89,90 | R$ 179,80 |
| Manga longa | ST47 | R$ 58,00 | R$ 116,00 |
| Moletom | FuturaIM | R$ 89,99 | R$ 179,98 |
| Garrafa térmica | Brussax/Shopee | R$ 62,80 | R$ 125,60 |
| Boné | Mercado Livre | R$ 38,90 | R$ 77,80 |
| Viseira | Mercado Livre | R$ 45,00 | R$ 90,00 |
| Mochila saco | Brindes Mil | R$ 18,40 | R$ 36,80 |
| Toalha | Elo7 | R$ 32,00 | R$ 64,00 |
| Caneca | Nedd Publicidade | R$ 30,00 | R$ 60,00 |
| Copo térmico | Teremaq | R$ 59,90 | R$ 119,80 |

Preço × 2 é acréscimo de 100% sobre o custo. Não equivale a margem líquida de 100%, pois a futura operação terá despesas. O sistema segue exatamente a regra solicitada pelo proprietário, sem afirmar lucro líquido.

## Arquivos técnicos principais

- `lib/workouts/training-types.ts` — contrato visual dos seis tipos;
- `components/admin/WorkoutsManager.tsx` — seleção técnica;
- `app/(dashboard)/dashboard/treinos/page.tsx` — feed privado por cores;
- `components/admin/AssessmentManager.tsx` — upload e conferência Tanita;
- `app/(dashboard)/dashboard/avaliacoes/page.tsx` — relatório pessoal e comparação;
- `app/(dashboard)/dashboard/perfil/page.tsx` e `components/feed/PerfilForm.tsx` — perfil e avatar;
- `lib/shop/catalog.ts` — catálogo, fontes e fórmula;
- `app/(admin)/admin/loja/page.tsx` — curadoria reservada;
- `supabase/migrations/20260811162800_corrige_perfil_e_categorias_de_treino.sql`;
- `supabase/migrations/20260811163511_permite_avaliacao_de_todos_perfis_ativos.sql`;
- `supabase/tests/database/treinos_avaliacoes_perfis.test.sql`.

## Evidências antes da publicação

- Supabase remoto: 16 migrations registradas, terminando em `20260811163511`;
- pgTAP novo: 10/10 asserções aprovadas no remoto;
- teste transacional de admin/coach avaliáveis: aprovado com rollback;
- TypeScript: aprovado;
- ESLint completo: aprovado;
- Vitest: 64/64;
- build Next.js: aprovado, 38 rotas;
- revisão React: consultas independentes paralelas, ações autenticadas no servidor, URLs assinadas e estados acessíveis preservados;
- Playwright completo: 28/28 em Desktop Chrome e Pixel 7, incluindo acessibilidade sem violações sérias/críticas nas rotas cobertas.
- Advisors do Supabase: nenhum erro novo; warnings `SECURITY DEFINER` são RPCs intencionais com autorização interna, proteção contra senhas vazadas depende do futuro Pro e índices ainda sem uso refletem base sem tráfego.

## Pendências reais depois deste bloco

1. o proprietário e Robson adicionarem suas fotos reais em Meu Perfil;
2. cadastrar os primeiros atletas reais e executar um treino privado completo;
3. registrar uma avaliação Tanita real conferida e validar a compreensão do relatório;
4. só depois estudar OCR assistido, sem publicação automática;
5. Fable 5 pode elevar todo o visual mantendo este contrato de cor, autorização e privacidade;
6. checkout/estoque/pagamentos e aplicativo Android nativo continuam fases separadas.

## Publicação e auditoria final

- commit funcional: `4baf07b351769ce3b2286f8122b88c930b84ef8e`;
- PR: `#25`, mesclada por squash;
- commit na `main`: `119bc640be220e82d05bed036a4a77c89b0ad6a6`;
- CI da PR: run `31516494439`, aprovado;
- CI do merge: run `31516776891`, aprovado integralmente;
- preview: `dpl_DGDRicdoCvejzroSg9maA7fZD1uF`, `READY` e protegido pela autenticação Vercel;
- produção funcional: `dpl_42CnrorJzo91kgQGYVKGeSQXbRPA`, `READY`;
- domínio oficial: home, Sobre, Login e Health responderam `200`;
- Perfil e Avaliações anônimos responderam `307` para login, preservando o `next`;
- Health confirmou `revision: 119bc64`;
- Runtime Logs: nenhuma entrada `error` ou `fatal` nos 15 minutos auditados.

Estado do bloco: **concluído e publicado**. O fechamento documental posterior não altera código, banco ou contratos descritos acima.
