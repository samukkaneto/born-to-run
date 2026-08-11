-- ============================================================
-- BORN TO RUN — comunidade fechada, segurança e treinos dirigidos
--
-- Snapshot consolidado pelas migrations 20260808151232, 20260808162054,
-- 20260808162941, 20260808174648, 20260808192626 e 20260809021316.
-- O script é deliberadamente idempotente: funciona tanto sobre o banco
-- remoto legado quanto em uma instalação nova.
-- ============================================================

begin;

create extension if not exists "uuid-ossp";
create schema if not exists app_private;

-- ============================================================
-- 1. Estrutura base
-- ============================================================

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text not null default 'Atleta',
  avatar_url text,
  bio text,
  cidade text,
  objetivo text,
  role text not null default 'member',
  membership_status text not null default 'pending',
  reviewed_at timestamptz,
  reviewed_by uuid,
  status_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles add column if not exists membership_status text;
alter table public.profiles add column if not exists reviewed_at timestamptz;
alter table public.profiles add column if not exists reviewed_by uuid;
alter table public.profiles add column if not exists status_note text;

-- Usuários que já faziam parte do projeto permanecem ativos.
update public.profiles
set membership_status = 'active',
    reviewed_at = coalesce(reviewed_at, created_at)
where membership_status is null;

alter table public.profiles alter column membership_status set default 'pending';
alter table public.profiles alter column membership_status set not null;
alter table public.profiles alter column full_name set default 'Atleta';

update public.profiles
set full_name = 'Atleta'
where length(btrim(coalesce(full_name, ''))) not between 2 and 120;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('member', 'admin'));

alter table public.profiles drop constraint if exists profiles_membership_status_check;
alter table public.profiles
  add constraint profiles_membership_status_check
  check (membership_status in ('pending', 'active', 'suspended', 'rejected'));

alter table public.profiles drop constraint if exists profiles_full_name_check;
alter table public.profiles
  add constraint profiles_full_name_check
  check (length(btrim(full_name)) between 2 and 120);

alter table public.profiles drop constraint if exists profiles_bio_check;
alter table public.profiles
  add constraint profiles_bio_check check (bio is null or length(bio) <= 300);

alter table public.profiles drop constraint if exists profiles_cidade_check;
alter table public.profiles
  add constraint profiles_cidade_check check (cidade is null or length(cidade) <= 100);

alter table public.profiles drop constraint if exists profiles_objetivo_check;
alter table public.profiles
  add constraint profiles_objetivo_check check (objetivo is null or length(objetivo) <= 200);

alter table public.profiles drop constraint if exists profiles_status_note_check;
alter table public.profiles
  add constraint profiles_status_note_check
  check (status_note is null or length(status_note) <= 500);

-- Repara perfis ausentes antes de trocar as FKs das tabelas sociais.
insert into public.profiles (user_id, full_name, role, membership_status)
select
  u.id,
  case
    when length(btrim(coalesce(u.raw_user_meta_data->>'full_name', ''))) between 2 and 120
      then btrim(u.raw_user_meta_data->>'full_name')
    else 'Atleta'
  end,
  'member',
  'pending'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.user_id = u.id
)
on conflict (user_id) do nothing;

alter table public.profiles drop constraint if exists profiles_reviewed_by_fkey;
alter table public.profiles
  add constraint profiles_reviewed_by_fkey
  foreign key (reviewed_by) references public.profiles(user_id) on delete set null;

