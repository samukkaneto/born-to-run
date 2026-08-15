# Born to Run — status real de implementação

Atualizado em **15/08/2026**. Este arquivo separa o que já está implementado e validado do que ainda depende de decisão ou insumo do proprietário.

> Estado mais recente: qualquer perfil ativo, inclusive administrador e treinador, pode receber prescrição privada. O atleta possui Hoje/Calendário/Mesociclo; a Tanita usa três imagens privadas, 25 medidas, faixa traduzida e análise segmental; a galeria não obriga legenda. Consulte `docs/ABACUS_AI_HANDOFF/23-PRESCRICAO-PRIVADA-MESOCICLO-E-TANITA-3-FOTOS.md`. A loja ficou fora deste bloco.

## Resumo executivo

O projeto deixou de ser apenas um protótipo visual. O código atual contém site institucional, área privada do atleta, feed social, administração e painel exclusivo do treinador conectados ao Supabase real. A comunidade é fechada: cadastros comuns aguardam aprovação e todo treino exige atleta ou grupo destinatário. Avaliações de bioimpedância têm histórico privado entre treinador e atleta.

O Supabase remoto foi sincronizado e testado. No checkpoint atual, lint, TypeScript, build de produção, auditoria de dependências, 69 testes unitários e 28 testes públicos de navegador passaram. A nova RPC de importação também passou 8/8 asserções remotas transacionais, com rollback comprovado. O fluxo hospedado anterior já havia sido validado com login, publicação, curtida, comentário, administração, grupos e treino direcionado reais; todos os dados técnicos foram removidos depois.

O Bloco 10 está publicado: galeria gerenciável, Tanita ampliada, missões, níveis, resultados/conquistas, novo ícone PWA e correções da home estão em produção. Em 11/08/2026, a loja foi retirada da área pública e reconstruída como catálogo profissional reservado a administrador/treinador; o login voltou a usar o logotipo oficial original. A PR #23 foi mesclada em `1f37f2e`, o CI do merge passou e o deployment `dpl_AJkfB6nyag24AMzKgL5qs6nQT3tT` está `READY` no domínio oficial.

O bloco publicado pela PR #25 corrige a leitura do perfil, confirma 1 administrador e 1 treinador ativos, permite que os dois também tenham avatar e recebam avaliação, entrega comparação Tanita em português e incorpora a linguagem de cores definida por Robson: azul-claro descanso, amarelo contínuo, roxo intervalado rápido, verde leve/moderado, mostarda potência aeróbia e vermelho competição. O Supabase remoto contém 16 migrations; CI do merge `31516776891` aprovado e produção funcional `dpl_42CnrorJzo91kgQGYVKGeSQXbRPA` `READY`. Consulte `docs/ABACUS_AI_HANDOFF/20-PERFIS-TANITA-CORES-DE-TREINO-E-LOJA.md`.

O checkpoint funcional seguinte foi concluído no código e no Supabase: logotipos oficiais ampliados sem alteração da arte, pós-graduações destacadas na home, OCR Tanita com revisão humana, relatório privado e PDF A4, além da importação local/editável do cronograma XLSX pelo treinador. O remoto contém 17 migrations e o novo RPC passou 8/8 asserções transacionais com rollback. A PR #27 está com CI aprovado e Preview Vercel `READY`; os detalhes estão em `docs/ABACUS_AI_HANDOFF/21-OCR-PDF-E-IMPORTACAO-DE-TREINOS.md`.

## Estado por área

