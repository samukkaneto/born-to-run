# OCR Tanita, PDF premium e importação do cronograma — 11/08/2026

Este relatório descreve o bloco funcional executado integralmente pelo Codex no repositório Born to Run. A Abacus AI e o Fable 5 não participaram deste bloco; o Fable 5 permanece reservado para uma futura revisão visual, depois que o produto estiver funcionalmente estabilizado.

## Requisitos recebidos

- eliminar ocorrências de logotipo oficial excessivamente pequeno, sem redesenhar ou adulterar a marca;
- mostrar na home as três pós-graduações do Prof. Robson Alves;
- permitir que administrador e treinador anexem PDF/JPG/PNG da Tanita;
- usar OCR para preencher uma prévia, sempre sujeita a conferência humana;
- apresentar a avaliação em português, com histórico privado e download em PDF;
- permitir que somente o treinador anexe a planilha XLSX de prescrição;
- ler semanas, datas, conteúdo e cores, gerar prévia editável e publicar privadamente para atletas ou grupos;
- preservar a diferença entre treino prescrito e atividade concluída, futura no Strava;
- revisar segurança e documentar o que permanece pendente.

## Identidade e currículo

`public/logo.png` continua sendo a arte oficial usada sobre fundo escuro. Nenhum pixel, texto, corredor ou slogan foi redesenhado. O problema era geométrico: o PNG possui espaço transparente inferior, e `object-fit: contain` reduzia o conteúdo visível dentro de caixas grandes.

A correção preserva o arquivo e oculta somente o espaço transparente por CSS. Foi aplicada ao cabeçalho e rodapé públicos, autenticação, barras laterais e cabeçalhos móveis das áreas privadas.

A home mostra cartões visíveis para as três pós-graduações:

1. Treinamento Desportivo;
2. Fisiologia do Exercício;
3. Treinamento especializado e funcional para corrida.

## Avaliação Tanita com OCR assistido

### Fluxo entregue

1. administrador ou treinador abre **Avaliações → Nova avaliação**;
2. escolhe qualquer perfil ativo, inclusive as contas técnicas;
3. anexa PDF, JPG ou PNG de até 15 MB;
4. o navegador tenta extrair texto diretamente do PDF;
5. se necessário, as páginas/imagens são preparadas e lidas por OCR no navegador;
6. medidas e data reconhecidas preenchem os campos em português;
7. a interface mostra progresso, quantidade reconhecida e aviso de conferência;
8. o responsável compara tudo com o original e só então salva;
9. o original vai ao bucket privado `assessment-files` somente no salvamento;
10. o usuário visualiza histórico, comparação, foto, observações e baixa a avaliação em PDF.

Campos: peso, gordura corporal, massa muscular, gordura visceral, água corporal, IMC, idade metabólica, massa óssea, metabolismo basal, classificação física e data.

O parser aceita inglês/português, vírgula/ponto decimal e rejeita valores fora dos limites do servidor. OCR não publica sozinho: arquivo escuro, desfocado ou desconhecido pode preencher apenas parte dos campos, e a revisão humana continua obrigatória.

### PDF premium

**Baixar avaliação em PDF** gera no navegador um A4 em português com marca, nome, foto quando disponível, data, dez cartões de indicadores, observações e aviso de privacidade/não diagnóstico. O PDF não cria faixa clínica ou julgamento automático.

## Importação do cronograma XLSX

### Amostra real validada

`MESOCICLO-08-DEIVID BANDARIQUE-AGOSTO-----SETEMBRO----2026 (1).xlsx` foi analisado localmente. O parser reconheceu ciclo, semanas, dias, descrições e as cinco categorias presentes. Por conter nome e prescrição identificável, o arquivo não foi copiado para Git ou Supabase.

### Fluxo entregue

1. treinador abre **Treinos → Importar XLSX**;
2. anexa arquivo de até 12 MB;
3. a planilha é lida localmente;
4. a tela cria prévia editável de cada dia;
5. o treinador corrige data, título, descrição/categoria ou remove um item;
6. escolhe nível e destinatários ativos;
7. publica o ciclo em uma operação atômica.

Se qualquer treino falhar, nenhum item do lote é salvo. Todo item continua `targeted`: somente treinador e destinatários conseguem lê-lo.

