begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(40);

-- Identidades determinísticas; toda a suíte é revertida no final.
insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '10000000-0000-4000-8000-000000000001',
    'admin-btr@test.invalid',
    '{"full_name":"Treinador Teste"}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000002',
    'direto-btr@test.invalid',
    '{"full_name":"Atleta Direto"}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000003',
    'grupo-btr@test.invalid',
    '{"full_name":"Atleta do Grupo"}'::jsonb
  ),
  (
    '10000000-0000-4000-8000-000000000004',
    'fora-btr@test.invalid',
    '{"full_name":"Atleta de Fora"}'::jsonb
  );

select results_eq(
  $$
    select count(*)::bigint
    from public.profiles
    where user_id in (
      '10000000-0000-4000-8000-000000000001'::uuid,
      '10000000-0000-4000-8000-000000000002'::uuid,
      '10000000-0000-4000-8000-000000000003'::uuid,
      '10000000-0000-4000-8000-000000000004'::uuid
    )
      and membership_status = 'pending'
  $$,
  array[4::bigint],
  'o trigger cria todo novo perfil como pendente'
);

-- Bootstrap explícito do único administrador do cenário.
update public.profiles
set role = 'admin',
    membership_status = 'active',
    reviewed_at = now(),
    reviewed_by = user_id
where user_id = '10000000-0000-4000-8000-000000000001';

select is(
  (
    select role = 'admin' and membership_status = 'active'
    from public.profiles
    where user_id = '10000000-0000-4000-8000-000000000001'
  ),
  true,
  'o bootstrap deixa um administrador ativo'
);

-- Dados de treino conhecidos para testar o filtro de público.
insert into public.training_groups (id, name, description, created_by)
values (
  '30000000-0000-4000-8000-000000000001',
  'Grupo pgTAP',
  'Grupo isolado da suíte de segurança',
  '10000000-0000-4000-8000-000000000001'
);

insert into public.training_group_members (group_id, user_id, added_by)
values (
  '30000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000003',
  '10000000-0000-4000-8000-000000000001'
);

insert into public.workouts (
  id, title, description, level, objective, scheduled_date, audience, created_by
)
values
  (
    '20000000-0000-4000-8000-000000000001',
    'Treino da equipe',
    'Visível para todos os membros ativos.',
    'iniciante',
    'Testar o público geral',
    current_date,
    'team',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    'Treino dirigido',
    'Visível apenas por atribuição individual ou de grupo.',
    'intermediario',
    'Testar o público dirigido',
    current_date,
    'targeted',
    '10000000-0000-4000-8000-000000000001'
  );

insert into public.workout_assignments (
  id, workout_id, athlete_user_id, group_id, assigned_by
)
values
  (
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    null,
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000002',
    null,
    '30000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001'
  );

insert into public.posts (id, user_id, caption)
values (
  '60000000-0000-4000-8000-000000000001',
  '10000000-0000-4000-8000-000000000002',
  'Publicação imutável da suíte pgTAP'
);

-- Objeto de outro atleta, criado no setup administrativo.
insert into storage.objects (id, bucket_id, name, owner_id)
values (
  '50000000-0000-4000-8000-000000000001',
  'avatars',
  '10000000-0000-4000-8000-000000000003/outro.jpg',
  '10000000-0000-4000-8000-000000000003'
);

-- Um perfil pendente não entra na comunidade.
set local role authenticated;
set local "request.jwt.claim.sub" = '10000000-0000-4000-8000-000000000002';
set local "request.jwt.claim.role" = 'authenticated';
set local "request.jwt.claims" =
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}';

select is(
  app_private.is_active_member(),
  false,
  'perfil pendente não é membro ativo'
);

select results_eq(
  $$
    select count(*)::bigint
    from public.workouts
    where id = '20000000-0000-4000-8000-000000000001'
  $$,
  array[0::bigint],
  'perfil pendente não vê treino da equipe'
);

-- Aprovação somente por um administrador autenticado.
set local "request.jwt.claim.sub" = '10000000-0000-4000-8000-000000000001';
set local "request.jwt.claims" =
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}';

select is(
  app_private.is_admin(),
  true,
  'o contexto do treinador é reconhecido como administrador'
);

select results_eq(
  $$
    select
      has_table_privilege('authenticated', 'public.workouts', 'INSERT'),
      has_table_privilege('authenticated', 'public.workouts', 'UPDATE'),
      has_table_privilege('authenticated', 'public.training_groups', 'INSERT'),
      has_table_privilege('authenticated', 'public.training_groups', 'UPDATE'),
      has_table_privilege('authenticated', 'public.training_groups', 'DELETE'),
      has_table_privilege('authenticated', 'public.training_group_members', 'INSERT'),
      has_table_privilege('authenticated', 'public.training_group_members', 'DELETE'),
      has_table_privilege('authenticated', 'public.workout_assignments', 'INSERT'),
      has_table_privilege('authenticated', 'public.workout_assignments', 'DELETE')
  $$,
  $$ values (false, false, false, false, false, false, false, false, false) $$,
  'tabelas administradas por RPC não expõem mutações diretas'
);

