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
