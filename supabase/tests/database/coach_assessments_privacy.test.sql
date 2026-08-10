begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(16);

insert into app_private.staff_invitations (email, role)
values ('coach-test@example.invalid', 'coach');

insert into auth.users (id, email, raw_user_meta_data)
values
  (
    '70000000-0000-4000-8000-000000000001',
    'admin-coach-test@example.invalid',
    '{"full_name":"Administrador Teste"}'::jsonb
  ),
  (
    '70000000-0000-4000-8000-000000000002',
    'coach-test@example.invalid',
    '{"full_name":"Treinador Teste"}'::jsonb
  ),
  (
    '70000000-0000-4000-8000-000000000003',
    'athlete-owner-test@example.invalid',
    '{"full_name":"Atleta Avaliado"}'::jsonb
  ),
  (
    '70000000-0000-4000-8000-000000000004',
    'athlete-other-test@example.invalid',
    '{"full_name":"Outro Atleta"}'::jsonb
  );

select is(
  (
    select role = 'coach' and membership_status = 'active'
    from public.profiles
    where user_id = '70000000-0000-4000-8000-000000000002'
  ),
  true,
  'e-mail pré-autorizado nasce como treinador ativo depois do cadastro'
);

update public.profiles
set role = case
      when user_id = '70000000-0000-4000-8000-000000000001' then 'admin'
      else 'member'
    end,
    membership_status = 'active'
where user_id in (
  '70000000-0000-4000-8000-000000000001',
  '70000000-0000-4000-8000-000000000003',
  '70000000-0000-4000-8000-000000000004'
);

set local role authenticated;
set local "request.jwt.claim.role" = 'authenticated';

set local "request.jwt.claim.sub" = '70000000-0000-4000-8000-000000000001';
set local "request.jwt.claims" =
  '{"sub":"70000000-0000-4000-8000-000000000001","role":"authenticated"}';

select is(app_private.is_admin(), true, 'Samuel permanece administrador');
select is(app_private.is_coach(), false, 'administrador não herda o papel de treinador');
select throws_ok(
  $$select public.admin_save_workout(
    null, 'Treino do admin', 'Não deve ser criado', 'iniciante',
    'Validar separação dos papéis', current_date, 'targeted',
    array['70000000-0000-4000-8000-000000000003'::uuid], '{}'::uuid[]
  )$$,
  '42501',
  null,
  'administrador não publica treino'
);

set local "request.jwt.claim.sub" = '70000000-0000-4000-8000-000000000002';
set local "request.jwt.claims" =
  '{"sub":"70000000-0000-4000-8000-000000000002","role":"authenticated"}';

select is(app_private.is_coach(), true, 'Robson é reconhecido como treinador ativo');
select lives_ok(
  $$select public.admin_save_workout(
    null, 'Rodagem individual', 'Corrida leve e controlada', 'iniciante',
    'Desenvolver base aeróbica', current_date, 'targeted',
    array['70000000-0000-4000-8000-000000000003'::uuid], '{}'::uuid[]
  )$$,
  'treinador publica treino privado para atleta escolhido'
);
select lives_ok(
  $$select public.coach_save_body_assessment(
    null,
    '70000000-0000-4000-8000-000000000003'::uuid,
    current_date,
    72.4,
    18.2,
    34.1,
    7::numeric,
    56.8,
    23.4,
    31::smallint,
    'Avaliação inicial da suíte de privacidade'
  )$$,
  'treinador registra avaliação do atleta'
);
select results_eq(
  $$select count(*)::bigint from public.body_assessments$$,
  array[1::bigint],
  'treinador vê a avaliação registrada'
);

set local "request.jwt.claim.sub" = '70000000-0000-4000-8000-000000000003';
set local "request.jwt.claims" =
  '{"sub":"70000000-0000-4000-8000-000000000003","role":"authenticated"}';

select results_eq(
  $$select count(*)::bigint from public.workouts where title = 'Rodagem individual'$$,
  array[1::bigint],
  'atleta designado vê o próprio treino'
);
select results_eq(
  $$select count(*)::bigint from public.body_assessments$$,
  array[1::bigint],
  'atleta avaliado vê a própria avaliação'
);
select throws_ok(
  $$insert into public.body_assessments (
    athlete_user_id, assessed_by, assessed_at, weight_kg
  ) values (
    '70000000-0000-4000-8000-000000000003',
    '70000000-0000-4000-8000-000000000002',
    current_date,
    70
  )$$,
  '42501',
  null,
  'atleta não insere avaliação pela Data API'
);
select throws_ok(
  $$select public.coach_save_body_assessment(
    null,
    '70000000-0000-4000-8000-000000000003'::uuid,
    current_date,
    70::numeric,
    null::numeric,
    null::numeric,
    null::numeric,
    null::numeric,
    null::numeric,
    null::smallint,
    null
  )$$,
  '42501',
  null,
  'atleta não chama o RPC reservado ao treinador'
);

set local "request.jwt.claim.sub" = '70000000-0000-4000-8000-000000000004';
set local "request.jwt.claims" =
  '{"sub":"70000000-0000-4000-8000-000000000004","role":"authenticated"}';

select results_eq(
  $$select count(*)::bigint from public.workouts where title = 'Rodagem individual'$$,
  array[0::bigint],
  'outro atleta não vê treino alheio'
);
select results_eq(
  $$select count(*)::bigint from public.body_assessments$$,
  array[0::bigint],
  'outro atleta não vê avaliação alheia'
);

set local "request.jwt.claim.sub" = '70000000-0000-4000-8000-000000000001';
set local "request.jwt.claims" =
  '{"sub":"70000000-0000-4000-8000-000000000001","role":"authenticated"}';

select results_eq(
  $$select count(*)::bigint from public.workouts where title = 'Rodagem individual'$$,
  array[0::bigint],
  'administrador não lê treino privado do treinador e atleta'
);
select results_eq(
  $$select count(*)::bigint from public.body_assessments$$,
  array[0::bigint],
  'administrador não lê avaliação privada do treinador e atleta'
);

select * from finish();
rollback;