select throws_ok(
  $$
    insert into public.workouts (
      title, description, level, objective, audience, created_by
    ) values (
      'Treino direto indevido', 'Não deve ser criado.', 'iniciante',
      'Validar privilégio mínimo', 'team',
      '10000000-0000-4000-8000-000000000001'
    )
  $$,
  '42501',
  null,
  'administrador não contorna o RPC inserindo treino diretamente'
);

select throws_ok(
  $$
    update public.training_groups
    set name = 'Grupo alterado diretamente'
    where id = '30000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  null,
  'administrador não contorna o RPC alterando grupo diretamente'
);

select throws_ok(
  $$
    insert into public.workout_assignments (
      workout_id, athlete_user_id, assigned_by
    ) values (
      '20000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000004',
      '10000000-0000-4000-8000-000000000001'
    )
  $$,
  '42501',
  null,
  'administrador não contorna o RPC inserindo atribuição diretamente'
);

select lives_ok(
  $$
    select public.admin_set_membership_status(
      '10000000-0000-4000-8000-000000000002',
      'active',
      'Aprovado pela suíte pgTAP'
    )
  $$,
  'administrador aprova o atleta com atribuição direta'
);

select lives_ok(
  $$
    select public.admin_set_membership_status(
      '10000000-0000-4000-8000-000000000003',
      'active',
      null
    )
  $$,
  'administrador aprova o atleta do grupo'
);

select lives_ok(
  $$
    select public.admin_set_membership_status(
      '10000000-0000-4000-8000-000000000004',
      'active',
      null
    )
  $$,
  'administrador aprova o atleta sem atribuição'
);

select results_eq(
  $$
    select membership_status, reviewed_by, reviewed_at is not null
    from public.profiles
    where user_id = '10000000-0000-4000-8000-000000000002'
  $$,
  $$
    values (
      'active'::text,
      '10000000-0000-4000-8000-000000000001'::uuid,
      true
    )
  $$,
  'aprovação registra status, revisor e data'
);

-- Membro aprovado: acesso normal, sem autopromoção.
set local "request.jwt.claim.sub" = '10000000-0000-4000-8000-000000000002';
set local "request.jwt.claims" =
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}';

select is(
  app_private.is_active_member(),
  true,
  'atleta aprovado passa a ser membro ativo'
);

select results_eq(
  $$
    select count(*)::bigint
    from public.workouts
    where id = '20000000-0000-4000-8000-000000000001'
  $$,
  array[1::bigint],
  'membro ativo vê o treino da equipe'
);

select throws_ok(
  $$
    select public.admin_set_member_role(
      '10000000-0000-4000-8000-000000000002',
      'admin'
    )
  $$,
  '42501',
  null,
  'membro não pode chamar o RPC administrativo para se promover'
);

select throws_ok(
  $$
    update public.profiles
    set role = 'admin'
    where user_id = '10000000-0000-4000-8000-000000000002'
  $$,
  '42501',
  null,
  'membro não possui privilégio de UPDATE na coluna role'
);

select is(
  (
    select role
    from public.profiles
    where user_id = '10000000-0000-4000-8000-000000000002'
  ),
  'member'::text,
  'as tentativas de autopromoção não alteram a função'
);

select throws_ok(
  $$
    update public.posts
    set caption = 'Alteração indevida'
    where id = '60000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  null,
  'membro não altera a legenda diretamente pela Data API'
);

select throws_ok(
  $$
    update public.posts
    set created_at = now() + interval '1 year'
    where id = '60000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  null,
  'membro não reposiciona a publicação alterando created_at'
);

select throws_ok(
  $$
    update public.posts
    set id = '60000000-0000-4000-8000-000000000002'
    where id = '60000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  null,
  'membro não altera o desempate id usado pelo cursor'
);

select lives_ok(
  $$
    insert into public.posts (user_id, caption)
    values (
      '10000000-0000-4000-8000-000000000002',
      'Publicação normal com chaves geradas pelo banco'
    )
  $$,
  'membro continua publicando pelas colunas funcionais permitidas'
);

select lives_ok(
  $$
    update public.profiles
    set avatar_url = '10000000-0000-4000-8000-000000000002/91000000-0000-4000-8000-000000000001.jpg'
    where user_id = '10000000-0000-4000-8000-000000000002'
  $$,
  'membro associa ao perfil um avatar da própria pasta'
);

select throws_ok(
  $$
    update public.profiles
    set avatar_url = '10000000-0000-4000-8000-000000000003/91000000-0000-4000-8000-000000000002.jpg'
    where user_id = '10000000-0000-4000-8000-000000000002'
  $$,
  '42501',
  null,
  'membro não associa ao perfil o avatar de outro atleta'
);

select throws_ok(
  $$
    update public.profiles
    set avatar_url = 'https://example.invalid/avatar.jpg'
    where user_id = '10000000-0000-4000-8000-000000000002'
  $$,
  '42501',
  null,
  'membro não associa URL externa diretamente ao avatar'
);

