import 'server-only'

export const MEMBER_PROFILE_COLUMNS = [
  'id',
  'user_id',
  'full_name',
  'avatar_url',
  'bio',
  'cidade',
  'role',
  'membership_status',
  'team_joined_at',
  'created_at',
  'updated_at',
].join(', ') as 'id, user_id, full_name, avatar_url, bio, cidade, role, membership_status, team_joined_at, created_at, updated_at'
