-- Administradores e treinadores tambem possuem modo atleta. Prescricoes
-- continuam privadas, mas qualquer perfil ativo pode ser destinatario.
create or replace function public.admin_save_workout(
  target_workout_id uuid,
  target_title text,
  target_description text,
  target_level text,
  target_objective text,
  target_scheduled_date date,
  target_audience text,
  target_member_ids uuid[],
  target_group_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
  member_ids uuid[] := coalesce(target_member_ids, '{}'::uuid[]);
  group_ids uuid[] := coalesce(target_group_ids, '{}'::uuid[]);
begin
  if not app_private.is_coach() then
    raise exception 'Acesso restrito a equipe tecnica.' using errcode = '42501';
  end if;
  if length(btrim(target_title)) not between 3 and 160 then
    raise exception 'O titulo deve ter entre 3 e 160 caracteres.' using errcode = '22023';
  end if;
  if length(btrim(target_description)) not between 1 and 5000 then
    raise exception 'A descricao do treino e obrigatoria.' using errcode = '22023';
  end if;
  if length(btrim(target_objective)) not between 1 and 500 then
    raise exception 'O objetivo do treino e obrigatorio.' using errcode = '22023';
  end if;
  if target_level not in ('iniciante', 'intermediario', 'avancado') then
    raise exception 'Nivel de treino invalido.' using errcode = '22023';
  end if;
  if target_audience <> 'targeted' then
    raise exception 'Todo treino deve ter destinatarios especificos.' using errcode = '22023';
  end if;
  if cardinality(member_ids) = 0 and cardinality(group_ids) = 0 then
    raise exception 'Escolha ao menos um atleta ou grupo.' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(member_ids) as requested_member(member_id)
    left join public.profiles p on p.user_id = requested_member.member_id
    where p.user_id is null
      or (
        p.membership_status <> 'active'
        and not (
          target_workout_id is not null
          and exists (
            select 1 from public.workout_assignments existing
            where existing.workout_id = target_workout_id
              and existing.athlete_user_id = requested_member.member_id
          )
        )
      )
  ) then
    raise exception 'A atribuicao contem um perfil inexistente ou inativo.' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(group_ids) as requested_group(group_id)
    left join public.training_groups g on g.id = requested_group.group_id
    where g.id is null
      or (
        g.archived_at is not null
        and not (
          target_workout_id is not null
          and exists (
            select 1 from public.workout_assignments existing
            where existing.workout_id = target_workout_id
              and existing.group_id = requested_group.group_id
          )
        )
      )
  ) then
    raise exception 'A atribuicao contem um grupo inexistente ou arquivado.' using errcode = '22023';
  end if;

  if target_workout_id is null then
    insert into public.workouts (
      title, description, level, objective, scheduled_date, audience, created_by
    ) values (
      btrim(target_title), btrim(target_description), target_level,
      btrim(target_objective), target_scheduled_date, 'targeted', (select auth.uid())
    ) returning id into saved_id;
  else
    update public.workouts
    set title = btrim(target_title),
        description = btrim(target_description),
        level = target_level,
        objective = btrim(target_objective),
        scheduled_date = target_scheduled_date,
        audience = 'targeted'
    where id = target_workout_id
    returning id into saved_id;
    if saved_id is null then
      raise exception 'Treino nao encontrado.' using errcode = 'P0002';
    end if;
  end if;

  delete from public.workout_assignments where workout_id = saved_id;
  insert into public.workout_assignments (workout_id, athlete_user_id, assigned_by)
  select saved_id, member_id, (select auth.uid())
  from (select distinct unnest(member_ids) as member_id) members;
  insert into public.workout_assignments (workout_id, group_id, assigned_by)
  select saved_id, group_id, (select auth.uid())
  from (select distinct unnest(group_ids) as group_id) groups;

  return saved_id;
end;
$$;

drop policy if exists btr_assessment_files_insert_staff on storage.objects;
create policy btr_assessment_files_insert_staff on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'assessment-files'
    and (select app_private.is_access_manager())
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}(-[123])?\.(pdf|jpg|png)$'
    and exists (
      select 1 from public.profiles athlete
      where athlete.user_id::text = (storage.foldername(name))[1]
        and athlete.membership_status = 'active'
    )
  );

