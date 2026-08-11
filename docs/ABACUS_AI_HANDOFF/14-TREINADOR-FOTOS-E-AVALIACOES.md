# Bloco 9 — treinador exclusivo, fotos reais e avaliações privadas

> Arquivo histórico: OCR Tanita e PDF foram implementados posteriormente. Consulte `21-OCR-PDF-E-IMPORTACAO-DE-TREINOS.md` para o estado atual.

Atualizado em 10/08/2026. Este documento registra o bloco iniciado pelo pedido do proprietário para separar administrador e treinador, atualizar a imagem institucional e criar a primeira versão das avaliações de bioimpedância.

## Decisões de produto confirmadas

- `samuelspeedy@gmail.com` continua sendo a única conta administradora.
- `ralves4101@gmail.com`, de Robson Alves, é o único e-mail pré-autorizado para o papel `coach`.
- Administrador e treinador podem aprovar, suspender ou reativar cadastros.
- Somente o treinador cria, edita ou exclui treinos e grupos técnicos.
- Um treino nunca é público para toda a equipe: exige ao menos um atleta ou grupo destinatário.
- O administrador não consegue ler os treinos privados nem as avaliações físicas.
- Uma avaliação de bioimpedância é visível somente para Robson e para o atleta avaliado.
- Feed, fotos, curtidas e comentários continuam sendo a comunidade social fechada; Garmin e Strava continuam apenas como referências, sem integração nesta fase.

## Fotos institucionais

Nove fotos reais recebidas foram preservadas em `public/team-archive/`, sem inventar datas, provas, resultados ou nomes de pessoas. A pasta contém um `README.md` com a finalidade de cada arquivo.

A foto escolhida para o destaque da home e da página Sobre é `team-race-palace.jpg`: imagem horizontal, recente e com boa leitura da equipe. As outras oito permanecem prontas para seleção manual futura na galeria.

A home ganhou um bloco específico de comando técnico usando `robson-running.jpg`. O texto junto dessa imagem fala exclusivamente de Robson Alves, sua função, CREF e certificação World Athletics. A página Sobre mantém o retrato `robson-portrait.jpg` em um segundo bloco dedicado ao treinador.

## Banco e autorização

Migrations aplicadas:

1. `20260810021549_treinador_e_avaliacoes_privadas`;
2. `20260810025223_preautoriza_treinador`.
3. `20260810030102_indexa_convite_treinador`.

A primeira migration:

- adiciona `coach` ao contrato de papéis e garante no máximo um treinador;
- separa `is_admin()`, `is_coach()` e `is_access_manager()`;
- limita aprovação de membros a administrador ou treinador;
- restringe alteração de papéis ao administrador;
- torna todo treino `targeted` e retira leitura administrativa ampla;
- torna grupos e mutações técnicas exclusivos do treinador;
- cria `body_assessments`, índices, validações, RLS e RPCs de gravação/remoção;
- concede leitura da avaliação somente ao atleta proprietário ou treinador.

A segunda migration cria `app_private.staff_invitations` e adapta o trigger de novo usuário. Nenhuma senha é criada pelo administrador ou pelo Codex. O endereço pré-autorizado cadastra-se normalmente, confirma o próprio e-mail e recebe o papel técnico de forma atômica. Um teste transacional confirmou papel `coach`, status `active` e consumo único do convite; o teste foi revertido e não deixou usuário artificial.

A terceira adiciona o índice da chave estrangeira do convite solicitado pelo Advisor de performance.

## Como Robson ativa a conta

1. Abrir `https://equipeborntorun.com/cadastro` depois que este bloco estiver publicado.
2. Informar nome, exatamente `ralves4101@gmail.com` e uma senha escolhida por ele.
3. Aceitar os documentos e concluir o cadastro.
4. Abrir o e-mail de confirmação enviado pelo Supabase/Resend.
5. Depois da confirmação, entrar normalmente. O painel será o de Treinador; não é necessária aprovação manual.

O e-mail ainda não possui usuário Auth no momento deste relatório. A pré-autorização está ativa e aguardando o cadastro real. Não cadastrar variações do endereço.

## Avaliações de bioimpedância — MVP

O treinador recebeu `/admin/avaliacoes`, com criação, edição e exclusão. A ficha atual aceita:

- data;
- peso;
- percentual de gordura;
- massa muscular;
- gordura visceral;
- água corporal;
- IMC;
- idade metabólica;
- observações técnicas.

