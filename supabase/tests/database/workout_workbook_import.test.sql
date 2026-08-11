begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(8);

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '30000000-0000-0000-0000-000000000101',
    'coach-workbook@example.test',
    '{"full_name":"Treinador Planilha"}'::jsonb
  ),
  (
    '30000000-0000-0000-0000-000000000102',
    'athlete-workbook@example.test',
    '{"full_name":"Atleta Planilha"}'::jsonb
  );

update public.profiles
set role = 'coach', membership_status = 'active'
where user_id = '30000000-0000-0000-0000-000000000101'
  and not exists (
    select 1 from public.profiles existing
    where existing.role = 'coach'
      and existing.membership_status = 'active'
      and existing.user_id <> '30000000-0000-0000-0000-000000000101'
  );

update public.profiles
set role = 'member', membership_status = 'active'
where user_id = '30000000-0000-0000-0000-000000000102';

select ok(
  has_function_privilege(
    'authenticated',
    'public.coach_import_workouts(jsonb,text,uuid[],uuid[])',
    'execute'
  ),
  'usuário autenticado pode chegar ao RPC, que valida a função no servidor'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.coach_import_workouts(jsonb,text,uuid[],uuid[])',
    'execute'
  ),
  'visitante anônimo não pode executar a importação'
);

select set_config(
  'btr.test_coach_id',
  (select user_id::text from public.profiles where role = 'coach' and membership_status = 'active' limit 1),
  true
);
select set_config('request.jwt.claim.sub', current_setting('btr.test_coach_id'), true);
set local role authenticated;

select is(
  cardinality(public.coach_import_workouts(
    '[
      {"scheduled_date":"2026-09-01","title":"Ritmo contínuo","description":"8 km em ritmo contínuo","objective":"Ritmo sustentado","training_type":"continuous"},
      {"scheduled_date":"2026-09-03","title":"Intervalado rápido","description":"8 x 400 m com recuperação","objective":"Velocidade","training_type":"fast_interval"}
    ]'::jsonb,
    'intermediario',
    array['30000000-0000-0000-0000-000000000102']::uuid[],
    '{}'::uuid[]
  )),
  2,
  'treinador importa dois treinos em uma chamada atômica'
);

select is(
  (select count(*)::integer from public.workouts where created_by = (select auth.uid())),
  2,
  'os dois treinos prescritos foram criados'
);

select is(
  (
    select count(*)::integer
    from public.workout_assignments assignment
    join public.workouts workout on workout.id = assignment.workout_id
    where workout.created_by = (select auth.uid())
      and assignment.athlete_user_id = '30000000-0000-0000-0000-000000000102'
  ),
  2,
  'cada treino permanece privado para o atleta selecionado'
);

select is(
  (
    select count(*)::integer
    from public.workouts
    where created_by = (select auth.uid())
      and training_type in ('continuous', 'fast_interval')
  ),
  2,
  'as cores semânticas da planilha são persistidas'
);

select set_config(
  'request.jwt.claim.sub',
  '30000000-0000-0000-0000-000000000102',
  true
);

select throws_ok(
  $$select public.coach_import_workouts(
    '[{"scheduled_date":"2026-09-05","title":"Treino indevido","description":"Não deve entrar","objective":"Segurança","training_type":"rest"}]'::jsonb,
    'iniciante',
    array['30000000-0000-0000-0000-000000000102']::uuid[],
    '{}'::uuid[]
  )$$,
  '42501',
  'Acesso restrito ao treinador.',
  'atleta não consegue importar treinos pela API direta'
);

select set_config(
  'request.jwt.claim.sub',
  current_setting('btr.test_coach_id'),
  true
);

select throws_ok(
  $$select public.coach_import_workouts(
    '[
      {"scheduled_date":"2026-09-07","title":"Treino que deve voltar","description":"Primeiro item válido","objective":"Atomicidade","training_type":"rest"},
      {"scheduled_date":"2026-09-08","title":"X","description":"Segundo item inválido","objective":"Atomicidade","training_type":"rest"}
    ]'::jsonb,
    'iniciante',
    array['30000000-0000-0000-0000-000000000102']::uuid[],
    '{}'::uuid[]
  )$$,
  '22023',
  'O título deve ter entre 3 e 160 caracteres.',
  'um item inválido aborta a importação inteira'
);

select * from finish();
rollback;
