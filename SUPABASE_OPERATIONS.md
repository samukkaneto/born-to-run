# Operação do Supabase — Born to Run

Projeto de produção: `nmcaejrmmfffzeclmuob`
Estado consolidado: `20260809021316_protege_metadados_e_referencias_de_midia`

Migrations registradas em produção em 8 de agosto de 2026:

1. `20260808151232_comunidade_fechada_e_treinos`
2. `20260808162054_preserva_historico_destinatarios`
3. `20260808162941_corrige_validacao_destinatarios`
4. `20260808174648_protege_chaves_feed`
5. `20260808192626_endurece_mutacoes_e_midias`
6. `20260809021316_protege_metadados_e_referencias_de_midia`

O arquivo `supabase/schema.sql` representa o resultado consolidado das seis.
No último diagnóstico remoto havia 1 usuário Auth, 1 perfil `admin/active`,
nenhum órfão e nenhuma linha de conteúdo ou atribuição.

`supabase/schema.sql` é somente um snapshot consolidado para inspeção ou
bootstrap controlado. Em produção já migrada, aplique apenas migrations
pendentes; não execute novamente o snapshot como mecanismo de atualização.

## Regras de migration

- Nunca reaplique ou edite uma migration já registrada.
- Crie toda alteração futura em uma nova migration timestampada.
- O conector e o Supabase CLI controlam a transação. Não adicione
  `BEGIN`/`COMMIT` às migrations futuras.
- Nunca exponha a chave `service_role` em variável `NEXT_PUBLIC_*`, no
  navegador ou em logs.
- Antes do deploy, confirme que Git, Supabase e Vercel apontam para a mesma
  versão.

## Estado saudável

O projeto deve ter pelo menos um administrador ativo e nenhum usuário Auth sem
perfil:

```sql
select
  count(*) filter (
    where role = 'admin' and membership_status = 'active'
  ) as administradores_ativos,
  count(*) filter (where membership_status = 'pending') as pendentes
from public.profiles;

select count(*) as usuarios_sem_perfil
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
);
```

## Bootstrap ou recuperação de administrador

Execute somente pelo SQL Editor ou por conexão administrativa confiável.
Primeiro confirme o UUID e o e-mail; nunca promova automaticamente “o primeiro
usuário”.

```sql
select
  u.id,
  u.email,
  p.full_name,
  p.role,
  p.membership_status
from auth.users u
left join public.profiles p on p.user_id = u.id
order by u.created_at;
```

Ative apenas o UUID explicitamente confirmado:

```sql
update public.profiles
set role = 'admin',
    membership_status = 'active',
    reviewed_at = now(),
    reviewed_by = user_id,
    status_note = null
where user_id = '<UUID_CONFIRMADO>'
returning user_id, full_name, role, membership_status;
```

No bootstrap emergencial acima, `reviewed_by = user_id` registra o próprio UUID
somente porque ainda não existe outro administrador confiável. Quando houver um
administrador ativo, use o UUID dele em `reviewed_by` e faça a mudança pelos
RPCs administrativos normais.

Antes de suspender ou rebaixar um administrador, confirme que outro continuará
ativo:

```sql
select user_id, full_name
from public.profiles
where role = 'admin' and membership_status = 'active';
```

Se o `UPDATE` de recuperação não retornar uma linha, pare e investigue o perfil
ausente. Não crie uma identidade Auth manualmente no banco de produção.

## Advisors

Execute os Security e Performance Advisors depois de toda migration e
periodicamente em produção.

Avisos aceitos e documentados:

- os cinco RPCs `admin_set_membership_status`, `admin_set_member_role`,
  `admin_save_training_group`, `admin_archive_training_group` e
  `admin_save_workout` como `SECURITY DEFINER`; eles devem continuar com
  `search_path = ''`, validação de admin e execução revogada de `public`/`anon`;
- `get_my_access_profile()` como `SECURITY DEFINER`, com retorno mínimo e filtro obrigatório por `auth.uid()`;
- `unused_index` enquanto ainda não houver tráfego representativo.

Qualquer novo aviso de segurança, nova função `SECURITY DEFINER` ou constraint
não validada bloqueia o deploy até revisão. A proteção contra senhas vazadas
deve ser ativada antes do lançamento e permanecer ligada no Supabase Auth. Não
remova índices com base apenas em estatísticas de uma base vazia.