-- Um mesociclo organiza a prescricao sem misturar o treino executado/feed.
create table public.training_cycles (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  level text not null,
  starts_on date not null,
  ends_on date not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint training_cycles_creator_profile_fkey
    foreign key (created_by) references public.profiles(user_id) on delete restrict,
  constraint training_cycles_name_check check (char_length(btrim(name)) between 3 and 120),
  constraint training_cycles_level_check check (level in ('iniciante', 'intermediario', 'avancado')),
  constraint training_cycles_dates_check check (ends_on >= starts_on and ends_on - starts_on <= 180)
);

create index idx_training_cycles_period on public.training_cycles(starts_on, ends_on);

alter table public.workouts
  add column training_cycle_id uuid references public.training_cycles(id) on delete set null;
create index idx_workouts_training_cycle_date
  on public.workouts(training_cycle_id, scheduled_date);

drop trigger if exists trg_training_cycles_updated_at on public.training_cycles;
create trigger trg_training_cycles_updated_at
  before update on public.training_cycles
  for each row execute function app_private.handle_updated_at();

alter table public.training_cycles enable row level security;
create policy training_cycles_select_authorized on public.training_cycles
  for select to authenticated
  using (
    (select app_private.is_coach())
    or exists (
      select 1
      from public.workouts w
      join public.workout_assignments wa on wa.workout_id = w.id
      where w.training_cycle_id = training_cycles.id
        and (
          wa.athlete_user_id = (select auth.uid())
          or exists (
            select 1 from public.training_group_members gm
            where gm.group_id = wa.group_id and gm.user_id = (select auth.uid())
          )
        )
    )
  );

revoke all on table public.training_cycles from anon, authenticated;
grant select on table public.training_cycles to authenticated;
grant select, insert, update, delete on table public.training_cycles to service_role;

