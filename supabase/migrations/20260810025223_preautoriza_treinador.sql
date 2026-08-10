-- Convites internos permitem pré-autorizar um papel técnico sem criar senha
-- em nome da pessoa. A confirmação do endereço continua a cargo do Supabase.

create table if not exists app_private.staff_invitations (
  email text primary key,
  role text not null default 'coach',
  created_at timestamptz not null default now(),
  expires_at timestamptz,
  accepted_at timestamptz,
  accepted_user_id uuid references auth.users(id) on delete set null,
  constraint staff_invitations_email_normalized_check
    check (email = lower(btrim(email)) and position('@' in email) > 1),
  constraint staff_invitations_role_check check (role = 'coach'),
  constraint staff_invitations_expiry_check
    check (expires_at is null or expires_at > created_at)
);

revoke all on table app_private.staff_invitations
  from public, anon, authenticated, service_role;

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_full_name text := btrim(coalesce(new.raw_user_meta_data->>'full_name', ''));
  normalized_email text := lower(btrim(coalesce(new.email, '')));
  invited_role text;
  invited_status text := 'pending';
begin
  if length(new_full_name) < 2 or length(new_full_name) > 120 then
    new_full_name := 'Atleta';
  end if;

  select invitation.role
  into invited_role
  from app_private.staff_invitations invitation
  where invitation.email = normalized_email
    and invitation.accepted_at is null
    and (invitation.expires_at is null or invitation.expires_at > now())
  for update;

  if invited_role = 'coach' then
    if exists (select 1 from public.profiles p where p.role = 'coach') then
      raise exception 'Já existe um treinador responsável cadastrado.'
        using errcode = '23505';
    end if;
    invited_status := 'active';
  else
    invited_role := 'member';
  end if;

  insert into public.profiles (
    user_id, full_name, role, membership_status, reviewed_at
  ) values (
    new.id,
    new_full_name,
    invited_role,
    invited_status,
    case when invited_status = 'active' then now() else null end
  )
  on conflict (user_id) do nothing;

  if invited_role = 'coach' then
    update app_private.staff_invitations
    set accepted_at = now(), accepted_user_id = new.id
    where email = normalized_email and accepted_at is null;
  end if;

  return new;
end;
$$;

revoke all on function app_private.handle_new_user()
  from public, anon, authenticated, service_role;
