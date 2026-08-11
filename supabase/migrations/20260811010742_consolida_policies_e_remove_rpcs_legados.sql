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