| Área | Estado | Evidência / observação |
|---|---|---|
| Site institucional | Implementado e publicado | Home, Sobre, galeria, contato via Resend, header/footer e páginas responsivas. A loja não integra a navegação pública. |
| Identidade visual Fable 5 | Implementada, ainda refinável | A direção atual foi preservada; a Fable pode redesenhar componentes sem alterar contratos funcionais. |
| Autenticação | Implementada e validada | Login, cadastro, confirmação e recuperação têm callback explícito, templates próprios e SMTP ativo no domínio oficial. |
| Comunidade fechada | Implementada e validada no banco | Cadastro entra como `pending`; somente `active` acessa conteúdo interno. |
| Aprovação de membros | Implementada e validada | Administrador e treinador aprovam, rejeitam, suspendem ou reativam; somente o administrador define o treinador. |
| Feed social | MVP implementado e validado | Posts, fotos privadas, métricas, curtidas, comentários e paginação keyset por cursor; escrita real passou no preview final. |
| Perfis | Implementado e corrigido no remoto | Edição segura e avatar privado para atleta, treinador e administrador; leitura de `team_joined_at` corrigida. |
| Treinos | Implementado e validado | Somente o treinador cria/edita/exclui; todo treino é privado. O importador XLSX lê datas/cores localmente, permite revisão e publica o ciclo atomicamente. |
| Grupos | Implementado e validado | Criar, editar, arquivar/reativar e gerenciar integrantes, preservando destinatários históricos. |
| Comunicados | Implementado | CRUD do administrador e leitura pelos membros ativos. |
| Painel do treinador | Implementado e validado | Dashboard, aprovações, membros, grupos, treinos privados e avaliações físicas. |
| Bioimpedância | OCR assistido e PDF implementados | Admin/treinador anexam PDF/JPG/PNG, recebem pré-preenchimento local, revisam, salvam privadamente e o usuário exporta PDF A4. |
| Galeria institucional | Implementada no Bloco 10 | Admin/treinador publicam, ordenam, ocultam e removem; consentimento obrigatório; feed pessoal separado. |
| Missões, níveis e conquistas | Implementados no Bloco 10 | 12 missões, cascata de distâncias, XP inclusivo, dez níveis, resultados e premiações gerais/por categoria. |
| Loja | Catálogo reservado | Somente administrador/treinador ativos; 13 produtos, cores ampliadas e preços por custo pesquisado × 2. Sem venda, checkout ou estoque ativo. |
| Fotos reais | Acervo atualizado | Nove fotos em `public/team-archive/`; `team-race-palace.jpg` é o novo destaque e as demais aguardam curadoria manual. |
| PWA/responsividade | Instalável, push e nativo pendentes | Manifesto, novo ícone oficial em fundo preto, instalação guiada, service worker e fallback offline público. Não gera APK e não é binário nativo. |
| Observabilidade | Implementada para o piloto | `/api/health`, Runtime Logs, Web Analytics habilitado e Speed Insights configurado; URLs são sanitizadas antes das métricas. |
| Continuidade | Procedimento definido | Audit no CI, Dependabot, relato privado e runbook de release; Supabase Free exige exportação criptografada ou Pro antes de depender de backup automático. |
| Supabase remoto | Sincronizado com o bloco atual | Dezessete migrations aplicadas; estado atual termina em `20260811191007_importa_planilha_treinos_prescritos`. |
| Vercel | Produção do Bloco 10 validada | Deployment Git `dpl_AjXfjFgjZd92Vh4KXjoP99gfioex`, revisão `bd73817`, `READY`, target `production`; 37 rotas, respostas 200/307, build sem erros e zero clusters de runtime em 30 minutos. |
| GitHub | Publicado, revisado e mesclado | PR [#17](https://github.com/samukkaneto/born-to-run/pull/17) mesclada em `main` no commit `bd7381777a0fe58b71365af75f53635a8f8b0667`; CI final do PR `31451292679` e CI do merge `31451446812` concluídos com sucesso. |

## Regras de produto consolidadas

- Garmin Connect, Strava e Sports Tracker são referências de experiência social/esportiva, não integrações desta entrega.
- A área interna pertence somente à equipe Born to Run; estar autenticado não basta, a associação precisa estar ativa.
- Administrador e treinador administram acesso; somente o treinador prescreve, sempre para grupos ou atletas específicos.
- Atletas podem publicar atividade com texto, fotografia e métricas, curtir e comentar.
- Site institucional e aplicativo privado coexistem no mesmo projeto.
- O aplicativo deve transmitir experiência mobile premium; a implementação atual é Next.js/PWA e também funciona no desktop.

## Banco de dados e segurança

A migration canônica e o snapshot `supabase/schema.sql` incluem:

- `profiles` com papéis `member/coach/admin` e status `pending/active/suspended/rejected`;
- `training_groups`, `training_group_members` e `workout_assignments`;
- relações diretas de autores do feed com `profiles`, compatíveis com PostgREST;
- RLS em todas as tabelas de negócio, exigindo membro ativo para conteúdo privado;
- proteção no banco contra autoelevação de `role` ou mudança indevida de status;
- RPCs administrativas atômicas e verificadas;
- buckets `avatars` e `post-images` privados, com caminhos por usuário e URLs temporárias assinadas;
- funções endurecidas com `search_path` fixo, grants explícitos e índices das relações/policies.
- chaves `id`/`created_at` do feed geradas obrigatoriamente pelo banco e posts imutáveis pela Data API.
- mutações de grupos, atribuições e criação/edição de treinos restritas aos RPCs atômicos, sem atalho administrativo pela Data API;
- validação no banco para que `avatar_url` e `photo_url` usem somente o formato `UUID_DO_USUÁRIO/UUID_DO_ARQUIVO.(jpg|png|webp)` do próprio autor.
- leitura de `profiles` limitada a colunas comunitárias; `status_note` e metadados de revisão não são expostos a membros;
- RPC mínimo para o próprio estado de acesso e verificação de existência física das mídias referenciadas;
- exclusão pela Storage API bloqueada enquanto o objeto ainda estiver referenciado pelo perfil ou post.
- `body_assessments` com validações, RLS e RPCs exclusivos do treinador;
- pré-autorização privada de e-mail para criar o único treinador sem senha de terceiros.

### Testes reais já executados no Supabase

Os testes abaixo foram executados dentro de transações e revertidos, sem deixar dados artificiais:

1. membro comum não conseguiu se promover a admin;
2. membro comum não conseguiu chamar RPC administrativa;
3. usuário pendente não conseguiu publicar;
4. atleta A viu treino da equipe, treino direto para A e treino de seu grupo;
5. atleta B viu treino da equipe e treino direto para B, mas não o grupo de A;
6. membro ativo enviou arquivo apenas no próprio caminho;
7. upload em caminho alheio e upload por usuário pendente foram bloqueados;
8. 12/12 testes adicionais confirmaram inserts normais do feed e bloquearam IDs, datas e updates forjados.
9. a quinta migration passou em um preflight remoto transacional de 47/47 asserções, com rollback comprovado antes da aplicação definitiva;
10. após a aplicação, funções, triggers e grants esperados foram confirmados e o banco permaneceu com 1 admin ativo, zero órfãos e zero conteúdo técnico.
11. a sexta migration passou em preflight remoto de 56/56 asserções e ocultou metadados de revisão de todos os clientes autenticados;
12. referências de avatar/foto inexistentes foram rejeitadas e policies passaram a impedir exclusão de objetos ainda usados.

O banco preserva 1 perfil administrador ativo, 1 perfil treinador ativo e nenhum conteúdo fictício de avaliação, treino, feed ou Storage.

## Qualidade verificada

| Gate | Resultado atual |
|---|---|
| ESLint | Aprovado, sem erros |
| TypeScript (`tsc --noEmit`) | Aprovado |
| Build Next.js 16.3.0 | Aprovado, 38 rotas |
| Testes unitários | 69/69 aprovados no checkpoint atual |
| `npm audit` | 0 vulnerabilidades conhecidas |
| Tipos do Supabase | Gerados a partir do banco remoto |
| Boundaries de erro/loading/not-found | Implementados |
| Acessibilidade básica | Skip links, foco visível, modais com foco, redução de movimento e controles ampliados |
| Testes pgTAP versionados | 72/72 asserções remotas transacionais após treinador, avaliações e convite |
| E2E público | 28/28 aprovados em Desktop Chrome e Pixel 7; zero violações axe sérias/críticas nas rotas cobertas |
| E2E autenticado hospedado | Login, feed, publicação, curtida, comentário, painel admin, grupo e treino dirigido validados; dados técnicos removidos |
| Vercel | Produção `READY` no domínio canônico, revisão `0c17f86`, 34 rotas, respostas 200/307 corretas, integração Git automática validada e sem warning/error/fatal nos logs consultados |
| GitHub Actions | Runs `31352323034` (PR final) e `31352438060` (merge) aprovadas integralmente |

## Dependências externas pós-publicação

O MVP web está publicado e o trabalho técnico independente dessas entradas foi concluído. Os itens abaixo exigem conta, decisão ou teste do proprietário e não anulam a entrega atual:

1. publicar o bloco atual e fazer o smoke autenticado;
2. habilitar no Supabase Auth a proteção contra senhas vazadas depois do upgrade Pro;
3. executar o piloto fechado com usuários reais e validar aprovação, publicação, treino e avaliação;
4. tratar push e empacotamento nativo como fase própria, caso o objetivo passe de PWA instalável para lojas de aplicativos;
5. definir backup Pro ou exportação criptografada antes do piloto gerar dados relevantes.

## Orientação para Abacus AI / Fable 5

Leia primeiro `README-FABLE5.md`. O redesign pode ter liberdade visual ampla, mas deve preservar os fluxos e contratos acima. Em particular, não voltar a:

- liberar todos os usuários apenas por estarem autenticados;
- permitir atualização direta de `role` ou status pelo navegador;
- apagar somente `profiles` como se isso revogasse uma conta Auth;
- usar `getPublicUrl` para os buckets privados;
- remover a audiência de grupos/atletas dos treinos;
- tratar Garmin ou Strava como integração já solicitada.

Este documento deve ser atualizado sempre que uma etapa técnica, deploy ou decisão de produto mudar de estado.

Detalhes de plano, SMTP, templates e matriz do piloto: `docs/ABACUS_AI_HANDOFF/10-AUTH-SMTP-E-TEMPLATES.md`.

O pacote detalhado e ordenado para retomada pela Abacus AI está em `docs/ABACUS_AI_HANDOFF/00-LEIA-PRIMEIRO.md`.
O estado PWA/LGPD e as dependências jurídicas estão em `docs/ABACUS_AI_HANDOFF/11-PWA-LGPD-E-OPERACAO.md`.
O checklist de observabilidade, backup, piloto e release está em `docs/ABACUS_AI_HANDOFF/12-OPERACAO-PILOTO-E-RELEASE.md`.
