alter table public.body_assessments
  add column body_fat_category text,
  add constraint body_assessments_body_fat_category_check check (
    body_fat_category is null
    or body_fat_category in ('underfat', 'healthy', 'overfat', 'obese')
  );

create or replace function public.staff_save_body_assessment_v4(
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
  fat_category text := nullif(btrim(target_measurements ->> 'body_fat_category'), '');
begin
  if not app_private.is_access_manager() then
    raise exception 'Acesso restrito a equipe tecnica.' using errcode = '42501';
  end if;
  if fat_category is not null and fat_category not in ('underfat', 'healthy', 'overfat', 'obese') then
    raise exception 'Faixa de gordura corporal invalida.' using errcode = '22023';
  end if;

  saved_id := public.staff_save_body_assessment_v3(
    target_assessment_id,
    target_athlete_user_id,
    target_assessed_at,
    target_measurements,
    target_source_paths,
    target_source_mime_types,
    target_notes
  );

  update public.body_assessments
  set body_fat_category = fat_category
  where id = saved_id;
  return saved_id;
end;
$$;

revoke all on function public.staff_save_body_assessment_v4(
  uuid, uuid, date, jsonb, text[], text[], text
) from public, anon;
grant execute on function public.staff_save_body_assessment_v4(
  uuid, uuid, date, jsonb, text[], text[], text
) to authenticated;
