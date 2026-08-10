create index if not exists idx_staff_invitations_accepted_user
  on app_private.staff_invitations(accepted_user_id)
  where accepted_user_id is not null;