create table if not exists public.posts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  caption text,
  photo_url text,
  distance_km numeric(6,2),
  duration_minutes integer,
  pace text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  id uuid primary key default uuid_generate_v4(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.workouts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null,
  level text not null default 'iniciante',
  objective text not null,
  scheduled_date date,
  audience text not null default 'team',
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.workouts add column if not exists audience text;
update public.workouts set audience = 'team' where audience is null;
alter table public.workouts alter column audience set default 'team';
alter table public.workouts alter column audience set not null;

create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_groups (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_by uuid not null,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.training_group_members (
  group_id uuid not null references public.training_groups(id) on delete cascade,
  user_id uuid not null,
  added_by uuid not null,
  created_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create table if not exists public.workout_assignments (
  id uuid primary key default uuid_generate_v4(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  athlete_user_id uuid,
  group_id uuid references public.training_groups(id) on delete cascade,
  assigned_by uuid not null,
  assigned_at timestamptz not null default now()
);

-- ============================================================
-- 2. Contratos e relacionamentos diretos com profiles
-- ============================================================

alter table public.posts drop constraint if exists posts_user_id_fkey;
alter table public.posts drop constraint if exists posts_user_profile_fkey;
alter table public.posts
  add constraint posts_user_profile_fkey
  foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.comments drop constraint if exists comments_user_id_fkey;
alter table public.comments drop constraint if exists comments_user_profile_fkey;
alter table public.comments
  add constraint comments_user_profile_fkey
  foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.likes drop constraint if exists likes_user_id_fkey;
alter table public.likes drop constraint if exists likes_user_profile_fkey;
alter table public.likes
  add constraint likes_user_profile_fkey
  foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.workouts drop constraint if exists workouts_created_by_fkey;
alter table public.workouts drop constraint if exists workouts_creator_profile_fkey;
alter table public.workouts
  add constraint workouts_creator_profile_fkey
  foreign key (created_by) references public.profiles(user_id) on delete restrict;

alter table public.announcements drop constraint if exists announcements_created_by_fkey;
alter table public.announcements drop constraint if exists announcements_creator_profile_fkey;
alter table public.announcements
  add constraint announcements_creator_profile_fkey
  foreign key (created_by) references public.profiles(user_id) on delete restrict;

alter table public.training_groups drop constraint if exists training_groups_creator_profile_fkey;
alter table public.training_groups
  add constraint training_groups_creator_profile_fkey
  foreign key (created_by) references public.profiles(user_id) on delete restrict;

alter table public.training_group_members
  drop constraint if exists training_group_members_user_profile_fkey;
alter table public.training_group_members
  add constraint training_group_members_user_profile_fkey
  foreign key (user_id) references public.profiles(user_id) on delete cascade;

alter table public.training_group_members
  drop constraint if exists training_group_members_added_by_profile_fkey;
alter table public.training_group_members
  add constraint training_group_members_added_by_profile_fkey
  foreign key (added_by) references public.profiles(user_id) on delete restrict;

alter table public.workout_assignments
  drop constraint if exists workout_assignments_athlete_profile_fkey;
alter table public.workout_assignments
  add constraint workout_assignments_athlete_profile_fkey
  foreign key (athlete_user_id) references public.profiles(user_id) on delete cascade;

alter table public.workout_assignments
  drop constraint if exists workout_assignments_assigned_by_profile_fkey;
alter table public.workout_assignments
  add constraint workout_assignments_assigned_by_profile_fkey
  foreign key (assigned_by) references public.profiles(user_id) on delete restrict;

alter table public.workouts drop constraint if exists workouts_level_check;
alter table public.workouts
  add constraint workouts_level_check
  check (level in ('iniciante', 'intermediario', 'avancado'));

alter table public.workouts drop constraint if exists workouts_audience_check;
alter table public.workouts
  add constraint workouts_audience_check check (audience in ('team', 'targeted'));

alter table public.workout_assignments
  drop constraint if exists workout_assignments_exactly_one_target;
alter table public.workout_assignments
  add constraint workout_assignments_exactly_one_target check (
    ((athlete_user_id is not null)::integer + (group_id is not null)::integer) = 1
  );

alter table public.posts drop constraint if exists posts_caption_check;
alter table public.posts
  add constraint posts_caption_check check (
    caption is null or length(btrim(caption)) between 1 and 1000
  );

alter table public.posts drop constraint if exists posts_content_check;
alter table public.posts add constraint posts_content_check check (
  caption is not null
  or photo_url is not null
  or distance_km is not null
  or duration_minutes is not null
  or pace is not null
);

alter table public.posts drop constraint if exists posts_distance_check;
alter table public.posts
  add constraint posts_distance_check
  check (distance_km is null or (distance_km > 0 and distance_km <= 999.99));

alter table public.posts drop constraint if exists posts_duration_check;
alter table public.posts
  add constraint posts_duration_check
  check (duration_minutes is null or (duration_minutes > 0 and duration_minutes <= 10080));

alter table public.posts drop constraint if exists posts_pace_check;
alter table public.posts
  add constraint posts_pace_check
  check (pace is null or (pace ~ '^[0-9]{1,2}:[0-5][0-9]$' and pace <> '00:00'));

alter table public.workouts drop constraint if exists workouts_title_check;
alter table public.workouts
  add constraint workouts_title_check check (length(btrim(title)) between 3 and 160);

alter table public.workouts drop constraint if exists workouts_description_check;
alter table public.workouts
  add constraint workouts_description_check check (length(btrim(description)) between 1 and 5000);

alter table public.workouts drop constraint if exists workouts_objective_check;
alter table public.workouts
  add constraint workouts_objective_check check (length(btrim(objective)) between 1 and 500);

alter table public.announcements drop constraint if exists announcements_title_check;
alter table public.announcements
  add constraint announcements_title_check check (length(btrim(title)) between 3 and 160);

alter table public.announcements drop constraint if exists announcements_content_check;
alter table public.announcements
  add constraint announcements_content_check check (length(btrim(content)) between 1 and 5000);

alter table public.comments drop constraint if exists comments_content_check;
alter table public.comments
  add constraint comments_content_check
  check (length(btrim(content)) between 1 and 500);

alter table public.training_groups drop constraint if exists training_groups_name_check;
alter table public.training_groups
  add constraint training_groups_name_check
  check (length(btrim(name)) between 2 and 100);

alter table public.training_groups drop constraint if exists training_groups_description_check;
alter table public.training_groups
  add constraint training_groups_description_check
  check (description is null or length(description) <= 500);

-- Converte a atribuição individual legada antes de remover assigned_to.
-- A instância remota possui uma policy antiga que referencia essa coluna.
drop policy if exists "Alunos veem apenas seus proprios treinos" on public.workouts;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'workouts'
      and column_name = 'assigned_to'
  ) then
    execute $sql$
      insert into public.workout_assignments (
        workout_id, athlete_user_id, assigned_by
      )
      select id, assigned_to, created_by
      from public.workouts
      where assigned_to is not null
      on conflict do nothing
    $sql$;
    execute $sql$
      update public.workouts
      set audience = 'targeted'
      where assigned_to is not null
    $sql$;
    alter table public.workouts drop constraint if exists workouts_assigned_to_fkey;
    alter table public.workouts drop column assigned_to;
  end if;
end
$$;

-- Policies antigas do Storage podem depender de public.is_admin(). Elas
-- precisam sair antes da função legada ser removida na seção de RLS.
do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') ilike '%avatars%'
        or coalesce(with_check, '') ilike '%avatars%'
        or coalesce(qual, '') ilike '%post-images%'
        or coalesce(with_check, '') ilike '%post-images%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', policy_row.policyname);
  end loop;
end
$$;

-- ============================================================
-- 3. Índices
-- ============================================================

create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_membership_status
  on public.profiles(membership_status, created_at);
create index if not exists idx_profiles_reviewed_by on public.profiles(reviewed_by);
create index if not exists idx_profiles_avatar_url
  on public.profiles(avatar_url)
  where avatar_url is not null;
create index if not exists idx_posts_photo_url
  on public.posts(photo_url)
  where photo_url is not null;
create index if not exists idx_posts_user_created
  on public.posts(user_id, created_at desc);
create index if not exists idx_posts_feed_cursor
  on public.posts(created_at desc, id desc);
create index if not exists idx_comments_post_created
  on public.comments(post_id, created_at, id);
create index if not exists idx_comments_user_id on public.comments(user_id);
create index if not exists idx_likes_post_id on public.likes(post_id);
create index if not exists idx_likes_user_id on public.likes(user_id);
create index if not exists idx_workouts_created_by on public.workouts(created_by);
create index if not exists idx_workouts_audience_date
  on public.workouts(audience, scheduled_date);
create index if not exists idx_announcements_created
  on public.announcements(created_at desc);
create index if not exists idx_announcements_created_by
  on public.announcements(created_by);
create unique index if not exists training_groups_name_active_unique
  on public.training_groups(lower(name)) where archived_at is null;
create index if not exists idx_training_groups_created_by
  on public.training_groups(created_by);
create index if not exists idx_training_group_members_user
  on public.training_group_members(user_id, group_id);
create index if not exists idx_training_group_members_added_by
  on public.training_group_members(added_by);
create index if not exists idx_workout_assignments_workout
  on public.workout_assignments(workout_id);
create index if not exists idx_workout_assignments_athlete
  on public.workout_assignments(athlete_user_id)
  where athlete_user_id is not null;
create index if not exists idx_workout_assignments_group
  on public.workout_assignments(group_id)
  where group_id is not null;
create index if not exists idx_workout_assignments_assigned_by
  on public.workout_assignments(assigned_by);
create unique index if not exists workout_assignments_athlete_unique
  on public.workout_assignments(workout_id, athlete_user_id)
  where athlete_user_id is not null;
create unique index if not exists workout_assignments_group_unique
  on public.workout_assignments(workout_id, group_id)
  where group_id is not null;

-- ============================================================
-- 4. Funções privadas e triggers endurecidos
-- ============================================================

create or replace function app_private.is_active_member()
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
  );
$$;

create or replace function app_private.is_admin()
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
      and p.role = 'admin'
  );
