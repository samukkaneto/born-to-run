-- Durante o desenvolvimento, administradores também exercem as funções técnicas.
-- O nome legado da função é mantido porque as políticas e RPCs existentes o usam.
create or replace function app_private.is_coach()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = (select auth.uid())
      and p.membership_status = 'active'
      and p.role in ('admin', 'coach')
  );
$$;

create table public.personal_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(user_id) on delete cascade,
  goal text not null check (char_length(btrim(goal)) between 1 and 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.personal_goals enable row level security;

create policy "personal_goals_select_own"
  on public.personal_goals for select
  to authenticated
  using (user_id = (select auth.uid()) and app_private.is_active_member());

create policy "personal_goals_insert_own"
  on public.personal_goals for insert
  to authenticated
  with check (user_id = (select auth.uid()) and app_private.is_active_member());

create policy "personal_goals_update_own"
  on public.personal_goals for update
  to authenticated
  using (user_id = (select auth.uid()) and app_private.is_active_member())
  with check (user_id = (select auth.uid()) and app_private.is_active_member());

create policy "personal_goals_delete_own"
  on public.personal_goals for delete
  to authenticated
  using (user_id = (select auth.uid()) and app_private.is_active_member());

create trigger personal_goals_set_updated_at
  before update on public.personal_goals
  for each row execute function app_private.handle_updated_at();

grant select, insert, update, delete on table public.personal_goals to authenticated;
grant all on table public.personal_goals to service_role;

insert into public.personal_goals (user_id, goal)
select user_id, btrim(objetivo)
from public.profiles
where nullif(btrim(objetivo), '') is not null
on conflict (user_id) do update set goal = excluded.goal;

update public.profiles set objetivo = null where objetivo is not null;
revoke select (objetivo), update (objetivo) on table public.profiles from authenticated;

-- Reafirma as permissões de escrita próprias usadas pela tela de conquistas.
grant insert on table public.race_results to authenticated;
grant update (event_name, event_date, distance_km, duration_seconds, achievement_kind, placement, category_label, notes)
  on table public.race_results to authenticated;
