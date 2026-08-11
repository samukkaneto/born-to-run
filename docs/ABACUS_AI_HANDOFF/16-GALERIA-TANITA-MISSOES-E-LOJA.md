# Bloco 10 — galeria, Tanita, missões, conquistas e loja

## Estado em 10/08/2026

Código implementado na branch `codex/content-studio-gamification`. As cinco migrations deste bloco já foram aplicadas no Supabase remoto. PR #17 aberta; CI `31451093854` verde; preview Vercel `dpl_5iugxLc26VFU1F3gP59D8jQM9pKU` `READY` no commit `131b879`. Restam merge e auditoria de produção.

## Correções visuais imediatas

- removida a repetição do selo “+200 participações em corridas” sobre a foto da home; o indicador com troféu permanece;
- foto institucional recente `team-race-palace.jpg` mantida como destaque;
- logotipo do rodapé ampliado para leitura e impacto;
- ícones PWA de 192 e 512 px substituídos pelo logotipo real sobre fundo preto;
- cache público da PWA alterado de `btr-public-v1` para `v2` para não conservar o ícone antigo “BR”.

## Galeria institucional

Nova rota de gestão `/admin/galeria`, acessível somente a `admin` e `coach` ativos. Permite upload, substituição, edição, ordem, formato normal/largo, rascunho/publicação e remoção. Título e legenda são opcionais. Descrição acessível é obrigatória. Publicação exige confirmação explícita de autorização de imagem.

Fotos novas usam bucket público `gallery`, pois o objetivo é divulgação no site. A tabela não concede escrita direta a usuários; mutações passam por RPCs `staff_*` que revalidam o papel. As fotos pessoais continuam em `post-images`, privado, e não são copiadas para a galeria.

Enquanto a galeria gerenciada estiver vazia, três fotos autorizadas do acervo inicial aparecem como fallback. Assim que existir uma foto publicada pelo painel, a coleção gerenciada assume integralmente a página.

Migration: `20260811010426_galeria_institucional_e_consentimento.sql`.

## Avaliação Tanita

Administrador e treinador passam a poder registrar/revisar avaliação. Atleta vê apenas as próprias. Foram adicionados massa óssea, metabolismo basal, classificação física e arquivo-fonte. Bucket `assessment-files` é privado, aceita PDF/JPEG/PNG até 15 MB e organiza cada arquivo na pasta UUID do atleta.

O sistema já apresenta as medidas em português e mantém o original com URL assinada. OCR automático permanece conscientemente pendente até receber um relatório real Tanita anonimizado; sem calibração, preencher números automaticamente seria inseguro.

Migration: `20260811010445_avaliacoes_tanita_equipe_tecnica.sql`.

## Missões, níveis e conquistas

Criadas 12 missões iniciais. A avaliação usa posts de treino e resultados de provas. Distância longa libera missões inferiores. Missões de pace exigem distância mínima e ritmo médio inferior ao limite.

Nível de jornada possui dez patamares, de `Primeira Largada` a `Legado Born to Run`. XP combina missões e tempo na equipe. O objetivo é inclusão; performance competitiva extrema permanece em badges/missões separadas.

A data real de entrada na equipe é controlada por administrador/treinador no painel de membros e alimenta o XP de permanência. O atleta não pode alterar essa data. Migration: `20260811013659_registra_data_real_na_equipe.sql`.

Atleta registra nome/data/distância/tempo da prova, participação ou premiação. Premiação exige escolha `geral` ou `categoria`, colocação e categoria quando aplicável. Conquistas principais podem ser destacadas. Dados são declarados pelo atleta; validação por resultado oficial é evolução futura.

Migration: `20260811010500_missoes_niveis_e_resultados.sql`.

## Loja conceitual

Nova rota pública `/loja`, explicitamente marcada como prévia sem vendas. Três campanhas foram geradas com o logotipo oficial e otimizadas para WebP. O catálogo apresenta roupas, top, shorts, moletom, garrafa, boné, viseira, mochila, toalha, caneca e copo. Preços são aproximações de validação, não oferta.

Não existem carrinho, estoque, checkout, pagamento ou pedido. Esses itens pertencem à fase comercial futura.

## Segurança e advisor

Migration `20260811010742_consolida_policies_e_remove_rpcs_legados.sql` unificou as policies de leitura da galeria e revogou execução dos dois RPCs antigos de avaliação. Os novos RPCs usam `SECURITY DEFINER`, `search_path=''` e autorização interna `is_access_manager()`.

Supabase remoto após aplicação:

- 12 missões; 0 resultados reais; 0 itens gerenciados de galeria; 0 avaliações;
- `gallery` público, 12 MB, somente imagens;
- `assessment-files` privado, 15 MB, PDF/JPEG/PNG;
- grants de resultado limitam INSERT/UPDATE às colunas funcionais;
- avisos de índices não usados são esperados numa base sem tráfego;
- proteção contra senhas vazadas continua pendente do plano/decisão do proprietário.

## Gates desta etapa

- TypeScript aprovado;
- ESLint direcionado aos arquivos alterados aprovado;
- Vitest 57/57 aprovado, incluindo arquivo Tanita, cascata de maratona, pace e XP por tempo de equipe;
- build Next.js 16.3 aprovado, 37 rotas;
- E2E público 28/28 aprovado em Desktop Chrome e Pixel 7, sem violações axe sérias/críticas;
- a primeira execução de CI (`31450271727`) identificou que a galeria derrubava a página quando o Supabase estava indisponível; a página passou a usar o acervo local autorizado como fallback;
- a repetição local exata passou 2/2 e o CI completo `31451093854` passou em todas as etapas;
- preview Vercel `dpl_5iugxLc26VFU1F3gP59D8jQM9pKU` ficou `READY`, ligado ao commit corrigido `131b879`;
- produção será registrada após o merge.