$$;

create or replace function app_private.can_view_workout(target_workout_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    app_private.is_admin()
    or (
      app_private.is_active_member()
      and exists (
        select 1
        from public.workouts w
        where w.id = target_workout_id
          and (
            w.audience = 'team'
            or exists (
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

create or replace function app_private.handle_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_full_name text := btrim(coalesce(new.raw_user_meta_data->>'full_name', ''));
begin
  if length(new_full_name) < 2 or length(new_full_name) > 120 then
    new_full_name := 'Atleta';
  end if;

  insert into public.profiles (
    user_id, full_name, role, membership_status
  ) values (
    new.id,
    new_full_name,
    'member',
    'pending'
  )
  on conflict (user_id) do nothing;
  return new;
end;
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
begin
  if new.user_id is distinct from old.user_id then
    raise exception 'O identificador do usuário é imutável.' using errcode = '42501';
  end if;

  if new.role is distinct from old.role
    or new.membership_status is distinct from old.membership_status
    or new.reviewed_at is distinct from old.reviewed_at
    or new.reviewed_by is distinct from old.reviewed_by
    or new.status_note is distinct from old.status_note then
    if not trusted_backend then
      if not app_private.is_admin() then
        raise exception 'Somente um administrador pode alterar acesso ou função.'
          using errcode = '42501';
      end if;
      if old.user_id = (select auth.uid()) then
        raise exception 'Administradores não podem alterar o próprio acesso ou função.'
          using errcode = '42501';
      end if;
    end if;
    if new.membership_status is distinct from old.membership_status then
      new.reviewed_at = now();
      new.reviewed_by = coalesce((select auth.uid()), new.reviewed_by);
    end if;
  end if;

  return new;
end;
$$;

create or replace function app_private.is_owned_media_path(
  target_path text,
  target_user_id uuid
)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select
    target_path is not null
    and target_user_id is not null
    and split_part(target_path, '/', 1) = target_user_id::text
    and target_path ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$';
$$;

create or replace function app_private.media_object_exists(
  target_bucket text,
  target_path text,
  target_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from storage.objects media
    where media.bucket_id = target_bucket
      and media.name = target_path
      and media.owner_id = target_user_id::text
  );
$$;

create or replace function app_private.enforce_profile_avatar_path()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  trusted_backend boolean :=
    session_user in ('postgres', 'supabase_admin')
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role';
begin
  if new.avatar_url is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.avatar_url is not distinct from old.avatar_url then
      return new;
    end if;
  end if;

  if not app_private.is_owned_media_path(new.avatar_url, new.user_id)
    or (
      not trusted_backend
      and (
        (select auth.uid()) is null
        or new.user_id <> (select auth.uid())
      )
    ) then
    raise exception 'O avatar deve pertencer a pasta de midia do proprio usuario.'
      using errcode = '42501';
  end if;

  if not app_private.media_object_exists('avatars', new.avatar_url, new.user_id) then
    raise exception 'O arquivo de avatar informado nao existe no Storage.'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

create or replace function app_private.enforce_post_photo_path()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  trusted_backend boolean :=
    session_user in ('postgres', 'supabase_admin')
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role';
begin
  if new.photo_url is null then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.photo_url is not distinct from old.photo_url then
      return new;
    end if;
  end if;

  if not app_private.is_owned_media_path(new.photo_url, new.user_id)
    or (
      not trusted_backend
      and (
        (select auth.uid()) is null
        or new.user_id <> (select auth.uid())
      )
    ) then
    raise exception 'A foto deve pertencer a pasta de midia do autor da publicacao.'
      using errcode = '42501';
  end if;

  if not app_private.media_object_exists('post-images', new.photo_url, new.user_id) then
    raise exception 'O arquivo da publicacao nao existe no Storage.'
      using errcode = '23503';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function app_private.handle_updated_at();

drop trigger if exists trg_profiles_protect_access on public.profiles;
create trigger trg_profiles_protect_access
  before update on public.profiles
  for each row execute function app_private.protect_profile_access_fields();

drop trigger if exists trg_profiles_validate_avatar_path on public.profiles;
create trigger trg_profiles_validate_avatar_path
  before insert or update of avatar_url, user_id on public.profiles
  for each row execute function app_private.enforce_profile_avatar_path();

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function app_private.handle_updated_at();

drop trigger if exists trg_posts_validate_photo_path on public.posts;
create trigger trg_posts_validate_photo_path
  before insert or update of photo_url, user_id on public.posts
  for each row execute function app_private.enforce_post_photo_path();

drop trigger if exists trg_workouts_updated_at on public.workouts;
create trigger trg_workouts_updated_at
  before update on public.workouts
  for each row execute function app_private.handle_updated_at();

drop trigger if exists trg_announcements_updated_at on public.announcements;
create trigger trg_announcements_updated_at
  before update on public.announcements
  for each row execute function app_private.handle_updated_at();

drop trigger if exists trg_training_groups_updated_at on public.training_groups;
create trigger trg_training_groups_updated_at
  before update on public.training_groups
  for each row execute function app_private.handle_updated_at();

drop trigger if exists trg_on_auth_user_created on auth.users;
create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function app_private.handle_new_user();

-- ============================================================
-- 5. RPC de acesso próprio e RPCs administrativas atômicas
-- ============================================================

create or replace function public.get_my_access_profile()
returns table (
  user_id uuid,
  full_name text,
  avatar_url text,
  role text,
  membership_status text,
  status_note text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    p.user_id,
    p.full_name,
    p.avatar_url,
    p.role,
    p.membership_status,
    p.status_note
  from public.profiles p
  where p.user_id = (select auth.uid())
  limit 1;
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
  if not app_private.is_admin() then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
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
  if target_role not in ('member', 'admin') then
    raise exception 'Função inválida.' using errcode = '22023';
  end if;

  update public.profiles
  set role = target_role
  where user_id = target_user_id
    and membership_status = 'active';

  if not found then
    raise exception 'Somente um membro ativo pode ter sua função alterada.' using errcode = '22023';
  end if;
  return true;
end;
$$;

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
  -- que já o continha. Isso preserva a composição histórica e permite editar
  -- o grupo. Apenas novas inclusões exigem associação ativa.
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

create or replace function public.admin_archive_training_group(target_group_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_admin() then
    raise exception 'Acesso restrito ao administrador.' using errcode = '42501';
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

-- ============================================================
-- 6. RLS: somente membros ativos entram na comunidade
-- ============================================================

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.workouts enable row level security;
alter table public.announcements enable row level security;
alter table public.training_groups enable row level security;
alter table public.training_group_members enable row level security;
alter table public.workout_assignments enable row level security;

do $$
declare
  table_name text;
  policy_row record;
begin
  foreach table_name in array array[
    'profiles', 'posts', 'comments', 'likes', 'workouts', 'announcements',
    'training_groups', 'training_group_members', 'workout_assignments'
  ] loop
    for policy_row in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = table_name
    loop
      execute format('drop policy if exists %I on public.%I', policy_row.policyname, table_name);
    end loop;
  end loop;
end
$$;

drop function if exists public.is_admin();
drop function if exists public.handle_new_user();
drop function if exists public.handle_updated_at();

create policy profiles_select on public.profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select app_private.is_admin())
    or (
      (select app_private.is_active_member())
      and membership_status = 'active'
    )
  );

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select app_private.is_active_member())
  )
  with check (
    user_id = (select auth.uid())
    and (select app_private.is_active_member())
  );

create policy posts_select_active on public.posts
  for select to authenticated using ((select app_private.is_active_member()));
create policy posts_insert_own_active on public.posts
  for insert to authenticated
  with check (
    user_id = (select auth.uid()) and (select app_private.is_active_member())
  );
create policy posts_delete_owner_or_admin on public.posts
  for delete to authenticated
  using (
    (select app_private.is_active_member())
    and (user_id = (select auth.uid()) or (select app_private.is_admin()))
  );

create policy comments_select_active on public.comments
  for select to authenticated using ((select app_private.is_active_member()));
create policy comments_insert_own_active on public.comments
  for insert to authenticated
  with check (
    user_id = (select auth.uid()) and (select app_private.is_active_member())
  );
create policy comments_delete_owner_or_admin on public.comments
  for delete to authenticated
  using (
    (select app_private.is_active_member())
    and (user_id = (select auth.uid()) or (select app_private.is_admin()))
  );

create policy likes_select_active on public.likes
  for select to authenticated using ((select app_private.is_active_member()));
create policy likes_insert_own_active on public.likes
  for insert to authenticated
  with check (
    user_id = (select auth.uid()) and (select app_private.is_active_member())
  );
create policy likes_delete_own_active on public.likes
  for delete to authenticated
  using (
    user_id = (select auth.uid()) and (select app_private.is_active_member())
  );

create policy workouts_select_authorized on public.workouts
  for select to authenticated
  using (app_private.can_view_workout(id));
create policy workouts_insert_admin on public.workouts
  for insert to authenticated with check ((select app_private.is_admin()));
create policy workouts_update_admin on public.workouts
  for update to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));
create policy workouts_delete_admin on public.workouts
  for delete to authenticated using ((select app_private.is_admin()));

create policy announcements_select_active on public.announcements
  for select to authenticated using ((select app_private.is_active_member()));
create policy announcements_insert_admin on public.announcements
  for insert to authenticated with check ((select app_private.is_admin()));
create policy announcements_update_admin on public.announcements
  for update to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));
