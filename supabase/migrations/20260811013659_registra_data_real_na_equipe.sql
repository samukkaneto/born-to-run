-- Data real de entrada na equipe para XP de permanência, controlada pela gestão.

alter table public.profiles
  add column if not exists team_joined_at date not null default current_date;

alter table public.profiles
  add constraint profiles_team_joined_at_check
    check (team_joined_at between date '2015-01-01' and current_date);

create or replace function public.staff_set_team_joined_at(
  target_user_id uuid,
  target_team_joined_at date
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not app_private.is_access_manager() then
    raise exception 'Acesso restrito à equipe técnica.' using errcode = '42501';
  end if;
  if target_team_joined_at is null
    or target_team_joined_at < date '2015-01-01'
    or target_team_joined_at > current_date then
    raise exception 'Data de entrada inválida.' using errcode = '22023';
  end if;
  update public.profiles
  set team_joined_at = target_team_joined_at
  where user_id = target_user_id;
  if not found then raise exception 'Perfil não encontrado.' using errcode = 'P0002'; end if;
  return true;
end;
$$;

revoke update (team_joined_at) on public.profiles from authenticated;
revoke all on function public.staff_set_team_joined_at(uuid, date) from public, anon;
grant execute on function public.staff_set_team_joined_at(uuid, date) to authenticated;
