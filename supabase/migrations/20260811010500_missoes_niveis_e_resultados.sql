-- Missões inclusivas, níveis de jornada e resultados/conquistas reais.
-- Nível de jornada mede participação e constância; desempenho competitivo
-- permanece separado para não desmotivar atletas por idade ou ritmo.

create table public.mission_catalog (
  code text primary key,
  title text not null,
  description text not null,
  category text not null,
  distance_km numeric(7,3),
  max_pace_seconds integer,
  points integer not null,
  tier text not null,
  icon_key text not null,
  sort_order integer not null,
  is_active boolean not null default true,
  constraint mission_catalog_code_check check (code ~ '^[a-z0-9_]{3,60}$'),
  constraint mission_catalog_category_check check (category in ('distance', 'pace', 'consistency', 'team')),
  constraint mission_catalog_distance_check check (distance_km is null or distance_km between 0.1 and 500),
  constraint mission_catalog_pace_check check (max_pace_seconds is null or max_pace_seconds between 120 and 1200),
  constraint mission_catalog_points_check check (points between 1 and 10000),
  constraint mission_catalog_tier_check check (tier in ('bronze', 'silver', 'gold', 'platinum', 'diamond', 'elite')),
  constraint mission_catalog_sort_check check (sort_order between 0 and 10000)
);

insert into public.mission_catalog
  (code, title, description, category, distance_km, max_pace_seconds, points, tier, icon_key, sort_order)
values
  ('primeiro_1k', 'Primeiro quilômetro', 'Complete 1 km em treino ou corrida.', 'distance', 1, null, 100, 'bronze', 'footprints', 10),
  ('primeiros_3k', 'Primeiros 3 km', 'Complete 3 km em uma atividade.', 'distance', 3, null, 160, 'bronze', 'route', 20),
  ('primeiros_5k', 'Primeiros 5 km', 'Complete 5 km em treino ou corrida.', 'distance', 5, null, 250, 'silver', 'medal', 30),
  ('primeiros_10k', 'Primeiros 10 km', 'Complete 10 km em uma atividade.', 'distance', 10, null, 450, 'silver', 'mountain', 40),
  ('primeiros_15k', 'Primeiros 15 km', 'Complete 15 km em uma atividade.', 'distance', 15, null, 650, 'gold', 'flame', 50),
  ('primeira_meia', 'Primeira meia maratona', 'Complete ao menos 21,1 km.', 'distance', 21.1, null, 1000, 'gold', 'trophy', 60),
  ('primeiros_30k', 'Além dos 30 km', 'Complete ao menos 30 km em uma atividade.', 'distance', 30, null, 1500, 'platinum', 'crown', 70),
  ('primeira_maratona', 'Primeira maratona', 'Complete ao menos 42,195 km.', 'distance', 42.195, null, 2400, 'diamond', 'gem', 80),
  ('cinco_sub_6', '5 km abaixo de 6:00/km', 'Complete 5 km com ritmo médio inferior a 6:00 por km.', 'pace', 5, 360, 500, 'silver', 'timer', 90),
  ('cinco_sub_5', '5 km abaixo de 5:00/km', 'Complete 5 km com ritmo médio inferior a 5:00 por km.', 'pace', 5, 300, 900, 'gold', 'zap', 100),
  ('cinco_sub_4', '5 km abaixo de 4:00/km', 'Complete 5 km com ritmo médio inferior a 4:00 por km.', 'pace', 5, 240, 1800, 'platinum', 'rocket', 110),
  ('cinco_sub_330', '5 km abaixo de 3:30/km', 'Marca de desempenho excepcional nos 5 km.', 'pace', 5, 210, 4000, 'elite', 'star', 120)
on conflict (code) do update set
  title = excluded.title,
  description = excluded.description,
  category = excluded.category,
  distance_km = excluded.distance_km,
  max_pace_seconds = excluded.max_pace_seconds,
  points = excluded.points,
  tier = excluded.tier,
  icon_key = excluded.icon_key,
  sort_order = excluded.sort_order,
  is_active = excluded.is_active;

create table public.race_results (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null references public.profiles(user_id) on delete cascade,
  event_name text not null,
  event_date date not null,
  distance_km numeric(7,3) not null,
  duration_seconds integer,
  achievement_kind text not null default 'participation',
  placement integer,
  category_label text,
  is_featured boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint race_results_event_name_check check (char_length(event_name) between 2 and 160),
  constraint race_results_event_date_check check (event_date <= current_date),
  constraint race_results_distance_check check (distance_km between 0.1 and 500),
  constraint race_results_duration_check check (duration_seconds is null or duration_seconds between 30 and 1728000),
  constraint race_results_kind_check check (achievement_kind in ('participation', 'overall', 'category')),
  constraint race_results_placement_check check (
    (achievement_kind = 'participation' and placement is null and category_label is null)
    or (achievement_kind = 'overall' and placement between 1 and 999 and category_label is null)
    or (achievement_kind = 'category' and placement between 1 and 999 and char_length(category_label) between 2 and 100)
  ),
  constraint race_results_notes_check check (notes is null or char_length(notes) <= 1000)
);

create index race_results_athlete_date_idx on public.race_results (athlete_user_id, event_date desc, created_at desc);
create index race_results_featured_idx on public.race_results (athlete_user_id, event_date desc) where is_featured;

create trigger race_results_updated_at
before update on public.race_results
for each row execute function app_private.handle_updated_at();

alter table public.mission_catalog enable row level security;
alter table public.race_results enable row level security;

create policy mission_catalog_select_active on public.mission_catalog
  for select to authenticated
  using ((select app_private.is_active_member()));

create policy race_results_select_community on public.race_results
  for select to authenticated
  using ((select app_private.is_active_member()));

create policy race_results_insert_own on public.race_results
  for insert to authenticated
  with check (
    athlete_user_id = (select auth.uid())
    and (select app_private.is_active_member())
  );

create policy race_results_update_own on public.race_results
  for update to authenticated
  using (athlete_user_id = (select auth.uid()) and (select app_private.is_active_member()))
  with check (athlete_user_id = (select auth.uid()) and (select app_private.is_active_member()));

create policy race_results_delete_own on public.race_results
  for delete to authenticated
  using (athlete_user_id = (select auth.uid()) and (select app_private.is_active_member()));

revoke all on table public.mission_catalog from anon, authenticated;
grant select on table public.mission_catalog to authenticated;
grant select, insert, update, delete on table public.mission_catalog to service_role;

revoke all on table public.race_results from anon, authenticated;
grant select on table public.race_results to authenticated;
grant insert (athlete_user_id, event_name, event_date, distance_km, duration_seconds,
  achievement_kind, placement, category_label, is_featured, notes)
  on table public.race_results to authenticated;
grant update (event_name, event_date, distance_km, duration_seconds,
  achievement_kind, placement, category_label, is_featured, notes)
  on table public.race_results to authenticated;
grant delete on table public.race_results to authenticated;
grant select, insert, update, delete on table public.race_results to service_role;
