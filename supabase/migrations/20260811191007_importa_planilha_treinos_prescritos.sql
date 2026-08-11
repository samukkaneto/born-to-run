-- Importação atômica de um mesociclo: somente o treinador ativo pode converter
-- a prévia revisada no navegador em treinos prescritos privados.
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
