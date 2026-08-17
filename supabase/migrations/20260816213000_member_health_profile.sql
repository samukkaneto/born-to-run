-- Ficha física privada do membro.
-- O sexo é informado pelo próprio membro e serve somente como parâmetro da
-- classificação corporal/ilustração; não é inferido por nome, foto ou IMC.
create table if not exists public.member_health_profiles (
  user_id uuid primary key references public.profiles(user_id) on delete cascade,
  sex text check (sex is null or sex in ('male', 'female')),
  age smallint check (age is null or age between 13 and 120),
  weight_kg numeric(6,2) check (weight_kg is null or weight_kg between 20 and 400),
  height_cm numeric(5,1) check (height_cm is null or height_cm between 100 and 250),
  show_age boolean not null default false,
  show_body_data boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.member_health_profiles is 'Dados físicos informados pelo membro; privados por padrão e usados para personalizar avaliações.';
comment on column public.member_health_profiles.sex is 'Sexo informado pelo membro para parâmetros de composição corporal da Tanita.';
comment on column public.member_health_profiles.show_age is 'Permite exibir a idade em perfis compartilhados.';
comment on column public.member_health_profiles.show_body_data is 'Permite compartilhar peso, altura e sexo com a equipe e no perfil compartilhado.';

alter table public.member_health_profiles enable row level security;

create policy member_health_profiles_select on public.member_health_profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select app_private.is_access_manager())
    or (
      (select app_private.is_coach())
      and show_body_data
    )
  );

create policy member_health_profiles_insert_own on public.member_health_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select app_private.is_active_member())
  );

create policy member_health_profiles_update_own on public.member_health_profiles
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select app_private.is_active_member())
  )
  with check (
    user_id = (select auth.uid())
    and (select app_private.is_active_member())
  );

create trigger member_health_profiles_updated_at
  before update on public.member_health_profiles
  for each row execute function app_private.handle_updated_at();

revoke all on table public.member_health_profiles from anon, authenticated;
grant select, insert, update on table public.member_health_profiles to authenticated;
