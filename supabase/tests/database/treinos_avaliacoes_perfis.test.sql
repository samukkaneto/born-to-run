begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(10);

select ok(
  has_column_privilege('authenticated', 'public.profiles', 'team_joined_at', 'select'),
  'perfil autenticado lê a data de entrada exibida no próprio perfil'
);

select has_column('public', 'workouts', 'training_type', 'treino armazena sua categoria visual');
select col_type_is('public', 'workouts', 'training_type', 'text', 'categoria visual usa texto controlado');
select col_not_null('public', 'workouts', 'training_type', 'todo treino possui uma categoria visual');

select ok(
  exists (
    select 1 from pg_constraint
    where conname = 'workouts_training_type_check'
      and pg_get_constraintdef(oid) like '%competition%'
      and pg_get_constraintdef(oid) like '%aerobic_power%'
  ),
  'constraint cobre competição e potência aeróbia'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.coach_save_workout(uuid,text,text,text,text,date,text,uuid[],uuid[],text)',
    'execute'
  ),
  'treinador autenticado pode chamar o salvamento atômico com categoria'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.coach_save_workout(uuid,text,text,text,text,date,text,uuid[],uuid[],text)',
    'execute'
  ),
  'visitante anônimo não chama o RPC de treino'
);

select ok(
  has_function_privilege(
    'authenticated',
    'public.staff_save_body_assessment_v2(uuid,uuid,date,numeric,numeric,numeric,numeric,numeric,numeric,smallint,numeric,integer,smallint,text,text,text)',
    'execute'
  ),
  'equipe técnica autenticada pode usar a avaliação para perfis ativos'
);

select ok(
  not has_function_privilege(
    'anon',
    'public.staff_save_body_assessment_v2(uuid,uuid,date,numeric,numeric,numeric,numeric,numeric,numeric,smallint,numeric,integer,smallint,text,text,text)',
    'execute'
  ),
  'visitante anônimo não chama o RPC de avaliação'
);

select ok(
  position('p.membership_status = ''active''' in pg_get_functiondef(
    'public.staff_save_body_assessment_v2(uuid,uuid,date,numeric,numeric,numeric,numeric,numeric,numeric,smallint,numeric,integer,smallint,text,text,text)'::regprocedure
  )) > 0
  and position('p.role = ''member''' in pg_get_functiondef(
    'public.staff_save_body_assessment_v2(uuid,uuid,date,numeric,numeric,numeric,numeric,numeric,numeric,smallint,numeric,integer,smallint,text,text,text)'::regprocedure
  )) = 0,
  'avaliação aceita qualquer perfil ativo sem restringir função premium'
);

select * from finish();
rollback;
