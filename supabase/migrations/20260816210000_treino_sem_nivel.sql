-- Bloco D · Treinos sem nível redundante
-- O nível "iniciante/intermediário/avançado" é redundante com as 6 categorias
-- cromáticas de treino (Prof. Robson). O campo permanece no banco (legado
-- interno) para não exigir migração de dados históricos, mas a experiência
-- de prescrição deixa de exigir, exibir ou editar esse valor.
--
-- Não editar migrations históricas.

-- 1. admin_save_workout: remove target_level da assinatura e usa o default.
drop function if exists public.admin_save_workout(
  uuid, text, text, text, text, date, text, uuid[], uuid[]
);

create or replace function public.admin_save_workout(
  target_workout_id uuid,
  target_title text,
  target_description text,
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
  if not app_private.is_admin() then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
  end if;
  if length(btrim(target_title)) not between 3 and 160 then
    raise exception 'O título deve ter entre 3 e 160 caracteres.' using errcode = '22023';
  end if;
  if length(btrim(target_description)) not between 1 and 5000 then
    raise exception 'A descrição do treino é obrigatória.' using errcode = '22023';
  end if;
  if length(btrim(target_objective)) not between 1 and 500 then
    raise exception 'O objetivo do treino é obrigatório.' using errcode = '22023';
  end if;
  if target_audience not in ('team', 'targeted') then
    raise exception 'Público do treino inválido.' using errcode = '22023';
  end if;
  if target_audience = 'targeted'
    and cardinality(member_ids) = 0
    and cardinality(group_ids) = 0 then
    raise exception 'Escolha ao menos um atleta ou grupo.' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(member_ids) member_id
    left join public.profiles p on p.user_id = member_id
    where p.user_id is null or p.membership_status <> 'active'
  ) then
    raise exception 'A atribuição contém um atleta inexistente ou sem acesso ativo.' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(group_ids) group_id
    left join public.training_groups g on g.id = group_id
    where g.id is null or g.archived_at is not null
  ) then
    raise exception 'A atribuição contém um grupo inexistente ou arquivado.' using errcode = '22023';
  end if;
  if target_workout_id is null then
    insert into public.workouts (
      title, description, objective, scheduled_date, audience, created_by
    ) values (
      btrim(target_title), btrim(target_description),
      btrim(target_objective), target_scheduled_date, target_audience,
      (select auth.uid())
    ) returning id into saved_id;
  else
    update public.workouts
    set title = btrim(target_title),
        description = btrim(target_description),
        objective = btrim(target_objective),
        scheduled_date = target_scheduled_date,
        audience = target_audience
    where id = target_workout_id
    returning id into saved_id;
    if saved_id is null then
      raise exception 'Treino não encontrado.' using errcode = 'P0002';
    end if;
  end if;
  delete from public.workout_assignments where workout_id = saved_id;
  if target_audience = 'targeted' then
    insert into public.workout_assignments (workout_id, athlete_user_id, assigned_by)
    select saved_id, member_id, (select auth.uid())
    from (select distinct unnest(member_ids) as member_id) members;
    insert into public.workout_assignments (workout_id, group_id, assigned_by)
    select saved_id, group_id, (select auth.uid())
    from (select distinct unnest(group_ids) as group_id) groups;
  end if;
  return saved_id;
end;
$$;

revoke all on function public.admin_save_workout(
  uuid, text, text, text, date, text, uuid[], uuid[]
) from public, anon;
grant execute on function public.admin_save_workout(
  uuid, text, text, text, date, text, uuid[], uuid[]
) to authenticated;

-- 2. coach_save_workout: remove target_level e repassa para admin_save_workout.
drop function if exists public.coach_save_workout(
  uuid, text, text, text, text, date, text, uuid[], uuid[], text
);

create or replace function public.coach_save_workout(
  target_workout_id uuid,
  target_title text,
  target_description text,
  target_objective text,
  target_scheduled_date date,
  target_audience text,
  target_member_ids uuid[],
  target_group_ids uuid[],
  target_training_type text
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
    raise exception 'Acesso restrito ao treinador.' using errcode = '42501';
  end if;
  if target_training_type not in (
    'rest',
    'continuous',
    'fast_interval',
    'easy_moderate',
    'aerobic_power',
    'competition'
  ) then
    raise exception 'Tipo de treino inválido.' using errcode = '22023';
  end if;
  saved_id := public.admin_save_workout(
    target_workout_id,
    target_title,
    target_description,
    target_objective,
    target_scheduled_date,
    target_audience,
    target_member_ids,
    target_group_ids
  );
  update public.workouts
  set training_type = target_training_type
  where id = saved_id;
  return saved_id;
end;
$$;

revoke all on function public.coach_save_workout(
  uuid, text, text, text, date, text, uuid[], uuid[], text
) from public, anon;
grant execute on function public.coach_save_workout(
  uuid, text, text, text, date, text, uuid[], uuid[], text
) to authenticated;

-- 3. staff_save_workout_v3: remove target_level; v2 permanece como legado.
drop function if exists public.staff_save_workout_v3(
  uuid, text, text, text, date, uuid[], uuid[], text, uuid
);

create or replace function public.staff_save_workout_v3(
  target_workout_id uuid,
  target_title text,
  target_description text,
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
    target_workout_id, target_title, target_description,
    target_objective, target_scheduled_date, 'targeted', target_member_ids,
    target_group_ids, target_training_type
  );
  update public.workouts set training_cycle_id = target_training_cycle_id where id = saved_id;
  return saved_id;
end;
$$;

revoke all on function public.staff_save_workout_v3(
  uuid, text, text, text, date, uuid[], uuid[], text, uuid
) from public, anon;
grant execute on function public.staff_save_workout_v3(
  uuid, text, text, text, date, uuid[], uuid[], text, uuid
) to authenticated;

-- 4. staff_import_training_cycle_v2: remove target_level; o mesociclo
--    herda o nível de legado 'iniciante' apenas para preservar a constraint.
drop function if exists public.staff_import_training_cycle_v2(
  text, jsonb, uuid[], uuid[]
);

create or replace function public.staff_import_training_cycle_v2(
  target_name text,
  target_items jsonb,
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
  values (btrim(target_name), 'iniciante', first_date, last_date, (select auth.uid()))
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
      null, item ->> 'title', item ->> 'description',
      item ->> 'objective', item_date, 'targeted', target_member_ids,
      target_group_ids, item ->> 'training_type'
    );
    update public.workouts set training_cycle_id = cycle_id where id = saved_id;
  end loop;
  return cycle_id;
end;
$$;

revoke all on function public.staff_import_training_cycle_v2(
  text, jsonb, uuid[], uuid[]
) from public, anon;
grant execute on function public.staff_import_training_cycle_v2(
  text, jsonb, uuid[], uuid[]
) to authenticated;

-- 5. get_my_assigned_workouts: remove a coluna exposta `level` do modo atleta.
drop function if exists public.get_my_assigned_workouts();

create or replace function public.get_my_assigned_workouts()
returns table (
  id uuid,
  title text,
  description text,
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
    w.id, w.title, w.description, w.objective, w.scheduled_date,
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

-- O RPC histórico v2 permanece executável durante o rollout para que a
-- versão publicada continue salvando treinos até o novo frontend entrar.
-- staff_save_workout_v2 e staff_import_training_cycle (v1) continuam no banco.
