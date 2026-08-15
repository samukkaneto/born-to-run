# Prescrição privada, mesociclo e Tanita em três fotos

Atualizado em 15/08/2026. Este bloco corrige o fluxo funcional apontado pelo proprietário. A loja foi deixada de fora por decisão expressa e nenhum arquivo de catálogo, produto ou mockup foi alterado.

## Contratos confirmados

- Samuel continua administrador e também possui modo atleta.
- Robson Alves continua treinador e também possui modo atleta.
- Administrador e treinador ativos podem receber treinos sem perder poderes técnicos.
- Treino prescrito é privado entre equipe técnica e destinatário.
- Treino executado pertence ao futuro módulo social/Strava e não é inferido a partir da prescrição.
- Avaliação Tanita é privada e usa três imagens em posições padronizadas.
- Título, legenda e descrição da galeria são opcionais; o sistema gera texto alternativo genérico quando necessário.

## Prescrição e destinatários

`/admin/treinos` começa com **Prescrição privada** e exige escolher a pessoa antes de abrir a criação. O seletor mostra explicitamente `Admin no modo atleta` e `Treinador no modo atleta`. A base remota confirmou dois perfis ativos: Samuel (`admin`) e Robson Alves (`coach`); ambos agora são destinatários válidos.

A validação antiga `role = member` foi removida do RPC. A regra atual aceita qualquer perfil ativo e continua exigindo atleta ou grupo específico. O painel inicial e `/dashboard/treinos` usam `get_my_assigned_workouts()`, que filtra por `auth.uid()` mesmo quando a conta possui papel técnico. Assim, o modo atleta de um administrador não herda a visão ampla da gestão.

## Mesociclo

`training_cycles` registra nome, nível, início, fim e criador. Cada `workout` pode apontar para um ciclo. A importação XLSX agora exige nome do mesociclo, preserva cores e destinatários e salva tudo em uma única transação.

O atleta recebeu três visualizações responsivas:

1. **Hoje:** sessão prescrita e detalhes do dia;
2. **Calendário:** navegação mensal e seleção de qualquer data;
3. **Mesociclo:** período, progresso, semanas e todas as sessões.

O atleta consulta, mas não altera a prescrição do treinador.

## Tanita: mapa das três imagens

As três imagens reais fornecidas foram analisadas apenas localmente e não foram copiadas para GitHub nem para assets públicos.

- **Foto 1 · Resumo:** peso, IMC, gordura corporal, massa de gordura, massa livre de gordura, gordura visceral, água corporal, massa de água, massa muscular, massa óssea, metabolismo basal, ingestão calórica diária, idade metabólica, classificação física e frequência cardíaca quando presente.
- **Foto 2 · Faixas:** escalas de IMC, gordura corporal, água corporal e gordura visceral.
- **Foto 3 · Segmentos:** gordura e massa muscular de braço esquerdo, braço direito, tronco, perna esquerda e perna direita.

O cadastro exige Foto 1, Foto 2 e Foto 3 em JPG/PNG para novas avaliações. O OCR continua local no navegador e apenas preenche uma prévia. A equipe técnica revisa os 25 campos, a faixa de gordura e a data antes de salvar.

`body_assessment_files` guarda os três caminhos privados por avaliação e posição. Os números ficam em `body_assessments`. A tela do atleta traduz `Healthy` para `Saudável`, `5-Standard` para `5 · Padrão`, apresenta métricas completas, gráficos de referência e tabela segmental. As fotos originais usam URLs assinadas.

## Galeria

A interface não exige texto para publicar uma foto. Título, legenda e descrição acessível estão marcados como opcionais. Quando a descrição fica vazia, o servidor grava `Foto da equipe Born to Run`, que serve a leitores de tela e não cria legenda visível. Legendas antigas permanecem preservadas.

## Armazenamento

- **Supabase Postgres:** treinos, destinatários, mesociclos, valores das avaliações e metadados.
- **Supabase Storage:** avatares, fotos de feed/galeria e as três imagens privadas da Tanita. É o serviço cujo armazenamento e egress crescem com uploads.
- **Vercel:** executa e entrega o Next.js e os assets versionados; não é o arquivo permanente dos uploads privados.
- **Hostinger:** domínio, DNS e e-mail profissional; não armazena os dados atuais do app.
- **Resend:** envio transacional de e-mails; não é banco nem Storage.

Para aumento de capacidade de fotos/avaliações, acompanhar e eventualmente ampliar o plano do Supabase. Um plano maior da Hostinger não aumenta o Storage do aplicativo atual.

## Banco e segurança

Migrations aplicadas no projeto `nmcaejrmmfffzeclmuob`:

- `20260815103041_mesociclos_tanita_tres_fotos_e_perfis_tecnicos`;
- `20260815104819_categoria_gordura_tanita_traduzida`;
- `20260815110255_indice_criador_mesociclo`.

As novas tabelas possuem RLS. RPCs usam `SECURITY DEFINER`, `search_path` vazio, grants explícitos e validação interna de papel/perfil. O advisor não apontou tabela nova sem RLS; o único índice ausente indicado foi adicionado. O warning de proteção contra senhas vazadas permanece uma decisão de plano já documentada.

## Qualidade executada

- ESLint completo e lint direcionado: aprovados;
- TypeScript: aprovado;
- 74/74 testes unitários: aprovados;
- parser Tanita: resumo, faixa e cinco segmentos cobertos;
- build Next.js 16.3, 40 rotas: aprovado;
- Playwright público: 26 cenários passaram em dev; os dois cenários PWA, que requerem produção, passaram separadamente em Desktop Chrome e Pixel 7;
- migrations aplicadas e tipos TypeScript regenerados do Supabase remoto;
- pgTAP novo versionado com 14 asserções; execução local bloqueada porque Docker/Supabase local não está instalado/ativo neste notebook.

## Próxima validação real

1. entrar como Samuel e confirmar que o topo de `/admin/treinos` lista Samuel e Robson;
2. publicar um mesociclo de teste para Samuel e revisar Hoje/Calendário/Mesociclo no modo atleta;
3. publicar um treino para Robson e conferir somente no modo atleta dele;
4. cadastrar uma avaliação real com Foto 1, Foto 2 e Foto 3, corrigindo qualquer OCR incompleto;
5. conferir a apresentação da avaliação em desktop e Android;
6. só depois abrir um bloco separado para reconstruir mockups da loja com os dois logos oficiais e checagem cor por cor.

## Publicação

- branch funcional: `codex/private-mesocycle-tanita-gallery`;
- commit funcional: `5fbbfcae4e29c932bc0ec22a4fe07a7995b6b52a`;
- PR [#30](https://github.com/samukkaneto/born-to-run/pull/30), mesclada por squash em `694be8c4f959ed13cb9b7a140d2b80ec3806051c`;
- GitHub Actions da PR `31882073973` e da `main` `31882239549`: aprovados integralmente;
- Preview Vercel `https://born-to-qw3zaypdt-shabuneto.vercel.app`: `READY` e protegido por SSO;
- produção Vercel `dpl_DiEf7ec6fTdPqFji4AvX9NYZAM58`, URL imutável `https://born-to-4bvu40wx6-shabuneto.vercel.app`: `READY`;
- aliases `equipeborntorun.com`, `www` e `born-to-run-seven.vercel.app` apontados para o deployment;
- smoke oficial: home, galeria e health `200`; health na revisão `694be8c`; `/admin/treinos`, `/dashboard/treinos` e `/dashboard/avaliacoes` anônimos mantiveram `307` para login.
