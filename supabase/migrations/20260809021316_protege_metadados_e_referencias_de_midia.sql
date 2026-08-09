-- Remove metadados administrativos da leitura direta de profiles e exige que
-- referencias de avatar/foto correspondam a objetos existentes no Storage.

-- Membros continuam lendo somente os campos necessários à comunidade. O
-- motivo de bloqueio do próprio usuário é devolvido pelo RPC restrito abaixo.
revoke select on table public.profiles from authenticated;
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

revoke all on function public.get_my_access_profile()
  from public, anon;
grant execute on function public.get_my_access_profile()
  to authenticated;

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

  if tg_op = 'UPDATE' and new.avatar_url is not distinct from old.avatar_url then
    return new;
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

  if tg_op = 'UPDATE' and new.photo_url is not distinct from old.photo_url then
    return new;
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

-- Impede exclusao pela Storage API enquanto o path ainda estiver referenciado.
drop policy if exists btr_avatars_delete_own on storage.objects;
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

drop policy if exists btr_post_images_delete_owner_or_admin on storage.objects;
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

create index if not exists idx_profiles_avatar_url
  on public.profiles(avatar_url)
  where avatar_url is not null;
create index if not exists idx_posts_photo_url
  on public.posts(photo_url)
  where photo_url is not null;

revoke all on function app_private.media_object_exists(text, text, uuid)
  from public, anon, authenticated, service_role;
revoke all on function app_private.enforce_profile_avatar_path()
  from public, anon, authenticated, service_role;
revoke all on function app_private.enforce_post_photo_path()
  from public, anon, authenticated, service_role;
