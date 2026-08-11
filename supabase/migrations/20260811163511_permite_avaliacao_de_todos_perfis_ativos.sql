-- Administrador e treinador também são atletas/perfis da equipe. Esta versão
-- permite que qualquer perfil ativo receba uma avaliação, sem ampliar quem
-- pode criar ou editar: somente a equipe técnica continua autorizada.

create or replace function public.staff_save_body_assessment_v2(
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
      and p.membership_status = 'active'
  ) then
    raise exception 'Selecione um perfil com acesso ativo.' using errcode = '22023';
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
      raise exception 'Avaliação não encontrada para este perfil.' using errcode = 'P0002';
    end if;
  end if;

  return saved_id;
end;
$$;

revoke all on function public.staff_save_body_assessment_v2(
  uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric,
  smallint, numeric, integer, smallint, text, text, text
) from public, anon;
grant execute on function public.staff_save_body_assessment_v2(
  uuid, uuid, date, numeric, numeric, numeric, numeric, numeric, numeric,
  smallint, numeric, integer, smallint, text, text, text
) to authenticated;
