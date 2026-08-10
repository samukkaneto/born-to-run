begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions;

select plan(7);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '00000000-0000-0000-0000-000000000101',
    'admin-lifecycle@example.test',
    '{"full_name":"Admin Lifecycle"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000102',
    'active-lifecycle@example.test',
    '{"full_name":"Atleta Ativo"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000103',
    'suspended-lifecycle@example.test',
    '{"full_name":"Atleta Suspenso"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000104',
    'pending-lifecycle@example.test',
    '{"full_name":"Atleta Pendente"}'::jsonb
  ),
  (
    '00000000-0000-0000-0000-000000000105',
    'coach-lifecycle@example.test',
    '{"full_name":"Treinador Lifecycle"}'::jsonb
  );

update public.profiles
set role = 'admin', membership_status = 'active'
where user_id = '00000000-0000-0000-0000-000000000101';

update public.profiles
set role = 'coach', membership_status = 'active'
where user_id = '00000000-0000-0000-0000-000000000105';

update public.profiles
set membership_status = 'active'
where user_id = '00000000-0000-0000-0000-000000000102';

update public.profiles
set membership_status = 'suspended'
where user_id = '00000000-0000-0000-0000-000000000103';

insert into public.training_groups (id, name, description, created_by, archived_at)
values
  (
    '00000000-0000-0000-0000-000000000201',
    'Grupo histórico',
    'Grupo arquivado que já recebeu um treino.',
    '00000000-0000-0000-0000-000000000101',
    now()
  ),
  (
    '00000000-0000-0000-0000-000000000202',
    'Grupo arquivado novo',
    'Grupo arquivado que nunca recebeu o treino.',
    '00000000-0000-0000-0000-000000000101',
    now()
  );

insert into public.training_group_members (group_id, user_id, added_by)
values
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000102',
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000103',
    '00000000-0000-0000-0000-000000000101'
  );

insert into public.workouts (
  id, title, description, level, objective, scheduled_date, audience, created_by
)
values (
  '00000000-0000-0000-0000-000000000301',
  'Treino histórico',
  'Treino usado para validar destinatários históricos.',
  'intermediario',
  'Validar o ciclo de vida',
  '2026-08-08',
  'targeted',
  '00000000-0000-0000-0000-000000000101'
);

insert into public.workout_assignments (
  workout_id, athlete_user_id, group_id, assigned_by
)
values
  (
    '00000000-0000-0000-0000-000000000301',
    '00000000-0000-0000-0000-000000000103',
    null,
    '00000000-0000-0000-0000-000000000101'
  ),
  (
    '00000000-0000-0000-0000-000000000301',
    null,
    '00000000-0000-0000-0000-000000000201',
    '00000000-0000-0000-0000-000000000101'
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000102',
  true
);

select ok(
  app_private.can_view_workout('00000000-0000-0000-0000-000000000301'),
  'membro ativo mantém acesso ao treino atribuído por grupo arquivado'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000101',
  true
);

select throws_ok(
  $$select public.admin_set_member_role(
    '00000000-0000-0000-0000-000000000103',
    'member'
  )$$,
  '22023',
  'Somente um membro ativo pode ter sua função alterada.',
  'RPC impede promover ou rebaixar um perfil inativo'
);

select set_config(
  'request.jwt.claim.sub',
  '00000000-0000-0000-0000-000000000105',
  true
);

select lives_ok(
  $$select public.admin_save_training_group(
    '00000000-0000-0000-0000-000000000201',
    'Grupo histórico',
    'Edição preserva integrante suspenso.',
    array[
      '00000000-0000-0000-0000-000000000102'::uuid,
      '00000000-0000-0000-0000-000000000103'::uuid
    ]
  )$$,
  'grupo existente pode preservar integrante que ficou inativo'
);

select lives_ok(
  $$select public.admin_archive_training_group(
    '00000000-0000-0000-0000-000000000201'
  )$$,
  'grupo editado pode ser arquivado novamente'
);

select lives_ok(
  $$select public.admin_save_workout(
    '00000000-0000-0000-0000-000000000301',
    'Treino histórico',
    'Edição preserva destinatários históricos.',
    'intermediario',
    'Validar o ciclo de vida',
    '2026-08-08',
    'targeted',
    array['00000000-0000-0000-0000-000000000103'::uuid],
    array['00000000-0000-0000-0000-000000000201'::uuid]
  )$$,
  'treino existente preserva atleta suspenso e grupo arquivado já atribuídos'
);

select throws_ok(
  $$select public.admin_save_workout(
    '00000000-0000-0000-0000-000000000301',
    'Treino histórico',
    'Não permite um novo perfil pendente.',
    'intermediario',
    'Validar o ciclo de vida',
    '2026-08-08',
    'targeted',
    array[
      '00000000-0000-0000-0000-000000000103'::uuid,
      '00000000-0000-0000-0000-000000000104'::uuid
    ],
    array['00000000-0000-0000-0000-000000000201'::uuid]
  )$$,
  '22023',
  'A atribuição contém uma inclusão inexistente, inativa ou que não é atleta.',
  'treino rejeita a inclusão de um novo perfil inativo'
);

select throws_ok(
  $$select public.admin_save_workout(
    '00000000-0000-0000-0000-000000000301',
    'Treino histórico',
    'Não permite um novo grupo arquivado.',
    'intermediario',
    'Validar o ciclo de vida',
    '2026-08-08',
    'targeted',
    array['00000000-0000-0000-0000-000000000103'::uuid],
    array[
      '00000000-0000-0000-0000-000000000201'::uuid,
      '00000000-0000-0000-0000-000000000202'::uuid
    ]
  )$$,
  '22023',
  'A atribuição contém uma nova inclusão de grupo inexistente ou arquivado.',
  'treino rejeita a inclusão de um novo grupo arquivado'
);

select * from finish();

rollback;
