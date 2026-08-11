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
