-- Restringe mutacoes administrativas aos RPCs atomicos e impede que
-- referencias de midia apontem para a pasta de outro integrante.

-- A exclusao de workouts permanece direta porque a Server Action atual usa
-- DELETE e as FKs cuidam da remocao atomica das atribuicoes.
revoke insert, update on table public.workouts from authenticated;
revoke insert, update, delete on table public.training_groups from authenticated;
revoke insert, delete on table public.training_group_members from authenticated;
revoke insert, delete on table public.workout_assignments from authenticated;

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

create or replace function app_private.enforce_profile_avatar_path()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.avatar_url is null
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.avatar_url is not distinct from old.avatar_url then
      return new;
    end if;
  end if;

  if (select auth.uid()) is null
    or new.user_id <> (select auth.uid())
    or not app_private.is_owned_media_path(new.avatar_url, new.user_id) then
    raise exception 'O avatar deve pertencer a pasta de midia do proprio usuario.'
      using errcode = '42501';
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
begin
  if new.photo_url is null
    or coalesce((select auth.jwt() ->> 'role'), '') = 'service_role' then
    return new;
  end if;

  if tg_op = 'UPDATE' then
    if new.photo_url is not distinct from old.photo_url then
      return new;
    end if;
  end if;

  if (select auth.uid()) is null
    or new.user_id <> (select auth.uid())
    or not app_private.is_owned_media_path(new.photo_url, new.user_id) then
    raise exception 'A foto deve pertencer a pasta de midia do autor da publicacao.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_profiles_validate_avatar_path on public.profiles;
create trigger trg_profiles_validate_avatar_path
  before insert or update of avatar_url, user_id on public.profiles
  for each row execute function app_private.enforce_profile_avatar_path();

drop trigger if exists trg_posts_validate_photo_path on public.posts;
create trigger trg_posts_validate_photo_path
  before insert or update of photo_url, user_id on public.posts
  for each row execute function app_private.enforce_post_photo_path();

-- Funcoes de trigger nao fazem parte da API publica. O executor do trigger
-- continua podendo chama-las, mas clientes da Data API nao.
revoke all on function app_private.is_owned_media_path(text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function app_private.enforce_profile_avatar_path()
  from public, anon, authenticated, service_role;
revoke all on function app_private.enforce_post_photo_path()
  from public, anon, authenticated, service_role;
