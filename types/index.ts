import type { Tables } from '@/types/database.types'
import type { TrainingType } from '@/lib/workouts/training-types'

export type UserRole = 'member' | 'coach' | 'admin'
export type MembershipStatus = 'pending' | 'active' | 'suspended' | 'rejected'
export type Profile = Omit<Tables<'profiles'>, 'role' | 'membership_status'> & {
  role: UserRole
  membership_status: MembershipStatus
}
export type MemberProfile = Pick<
  Profile,
  | 'id'
  | 'user_id'
  | 'full_name'
  | 'avatar_url'
  | 'bio'
  | 'cidade'
  | 'role'
  | 'membership_status'
  | 'team_joined_at'
  | 'created_at'
  | 'updated_at'
>
export type PublicProfile = Pick<
  Profile,
  'id' | 'user_id' | 'full_name' | 'avatar_url' | 'role'
>
export type Post = Tables<'posts'> & {
  profiles?: PublicProfile
  likes_count?: number
  comments_count?: number
  user_has_liked?: boolean
}
export type Comment = Tables<'comments'> & {
  profiles?: Pick<PublicProfile, 'id' | 'user_id' | 'full_name' | 'avatar_url'>
}
export type Like = Tables<'likes'>
export type Workout = Omit<Tables<'workouts'>, 'level' | 'audience' | 'training_type'> & {
  level: 'iniciante' | 'intermediario' | 'avancado'
  audience: 'team' | 'targeted'
  training_type: TrainingType
}
export type Announcement = Tables<'announcements'> & { profiles?: Profile }
export type TrainingGroup = Tables<'training_groups'>
export type TrainingGroupMember = Tables<'training_group_members'>
export type WorkoutAssignment = Tables<'workout_assignments'>
export type BodyAssessment = Tables<'body_assessments'>
export type GalleryItem = Tables<'gallery_items'>
export type Mission = Tables<'mission_catalog'>
export type RaceResult = Tables<'race_results'>

export type WorkoutWithAssignments = Workout & {
  workout_assignments?: Pick<
    WorkoutAssignment,
    'athlete_user_id' | 'group_id'
  >[]
}

export type TrainingGroupWithMembers = TrainingGroup & {
  training_group_members?: Pick<TrainingGroupMember, 'user_id'>[]
}
