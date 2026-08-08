-- Remove ambiguidades de nomes nas validações de destinatários históricos.
-- A migration anterior preserva destinatários já associados; esta versão
-- qualifica explicitamente cada ID solicitado para impedir falsos positivos.

create or replace function public.admin_save_training_group(
  target_group_id uuid,
  target_name text,
  target_description text,
  target_member_ids uuid[]
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
begin
  if not app_private.is_admin() then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
  end if;
  if length(btrim(target_name)) not between 2 and 100 then
    raise exception 'O nome do grupo deve ter entre 2 e 100 caracteres.' using errcode = '22023';
  end if;
  if target_description is not null and length(target_description) > 500 then
    raise exception 'A descrição deve ter no máximo 500 caracteres.' using errcode = '22023';
  end if;

  -- Um integrante que ficou suspenso/rejeitado pode permanecer em um grupo
  -- que já o continha. Apenas novas inclusões exigem associação ativa.
  if exists (
    select 1
    from unnest(coalesce(target_member_ids, '{}'::uuid[]))
      as requested_member(member_id)
    left join public.profiles p on p.user_id = requested_member.member_id
    where p.user_id is null
      or (
        p.membership_status <> 'active'
        and not (
          target_group_id is not null
          and exists (
            select 1
            from public.training_group_members existing
            where existing.group_id = target_group_id
              and existing.user_id = requested_member.member_id
          )
        )
      )
  ) then
    raise exception 'O grupo contém uma nova inclusão inexistente ou sem acesso ativo.' using errcode = '22023';
  end if;

  if target_group_id is null then
    insert into public.training_groups (name, description, created_by)
    values (btrim(target_name), nullif(btrim(target_description), ''), (select auth.uid()))
    returning id into saved_id;
  else
    update public.training_groups
    set name = btrim(target_name),
        description = nullif(btrim(target_description), ''),
        archived_at = null
    where id = target_group_id
    returning id into saved_id;
    if saved_id is null then
      raise exception 'Grupo não encontrado.' using errcode = 'P0002';
    end if;
  end if;

  delete from public.training_group_members where group_id = saved_id;
  insert into public.training_group_members (group_id, user_id, added_by)
  select saved_id, member_id, (select auth.uid())
  from (
    select distinct unnest(coalesce(target_member_ids, '{}'::uuid[])) as member_id
  ) members;

  return saved_id;
end;
$$;

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
  if target_level not in ('iniciante', 'intermediario', 'avancado') then
    raise exception 'Nível de treino inválido.' using errcode = '22023';
  end if;
  if target_audience not in ('team', 'targeted') then
    raise exception 'Público do treino inválido.' using errcode = '22023';
  end if;
  if target_audience = 'targeted'
    and cardinality(member_ids) = 0
    and cardinality(group_ids) = 0 then
    raise exception 'Escolha ao menos um atleta ou grupo.' using errcode = '22023';
  end if;

  -- Destinatários históricos podem permanecer após suspensão/arquivamento.
  -- IDs inativos/arquivados que não estavam neste treino continuam proibidos.
  if target_audience = 'targeted' and exists (
    select 1
    from unnest(member_ids) as requested_member(member_id)
    left join public.profiles p on p.user_id = requested_member.member_id
    where p.user_id is null
      or (
        p.membership_status <> 'active'
        and not (
          target_workout_id is not null
          and exists (
            select 1
            from public.workout_assignments existing
            where existing.workout_id = target_workout_id
              and existing.athlete_user_id = requested_member.member_id
          )
        )
      )
  ) then
    raise exception 'A atribuição contém uma nova inclusão inexistente ou sem acesso ativo.' using errcode = '22023';
  end if;

  if target_audience = 'targeted' and exists (
    select 1
    from unnest(group_ids) as requested_group(group_id)
    left join public.training_groups g on g.id = requested_group.group_id
    where g.id is null
      or (
        g.archived_at is not null
        and not (
          target_workout_id is not null
          and exists (
            select 1
            from public.workout_assignments existing
            where existing.workout_id = target_workout_id
              and existing.group_id = requested_group.group_id
          )
        )
      )
  ) then
    raise exception 'A atribuição contém uma nova inclusão de grupo inexistente ou arquivado.' using errcode = '22023';
  end if;

  if target_workout_id is null then
    insert into public.workouts (
      title, description, level, objective, scheduled_date, audience, created_by
    ) values (
      btrim(target_title), btrim(target_description), target_level,
      btrim(target_objective), target_scheduled_date, target_audience,
      (select auth.uid())
    ) returning id into saved_id;
  else
    update public.workouts
    set title = btrim(target_title),
        description = btrim(target_description),
        level = target_level,
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
