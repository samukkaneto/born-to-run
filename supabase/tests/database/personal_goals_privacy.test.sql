begin;

create extension if not exists pgtap with schema extensions;
set local search_path = public, extensions, pg_catalog;

select plan(4);

insert into auth.users (id, email, raw_user_meta_data)
values
  ('71000000-0000-4000-8000-000000000001', 'goal-owner@example.invalid', '{"full_name":"Meta Própria"}'::jsonb),
  ('71000000-0000-4000-8000-000000000002', 'goal-other@example.invalid', '{"full_name":"Outra Pessoa"}'::jsonb),
  ('71000000-0000-4000-8000-000000000003', 'goal-admin@example.invalid', '{"full_name":"Admin Meta"}'::jsonb);

update public.profiles set membership_status = 'active', role = case when user_id = '71000000-0000-4000-8000-000000000003' then 'admin' else 'member' end
where user_id in ('71000000-0000-4000-8000-000000000001', '71000000-0000-4000-8000-000000000002', '71000000-0000-4000-8000-000000000003');

set local role authenticated;
set local "request.jwt.claim.role" = 'authenticated';
set local "request.jwt.claim.sub" = '71000000-0000-4000-8000-000000000001';
set local "request.jwt.claims" = '{"sub":"71000000-0000-4000-8000-000000000001","role":"authenticated"}';

select lives_ok($$insert into public.personal_goals (user_id, goal) values ('71000000-0000-4000-8000-000000000001', 'Completar 10 km')$$, 'atleta salva a própria meta');
select results_eq($$select count(*)::bigint from public.personal_goals$$, array[1::bigint], 'atleta vê a própria meta');

set local "request.jwt.claim.sub" = '71000000-0000-4000-8000-000000000002';
set local "request.jwt.claims" = '{"sub":"71000000-0000-4000-8000-000000000002","role":"authenticated"}';
select results_eq($$select count(*)::bigint from public.personal_goals$$, array[0::bigint], 'outro atleta não vê meta alheia');

set local "request.jwt.claim.sub" = '71000000-0000-4000-8000-000000000003';
set local "request.jwt.claims" = '{"sub":"71000000-0000-4000-8000-000000000003","role":"authenticated"}';
select results_eq($$select count(*)::bigint from public.personal_goals$$, array[0::bigint], 'administrador não vê meta privada do atleta');

select * from finish();
rollback;
