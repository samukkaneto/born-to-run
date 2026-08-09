# Born to Run — status real de implementação

Atualizado em **08/08/2026**. Este arquivo separa o que já está implementado e validado do que ainda depende de publicação ou decisão do proprietário.

## Resumo executivo

O projeto deixou de ser apenas um protótipo visual. O código atual já contém o site institucional, a área privada do atleta, o feed social e o painel do treinador conectados ao Supabase real. A base foi reformulada como **comunidade esportiva fechada**: novos cadastros aguardam aprovação, conteúdo interno exige associação ativa e treinos podem ser destinados à equipe inteira, a grupos ou a atletas escolhidos.

O Supabase remoto foi sincronizado e testado. Lint, TypeScript, build de produção, auditoria de dependências, 48 testes unitários e 12 testes públicos de navegador passaram. O fluxo hospedado também foi validado com login, publicação, curtida, comentário, administração, grupos e treino direcionado reais; todos os dados técnicos foram removidos depois. O código foi publicado no GitHub, o PR [#1](https://github.com/samukkaneto/born-to-run/pull/1) foi mesclado em `main`, os dois workflows de qualidade ficaram verdes e a versão validada está em produção em **https://born-to-run-seven.vercel.app**.

## Estado por área

| Área | Estado | Evidência / observação |
|---|---|---|
| Site institucional | Implementado e validado | Home, Sobre, Galeria, Contato, header/footer e páginas responsivas; desktop e Pixel 7 passaram no E2E. |
| Identidade visual Fable 5 | Implementada, ainda refinável | A direção atual foi preservada; a Fable pode redesenhar componentes sem alterar contratos funcionais. |
| Autenticação | Implementada e validada | Login real e erros de credencial foram validados; cadastro tem callback explícito e templates prontos, mas a entrega real ainda depende de SMTP próprio. |
| Comunidade fechada | Implementada e validada no banco | Cadastro entra como `pending`; somente `active` acessa conteúdo interno. |
| Aprovação de membros | Implementada e validada | Admin aprova, rejeita, suspende ou reativa; autorização foi testada no banco e o painel passou em smoke autenticado anterior. |
| Feed social | MVP implementado e validado | Posts, fotos privadas, métricas, curtidas, comentários e paginação keyset por cursor; escrita real passou no preview final. |
| Perfis | Perfil básico implementado | Edição segura e avatar privado; evolução analítica com gráficos/tendências ainda não existe. |
| Treinos | Implementado e validado | CRUD e audiência para equipe, grupos e atletas; treino direcionado foi validado em E2E autenticado e no banco. |
| Grupos | Implementado e validado | Criar, editar, arquivar/reativar e gerenciar integrantes, preservando destinatários históricos. |
| Comunicados | Implementado | CRUD do treinador e leitura pelos membros ativos. |
| Painel do treinador | Implementado e validado | Dashboard, aprovações, membros, grupos, treinos e comunicados; grupo e treino direcionado passaram em smoke autenticado. |
| PWA/responsividade | Instalável, push pendente | Manifesto, ícones, instalação guiada, service worker e fallback offline público validados; dados privados nunca entram no cache. Não é binário nativo. |
| Observabilidade | Implementada para o piloto | `/api/health`, Runtime Logs, Web Analytics e Speed Insights; URLs são sanitizadas antes das métricas. O painel Vercel ainda deve confirmar a ativação dos dois produtos. |
| Continuidade | Procedimento definido | Audit no CI, Dependabot, relato privado e runbook de release; Supabase Free exige exportação criptografada ou Pro antes de depender de backup automático. |
| Supabase remoto | Sincronizado | Seis migrations aplicadas; estado atual termina em `20260809021316_protege_metadados_e_referencias_de_midia`. |
| Vercel | Produção publicada e automação restaurada | O domínio público acompanha os deployments Git de `main`; a reconexão ao repositório atual foi comprovada pelo deployment automático do commit `0947508`. Variáveis Supabase, rotas públicas/guard e logs foram verificados. `dpl_BEEAsWK34yBunpBXvGUgznbQzDKk` permanece como baseline manual validado e `dpl_3GyqEDBXYJcqndUWVRZGSzviMDik` como rollback antigo conhecido. |
| GitHub | Publicado, revisado e mesclado | PR [#1](https://github.com/samukkaneto/born-to-run/pull/1) mesclado em `main` no commit `21d15aa`; CI da branch e do merge concluídos com sucesso. |

## Regras de produto consolidadas

- Garmin Connect, Strava e Sports Tracker são referências de experiência social/esportiva, não integrações desta entrega.
- A área interna pertence somente à equipe Born to Run; estar autenticado não basta, a associação precisa estar ativa.
- O treinador administra o acesso e pode prescrever um treino para toda a equipe, grupos ou atletas individuais.
- Atletas podem publicar atividade com texto, fotografia e métricas, curtir e comentar.
- Site institucional e aplicativo privado coexistem no mesmo projeto.
- O aplicativo deve transmitir experiência mobile premium; a implementação atual é Next.js/PWA e também funciona no desktop.

## Banco de dados e segurança

A migration canônica e o snapshot `supabase/schema.sql` incluem:

- `profiles` com papéis `member/admin` e status `pending/active/suspended/rejected`;
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

O banco preserva 1 perfil administrador ativo e continua sem conteúdo fictício em posts, comentários, curtidas, treinos, comunicados ou grupos.

## Qualidade verificada

| Gate | Resultado atual |
|---|---|
| ESLint | Aprovado, sem erros |
| TypeScript (`tsc --noEmit`) | Aprovado |
| Build Next.js 16.3.0 | Aprovado, 31 rotas |
| Testes unitários | 48/48 aprovados, incluindo paginação e cursores adulterados |
| `npm audit` | 0 vulnerabilidades conhecidas |
| Tipos do Supabase | Gerados a partir do banco remoto |
| Boundaries de erro/loading/not-found | Implementados |
| Acessibilidade básica | Skip links, foco visível, modais com foco, redução de movimento e controles ampliados |
| Testes pgTAP versionados | 56 asserções; a suíte combinada passou remotamente dentro de transação revertida antes da sexta migration |
| E2E público | Cobertura ampliada para 24 casos em Desktop Chrome e Pixel 7; todos aprovados sobre o build de produção; zero violações axe sérias/críticas |
| E2E autenticado hospedado | Login, feed, publicação, curtida, comentário, painel admin, grupo e treino dirigido validados; dados técnicos removidos |
| Vercel | Produção `READY` no domínio canônico, 27 rotas, respostas 200/307 corretas, integração Git automática validada e sem erros nos logs consultados |
| GitHub Actions | Runs `31275354335` e `31275507684` aprovadas integralmente na branch e no merge em `main` |

## Pendências operacionais pós-publicação

O MVP web está publicado. Os itens abaixo são melhorias operacionais ou fases posteriores e não anulam a entrega atual:

1. configurar SMTP próprio e validar cadastro, confirmação e recuperação com caixa de e-mail real;
2. habilitar no Supabase Auth a proteção contra senhas vazadas;
3. executar o piloto fechado com usuários reais e validar os fluxos de aprovação, publicação e treino;
4. tratar push e empacotamento nativo como fase própria, caso o objetivo passe de PWA instalável para lojas de aplicativos.
5. confirmar Web Analytics/Speed Insights no painel e definir backup Pro ou exportação criptografada antes do piloto gerar dados relevantes.

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