create policy announcements_delete_admin on public.announcements
  for delete to authenticated using ((select app_private.is_admin()));

create policy training_groups_select_authorized on public.training_groups
  for select to authenticated
  using (
    (select app_private.is_admin())
    or (
      archived_at is null
      and (select app_private.is_active_member())
      and exists (
        select 1 from public.training_group_members gm
        where gm.group_id = id and gm.user_id = (select auth.uid())
      )
    )
  );
create policy training_groups_insert_admin on public.training_groups
  for insert to authenticated with check ((select app_private.is_admin()));
create policy training_groups_update_admin on public.training_groups
  for update to authenticated
  using ((select app_private.is_admin()))
  with check ((select app_private.is_admin()));
create policy training_groups_delete_admin on public.training_groups
  for delete to authenticated using ((select app_private.is_admin()));

create policy training_group_members_select_authorized on public.training_group_members
  for select to authenticated
  using (
    (select app_private.is_admin())
    or (
      user_id = (select auth.uid())
      and (select app_private.is_active_member())
    )
  );
create policy training_group_members_insert_admin on public.training_group_members
  for insert to authenticated with check ((select app_private.is_admin()));
create policy training_group_members_delete_admin on public.training_group_members
  for delete to authenticated using ((select app_private.is_admin()));

create policy workout_assignments_select_authorized on public.workout_assignments
  for select to authenticated
  using (
    (select app_private.is_admin())
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
create policy workout_assignments_insert_admin on public.workout_assignments
  for insert to authenticated with check ((select app_private.is_admin()));
create policy workout_assignments_delete_admin on public.workout_assignments
  for delete to authenticated using ((select app_private.is_admin()));

-- ============================================================
-- 7. Storage privado
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars', 'avatars', false, 5242880,
  array['image/jpeg','image/jpg','image/png','image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images', 'post-images', false, 10485760,
  array['image/jpeg','image/jpg','image/png','image/webp']
)
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and (
        coalesce(qual, '') ilike '%avatars%'
        or coalesce(with_check, '') ilike '%avatars%'
        or coalesce(qual, '') ilike '%post-images%'
        or coalesce(with_check, '') ilike '%post-images%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', policy_row.policyname);
  end loop;
end
$$;

create policy btr_media_select_active on storage.objects
  for select to authenticated
  using (
    bucket_id in ('avatars', 'post-images')
    and (select app_private.is_active_member())
  );

create policy btr_avatars_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select app_private.is_active_member())
  );
create policy btr_avatars_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select app_private.is_active_member())
  )
  with check (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select app_private.is_active_member())
  );
create policy btr_avatars_delete_own on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select app_private.is_active_member())
    and not exists (
      select 1
      from public.profiles profile
      where profile.avatar_url = storage.objects.name
    )
  );

create policy btr_post_images_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select app_private.is_active_member())
  );
create policy btr_post_images_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'post-images'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select app_private.is_active_member())
  )
  with check (
    bucket_id = 'post-images'
    and owner_id = (select auth.uid())::text
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select app_private.is_active_member())
  );
create policy btr_post_images_delete_owner_or_admin on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'post-images'
    and (select app_private.is_active_member())
    and (
      (
        owner_id = (select auth.uid())::text
        and (storage.foldername(name))[1] = (select auth.uid())::text
      )
      or (select app_private.is_admin())
    )
    and not exists (
      select 1
      from public.posts post
      where post.photo_url = storage.objects.name
    )
  );

