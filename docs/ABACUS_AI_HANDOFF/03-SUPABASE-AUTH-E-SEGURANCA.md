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
6. `20260809021316_protege_metadados_e_referencias_de_midia`

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

## Bloco 1 concluído em 08/08/2026

1. O privilégio de tabela em `profiles` foi removido e substituído por leitura somente das colunas comunitárias seguras.
2. `status_note`, `reviewed_at` e `reviewed_by` não são mais legíveis pela Data API autenticada.
3. O RPC mínimo `get_my_access_profile()` entrega ao usuário apenas o próprio estado e motivo de bloqueio.
4. Novas referências de `avatar_url` e `photo_url` exigem path do proprietário e objeto existente no bucket correto.
5. Objetos ainda referenciados não podem ser apagados pela Storage API.
6. A migration oficial passou antes em preflight remoto de 56/56 asserções com rollback comprovado.

## Pendências de configuração

1. A proteção de senhas vazadas está desativada. A documentação oficial informa disponibilidade no plano Pro ou superior.
2. SMTP próprio ainda não está configurado; o serviço padrão é apenas demonstrativo, limitado e envia somente a endereços autorizados da equipe do projeto.

O Bloco 2 confirmou que a organização está no plano `Free`. O código passou a informar callback explícito no cadastro; a configuração local foi alinhada para confirmação de e-mail e senha de 8 caracteres com letra e número; oito templates e a runbook `10-AUTH-SMTP-E-TEMPLATES.md` foram preparados. A ativação remota depende de upgrade Pro para senhas vazadas e de domínio/provedor/credenciais para SMTP.

## Advisors no baseline

- Seis warnings intencionais de RPCs `SECURITY DEFINER`: cinco administrativos com checagem de administrador e `get_my_access_profile()` limitado a `auth.uid()`.
- Um warning de proteção contra senhas vazadas desativada.
- Índices sem uso, esperado para base sem conteúdo/tráfego.

## Regras para a próxima alteração

- Preferir view `security_invoker` ou RPC com retorno mínimo para dados públicos de perfil.
- Não usar privilégio por coluna sem adaptar todas as consultas `select('*')`.
- Não consultar ou alterar `storage.objects` diretamente de forma incompatível com a proteção nativa do Supabase.
- Testar anon, pending, active, suspended e admin.
- Atualizar `supabase/schema.sql`, tipos, pgTAP e documentação junto da migration.