- [Funções SECURITY DEFINER no advisor](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)
- [Proteção de senha](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
- [Índices não usados](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)

Após `20260809021316_protege_metadados_e_referencias_de_midia`, o Security Advisor foi executado em
08/08/2026. Restaram apenas os seis avisos intencionais acima e a proteção
contra senhas vazadas ainda desativada. O Performance Advisor retornou somente
índices ainda não utilizados, resultado esperado para a base sem tráfego.

## Entrega de e-mail do Auth

O E2E de 8 de agosto de 2026 recebeu `429 over_email_send_rate_limit` no
cadastro usando o provedor de e-mail padrão do Supabase. Nenhum usuário parcial
foi criado. Antes de abrir cadastros para a equipe:

1. configure um SMTP próprio no Supabase Auth;
2. cadastre as URLs de produção e preview permitidas para callback;
3. valide cadastro, confirmação e recuperação de senha com uma caixa real;
4. mantenha a mensagem de erro da interface sem revelar detalhes internos.

Esse limite é operacional e não deve ser contornado desativando confirmação de
e-mail em produção.

O plano da organização foi confirmado como `Free` em 08/08/2026. Oito templates
versionados ficam em `supabase/templates/`; a runbook completa para Resend,
URLs, assuntos, segurança e piloto está em
`docs/ABACUS_AI_HANDOFF/10-AUTH-SMTP-E-TEMPLATES.md`. A proteção contra senhas
vazadas exige upgrade Pro. Nenhuma credencial SMTP foi colocada no Git.

- [Configurar SMTP próprio no Supabase Auth](https://supabase.com/docs/guides/auth/auth-smtp)

O callback do aplicativo é `/auth/callback`. Para produção, autorize
`https://born-to-run-seven.vercel.app/auth/callback`. Para cada preview usado em
teste de e-mail, autorize também a URL exata daquele deployment. O código usa
`NEXT_PUBLIC_SITE_URL` em produção e `VERCEL_URL` automático nos previews.

## Drift, backup e recuperação

Antes de todo deploy, confirme que o histórico remoto contém exatamente as
seis migrations registradas neste documento e que não existe migration local
pendente. Mudanças em migrations já aplicadas são proibidas: qualquer correção
entra em uma nova migration timestampada.

Antes de uma alteração destrutiva, confirme no painel do Supabase a política de
backup/restauração disponível para o plano atual e registre o ponto de retorno.
Em incidentes, prefira restauração gerenciada ou uma migration corretiva; não
edite o histórico remoto e não execute `supabase db reset` em produção.

## Testes de banco

A suíte pgTAP fica em `supabase/tests/database` e roda dentro de uma transação
com `ROLLBACK`:

```bash
npx --no-install supabase start
npx --no-install supabase db reset --local
npm run test:db
```

O Supabase local requer Docker. Por isso `test:db` é um gate separado e não faz
parte de `npm run check`. Em CI com Docker, execute `supabase start` antes da
suíte. Os testes SQL cobrem RLS e metadados do Storage; não enviam bytes pela API
de objetos e, portanto, não substituem um teste de upload real. A exclusão de
objetos deve ser feita pela Storage API: a proteção nativa atual bloqueia
`DELETE` direto em `storage.objects`, inclusive em testes.

Em 08/08/2026, os casos críticos foram executados também no projeto remoto
dentro de transações revertidas. A proteção final do feed passou em 12/12
asserções: inserts funcionais de posts, comentários e curtidas continuaram
permitidos, enquanto `id`, `created_at` e `UPDATE` forjados foram bloqueados.
A suíte versionada contém 56 asserções no total. Antes da aplicação de
`20260809021316_protege_metadados_e_referencias_de_midia`, as duas suítes foram combinadas em
um preflight remoto de 56/56 asserções dentro de uma única transação. O
`ROLLBACK` foi confirmado para histórico, funções, triggers, grants e fixtures;
somente depois a migration foi aplicada oficialmente.

- [Testes de banco no Supabase](https://supabase.com/docs/guides/database/testing)

## Smoke test após deploy

1. Novo cadastro fica pendente e não acessa o dashboard.
2. Admin aprova o cadastro.
3. Membro ativo publica texto e imagem.
4. Outro membro ativo visualiza, curte e comenta.
5. Treino da equipe aparece para todos os ativos.
6. Treino dirigido aparece somente ao atleta ou grupo escolhido.
7. Usuário suspenso perde acesso ao feed, treinos e arquivos privados.
8. URLs de mídia são assinadas e nenhuma chave `service_role` chega ao bundle
   do navegador.
