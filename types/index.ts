// Tipos globais do projeto Born to Run

export type UserRole = 'member' | 'admin'

export interface Profile {
  id: string
  user_id: string
  full_name: string
  avatar_url: string | null
  bio: string | null
  cidade: string | null
  objetivo: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  user_id: string
  caption: string | null
  photo_url: string | null
  distance_km: number | null
  duration_minutes: number | null
  pace: string | null
  created_at: string
  profiles?: Profile
  likes_count?: number
  comments_count?: number
  user_has_liked?: boolean
}

export interface Comment {
  id: string
  post_id: string
  user_id: string
  content: string
  created_at: string
  profiles?: Profile
}

export interface Like {
  id: string
  post_id: string
  user_id: string
  created_at: string
}

export interface Workout {
  id: string
  title: string
  description: string
  level: 'iniciante' | 'intermediario' | 'avancado'
  objective: string
  scheduled_date: string | null
  created_by: string
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  created_by: string
  created_at: string
  profiles?: Profile
}