-- ============================================================
-- 8. Privilégios mínimos e execução de funções
-- ============================================================

revoke all on table
  public.profiles,
  public.posts,
  public.comments,
  public.likes,
  public.workouts,
  public.announcements,
  public.training_groups,
  public.training_group_members,
  public.workout_assignments
from anon, authenticated;

grant select (
  id,
  user_id,
  full_name,
  avatar_url,
  bio,
  cidade,
  objetivo,
  role,
  membership_status,
  created_at,
  updated_at
) on table public.profiles to authenticated;
grant update (full_name, avatar_url, bio, cidade, objetivo)
  on public.profiles to authenticated;
grant select, delete on table public.posts to authenticated;
grant insert (user_id, caption, photo_url, distance_km, duration_minutes, pace)
  on table public.posts to authenticated;
grant select, delete on table public.comments, public.likes to authenticated;
grant insert (post_id, user_id, content)
  on table public.comments to authenticated;
grant insert (post_id, user_id)
  on table public.likes to authenticated;
grant select, insert, update, delete on table
  public.workouts,
  public.announcements,
  public.training_groups
to authenticated;
grant select, insert, delete on table
  public.training_group_members,
  public.workout_assignments
to authenticated;

revoke insert, update on table public.workouts from authenticated;
revoke insert, update, delete on table public.training_groups from authenticated;
revoke insert, delete on table public.training_group_members from authenticated;
revoke insert, delete on table public.workout_assignments from authenticated;

grant select, insert, update, delete on table
  public.profiles,
  public.posts,
  public.comments,
  public.likes,
  public.workouts,
  public.announcements,
  public.training_groups,
  public.training_group_members,
  public.workout_assignments
to service_role;

revoke all on all functions in schema app_private
  from public, anon, authenticated, service_role;
grant usage on schema app_private to authenticated;
grant execute on function app_private.is_active_member() to authenticated;
grant execute on function app_private.is_admin() to authenticated;
grant execute on function app_private.can_view_workout(uuid) to authenticated;

revoke all on function public.admin_set_membership_status(uuid, text, text)
  from public, anon;
revoke all on function public.get_my_access_profile()
  from public, anon;
revoke all on function public.admin_set_member_role(uuid, text)
  from public, anon;
revoke all on function public.admin_save_training_group(uuid, text, text, uuid[])
  from public, anon;
revoke all on function public.admin_archive_training_group(uuid)
  from public, anon;
revoke all on function public.admin_save_workout(
  uuid, text, text, text, text, date, text, uuid[], uuid[]
) from public, anon;

grant execute on function public.admin_set_membership_status(uuid, text, text)
  to authenticated;
grant execute on function public.get_my_access_profile()
  to authenticated;
grant execute on function public.admin_set_member_role(uuid, text)
  to authenticated;
grant execute on function public.admin_save_training_group(uuid, text, text, uuid[])
  to authenticated;
grant execute on function public.admin_archive_training_group(uuid)
  to authenticated;
grant execute on function public.admin_save_workout(
  uuid, text, text, text, text, date, text, uuid[], uuid[]
) to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Papel exclusivo de treinador, treinos privados e avaliações de bioimpedância.
-- Mantido ao final para que este snapshot novo reproduza exatamente a migração
-- 20260810021549 após a base histórica consolidada acima.
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

-- Pré-autorização segura do treinador, aplicada na migration 20260810025223.
-- Convites internos permitem pré-autorizar um papel técnico sem criar senha
-- em nome da pessoa. A confirmação do endereço continua a cargo do Supabase.

create table if not exists app_private.staff_invitations (
  email text primary key,
  role text not null default 'coach',
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users(id) on delete set null,
  constraint staff_invitations_email_normalized_check
    check (email = lower(btrim(email)) and position('@' in email) > 1),
  constraint staff_invitations_role_check check (role = 'coach'),
  constraint staff_invitations_expiry_check
    check (expires_at is null or expires_at > created_at)
);

revoke all on table app_private.staff_invitations
  from public, anon, authenticated, service_role;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_full_name text := btrim(coalesce(new.raw_user_meta_data->>'full_name', ''));
  normalized_email text := lower(btrim(coalesce(new.email, '')));
  invited_role text;
  invited_status text := 'pending';
begin
  if length(new_full_name) < 2 or length(new_full_name) > 120 then
    new_full_name := 'Atleta';
  end if;

  select invitation.role
  into invited_role
  from app_private.staff_invitations invitation
  where invitation.email = normalized_email
    and invitation.accepted_at is null
    and (invitation.expires_at is null or invitation.expires_at > now())
  for update;

  if invited_role = 'coach' then
    if exists (select 1 from public.profiles p where p.role = 'coach') then
      raise exception 'Já existe um treinador responsável cadastrado.'
        using errcode = '23505';
    end if;
    invited_status := 'active';
  else
    invited_role := 'member';
  end if;

  insert into public.profiles (
    user_id, full_name, role, membership_status, reviewed_at
  ) values (
    new.id,
    new_full_name,
    invited_role,
    invited_status,
    case when invited_status = 'active' then now() else null end
  )
  on conflict (user_id) do nothing;

  if invited_role = 'coach' then
    update app_private.staff_invitations
    set accepted_at = now(), accepted_user_id = new.id
    where email = normalized_email and accepted_at is null;
  end if;

  return new;
end;
$$;

revoke all on function app_private.handle_new_user()
  from public, anon, authenticated, service_role;

-- Índice da chave estrangeira do convite técnico (migration 20260810030102).
create index if not exists idx_staff_invitations_accepted_user
  on app_private.staff_invitations(accepted_user_id)
  where accepted_user_id is not null;


-- ============================================================================
-- Migration 20260811010426_galeria_institucional_e_consentimento.sql
-- ============================================================================
-- Galeria institucional pública, separada das fotos pessoais do feed.
-- Somente administrador e treinador podem publicar material de divulgação.

create table public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique,
  title text,
  caption text,
  alt_text text not null,
  taken_at date,
  layout text not null default 'standard',
  sort_order integer not null default 0,
  is_published boolean not null default false,
  consent_confirmed boolean not null default false,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  updated_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gallery_items_storage_path_check check (
    storage_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'
  ),
  constraint gallery_items_title_check check (
    title is null or char_length(title) between 2 and 120
  ),
  constraint gallery_items_caption_check check (
    caption is null or char_length(caption) <= 500
  ),
  constraint gallery_items_alt_text_check check (
    char_length(alt_text) between 5 and 250
  ),
  constraint gallery_items_layout_check check (layout in ('standard', 'wide')),
  constraint gallery_items_sort_order_check check (sort_order between 0 and 10000),
  constraint gallery_items_publish_requires_consent_check check (
    not is_published or consent_confirmed
  )
);