O atleta recebeu `/dashboard/avaliacoes`, com avaliação mais recente, indicadores e histórico. Não há autodiagnóstico, recomendação médica ou edição pelo atleta. A política de privacidade foi atualizada e a versão jurídica passou para `2026-08-09`.

Esta é deliberadamente a primeira versão. Gráficos, comparação por período, anexos do equipamento, metas e exportação podem ser adicionados depois do piloto, sem alterar o contrato de privacidade.

## Evidências até o checkpoint local

- migration principal: preflight remoto com rollback aprovado e aplicação real concluída;
- migration de convite: preflight remoto com rollback aprovado e aplicação real concluída;
- pgTAP remoto: 49/49 comunidade fechada, 7/7 ciclo de destinatários e 16/16 treinador/avaliações; total 72/72;
- fixtures remotos: zero usuários de teste após rollback;
- TypeScript: aprovado;
- ESLint: aprovado;
- Vitest: 53/53;
- build Next.js 16.3.0: aprovado, 34 rotas;
- E2E público: 24 casos comuns no modo local + 2 casos PWA no build de produção, equivalentes aos 26/26 da matriz;
- axe: nenhuma violação séria/crítica nas páginas cobertas.

## Estado de publicação

O Supabase contém as três migrations e a pré-autorização. O código foi publicado no commit `c1f111a027d1a5c87e109de3089eb7e14cd8a49d`, branch `codex/coach-assessments-team-media`, e abriu a PR draft [#15](https://github.com/samukkaneto/born-to-run/pull/15).

- GitHub Actions: run [`31351998723`](https://github.com/samukkaneto/born-to-run/actions/runs/31351998723), concluída com sucesso; lint, audit, TypeScript, unitários, build e testes de navegador passaram no CI.
- Preview Vercel: `dpl_8PYatkCt2jUCQMKK1VjmwSVJkTTA`, estado `READY`, endereço protegido `https://born-to-qlnisgqpt-shabuneto.vercel.app`.
- Verificação do artefato: `vercel curl` retornou a home 200 e confirmou no HTML renderizado `team-race-palace.jpg`, a seção exclusiva de Robson e o conteúdo da área da equipe.
- Checkpoint documental: commit `5229bbb`, CI final da PR `31352323034` verde e preview final `dpl_A5j5aEmoEebST2DeYkmQiAUXPwfw` `READY`.
- Merge: PR #15 mesclada por squash em `main`, commit `0c17f86995a4e88e1a8d04a0d68b3242b5d3acc7`.
- CI do merge: run [`31352438060`](https://github.com/samukkaneto/born-to-run/actions/runs/31352438060), aprovado integralmente.
- Produção: `dpl_5Ef5i65VmCNTAQ1zGM2ZqRcqXJhe`, `READY`, target `production`, sem `aliasError`, revisão de health `0c17f86`.
- Domínio oficial: `/`, `/sobre`, `/cadastro`, `/login` e `/api/health` responderam 200; áreas privadas responderam 307 para login.
- Inspeção visual: desktop e mobile renderizaram todo o layout, a foto nova e a seção de Robson, sem overlay de erro.
- Runtime Logs: nenhuma ocorrência `warning`, `error` ou `fatal` no deployment consultado.

O Bloco 9 está concluído e publicado. A próxima ação funcional pertence ao piloto: Robson cria a conta real pelo cadastro oficial e confirma o e-mail.

## Contrato para Abacus AI / Fable 5

A Fable 5 pode refinar livremente o visual, mas deve preservar:

- papéis distintos `admin`, `coach` e `member`;
- único treinador;
- aprovação por administrador ou treinador;
- publicação técnica somente pelo treinador;
- treino sempre privado por destinatário;
- avaliação privada entre treinador e atleta;
- pasta `public/team-archive/` como acervo, sem publicar todas as fotos automaticamente;
- nenhum número inventado de atletas, resultados, troféus ou patrocinadores.

## Atualização do MVP Tanita — 11/08/2026

O treinador já está cadastrado e ativo. A migration `20260811163511_permite_avaliacao_de_todos_perfis_ativos` substitui a antiga limitação de alvo `member`: atleta, treinador e administrador ativos podem possuir avaliação e avatar próprios. Quem grava continua sendo somente administrador/treinador. A tela pessoal agora apresenta foto, medidas em português e comparação entre medições; o arquivo original continua privado. OCR não foi ativado. Detalhes em `20-PERFIS-TANITA-CORES-DE-TREINO-E-LOJA.md`.
