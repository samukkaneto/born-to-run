import 'server-only'

export const MEMBER_PROFILE_COLUMNS = [
  'id',
  'user_id',
  'full_name',
  'avatar_url',
  'bio',
  'cidade',
  'objetivo',
  'role',
  'membership_status',
  'created_at',
  'updated_at',
].join(', ') as 'id, user_id, full_name, avatar_url, bio, cidade, objetivo, role, membership_status, created_at, updated_at'
