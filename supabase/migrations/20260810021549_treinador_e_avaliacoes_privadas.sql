-- Papel exclusivo de treinador, treinos privados e primeira versão das
-- avaliações de bioimpedância.

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('member', 'coach', 'admin'));

create unique index if not exists profiles_single_coach_unique
  on public.profiles ((role))
  where role = 'coach';

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
      and p.role = 'coach'
  );
$$;

create or replace function app_private.is_access_manager()
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

create or replace function app_private.protect_profile_access_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  trusted_backend boolean :=
    session_user in ('postgres', 'supabase_admin')
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role';
  access_changed boolean :=
    new.membership_status is distinct from old.membership_status
    or new.reviewed_at is distinct from old.reviewed_at
    or new.reviewed_by is distinct from old.reviewed_by
    or new.status_note is distinct from old.status_note;
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'O identificador do usuário é imutável.' using errcode = '42501';
  end if;

  if new.role is distinct from old.role and not trusted_backend then
    if not app_private.is_admin() then
      raise exception 'Somente o administrador pode alterar funções.' using errcode = '42501';
    end if;
    if old.user_id = (select auth.uid()) then
      raise exception 'O administrador não pode alterar a própria função.' using errcode = '42501';
    end if;
  end if;

  if access_changed and not trusted_backend then
    if not app_private.is_access_manager() then
      raise exception 'Somente o administrador ou o treinador pode alterar acessos.'
        using errcode = '42501';
    end if;
    if old.user_id = (select auth.uid()) then
      raise exception 'Você não pode alterar o próprio acesso.' using errcode = '42501';
    end if;
  end if;

  if new.membership_status is distinct from old.membership_status then
    new.reviewed_at = now();
    new.reviewed_by = coalesce((select auth.uid()), new.reviewed_by);
  end if;

  return new;
end;
$$;