select lives_ok(
  $$
    insert into public.posts (user_id, caption, photo_url)
    values (
      '10000000-0000-4000-8000-000000000002',
      'Foto válida da própria pasta',
      '10000000-0000-4000-8000-000000000002/92000000-0000-4000-8000-000000000001.webp'
    )
  $$,
  'membro publica uma foto da própria pasta'
);

select throws_ok(
  $$
    insert into public.posts (user_id, caption, photo_url)
    values (
      '10000000-0000-4000-8000-000000000002',
      'Foto indevida de outro atleta',
      '10000000-0000-4000-8000-000000000003/92000000-0000-4000-8000-000000000002.png'
    )
  $$,
  '42501',
  null,
  'membro não publica foto apontando para a pasta de outro atleta'
);

select throws_ok(
  $$
    insert into public.posts (user_id, caption, photo_url)
    values (
      '10000000-0000-4000-8000-000000000002',
      'Foto externa indevida',
      'https://example.invalid/post.jpg'
    )
  $$,
  '42501',
  null,
  'membro não publica URL externa diretamente como foto'
);

select throws_ok(
  $$
    insert into public.posts (id, user_id, caption, created_at)
    values (
      '60000000-0000-4000-8000-000000000003',
      '10000000-0000-4000-8000-000000000002',
      'Tentativa de fixar publicação no topo',
      now() + interval '10 years'
    )
  $$,
  '42501',
  null,
  'membro não escolhe id nem created_at ao publicar'
);

select lives_ok(
  $$
    insert into public.comments (post_id, user_id, content)
    values (
      '60000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002',
      'Comentário com chaves geradas pelo banco'
    )
  $$,
  'membro continua comentando pelas colunas funcionais permitidas'
);

select throws_ok(
  $$
    insert into public.comments (id, post_id, user_id, content, created_at)
    values (
      '70000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002',
      'Comentário com data forjada',
      now() + interval '10 years'
    )
  $$,
  '42501',
  null,
  'membro não escolhe id nem created_at ao comentar'
);

select lives_ok(
  $$
    insert into public.likes (post_id, user_id)
    values (
      '60000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002'
    )
  $$,
  'membro continua curtindo pelas colunas funcionais permitidas'
);

select throws_ok(
  $$
    insert into public.likes (id, post_id, user_id, created_at)
    values (
      '80000000-0000-4000-8000-000000000001',
      '60000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002',
      now() + interval '10 years'
    )
  $$,
  '42501',
  null,
  'membro não escolhe id nem created_at ao curtir'
);

select results_eq(
  $$
    select count(*)::bigint
    from public.workouts
    where id = '20000000-0000-4000-8000-000000000002'
  $$,
  array[1::bigint],
  'atleta escolhido individualmente vê o treino dirigido'
);

-- Ownership de Storage: testa metadados/RLS, não o upload binário da API.
select lives_ok(
  $$
    insert into storage.objects (id, bucket_id, name, owner_id)
    values (
      '50000000-0000-4000-8000-000000000002',
      'avatars',
      '10000000-0000-4000-8000-000000000002/proprio.jpg',
      '10000000-0000-4000-8000-000000000002'
    )
  $$,
  'membro ativo cria metadado na própria pasta de avatar'
);

select throws_ok(
  $$
    insert into storage.objects (id, bucket_id, name, owner_id)
    values (
      '50000000-0000-4000-8000-000000000003',
      'avatars',
      '10000000-0000-4000-8000-000000000003/invasao.jpg',
      '10000000-0000-4000-8000-000000000002'
    )
  $$,
  '42501',
  null,
  'membro não cria objeto na pasta de outro atleta'
);

select throws_ok(
  $$
    delete from storage.objects
    where id = '50000000-0000-4000-8000-000000000001'
  $$,
  '42501',
  null,
  'membro não exclui o avatar pertencente a outro atleta e usa a Storage API'
);

-- Atribuição via grupo.
set local "request.jwt.claim.sub" = '10000000-0000-4000-8000-000000000003';
set local "request.jwt.claims" =
  '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}';

select results_eq(
  $$
    select count(*)::bigint
    from public.workouts
    where id = '20000000-0000-4000-8000-000000000002'
  $$,
  array[1::bigint],
  'integrante do grupo vê o treino dirigido ao grupo'
);

-- Membro ativo sem atribuição não vê o treino dirigido.
set local "request.jwt.claim.sub" = '10000000-0000-4000-8000-000000000004';
set local "request.jwt.claims" =
  '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated"}';

select results_eq(
  $$
    select count(*)::bigint
    from public.workouts
    where id = '20000000-0000-4000-8000-000000000002'
  $$,
  array[0::bigint],
  'membro sem atribuição não vê treino dirigido a terceiros'
);

reset role;

select results_eq(
  $$
    select public
    from storage.buckets
    where id in ('avatars', 'post-images')
    order by id
  $$,
  array[false, false],
  'os dois buckets de mídia permanecem privados'
);

select * from finish();
rollback;
