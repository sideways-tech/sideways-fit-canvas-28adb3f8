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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          aesthetics_interest: number | null
          aesthetics_process_note: string | null
          articulation_skill: number | null
          background_notes: string | null
          candidate_id: string
          created_at: string
          cv_file_path: string | null
          depth_of_craft: number | null
          depth_score: number | null
          depth_topic: string | null
          diagnostic_level: string | null
          honesty_level: string | null
          id: string
          interested_in_others: number | null
          interests_passions_notes: string | null
          interviewer_name: string
          mindset_score: number | null
          motivation_level: string | null
          motivation_reason: string | null
          overall_score: number | null
          person_score: number | null
          portfolio_quality: number | null
          problem_solving_approach: number | null
          professional_breadth: number | null
          professional_dive_notes: string | null
          professional_score: number | null
          reads_widely: number | null
          recent_read_example: string | null
          resilience_score: number | null
          round_number: number
          sideways_motivation_level: string | null
          sideways_motivation_reason: string | null
          sideways_website_feedback: string | null
          updated_at: string
          verdict: string | null
        }
        Insert: {
          aesthetics_interest?: number | null
          aesthetics_process_note?: string | null
          articulation_skill?: number | null
          background_notes?: string | null
          candidate_id: string
          created_at?: string
          cv_file_path?: string | null
          depth_of_craft?: number | null
          depth_score?: number | null
          depth_topic?: string | null
          diagnostic_level?: string | null
          honesty_level?: string | null
          id?: string
          interested_in_others?: number | null
          interests_passions_notes?: string | null
          interviewer_name: string
          mindset_score?: number | null
          motivation_level?: string | null
          motivation_reason?: string | null
          overall_score?: number | null
          person_score?: number | null
          portfolio_quality?: number | null
          problem_solving_approach?: number | null
          professional_breadth?: number | null
          professional_dive_notes?: string | null
          professional_score?: number | null
          reads_widely?: number | null
          recent_read_example?: string | null
          resilience_score?: number | null
          round_number?: number
          sideways_motivation_level?: string | null
          sideways_motivation_reason?: string | null
          sideways_website_feedback?: string | null
          updated_at?: string
          verdict?: string | null
        }
        Update: {
          aesthetics_interest?: number | null
          aesthetics_process_note?: string | null
          articulation_skill?: number | null
          background_notes?: string | null
          candidate_id?: string
          created_at?: string
          cv_file_path?: string | null
          depth_of_craft?: number | null
          depth_score?: number | null
          depth_topic?: string | null
          diagnostic_level?: string | null
          honesty_level?: string | null
          id?: string
          interested_in_others?: number | null
          interests_passions_notes?: string | null
          interviewer_name?: string
          mindset_score?: number | null
          motivation_level?: string | null
          motivation_reason?: string | null
          overall_score?: number | null
          person_score?: number | null
          portfolio_quality?: number | null
          problem_solving_approach?: number | null
          professional_breadth?: number | null
          professional_dive_notes?: string | null
          professional_score?: number | null
          reads_widely?: number | null
          recent_read_example?: string | null
          resilience_score?: number | null
          round_number?: number
          sideways_motivation_level?: string | null
          sideways_motivation_reason?: string | null
          sideways_website_feedback?: string | null
          updated_at?: string
          verdict?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidates"
            referencedColumns: ["id"]
          },
        ]
      }
      candidates: {
        Row: {
          created_at: string
          department: string | null
          education: string | null
          email: string | null
          hiring_level: string | null
          id: string
          name: string
          role: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          department?: string | null
          education?: string | null
          email?: string | null
          hiring_level?: string | null
          id?: string
          name: string
          role?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          department?: string | null
          education?: string | null
          email?: string | null
          hiring_level?: string | null
          id?: string
          name?: string
          role?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