create index gallery_items_public_order_idx
  on public.gallery_items (sort_order, created_at desc)
  where is_published;
create index gallery_items_created_by_idx on public.gallery_items (created_by);
create index gallery_items_updated_by_idx on public.gallery_items (updated_by);

alter table public.gallery_items enable row level security;

create policy gallery_items_select_public
  on public.gallery_items
  for select
  to anon, authenticated
  using (is_published);

create policy gallery_items_select_staff
  on public.gallery_items
  for select
  to authenticated
  using ((select app_private.is_access_manager()));

create trigger gallery_items_updated_at
before update on public.gallery_items
for each row execute function app_private.handle_updated_at();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'gallery',
  'gallery',
  true,
  12582912,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy btr_gallery_select_staff on storage.objects
  for select to authenticated
  using (
    bucket_id = 'gallery'
    and (select app_private.is_access_manager())
  );

create policy btr_gallery_insert_staff on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'gallery'
    and (select app_private.is_access_manager())
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~ ('^' || (select auth.uid())::text || '/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$')
  );

create policy btr_gallery_delete_staff on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'gallery'
    and (select app_private.is_access_manager())
  );

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
  target_alt_text := btrim(coalesce(target_alt_text, ''));
  target_layout := coalesce(nullif(btrim(target_layout), ''), 'standard');
  target_sort_order := coalesce(target_sort_order, 0);
  target_is_published := coalesce(target_is_published, false);
  target_consent_confirmed := coalesce(target_consent_confirmed, false);

  if target_item_id is not null then
    select item.storage_path into current_path
    from public.gallery_items item
    where item.id = target_item_id;
    if current_path is null then raise exception 'gallery_item_not_found'; end if;
  end if;

  if target_storage_path is null
    or (
      target_storage_path is distinct from current_path
      and target_storage_path !~ ('^' || caller_id::text || '/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$')
    )
    or not exists (
      select 1 from storage.objects media
      where media.bucket_id = 'gallery' and media.name = target_storage_path
    ) then
    raise exception 'invalid_gallery_media';
  end if;

  if target_title is not null and char_length(target_title) not between 2 and 120 then
    raise exception 'invalid_title';
  end if;
  if target_caption is not null and char_length(target_caption) > 500 then
    raise exception 'invalid_caption';
  end if;
  if char_length(target_alt_text) not between 5 and 250 then
    raise exception 'invalid_alt_text';
  end if;
  if target_layout not in ('standard', 'wide') or target_sort_order not between 0 and 10000 then
    raise exception 'invalid_layout';
  end if;
  if target_is_published and not target_consent_confirmed then
    raise exception 'consent_required';
  end if;

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
    update public.gallery_items
    set storage_path = target_storage_path,
        title = target_title,
        caption = target_caption,
        alt_text = target_alt_text,
        taken_at = target_taken_at,
        layout = target_layout,
        sort_order = target_sort_order,
        is_published = target_is_published,
        consent_confirmed = target_consent_confirmed,
        updated_by = caller_id
    where id = target_item_id
    returning id into saved_id;

  end if;

  return saved_id;
end;
$$;

create or replace function public.staff_delete_gallery_item(target_item_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_path text;
begin
  if (select auth.uid()) is null or not app_private.is_access_manager() then
    raise exception 'not_authorized';
  end if;

  delete from public.gallery_items
  where id = target_item_id
  returning storage_path into deleted_path;

  if deleted_path is null then raise exception 'gallery_item_not_found'; end if;
  return deleted_path;
end;
$$;

revoke all on table public.gallery_items from anon, authenticated;
grant select on table public.gallery_items to anon, authenticated;
grant select, insert, update, delete on table public.gallery_items to service_role;

revoke all on function public.staff_save_gallery_item(
  uuid, text, text, text, text, date, text, integer, boolean, boolean
) from public, anon;
revoke all on function public.staff_delete_gallery_item(uuid) from public, anon;
grant execute on function public.staff_save_gallery_item(
  uuid, text, text, text, text, date, text, integer, boolean, boolean
) to authenticated;
grant execute on function public.staff_delete_gallery_item(uuid) to authenticated;

-- ============================================================================
-- Migration 20260811010445_avaliacoes_tanita_equipe_tecnica.sql
-- ============================================================================
-- Evolução das avaliações Tanita: acesso da equipe técnica (admin + treinador),
-- arquivo-fonte privado e medidas adicionais para relatório em português.

alter table public.body_assessments
  add column if not exists bone_mass_kg numeric(5,2),
  add column if not exists basal_metabolic_rate integer,
  add column if not exists physique_rating smallint,
  add column if not exists source_path text,
  add column if not exists source_mime_type text;

alter table public.body_assessments
  add constraint body_assessments_bone_mass_check
    check (bone_mass_kg is null or bone_mass_kg between 0.5 and 15),
  add constraint body_assessments_bmr_check
    check (basal_metabolic_rate is null or basal_metabolic_rate between 500 and 10000),
  add constraint body_assessments_physique_rating_check
    check (physique_rating is null or physique_rating between 1 and 9),
  add constraint body_assessments_source_pair_check
    check ((source_path is null) = (source_mime_type is null)),
  add constraint body_assessments_source_path_check
    check (source_path is null or source_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png)$'),
  add constraint body_assessments_source_mime_check
    check (source_mime_type is null or source_mime_type in ('application/pdf', 'image/jpeg', 'image/png'));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'assessment-files',
  'assessment-files',
  false,
  15728640,
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy btr_assessment_files_select_private on storage.objects
  for select to authenticated
  using (
    bucket_id = 'assessment-files'
    and (
      (select app_private.is_access_manager())
      or (storage.foldername(name))[1] = (select auth.uid())::text
    )
  );

create policy btr_assessment_files_insert_staff on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'assessment-files'
    and (select app_private.is_access_manager())
    and name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}\.(pdf|jpg|png)$'
    and exists (
      select 1 from public.profiles athlete
      where athlete.user_id::text = (storage.foldername(name))[1]
        and athlete.role = 'member'
        and athlete.membership_status = 'active'
    )
  );

create policy btr_assessment_files_delete_staff on storage.objects
  for delete to authenticated
  using (bucket_id = 'assessment-files' and (select app_private.is_access_manager()));

