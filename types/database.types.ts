export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_creator_profile_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      body_assessments: {
        Row: {
          assessed_at: string
          assessed_by: string
          athlete_user_id: string
          basal_metabolic_rate: number | null
          bmi: number | null
          body_fat_pct: number | null
          body_water_pct: number | null
          bone_mass_kg: number | null
          created_at: string
          id: string
          metabolic_age: number | null
          muscle_mass_kg: number | null
          notes: string | null
          physique_rating: number | null
          source_mime_type: string | null
          source_path: string | null
          updated_at: string
          visceral_fat_level: number | null
          weight_kg: number | null
        }
        Insert: {
          assessed_at?: string
          assessed_by: string
          athlete_user_id: string
          basal_metabolic_rate?: number | null
          bmi?: number | null
          body_fat_pct?: number | null
          body_water_pct?: number | null
          bone_mass_kg?: number | null
          created_at?: string
          id?: string
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          physique_rating?: number | null
          source_mime_type?: string | null
          source_path?: string | null
          updated_at?: string
          visceral_fat_level?: number | null
          weight_kg?: number | null
        }
        Update: {
          assessed_at?: string
          assessed_by?: string
          athlete_user_id?: string
          basal_metabolic_rate?: number | null
          bmi?: number | null
          body_fat_pct?: number | null
          body_water_pct?: number | null
          bone_mass_kg?: number | null
          created_at?: string
          id?: string
          metabolic_age?: number | null
          muscle_mass_kg?: number | null
          notes?: string | null
          physique_rating?: number | null
          source_mime_type?: string | null
          source_path?: string | null
          updated_at?: string
          visceral_fat_level?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "body_assessments_assessor_profile_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "body_assessments_athlete_profile_fkey"
            columns: ["athlete_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      gallery_items: {
        Row: {
          alt_text: string
          caption: string | null
          consent_confirmed: boolean
          created_at: string
          created_by: string
          id: string
          is_published: boolean
          layout: string
          sort_order: number
          storage_path: string
          taken_at: string | null
          title: string | null
          updated_at: string
          updated_by: string
        }
        Insert: {
          alt_text: string
          caption?: string | null
          consent_confirmed?: boolean
          created_at?: string
          created_by: string
          id?: string
          is_published?: boolean
          layout?: string
          sort_order?: number
          storage_path: string
          taken_at?: string | null
          title?: string | null
          updated_at?: string
          updated_by: string
        }
        Update: {
          alt_text?: string
          caption?: string | null
          consent_confirmed?: boolean
          created_at?: string
          created_by?: string
          id?: string
          is_published?: boolean
          layout?: string
          sort_order?: number
          storage_path?: string
          taken_at?: string | null
          title?: string | null
          updated_at?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_items_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "gallery_items_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      mission_catalog: {
        Row: {
          category: string
          code: string
          description: string
          distance_km: number | null
          icon_key: string
          is_active: boolean
          max_pace_seconds: number | null
          points: number
          sort_order: number
          tier: string
          title: string
        }
        Insert: {
          category: string
          code: string
          description: string
          distance_km?: number | null
          icon_key: string
          is_active?: boolean
          max_pace_seconds?: number | null
          points: number
          sort_order: number
          tier: string
          title: string
        }
        Update: {
          category?: string
          code?: string
          description?: string
          distance_km?: number | null
          icon_key?: string
          is_active?: boolean
          max_pace_seconds?: number | null
          points?: number
          sort_order?: number
          tier?: string
          title?: string
        }
        Relationships: []
      }
      personal_goals: {
        Row: {
          created_at: string
          goal: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          goal: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          goal?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "personal_goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      posts: {
        Row: {
          caption: string | null
          created_at: string
          distance_km: number | null
          duration_minutes: number | null
          id: string
          pace: string | null
          photo_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          pace?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          distance_km?: number | null
          duration_minutes?: number | null
          id?: string
          pace?: string | null
          photo_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          cidade: string | null
          created_at: string
          full_name: string
          id: string
          membership_status: string
          objetivo: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          role: string
          status_note: string | null
          team_joined_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          full_name?: string
          id?: string
          membership_status?: string
          objetivo?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          status_note?: string | null
          team_joined_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          cidade?: string | null
          created_at?: string
          full_name?: string
          id?: string
          membership_status?: string
          objetivo?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          role?: string
          status_note?: string | null
          team_joined_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      race_results: {
        Row: {
          achievement_kind: string
          athlete_user_id: string
          category_label: string | null
          created_at: string
          distance_km: number
          duration_seconds: number | null
          event_date: string
          event_name: string
          id: string
          is_featured: boolean
          notes: string | null
          placement: number | null
          updated_at: string
        }
        Insert: {
          achievement_kind?: string
          athlete_user_id: string
          category_label?: string | null
          created_at?: string
          distance_km: number
          duration_seconds?: number | null
          event_date: string
          event_name: string
          id?: string
          is_featured?: boolean
          notes?: string | null
          placement?: number | null
          updated_at?: string
        }
        Update: {
          achievement_kind?: string
          athlete_user_id?: string
          category_label?: string | null
          created_at?: string
          distance_km?: number
          duration_seconds?: number | null
          event_date?: string
          event_name?: string
          id?: string
          is_featured?: boolean
          notes?: string | null
          placement?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_results_athlete_user_id_fkey"
            columns: ["athlete_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      training_group_members: {
        Row: {
          added_by: string
          created_at: string
          group_id: string
          user_id: string
        }
        Insert: {
          added_by: string
          created_at?: string
          group_id: string
          user_id: string
        }
        Update: {
          added_by?: string
          created_at?: string
          group_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_group_members_added_by_profile_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "training_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "training_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_group_members_user_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      training_groups: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_groups_creator_profile_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      workout_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string
          athlete_user_id: string | null
          group_id: string | null
          id: string
          workout_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by: string
          athlete_user_id?: string | null
          group_id?: string | null
          id?: string
          workout_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string
          athlete_user_id?: string | null
          group_id?: string | null
          id?: string
          workout_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_assignments_assigned_by_profile_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workout_assignments_athlete_profile_fkey"
            columns: ["athlete_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "workout_assignments_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "training_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_assignments_workout_id_fkey"
            columns: ["workout_id"]
            isOneToOne: false
            referencedRelation: "workouts"
            referencedColumns: ["id"]
          },
        ]
      }
      workouts: {
        Row: {
          audience: string
          created_at: string
          created_by: string
          description: string
          id: string
          level: string
          objective: string
          scheduled_date: string | null
          title: string
          training_type: string
          updated_at: string
        }
        Insert: {
          audience?: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          level?: string
          objective: string
          scheduled_date?: string | null
          title: string
          training_type?: string
          updated_at?: string
        }
        Update: {
          audience?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          level?: string
          objective?: string
          scheduled_date?: string | null
          title?: string
          training_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workouts_creator_profile_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_archive_training_group: {
        Args: { target_group_id: string }
        Returns: boolean
      }
      admin_save_training_group: {
        Args: {
          target_description: string
          target_group_id: string
          target_member_ids: string[]
          target_name: string
        }
        Returns: string
      }
      admin_save_workout: {
        Args: {
          target_audience: string
          target_description: string
          target_group_ids: string[]
          target_level: string
          target_member_ids: string[]
          target_objective: string
          target_scheduled_date: string
          target_title: string
          target_workout_id: string
        }
        Returns: string
      }
      admin_set_member_role: {
        Args: { target_role: string; target_user_id: string }
        Returns: boolean
      }
      admin_set_membership_status: {
        Args: {
          target_note: string
          target_status: string
          target_user_id: string
        }
        Returns: boolean
      }
      coach_delete_body_assessment: {
        Args: { target_assessment_id: string }
        Returns: boolean
      }
      coach_import_workouts: {
        Args: {
          target_group_ids: string[]
          target_items: Json
          target_level: string
          target_member_ids: string[]
        }
        Returns: string[]
      }
      coach_save_body_assessment: {
        Args: {
          target_assessed_at: string
          target_assessment_id: string
          target_athlete_user_id: string
          target_bmi: number
          target_body_fat_pct: number
          target_body_water_pct: number
          target_metabolic_age: number
          target_muscle_mass_kg: number
          target_notes: string
          target_visceral_fat_level: number
          target_weight_kg: number
        }
        Returns: string
      }
      coach_save_workout: {
        Args: {
          target_audience: string
          target_description: string
          target_group_ids: string[]
          target_level: string
          target_member_ids: string[]
          target_objective: string
          target_scheduled_date: string
          target_title: string
          target_training_type: string
          target_workout_id: string
        }
        Returns: string
      }
      get_my_access_profile: {
        Args: never
        Returns: {
          avatar_url: string
          full_name: string
          membership_status: string
          role: string
          status_note: string
          user_id: string
        }[]
      }
      staff_delete_body_assessment: {
        Args: { target_assessment_id: string }
        Returns: string
      }
      staff_delete_gallery_item: {
        Args: { target_item_id: string }
        Returns: string
      }
      staff_save_body_assessment: {
        Args: {
          target_assessed_at: string
          target_assessment_id: string
          target_athlete_user_id: string
          target_basal_metabolic_rate: number
          target_bmi: number
          target_body_fat_pct: number
          target_body_water_pct: number
          target_bone_mass_kg: number
          target_metabolic_age: number
          target_muscle_mass_kg: number
          target_notes: string
          target_physique_rating: number
          target_source_mime_type: string
          target_source_path: string
          target_visceral_fat_level: number
          target_weight_kg: number
        }
        Returns: string
      }
      staff_save_body_assessment_v2: {
        Args: {
          target_assessed_at: string
          target_assessment_id: string
          target_athlete_user_id: string
          target_basal_metabolic_rate: number
          target_bmi: number
          target_body_fat_pct: number
          target_body_water_pct: number
          target_bone_mass_kg: number
          target_metabolic_age: number
          target_muscle_mass_kg: number
          target_notes: string
          target_physique_rating: number
          target_source_mime_type: string
          target_source_path: string
          target_visceral_fat_level: number
          target_weight_kg: number
        }
        Returns: string
      }
      staff_save_gallery_item: {
        Args: {
          target_alt_text: string
          target_caption: string
          target_consent_confirmed: boolean
          target_is_published: boolean
          target_item_id: string
          target_layout: string
          target_sort_order: number
          target_storage_path: string
          target_taken_at: string
          target_title: string
        }
        Returns: string
      }
      staff_set_team_joined_at: {
        Args: { target_team_joined_at: string; target_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
