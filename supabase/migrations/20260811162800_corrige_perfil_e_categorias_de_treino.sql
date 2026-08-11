-- Corrige a leitura do perfil após a inclusão de team_joined_at e registra
-- a linguagem visual de treinos definida pelo Prof. Robson Alves.

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
    'rest',
    'continuous',
    'fast_interval',
    'easy_moderate',
    'aerobic_power',
    'competition'
  ) then
    raise exception 'Tipo de treino inválido.' using errcode = '22023';
  end if;

  saved_id := public.admin_save_workout(
    target_workout_id,
    target_title,
    target_description,
    target_level,
    target_objective,
    target_scheduled_date,
    target_audience,
    target_member_ids,
    target_group_ids
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

-- O RPC histórico permanece executável durante o rollout para que a versão
-- atualmente publicada continue salvando treinos até o novo frontend entrar.
