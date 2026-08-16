-- Bloco C: gravação de sex/biotype (variante da ilustração anatômica) no save de avaliações.
-- v5 encapsula v4 e persiste as novas colunas com checagem de domínio.

create or replace function public.staff_save_body_assessment_v5(
  target_assessment_id uuid,
  target_athlete_user_id uuid,
  target_assessed_at date,
  target_measurements jsonb,
  target_source_paths text[],
  target_source_mime_types text[],
  target_notes text,
  target_sex text,
  target_biotype text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid;
  sex_value text := nullif(btrim(target_sex), '');
  biotype_value text := nullif(btrim(target_biotype), '');
begin
  if sex_value is not null and sex_value not in ('male', 'female') then
    raise exception 'Sexo invalido para ilustracao.' using errcode = '22023';
  end if;
  if biotype_value is not null and biotype_value not in ('lean', 'mid', 'large') then
    raise exception 'Biotipo invalido para ilustracao.' using errcode = '22023';
  end if;

  saved_id := public.staff_save_body_assessment_v4(
    target_assessment_id,
    target_athlete_user_id,
    target_assessed_at,
    target_measurements,
    target_source_paths,
    target_source_mime_types,
    target_notes
  );

  update public.body_assessments
  set sex = sex_value, biotype = biotype_value
  where id = saved_id;
  return saved_id;
end;
$$;

revoke all on function public.staff_save_body_assessment_v5(
  uuid, uuid, date, jsonb, text[], text[], text, text, text
) from public, anon;
grant execute on function public.staff_save_body_assessment_v5(
  uuid, uuid, date, jsonb, text[], text[], text, text, text
) to authenticated;