create or replace function public.staff_save_body_assessment(
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
  target_bone_mass_kg numeric,
  target_basal_metabolic_rate integer,
  target_physique_rating smallint,
  target_source_path text,
  target_source_mime_type text,
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
  if not app_private.is_access_manager() then
    raise exception 'Acesso restrito à equipe técnica.' using errcode = '42501';
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
    target_metabolic_age, target_bone_mass_kg, target_basal_metabolic_rate,
    target_physique_rating, nullif(btrim(target_notes), '')
  ) = 0 then
    raise exception 'Informe ao menos uma medida ou observação.' using errcode = '22023';
  end if;
  if (target_source_path is null) <> (target_source_mime_type is null) then
    raise exception 'Arquivo de origem inválido.' using errcode = '22023';
  end if;
  if target_source_path is not null and (
    target_source_path !~ ('^' || target_athlete_user_id::text || '/[0-9a-f-]{36}\.(pdf|jpg|png)$')
    or target_source_mime_type not in ('application/pdf', 'image/jpeg', 'image/png')
    or not exists (
      select 1 from storage.objects media
      where media.bucket_id = 'assessment-files' and media.name = target_source_path
    )
  ) then
    raise exception 'Arquivo de origem inválido.' using errcode = '22023';
  end if;

  if target_assessment_id is null then
    insert into public.body_assessments (
      athlete_user_id, assessed_by, assessed_at, weight_kg, body_fat_pct,
      muscle_mass_kg, visceral_fat_level, body_water_pct, bmi, metabolic_age,
      bone_mass_kg, basal_metabolic_rate, physique_rating, source_path,
      source_mime_type, notes
    ) values (
      target_athlete_user_id, (select auth.uid()), target_assessed_at,
      target_weight_kg, target_body_fat_pct, target_muscle_mass_kg,
      target_visceral_fat_level, target_body_water_pct, target_bmi,
      target_metabolic_age, target_bone_mass_kg, target_basal_metabolic_rate,
      target_physique_rating, target_source_path, target_source_mime_type,
      nullif(btrim(target_notes), '')
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
        bone_mass_kg = target_bone_mass_kg,
        basal_metabolic_rate = target_basal_metabolic_rate,
        physique_rating = target_physique_rating,
        source_path = target_source_path,
        source_mime_type = target_source_mime_type,
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

create or replace function public.staff_delete_body_assessment(target_assessment_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  deleted_path text;
begin
  if not app_private.is_access_manager() then
    raise exception 'Acesso restrito à equipe técnica.' using errcode = '42501';
  end if;
  delete from public.body_assessments
  where id = target_assessment_id
  returning source_path into deleted_path;
  if not found then
    raise exception 'Avaliação não encontrada.' using errcode = 'P0002';
  end if;
  return coalesce(deleted_path, '');
end;
$$;

drop policy if exists body_assessments_select_private on public.body_assessments;
create policy body_assessments_select_private on public.body_assessments
  for select to authenticated
  using (
    (select app_private.is_active_member())
    and (
      athlete_user_id = (select auth.uid())
      or (select app_private.is_access_manager())
    )
  );

revoke all on function public.staff_save_body_assessment(
  uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric,
  smallint, numeric, integer, smallint, text, text, text
) from public, anon;
revoke all on function public.staff_delete_body_assessment(uuid) from public, anon;
grant execute on function public.staff_save_body_assessment(
  uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric,
  smallint, numeric, integer, smallint, text, text, text
) to authenticated;
grant execute on function public.staff_delete_body_assessment(uuid) to authenticated;

-- ============================================================================
-- Migration 20260811010500_missoes_niveis_e_resultados.sql
-- ============================================================================
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

-- ============================================================================
-- Migration 20260811010742_consolida_policies_e_remove_rpcs_legados.sql
-- ============================================================================
-- Remove redundância de SELECT e desativa RPCs de avaliação substituídos.

drop policy if exists gallery_items_select_public on public.gallery_items;
drop policy if exists gallery_items_select_staff on public.gallery_items;

create policy gallery_items_select_public on public.gallery_items
  for select to anon
  using (is_published);

create policy gallery_items_select_authenticated on public.gallery_items
  for select to authenticated
  using (is_published or (select app_private.is_access_manager()));

revoke execute on function public.coach_save_body_assessment(
  uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric, smallint, text
) from authenticated;
revoke execute on function public.coach_delete_body_assessment(uuid) from authenticated;


-- ============================================================================
-- Migration 20260811013659_registra_data_real_na_equipe.sql
-- ============================================================================
-- Data real de entrada na equipe para XP de permanência, controlada pela gestão.

alter table public.profiles
  add column if not exists team_joined_at date not null default current_date;

alter table public.profiles
  add constraint profiles_team_joined_at_check
    check (team_joined_at between date '2015-01-01' and current_date);

create or replace function public.staff_set_team_joined_at(
  target_user_id uuid,
  target_team_joined_at date
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_access_manager() then
    raise exception 'Acesso restrito à equipe técnica.' using errcode = '42501';
  end if;
  if target_team_joined_at is null
    or target_team_joined_at < date '2015-01-01'
    or target_team_joined_at > current_date then
    raise exception 'Data de entrada inválida.' using errcode = '22023';
  end if;
  update public.profiles
  set team_joined_at = target_team_joined_at
  where user_id = target_user_id;
  if not found then raise exception 'Perfil não encontrado.' using errcode = 'P0002'; end if;
  return true;
end;
$$;

revoke update (team_joined_at) on public.profiles from authenticated;
revoke all on function public.staff_set_team_joined_at(uuid, date) from public, anon;
grant execute on function public.staff_set_team_joined_at(uuid, date) to authenticated;

-- ============================================================================
-- Migration 20260811162800_corrige_perfil_e_categorias_de_treino.sql
-- ============================================================================

grant select (team_joined_at) on table public.profiles to authenticated;

alter table public.workouts
  add column if not exists training_type text not null default 'easy_moderate';

alter table public.workouts
  drop constraint if exists workouts_training_type_check;
alter table public.workouts
  add constraint workouts_training_type_check check (
    training_type in (
      'rest',
      'continuous',
      'fast_interval',
      'easy_moderate',
      'aerobic_power',
      'competition'
    )
  );

create or replace function public.coach_save_workout(
  target_workout_id uuid,
  target_title text,
  target_description text,
  target_level text,
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
    'rest', 'continuous', 'fast_interval', 'easy_moderate',
    'aerobic_power', 'competition'
  ) then
    raise exception 'Tipo de treino inválido.' using errcode = '22023';
  end if;

  saved_id := public.admin_save_workout(
    target_workout_id, target_title, target_description, target_level,
    target_objective, target_scheduled_date, target_audience,
    target_member_ids, target_group_ids
  );

  update public.workouts
  set training_type = target_training_type
  where id = saved_id;

  return saved_id;
end;
$$;

revoke all on function public.coach_save_workout(
  uuid, text, text, text, text, date, text, uuid[], uuid[], text
) from public, anon;
grant execute on function public.coach_save_workout(
  uuid, text, text, text, text, date, text, uuid[], uuid[], text
) to authenticated;

-- ============================================================================
-- Migration 20260811191007_importa_planilha_treinos_prescritos.sql
-- ============================================================================

create or replace function public.coach_import_workouts(
  target_items jsonb,
  target_level text,
  target_member_ids uuid[],
  target_group_ids uuid[]
)
returns uuid[]
language plpgsql
security definer
set search_path = ''
as $$
declare
  item jsonb;
  imported_ids uuid[] := '{}'::uuid[];
  saved_id uuid;
  item_date date;
begin
  if not app_private.is_coach() then
    raise exception 'Acesso restrito ao treinador.' using errcode = '42501';
  end if;
  if target_level not in ('iniciante', 'intermediario', 'avancado') then
    raise exception 'Nível de treino inválido.' using errcode = '22023';
  end if;
  if jsonb_typeof(target_items) <> 'array'
    or jsonb_array_length(target_items) not between 1 and 62 then
    raise exception 'Envie entre 1 e 62 treinos por importação.' using errcode = '22023';
  end if;

  for item in select value from jsonb_array_elements(target_items)
  loop
    if jsonb_typeof(item) <> 'object'
      or coalesce(item ->> 'scheduled_date', '') !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'A planilha contém um treino inválido.' using errcode = '22023';
    end if;

    begin
      item_date := (item ->> 'scheduled_date')::date;
    exception when others then
      raise exception 'A planilha contém uma data inválida.' using errcode = '22023';
    end;

    saved_id := public.coach_save_workout(
      null,
      item ->> 'title',
      item ->> 'description',
      target_level,
      item ->> 'objective',
      item_date,
      'targeted',
      target_member_ids,
      target_group_ids,
      item ->> 'training_type'
    );
    imported_ids := array_append(imported_ids, saved_id);
  end loop;

  return imported_ids;
end;
$$;

revoke all on function public.coach_import_workouts(
  jsonb, text, uuid[], uuid[]
) from public, anon;
grant execute on function public.coach_import_workouts(
  jsonb, text, uuid[], uuid[]
) to authenticated;

-- Migration 20260811163511_permite_avaliacao_de_todos_perfis_ativos.sql
create or replace function public.staff_save_body_assessment_v2(
  target_assessment_id uuid, target_athlete_user_id uuid, target_assessed_at date,
  target_weight_kg numeric, target_body_fat_pct numeric, target_muscle_mass_kg numeric,
  target_visceral_fat_level numeric, target_body_water_pct numeric, target_bmi numeric,
  target_metabolic_age smallint, target_bone_mass_kg numeric,
  target_basal_metabolic_rate integer, target_physique_rating smallint,
  target_source_path text, target_source_mime_type text, target_notes text
)
returns uuid language plpgsql security definer set search_path = '' as $$
declare saved_id uuid;
begin
  if not app_private.is_access_manager() then raise exception 'Acesso restrito à equipe técnica.' using errcode = '42501'; end if;
  if target_assessed_at is null or target_assessed_at > current_date then raise exception 'A data da avaliação não pode estar no futuro.' using errcode = '22023'; end if;
  if not exists (select 1 from public.profiles p where p.user_id = target_athlete_user_id and p.membership_status = 'active') then raise exception 'Selecione um perfil com acesso ativo.' using errcode = '22023'; end if;
  if num_nonnulls(target_weight_kg, target_body_fat_pct, target_muscle_mass_kg, target_visceral_fat_level, target_body_water_pct, target_bmi, target_metabolic_age, target_bone_mass_kg, target_basal_metabolic_rate, target_physique_rating, nullif(btrim(target_notes), '')) = 0 then raise exception 'Informe ao menos uma medida ou observação.' using errcode = '22023'; end if;
  if (target_source_path is null) <> (target_source_mime_type is null) then raise exception 'Arquivo de origem inválido.' using errcode = '22023'; end if;
  if target_source_path is not null and (target_source_path !~ ('^' || target_athlete_user_id::text || '/[0-9a-f-]{36}\.(pdf|jpg|png)$') or target_source_mime_type not in ('application/pdf', 'image/jpeg', 'image/png') or not exists (select 1 from storage.objects media where media.bucket_id = 'assessment-files' and media.name = target_source_path)) then raise exception 'Arquivo de origem inválido.' using errcode = '22023'; end if;
  if target_assessment_id is null then
    insert into public.body_assessments (athlete_user_id, assessed_by, assessed_at, weight_kg, body_fat_pct, muscle_mass_kg, visceral_fat_level, body_water_pct, bmi, metabolic_age, bone_mass_kg, basal_metabolic_rate, physique_rating, source_path, source_mime_type, notes)
    values (target_athlete_user_id, (select auth.uid()), target_assessed_at, target_weight_kg, target_body_fat_pct, target_muscle_mass_kg, target_visceral_fat_level, target_body_water_pct, target_bmi, target_metabolic_age, target_bone_mass_kg, target_basal_metabolic_rate, target_physique_rating, target_source_path, target_source_mime_type, nullif(btrim(target_notes), '')) returning id into saved_id;
  else
    update public.body_assessments set assessed_at=target_assessed_at, weight_kg=target_weight_kg, body_fat_pct=target_body_fat_pct, muscle_mass_kg=target_muscle_mass_kg, visceral_fat_level=target_visceral_fat_level, body_water_pct=target_body_water_pct, bmi=target_bmi, metabolic_age=target_metabolic_age, bone_mass_kg=target_bone_mass_kg, basal_metabolic_rate=target_basal_metabolic_rate, physique_rating=target_physique_rating, source_path=target_source_path, source_mime_type=target_source_mime_type, notes=nullif(btrim(target_notes), '') where id=target_assessment_id and athlete_user_id=target_athlete_user_id returning id into saved_id;
    if saved_id is null then raise exception 'Avaliação não encontrada para este perfil.' using errcode = 'P0002'; end if;
  end if;
  return saved_id;
end;
$$;
revoke all on function public.staff_save_body_assessment_v2(uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric, smallint, numeric, integer, smallint, text, text, text) from public, anon;
grant execute on function public.staff_save_body_assessment_v2(uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric, smallint, numeric, integer, smallint, text, text, text) to authenticated;

commit;