| Cor | Código | Significado |
|---|---|---|
| azul-claro | `rest` | descanso |
| amarelo | `continuous` | ritmo contínuo |
| roxo | `fast_interval` | intervalado rápido |
| verde | `easy_moderate` | leve a moderado |
| mostarda | `aerobic_power` | potência aeróbia |
| vermelho | `competition` | competição |

## Prescrição não é atividade concluída

- `workouts` = cronograma/treino prescrito pelo Prof. Robson;
- publicação social com métricas = registro informado pelo atleta;
- futura atividade Strava = evidência de treino efetivamente realizado.

Um treino prescrito nunca deve ser marcado automaticamente como concluído. Strava não faz parte deste bloco e exigirá consentimento, OAuth, limites de API e reconciliação.

## Banco e segurança

Migration aplicada: `20260811191007_importa_planilha_treinos_prescritos`.

`coach_import_workouts(jsonb,text,uuid[],uuid[])` usa `SECURITY DEFINER`, `search_path` vazio, bloqueia `public/anon`, exige `app_private.is_coach()`, limita 62 itens, reutiliza as validações privadas de `coach_save_workout` e é transacional.

O teste remoto revertido confirmou 8/8 casos: ACL, bloqueio do atleta, importação do treinador, destinatário privado, cores e rollback de lote inválido. Fixtures e treinos técnicos foram comprovadamente removidos.

Estado auditado:

- 17 migrations;
- 1 administrador ativo e 1 treinador ativo;
- nenhum P0/P1 identificado;
- warnings `SECURITY DEFINER` são esperados porque os RPCs validam papel internamente;
- proteção contra senhas vazadas continua desabilitada conforme plano/decisão documentados;
- índices sem uso são informativos em base sem tráfego relevante.

## Dependências e qualidade

Versões fixas adicionadas: `tesseract.js`, `pdfjs-dist`, `exceljs` e `pdf-lib`. O transitivo vulnerável do ExcelJS recebeu override seguro; `npm audit --omit=dev` retorna zero vulnerabilidades.

Gates do checkpoint:

- ESLint e TypeScript aprovados;
- testes unitários incluindo OCR, Excel e PDF aprovados;
- build Next.js 16.3 aprovado com 38 rotas;
- Playwright completo aprovado: 28/28 em Desktop Chrome e Pixel 7, incluindo as verificações axe sem violações sérias/críticas nas rotas cobertas;
- home verificada em navegador, com conteúdo e sem overlay;
- migration aplicada e teste remoto revertido com sucesso.

## Arquivos principais

- `lib/assessments/tanita-ocr.ts`, `ocr-client.ts` e `pdf.ts`;
- `components/assessments/AssessmentPdfButton.tsx`;
- `components/admin/AssessmentManager.tsx`;
- `lib/workouts/workbook-import.ts`;
- `components/admin/WorkoutWorkbookImporter.tsx`;
- `lib/actions/admin.ts`;
- `supabase/migrations/20260811191007_importa_planilha_treinos_prescritos.sql`;
- `supabase/tests/database/workout_workbook_import.test.sql`;
- testes unitários de OCR, planilha e PDF.

## Pendências reais

1. testar uma avaliação real, conferindo o OCR campo a campo;
2. importar um ciclo real para atleta piloto e conferir a visão diária;
3. adicionar gráficos por período e leitura segmental depois do fluxo básico;
4. projetar atividades concluídas/Strava como módulo separado;
5. usar Fable 5 futuramente para elevar o visual sem remover revisão humana, privacidade ou cores.

## Checkpoint de publicação

- branch: `codex/tanita-ocr-workout-import`;
- commit funcional: `1b469edebe4c6ae4dea0d7ee8a2eacea73846a09`;
- PR: [#27](https://github.com/samukkaneto/born-to-run/pull/27);
- GitHub Actions: run `31530524038`, aprovado integralmente;
- Preview Vercel: `dpl_AwjLv3iz6qGEaaPFUpVk3UgDLQGb`, URL imutável `https://born-to-fnh0sn0cw-shabuneto.vercel.app`, estado `READY`;
- smoke do Preview: home `200`, `/api/health` retornou revisão `1b469ed` e `/admin` anônimo manteve redirect `307` para o login.

O merge, o CI da `main` e o deployment final de produção devem ser acrescentados neste documento no fechamento operacional.