create or replace function public.staff_save_workout_v2(
  target_workout_id uuid,
  target_title text,
  target_description text,
  target_level text,
  target_objective text,
  target_scheduled_date date,
  target_member_ids uuid[],
  target_group_ids uuid[],
  target_training_type text,
  target_training_cycle_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if not app_private.is_coach() then
    raise exception 'Acesso restrito a equipe tecnica.' using errcode = '42501';
  end if;
  if target_training_cycle_id is not null and not exists (
    select 1 from public.training_cycles cycle where cycle.id = target_training_cycle_id
  ) then
    raise exception 'Mesociclo nao encontrado.' using errcode = '22023';
  end if;

  saved_id := public.coach_save_workout(
    target_workout_id, target_title, target_description, target_level,
    target_objective, target_scheduled_date, 'targeted', target_member_ids,
    target_group_ids, target_training_type
  );

  update public.workouts set training_cycle_id = target_training_cycle_id where id = saved_id;
  return saved_id;
end;
$$;

revoke all on function public.staff_save_workout_v2(
  uuid, text, text, text, text, date, uuid[], uuid[], text, uuid
) from public, anon;
grant execute on function public.staff_save_workout_v2(
  uuid, text, text, text, text, date, uuid[], uuid[], text, uuid
) to authenticated;

create or replace function public.staff_import_training_cycle(
  target_name text,
  target_items jsonb,
  target_level text,
  target_member_ids uuid[],
  target_group_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  cycle_id uuid;
  saved_id uuid;
  item_date date;
  first_date date;
  last_date date;
begin
  if not app_private.is_coach() then
    raise exception 'Acesso restrito a equipe tecnica.' using errcode = '42501';
  end if;
  if length(btrim(target_name)) not between 3 and 120 then
    raise exception 'Informe um nome para o mesociclo.' using errcode = '22023';
  end if;
  if target_level not in ('iniciante', 'intermediario', 'avancado') then
    raise exception 'Nivel de treino invalido.' using errcode = '22023';
  end if;
  if jsonb_typeof(target_items) <> 'array'
    or jsonb_array_length(target_items) not between 1 and 62 then
    raise exception 'Envie entre 1 e 62 treinos por mesociclo.' using errcode = '22023';
  end if;

  select min((value ->> 'scheduled_date')::date), max((value ->> 'scheduled_date')::date)
  into first_date, last_date
  from jsonb_array_elements(target_items)
  where coalesce(value ->> 'scheduled_date', '') ~ '^\d{4}-\d{2}-\d{2}$';
  if first_date is null or last_date is null
    or last_date - first_date > 180 then
    raise exception 'Datas do mesociclo invalidas.' using errcode = '22023';
  end if;

  insert into public.training_cycles(name, level, starts_on, ends_on, created_by)
  values (btrim(target_name), target_level, first_date, last_date, (select auth.uid()))
  returning id into cycle_id;

  for item in select value from jsonb_array_elements(target_items)
  loop
    if jsonb_typeof(item) <> 'object'
      or coalesce(item ->> 'scheduled_date', '') !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'A planilha contem um treino invalido.' using errcode = '22023';
    end if;
    begin
      item_date := (item ->> 'scheduled_date')::date;
    exception when others then
      raise exception 'A planilha contem uma data invalida.' using errcode = '22023';
    end;

    saved_id := public.coach_save_workout(
      null, item ->> 'title', item ->> 'description', target_level,
      item ->> 'objective', item_date, 'targeted', target_member_ids,
      target_group_ids, item ->> 'training_type'
    );
    update public.workouts set training_cycle_id = cycle_id where id = saved_id;
  end loop;

  return cycle_id;
end;
$$;

revoke all on function public.staff_import_training_cycle(text, jsonb, text, uuid[], uuid[])
  from public, anon;
grant execute on function public.staff_import_training_cycle(text, jsonb, text, uuid[], uuid[])
  to authenticated;

-- Mesmo quando o usuario e administrador/treinador, o modo atleta recebe
-- somente prescricoes atribuidas ao proprio perfil.
create or replace function public.get_my_assigned_workouts()
returns table (
  id uuid,
  title text,
  description text,
  level text,
  objective text,
  scheduled_date date,
  training_type text,
  training_cycle_id uuid,
  cycle_name text,
  cycle_starts_on date,
  cycle_ends_on date,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
stable
as $$
begin
  if (select auth.uid()) is null or not exists (
    select 1 from public.profiles p
    where p.user_id = (select auth.uid()) and p.membership_status = 'active'
  ) then
    raise exception 'Perfil ativo obrigatorio.' using errcode = '42501';
  end if;

  return query
  select distinct
    w.id, w.title, w.description, w.level, w.objective, w.scheduled_date,
    w.training_type, w.training_cycle_id, cycle.name, cycle.starts_on,
    cycle.ends_on, w.created_at, w.updated_at
  from public.workouts w
  join public.workout_assignments wa on wa.workout_id = w.id
  left join public.training_cycles cycle on cycle.id = w.training_cycle_id
  where wa.athlete_user_id = (select auth.uid())
    or exists (
      select 1 from public.training_group_members gm
      where gm.group_id = wa.group_id and gm.user_id = (select auth.uid())
    )
  order by w.scheduled_date nulls last, w.created_at;
end;
$$;

revoke all on function public.get_my_assigned_workouts() from public, anon;
grant execute on function public.get_my_assigned_workouts() to authenticated;

-- Dados completos das tres telas do relatorio Tanita.
alter table public.body_assessments
  add column fat_mass_kg numeric(6,2),
  add column fat_free_mass_kg numeric(6,2),
  add column body_water_mass_kg numeric(6,2),
  add column daily_calorie_intake integer,
  add column heart_rate_bpm smallint,
  add column segment_left_arm_fat_pct numeric(5,2),
  add column segment_right_arm_fat_pct numeric(5,2),
  add column segment_trunk_fat_pct numeric(5,2),
  add column segment_left_leg_fat_pct numeric(5,2),
  add column segment_right_leg_fat_pct numeric(5,2),
  add column segment_left_arm_muscle_kg numeric(5,2),
  add column segment_right_arm_muscle_kg numeric(5,2),
  add column segment_trunk_muscle_kg numeric(6,2),
  add column segment_left_leg_muscle_kg numeric(5,2),
  add column segment_right_leg_muscle_kg numeric(5,2);

alter table public.body_assessments
  add constraint body_assessments_fat_mass_check check (fat_mass_kg is null or fat_mass_kg between 1 and 300),
  add constraint body_assessments_fat_free_mass_check check (fat_free_mass_kg is null or fat_free_mass_kg between 1 and 300),
  add constraint body_assessments_water_mass_check check (body_water_mass_kg is null or body_water_mass_kg between 1 and 300),
  add constraint body_assessments_daily_calorie_check check (daily_calorie_intake is null or daily_calorie_intake between 500 and 15000),
  add constraint body_assessments_heart_rate_check check (heart_rate_bpm is null or heart_rate_bpm between 30 and 240),
  add constraint body_assessments_segment_fat_check check (
    (segment_left_arm_fat_pct is null or segment_left_arm_fat_pct between 1 and 75)
    and (segment_right_arm_fat_pct is null or segment_right_arm_fat_pct between 1 and 75)
    and (segment_trunk_fat_pct is null or segment_trunk_fat_pct between 1 and 75)
    and (segment_left_leg_fat_pct is null or segment_left_leg_fat_pct between 1 and 75)
    and (segment_right_leg_fat_pct is null or segment_right_leg_fat_pct between 1 and 75)
  ),
  add constraint body_assessments_segment_muscle_check check (
    (segment_left_arm_muscle_kg is null or segment_left_arm_muscle_kg between 0.1 and 100)
    and (segment_right_arm_muscle_kg is null or segment_right_arm_muscle_kg between 0.1 and 100)
    and (segment_trunk_muscle_kg is null or segment_trunk_muscle_kg between 0.1 and 150)
    and (segment_left_leg_muscle_kg is null or segment_left_leg_muscle_kg between 0.1 and 100)
    and (segment_right_leg_muscle_kg is null or segment_right_leg_muscle_kg between 0.1 and 100)
  );

alter table public.body_assessments drop constraint if exists body_assessments_has_measurement;
alter table public.body_assessments add constraint body_assessments_has_measurement check (
  num_nonnulls(
    weight_kg, body_fat_pct, muscle_mass_kg, visceral_fat_level, body_water_pct,
    bmi, metabolic_age, bone_mass_kg, basal_metabolic_rate, physique_rating,
    fat_mass_kg, fat_free_mass_kg, body_water_mass_kg, daily_calorie_intake,
    heart_rate_bpm, segment_left_arm_fat_pct, segment_right_arm_fat_pct,
    segment_trunk_fat_pct, segment_left_leg_fat_pct, segment_right_leg_fat_pct,
    segment_left_arm_muscle_kg, segment_right_arm_muscle_kg,
    segment_trunk_muscle_kg, segment_left_leg_muscle_kg,
    segment_right_leg_muscle_kg, notes
  ) > 0
);

create table public.body_assessment_files (
  assessment_id uuid not null references public.body_assessments(id) on delete cascade,
  slot smallint not null,
  storage_path text not null unique,
  mime_type text not null,
  created_at timestamptz not null default now(),
  primary key (assessment_id, slot),
  constraint body_assessment_files_slot_check check (slot between 1 and 3),
  constraint body_assessment_files_path_check check (
    storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}-[123]\.(jpg|png)$'
  ),
  constraint body_assessment_files_mime_check check (mime_type in ('image/jpeg', 'image/png'))
);

alter table public.body_assessment_files enable row level security;
create policy body_assessment_files_select_private on public.body_assessment_files
  for select to authenticated
  using (
    exists (
      select 1 from public.body_assessments assessment
      where assessment.id = body_assessment_files.assessment_id
        and (
          assessment.athlete_user_id = (select auth.uid())
          or (select app_private.is_access_manager())
        )
    )
  );
revoke all on table public.body_assessment_files from anon, authenticated;
grant select on table public.body_assessment_files to authenticated;
grant select, insert, update, delete on table public.body_assessment_files to service_role;

create or replace function public.staff_save_body_assessment_v3(
  target_assessment_id uuid,
  target_athlete_user_id uuid,
  target_assessed_at date,
  target_measurements jsonb,
  target_source_paths text[],
  target_source_mime_types text[],
  target_notes text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
  source_count integer := cardinality(coalesce(target_source_paths, '{}'::text[]));
  mime_count integer := cardinality(coalesce(target_source_mime_types, '{}'::text[]));
  source_path text;
  source_mime text;
  slot_number integer;
begin
  if not app_private.is_access_manager() then
    raise exception 'Acesso restrito a equipe tecnica.' using errcode = '42501';
  end if;
  if target_assessed_at is null or target_assessed_at > current_date then
    raise exception 'A data da avaliacao nao pode estar no futuro.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = target_athlete_user_id and p.membership_status = 'active'
  ) then
    raise exception 'Selecione um perfil com acesso ativo.' using errcode = '22023';
  end if;
  if jsonb_typeof(coalesce(target_measurements, '{}'::jsonb)) <> 'object' then
    raise exception 'Medidas invalidas.' using errcode = '22023';
  end if;
  if source_count <> mime_count or source_count not in (0, 3) then
    raise exception 'Envie as tres fotos da Tanita.' using errcode = '22023';
  end if;
  if target_assessment_id is null and source_count <> 3 then
    raise exception 'Uma nova avaliacao exige Foto 1, Foto 2 e Foto 3.' using errcode = '22023';
  end if;

  if source_count = 3 then
    for slot_number in 1..3 loop
      source_path := target_source_paths[slot_number];
      source_mime := target_source_mime_types[slot_number];
      if source_path !~ ('^' || target_athlete_user_id::text || '/[0-9a-f-]{36}-' || slot_number || '\.(jpg|png)$')
        or source_mime not in ('image/jpeg', 'image/png')
        or not exists (
          select 1 from storage.objects media
          where media.bucket_id = 'assessment-files' and media.name = source_path
        ) then
        raise exception 'Foto % da Tanita invalida.', slot_number using errcode = '22023';
      end if;
    end loop;
  end if;

  if target_assessment_id is null then
    insert into public.body_assessments (
      athlete_user_id, assessed_by, assessed_at, weight_kg, body_fat_pct,
      muscle_mass_kg, visceral_fat_level, body_water_pct, bmi, metabolic_age,
      bone_mass_kg, basal_metabolic_rate, physique_rating, fat_mass_kg,
      fat_free_mass_kg, body_water_mass_kg, daily_calorie_intake, heart_rate_bpm,
      segment_left_arm_fat_pct, segment_right_arm_fat_pct, segment_trunk_fat_pct,
      segment_left_leg_fat_pct, segment_right_leg_fat_pct,
      segment_left_arm_muscle_kg, segment_right_arm_muscle_kg,
      segment_trunk_muscle_kg, segment_left_leg_muscle_kg,
      segment_right_leg_muscle_kg, notes
    ) values (
      target_athlete_user_id, (select auth.uid()), target_assessed_at,
      nullif(target_measurements ->> 'weight_kg', '')::numeric,
      nullif(target_measurements ->> 'body_fat_pct', '')::numeric,
      nullif(target_measurements ->> 'muscle_mass_kg', '')::numeric,
      nullif(target_measurements ->> 'visceral_fat_level', '')::numeric,
      nullif(target_measurements ->> 'body_water_pct', '')::numeric,
      nullif(target_measurements ->> 'bmi', '')::numeric,
      nullif(target_measurements ->> 'metabolic_age', '')::smallint,
      nullif(target_measurements ->> 'bone_mass_kg', '')::numeric,
      nullif(target_measurements ->> 'basal_metabolic_rate', '')::integer,
      nullif(target_measurements ->> 'physique_rating', '')::smallint,
      nullif(target_measurements ->> 'fat_mass_kg', '')::numeric,
      nullif(target_measurements ->> 'fat_free_mass_kg', '')::numeric,
      nullif(target_measurements ->> 'body_water_mass_kg', '')::numeric,
      nullif(target_measurements ->> 'daily_calorie_intake', '')::integer,
      nullif(target_measurements ->> 'heart_rate_bpm', '')::smallint,
      nullif(target_measurements ->> 'segment_left_arm_fat_pct', '')::numeric,
      nullif(target_measurements ->> 'segment_right_arm_fat_pct', '')::numeric,
      nullif(target_measurements ->> 'segment_trunk_fat_pct', '')::numeric,
      nullif(target_measurements ->> 'segment_left_leg_fat_pct', '')::numeric,
      nullif(target_measurements ->> 'segment_right_leg_fat_pct', '')::numeric,
      nullif(target_measurements ->> 'segment_left_arm_muscle_kg', '')::numeric,
      nullif(target_measurements ->> 'segment_right_arm_muscle_kg', '')::numeric,
      nullif(target_measurements ->> 'segment_trunk_muscle_kg', '')::numeric,
      nullif(target_measurements ->> 'segment_left_leg_muscle_kg', '')::numeric,
      nullif(target_measurements ->> 'segment_right_leg_muscle_kg', '')::numeric,
      nullif(btrim(target_notes), '')
    ) returning id into saved_id;
  else
    update public.body_assessments set
      assessed_at = target_assessed_at,
      weight_kg = nullif(target_measurements ->> 'weight_kg', '')::numeric,
      body_fat_pct = nullif(target_measurements ->> 'body_fat_pct', '')::numeric,
      muscle_mass_kg = nullif(target_measurements ->> 'muscle_mass_kg', '')::numeric,
      visceral_fat_level = nullif(target_measurements ->> 'visceral_fat_level', '')::numeric,
      body_water_pct = nullif(target_measurements ->> 'body_water_pct', '')::numeric,
      bmi = nullif(target_measurements ->> 'bmi', '')::numeric,
      metabolic_age = nullif(target_measurements ->> 'metabolic_age', '')::smallint,
      bone_mass_kg = nullif(target_measurements ->> 'bone_mass_kg', '')::numeric,
      basal_metabolic_rate = nullif(target_measurements ->> 'basal_metabolic_rate', '')::integer,
      physique_rating = nullif(target_measurements ->> 'physique_rating', '')::smallint,
      fat_mass_kg = nullif(target_measurements ->> 'fat_mass_kg', '')::numeric,
      fat_free_mass_kg = nullif(target_measurements ->> 'fat_free_mass_kg', '')::numeric,
      body_water_mass_kg = nullif(target_measurements ->> 'body_water_mass_kg', '')::numeric,
      daily_calorie_intake = nullif(target_measurements ->> 'daily_calorie_intake', '')::integer,
      heart_rate_bpm = nullif(target_measurements ->> 'heart_rate_bpm', '')::smallint,
      segment_left_arm_fat_pct = nullif(target_measurements ->> 'segment_left_arm_fat_pct', '')::numeric,
      segment_right_arm_fat_pct = nullif(target_measurements ->> 'segment_right_arm_fat_pct', '')::numeric,
      segment_trunk_fat_pct = nullif(target_measurements ->> 'segment_trunk_fat_pct', '')::numeric,
      segment_left_leg_fat_pct = nullif(target_measurements ->> 'segment_left_leg_fat_pct', '')::numeric,
      segment_right_leg_fat_pct = nullif(target_measurements ->> 'segment_right_leg_fat_pct', '')::numeric,
      segment_left_arm_muscle_kg = nullif(target_measurements ->> 'segment_left_arm_muscle_kg', '')::numeric,
      segment_right_arm_muscle_kg = nullif(target_measurements ->> 'segment_right_arm_muscle_kg', '')::numeric,
      segment_trunk_muscle_kg = nullif(target_measurements ->> 'segment_trunk_muscle_kg', '')::numeric,
      segment_left_leg_muscle_kg = nullif(target_measurements ->> 'segment_left_leg_muscle_kg', '')::numeric,
      segment_right_leg_muscle_kg = nullif(target_measurements ->> 'segment_right_leg_muscle_kg', '')::numeric,
      notes = nullif(btrim(target_notes), '')
    where id = target_assessment_id and athlete_user_id = target_athlete_user_id
    returning id into saved_id;
    if saved_id is null then
      raise exception 'Avaliacao nao encontrada para este perfil.' using errcode = 'P0002';
    end if;
  end if;

  if source_count = 3 then
    delete from public.body_assessment_files where assessment_id = saved_id;
    insert into public.body_assessment_files(assessment_id, slot, storage_path, mime_type)
    select saved_id, slot, target_source_paths[slot], target_source_mime_types[slot]
    from generate_series(1, 3) slot;
  end if;

  return saved_id;
end;
$$;

revoke all on function public.staff_save_body_assessment_v3(
  uuid, uuid, date, jsonb, text[], text[], text
) from public, anon;
grant execute on function public.staff_save_body_assessment_v3(
  uuid, uuid, date, jsonb, text[], text[], text
) to authenticated;

-- Legendas e descricoes deixam de ser obrigatorias. O texto alternativo
-- generico continua garantindo acessibilidade sem aparecer como legenda.
create or replace function public.staff_save_gallery_item(
  target_item_id uuid,
  target_storage_path text,
  target_title text,
  target_caption text,
  target_alt_text text,
  target_taken_at date,
  target_layout text,
  target_sort_order integer,
  target_is_published boolean,
  target_consent_confirmed boolean
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_id uuid := (select auth.uid());
  current_path text;
  saved_id uuid;
begin
  if caller_id is null or not app_private.is_access_manager() then
    raise exception 'not_authorized';
  end if;
  target_title := nullif(btrim(coalesce(target_title, '')), '');
  target_caption := nullif(btrim(coalesce(target_caption, '')), '');
  target_alt_text := coalesce(nullif(btrim(target_alt_text), ''), 'Foto da equipe Born to Run');
  target_layout := coalesce(nullif(btrim(target_layout), ''), 'standard');
  target_sort_order := coalesce(target_sort_order, 0);
  target_is_published := coalesce(target_is_published, false);
  target_consent_confirmed := coalesce(target_consent_confirmed, false);

  if target_item_id is not null then
    select item.storage_path into current_path from public.gallery_items item where item.id = target_item_id;
    if current_path is null then raise exception 'gallery_item_not_found'; end if;
  end if;
  if target_storage_path is null
    or (target_storage_path is distinct from current_path
      and target_storage_path !~ ('^' || caller_id::text || '/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'))
    or not exists (
      select 1 from storage.objects media
      where media.bucket_id = 'gallery' and media.name = target_storage_path
    ) then
    raise exception 'invalid_gallery_media';
  end if;
  if target_title is not null and char_length(target_title) not between 2 and 120 then raise exception 'invalid_title'; end if;
  if target_caption is not null and char_length(target_caption) > 500 then raise exception 'invalid_caption'; end if;
  if char_length(target_alt_text) > 250 then raise exception 'invalid_alt_text'; end if;
  if target_layout not in ('standard', 'wide') or target_sort_order not between 0 and 10000 then raise exception 'invalid_layout'; end if;
  if target_is_published and not target_consent_confirmed then raise exception 'consent_required'; end if;

  if target_item_id is null then
    insert into public.gallery_items (
      storage_path, title, caption, alt_text, taken_at, layout, sort_order,
      is_published, consent_confirmed, created_by, updated_by
    ) values (
      target_storage_path, target_title, target_caption, target_alt_text,
      target_taken_at, target_layout, target_sort_order, target_is_published,
      target_consent_confirmed, caller_id, caller_id
    ) returning id into saved_id;
  else
    update public.gallery_items set
      storage_path = target_storage_path, title = target_title,
      caption = target_caption, alt_text = target_alt_text,
      taken_at = target_taken_at, layout = target_layout,
      sort_order = target_sort_order, is_published = target_is_published,
      consent_confirmed = target_consent_confirmed, updated_by = caller_id
    where id = target_item_id returning id into saved_id;
  end if;
  return saved_id;
end;
$$;