create or replace function app_private.can_view_workout(target_workout_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    app_private.is_coach()
    or (
      app_private.is_active_member()
      and exists (
        select 1
        from public.workouts w
        where w.id = target_workout_id
          and w.audience = 'targeted'
          and (
            exists (
              select 1
              from public.workout_assignments wa
              where wa.workout_id = w.id
                and wa.athlete_user_id = (select auth.uid())
            )
            or exists (
              select 1
              from public.workout_assignments wa
              join public.training_group_members gm on gm.group_id = wa.group_id
              where wa.workout_id = w.id
                and gm.user_id = (select auth.uid())
            )
          )
      )
    );
$$;

create or replace function public.admin_set_membership_status(
  target_user_id uuid,
  target_status text,
  target_note text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_access_manager() then
    raise exception 'Acesso restrito ao administrador ou treinador.' using errcode = '42501';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception 'Você não pode alterar o próprio acesso.' using errcode = '42501';
  end if;
  if target_status not in ('pending', 'active', 'suspended', 'rejected') then
    raise exception 'Status de acesso inválido.' using errcode = '22023';
  end if;
  if target_note is not null and length(target_note) > 500 then
    raise exception 'A observação deve ter no máximo 500 caracteres.' using errcode = '22023';
  end if;

  update public.profiles
  set membership_status = target_status,
      status_note = nullif(btrim(target_note), '')
  where user_id = target_user_id;

  if not found then
    raise exception 'Membro não encontrado.' using errcode = 'P0002';
  end if;
  return true;
end;
$$;

create or replace function public.admin_set_member_role(
  target_user_id uuid,
  target_role text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_admin() then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
  end if;
  if target_user_id = (select auth.uid()) then
    raise exception 'Você não pode alterar a própria função.' using errcode = '42501';
  end if;
  if target_role not in ('member', 'coach') then
    raise exception 'A função deve ser atleta ou treinador.' using errcode = '22023';
  end if;
  if target_role = 'coach' and exists (
    select 1 from public.profiles p
    where p.role = 'coach' and p.user_id <> target_user_id
  ) then
    raise exception 'Já existe um treinador responsável cadastrado.' using errcode = '23505';
  end if;

  update public.profiles
  set role = target_role
  where user_id = target_user_id
    and membership_status = 'active'
    and role <> 'admin';

  if not found then
    raise exception 'Somente um membro ativo pode ter sua função alterada.' using errcode = '22023';
  end if;
  return true;
end;
$$;

-- Todo treino passa a exigir destinatário. Não existe publicação aberta para
-- toda a comunidade; a leitura fica entre treinador e atletas designados.
update public.workouts set audience = 'targeted' where audience = 'team';
alter table public.workouts alter column audience set default 'targeted';
alter table public.workouts drop constraint if exists workouts_audience_check;
alter table public.workouts
  add constraint workouts_audience_check check (audience = 'targeted');

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
  if not app_private.is_coach() then
    raise exception 'Acesso restrito ao treinador.' using errcode = '42501';
  end if;
  if length(btrim(target_name)) not between 2 and 100 then
    raise exception 'O nome do grupo deve ter entre 2 e 100 caracteres.' using errcode = '22023';
  end if;
  if target_description is not null and length(target_description) > 500 then
    raise exception 'A descrição deve ter no máximo 500 caracteres.' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(coalesce(target_member_ids, '{}'::uuid[])) as requested_member(member_id)
    left join public.profiles p on p.user_id = requested_member.member_id
    where p.user_id is null
      or p.role <> 'member'
      or (
        p.membership_status <> 'active'
        and not (
          target_group_id is not null
          and exists (
            select 1 from public.training_group_members existing
            where existing.group_id = target_group_id
              and existing.user_id = requested_member.member_id
          )
        )
      )
  ) then
    raise exception 'O grupo contém uma nova inclusão inexistente, inativa ou que não é atleta.'
      using errcode = '22023';
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
  from (select distinct unnest(coalesce(target_member_ids, '{}'::uuid[])) as member_id) members;

  return saved_id;
end;
$$;

create or replace function public.admin_archive_training_group(target_group_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_coach() then
    raise exception 'Acesso restrito ao treinador.' using errcode = '42501';
  end if;
  update public.training_groups set archived_at = now() where id = target_group_id;
  if not found then
    raise exception 'Grupo não encontrado.' using errcode = 'P0002';
  end if;
  return true;
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
  if not app_private.is_coach() then
    raise exception 'Acesso restrito ao treinador.' using errcode = '42501';
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
  if target_audience <> 'targeted' then
    raise exception 'Todo treino deve ser destinado a atletas ou grupos específicos.' using errcode = '22023';
  end if;
  if cardinality(member_ids) = 0 and cardinality(group_ids) = 0 then
    raise exception 'Escolha ao menos um atleta ou grupo.' using errcode = '22023';
  end if;
  if exists (
    select 1
    from unnest(member_ids) as requested_member(member_id)
    left join public.profiles p on p.user_id = requested_member.member_id
    where p.user_id is null
      or p.role <> 'member'
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
    raise exception 'A atribuição contém uma inclusão inexistente, inativa ou que não é atleta.'
      using errcode = '22023';
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
    raise exception 'A atribuição contém uma nova inclusão de grupo inexistente ou arquivado.'
      using errcode = '22023';
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
      raise exception 'Treino não encontrado.' using errcode = 'P0002';
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

create table if not exists public.body_assessments (
  id uuid primary key default gen_random_uuid(),
  athlete_user_id uuid not null,
  assessed_by uuid not null,
  assessed_at date not null default current_date,
  weight_kg numeric(6,2),
  body_fat_pct numeric(5,2),
  muscle_mass_kg numeric(6,2),
  visceral_fat_level numeric(5,2),
  body_water_pct numeric(5,2),
  bmi numeric(5,2),
  metabolic_age smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint body_assessments_athlete_profile_fkey
    foreign key (athlete_user_id) references public.profiles(user_id) on delete cascade,
  constraint body_assessments_assessor_profile_fkey
    foreign key (assessed_by) references public.profiles(user_id) on delete restrict,
  constraint body_assessments_assessed_at_check check (assessed_at <= current_date),
  constraint body_assessments_weight_check check (weight_kg is null or weight_kg between 20 and 400),
  constraint body_assessments_body_fat_check check (body_fat_pct is null or body_fat_pct between 1 and 75),
  constraint body_assessments_muscle_mass_check check (muscle_mass_kg is null or muscle_mass_kg between 5 and 250),
  constraint body_assessments_visceral_fat_check check (visceral_fat_level is null or visceral_fat_level between 1 and 60),
  constraint body_assessments_water_check check (body_water_pct is null or body_water_pct between 20 and 80),
  constraint body_assessments_bmi_check check (bmi is null or bmi between 8 and 80),
  constraint body_assessments_metabolic_age_check check (metabolic_age is null or metabolic_age between 10 and 120),
  constraint body_assessments_notes_check check (notes is null or length(notes) <= 2000),
  constraint body_assessments_has_measurement check (
    num_nonnulls(weight_kg, body_fat_pct, muscle_mass_kg, visceral_fat_level,
      body_water_pct, bmi, metabolic_age, notes) > 0
  )
);

create index if not exists idx_body_assessments_athlete_date
  on public.body_assessments(athlete_user_id, assessed_at desc, created_at desc);
create index if not exists idx_body_assessments_assessed_by
  on public.body_assessments(assessed_by);

drop trigger if exists trg_body_assessments_updated_at on public.body_assessments;
create trigger trg_body_assessments_updated_at
  before update on public.body_assessments
  for each row execute function app_private.handle_updated_at();

create or replace function public.coach_save_body_assessment(
  target_assessment_id uuid,
  target_athlete_user_id uuid,
  target_assessed_at date,
  target_weight_kg numeric,
  target_body_fat_pct numeric,
  target_muscle_mass_kg numeric,
  target_visceral_fat_level numeric,
  target_body_water_pct numeric,
  target_bmi numeric,
  target_metabolic_age smallint,
  target_notes text
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
  if target_assessed_at is null or target_assessed_at > current_date then
    raise exception 'A data da avaliação não pode estar no futuro.' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.profiles p
    where p.user_id = target_athlete_user_id
      and p.role = 'member'
      and p.membership_status = 'active'
  ) then
    raise exception 'Selecione um atleta com acesso ativo.' using errcode = '22023';
  end if;
  if num_nonnulls(
    target_weight_kg, target_body_fat_pct, target_muscle_mass_kg,
    target_visceral_fat_level, target_body_water_pct, target_bmi,
    target_metabolic_age, nullif(btrim(target_notes), '')
  ) = 0 then
    raise exception 'Informe ao menos uma medida ou observação.' using errcode = '22023';
  end if;

  if target_assessment_id is null then
    insert into public.body_assessments (
      athlete_user_id, assessed_by, assessed_at, weight_kg, body_fat_pct,
      muscle_mass_kg, visceral_fat_level, body_water_pct, bmi,
      metabolic_age, notes
    ) values (
      target_athlete_user_id, (select auth.uid()), target_assessed_at,
      target_weight_kg, target_body_fat_pct, target_muscle_mass_kg,
      target_visceral_fat_level, target_body_water_pct, target_bmi,
      target_metabolic_age, nullif(btrim(target_notes), '')
    ) returning id into saved_id;
  else
    update public.body_assessments
    set assessed_at = target_assessed_at,
        weight_kg = target_weight_kg,
        body_fat_pct = target_body_fat_pct,
        muscle_mass_kg = target_muscle_mass_kg,
        visceral_fat_level = target_visceral_fat_level,
        body_water_pct = target_body_water_pct,
        bmi = target_bmi,
        metabolic_age = target_metabolic_age,
        notes = nullif(btrim(target_notes), '')
    where id = target_assessment_id
      and athlete_user_id = target_athlete_user_id
    returning id into saved_id;
    if saved_id is null then
      raise exception 'Avaliação não encontrada para este atleta.' using errcode = 'P0002';
    end if;
  end if;

  return saved_id;
end;
$$;

create or replace function public.coach_delete_body_assessment(target_assessment_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_coach() then
    raise exception 'Acesso restrito ao treinador.' using errcode = '42501';
  end if;
  delete from public.body_assessments where id = target_assessment_id;
  if not found then
    raise exception 'Avaliação não encontrada.' using errcode = 'P0002';
  end if;
  return true;
end;
$$;

alter table public.body_assessments enable row level security;

drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select app_private.is_access_manager())
    or (
      (select app_private.is_active_member())
      and membership_status = 'active'
    )
  );

drop policy if exists workouts_insert_admin on public.workouts;
drop policy if exists workouts_update_admin on public.workouts;
drop policy if exists workouts_delete_admin on public.workouts;
drop policy if exists workouts_delete_coach on public.workouts;
create policy workouts_delete_coach on public.workouts
  for delete to authenticated using ((select app_private.is_coach()));

drop policy if exists training_groups_select_authorized on public.training_groups;
create policy training_groups_select_authorized on public.training_groups
  for select to authenticated
  using (
    (select app_private.is_coach())
    or (
      archived_at is null
      and (select app_private.is_active_member())
      and exists (
        select 1 from public.training_group_members gm
        where gm.group_id = id and gm.user_id = (select auth.uid())
      )
    )
  );
drop policy if exists training_groups_insert_admin on public.training_groups;
drop policy if exists training_groups_update_admin on public.training_groups;
drop policy if exists training_groups_delete_admin on public.training_groups;

drop policy if exists training_group_members_select_authorized on public.training_group_members;
create policy training_group_members_select_authorized on public.training_group_members
  for select to authenticated
  using (
    (select app_private.is_coach())
    or (
      user_id = (select auth.uid())
      and (select app_private.is_active_member())
    )
  );
drop policy if exists training_group_members_insert_admin on public.training_group_members;
drop policy if exists training_group_members_delete_admin on public.training_group_members;

drop policy if exists workout_assignments_select_authorized on public.workout_assignments;
create policy workout_assignments_select_authorized on public.workout_assignments
  for select to authenticated
  using (
    (select app_private.is_coach())
    or (
      (select app_private.is_active_member())
      and (
        athlete_user_id = (select auth.uid())
        or exists (
          select 1 from public.training_group_members gm
          where gm.group_id = workout_assignments.group_id
            and gm.user_id = (select auth.uid())
        )
      )
    )
  );
drop policy if exists workout_assignments_insert_admin on public.workout_assignments;
drop policy if exists workout_assignments_delete_admin on public.workout_assignments;

drop policy if exists body_assessments_select_private on public.body_assessments;
create policy body_assessments_select_private on public.body_assessments
  for select to authenticated
  using (
    (select app_private.is_active_member())
    and (
      athlete_user_id = (select auth.uid())
      or (select app_private.is_coach())
    )
  );

revoke all on table public.body_assessments from anon, authenticated;
grant select on table public.body_assessments to authenticated;
grant select, insert, update, delete on table public.body_assessments to service_role;

revoke insert, update on table public.workouts from authenticated;
grant select, delete on table public.workouts to authenticated;
revoke insert, update, delete on table public.training_groups from authenticated;
revoke insert, delete on table public.training_group_members from authenticated;
revoke insert, delete on table public.workout_assignments from authenticated;

revoke all on function app_private.is_coach()
  from public, anon, authenticated, service_role;
revoke all on function app_private.is_access_manager()
  from public, anon, authenticated, service_role;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_coach() to authenticated;
grant execute on function app_private.is_access_manager() to authenticated;

revoke all on function public.coach_save_body_assessment(
  uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric, smallint, text
) from public, anon;
revoke all on function public.coach_delete_body_assessment(uuid) from public, anon;
grant execute on function public.coach_save_body_assessment(
  uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric, smallint, text
) to authenticated;
grant execute on function public.coach_delete_body_assessment(uuid) to authenticated;
