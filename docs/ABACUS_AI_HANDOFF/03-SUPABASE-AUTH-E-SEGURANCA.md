# Supabase, Auth e segurança

## Projeto

- Project ref: `nmcaejrmmfffzeclmuob`
- Estado no início do ciclo: `ACTIVE_HEALTHY`
- PostgreSQL: 17

## Migrations aplicadas no baseline

1. `20260808151232_comunidade_fechada_e_treinos`
2. `20260808162054_preserva_historico_destinatarios`
3. `20260808162941_corrige_validacao_destinatarios`
4. `20260808174648_protege_chaves_feed`
5. `20260808192626_endurece_mutacoes_e_midias`

Nunca editar ou reaplicar essas migrations. Toda alteração entra em uma migration nova.

## Controles existentes

- RLS em todas as tabelas de negócio;
- acesso interno condicionado a `membership_status = active`;
- proteção de `role` e estado de associação;
- operações administrativas atômicas por RPC;
- buckets `avatars` e `post-images` privados;
- paths de mídia por UUID do proprietário;
- URLs assinadas;
- feed sem atualização direta e com chaves controladas pelo banco;
- mutações de grupos e treinos restritas aos fluxos administrativos.

## Pontos pendentes no início do ciclo

1. Membros ativos ainda podem consultar pela Data API `status_note`, `reviewed_at` e `reviewed_by` de outros perfis ativos. A UI não exibe isso, mas segurança não deve depender da UI.
2. O banco valida formato e proprietário do path de mídia, mas não comprova que o objeto existe no bucket.
3. A proteção de senhas vazadas está desativada. A documentação oficial informa disponibilidade no plano Pro ou superior.
4. SMTP próprio ainda não está configurado; o serviço padrão é apenas demonstrativo, limitado e envia somente a endereços autorizados da equipe do projeto.

## Advisors no baseline

- Cinco warnings intencionais de RPCs administrativos `SECURITY DEFINER`, todos com checagem de administrador.
- Um warning de proteção contra senhas vazadas desativada.
- Índices sem uso, esperado para base sem conteúdo/tráfego.

## Regras para a próxima alteração

- Preferir view `security_invoker` ou RPC com retorno mínimo para dados públicos de perfil.
- Não usar privilégio por coluna sem adaptar todas as consultas `select('*')`.
- Não consultar ou alterar `storage.objects` diretamente de forma incompatível com a proteção nativa do Supabase.
- Testar anon, pending, active, suspended e admin.
- Atualizar `supabase/schema.sql`, tipos, pgTAP e documentação junto da migration.
