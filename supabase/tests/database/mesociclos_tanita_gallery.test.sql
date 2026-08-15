begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(14);

select has_table('public', 'training_cycles', 'mesociclos possuem tabela própria');
select has_column('public', 'workouts', 'training_cycle_id', 'treino pode pertencer a um mesociclo');
select has_table('public', 'body_assessment_files', 'avaliação possui arquivos Tanita normalizados');
select has_column('public', 'body_assessments', 'body_fat_category', 'faixa de gordura traduzível é persistida');
select has_column('public', 'body_assessments', 'segment_trunk_muscle_kg', 'massa muscular segmental é persistida');

select ok(
  has_function_privilege('authenticated', 'public.staff_import_training_cycle(text,jsonb,text,uuid[],uuid[])', 'execute'),
  'equipe técnica autenticada pode publicar mesociclo'
);
select ok(
  not has_function_privilege('anon', 'public.staff_import_training_cycle(text,jsonb,text,uuid[],uuid[])', 'execute'),
  'visitante não publica mesociclo'
);
select ok(
  has_function_privilege('authenticated', 'public.get_my_assigned_workouts()', 'execute'),
  'perfil autenticado pode consultar apenas as próprias prescrições'
);
select ok(
  not has_function_privilege('anon', 'public.get_my_assigned_workouts()', 'execute'),
  'visitante não consulta prescrições privadas'
);
select ok(
  has_function_privilege('authenticated', 'public.staff_save_body_assessment_v4(uuid,uuid,date,jsonb,text[],text[],text)', 'execute'),
  'equipe técnica usa avaliação Tanita completa'
);
select ok(
  not has_function_privilege('anon', 'public.staff_save_body_assessment_v4(uuid,uuid,date,jsonb,text[],text[],text)', 'execute'),
  'visitante não grava avaliação Tanita'
);

select ok(
  position('p.role <> ''member''' in pg_get_functiondef(
    'public.admin_save_workout(uuid,text,text,text,text,date,text,uuid[],uuid[])'::regprocedure
  )) = 0
  and position('p.membership_status <> ''active''' in pg_get_functiondef(
    'public.admin_save_workout(uuid,text,text,text,text,date,text,uuid[],uuid[])'::regprocedure
  )) > 0,
  'admin e treinador ativos também podem ser destinatários no modo atleta'
);

select ok(
  position('wa.athlete_user_id = (select auth.uid())' in pg_get_functiondef(
    'public.get_my_assigned_workouts()'::regprocedure
  )) > 0,
  'modo atleta filtra a prescrição pelo próprio usuário mesmo para equipe técnica'
);

select ok(
  position('Foto da equipe Born to Run' in pg_get_functiondef(
    'public.staff_save_gallery_item(uuid,text,text,text,text,date,text,integer,boolean,boolean)'::regprocedure
  )) > 0,
  'galeria aplica texto alternativo acessível sem exigir legenda do usuário'
);

select * from finish();
rollback;
