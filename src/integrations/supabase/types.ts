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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean
          receiver_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean
          receiver_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      help_messages: {
        Row: {
          created_at: string
          id: string
          is_from_organizer: boolean
          message: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_from_organizer?: boolean
          message: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_from_organizer?: boolean
          message?: string
          user_id?: string
        }
        Relationships: []
      }
      match_actions: {
        Row: {
          created_at: string
          id: string
          matched_user_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          matched_user_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          matched_user_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      matches: {
        Row: {
          ai_summary: string | null
          complementarity_score: number
          created_at: string
          id: string
          match_reasons: Json | null
          matched_user_id: string
          meeting_value_score: number
          overall_score: number
          strategic_alignment_score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_summary?: string | null
          complementarity_score?: number
          created_at?: string
          id?: string
          match_reasons?: Json | null
          matched_user_id: string
          meeting_value_score?: number
          overall_score?: number
          strategic_alignment_score?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_summary?: string | null
          complementarity_score?: number
          created_at?: string
          id?: string
          match_reasons?: Json | null
          matched_user_id?: string
          meeting_value_score?: number
          overall_score?: number
          strategic_alignment_score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profile_analyses: {
        Row: {
          analyzed_at: string
          content_tags: string[] | null
          embedding_text: string | null
          execution_compatibility: string | null
          id: string
          intent_vector: Json | null
          power_map: Json | null
          trend_alignment: string | null
          user_id: string
        }
        Insert: {
          analyzed_at?: string
          content_tags?: string[] | null
          embedding_text?: string | null
          execution_compatibility?: string | null
          id?: string
          intent_vector?: Json | null
          power_map?: Json | null
          trend_alignment?: string | null
          user_id: string
        }
        Update: {
          analyzed_at?: string
          content_tags?: string[] | null
          embedding_text?: string | null
          execution_compatibility?: string | null
          id?: string
          intent_vector?: Json | null
          power_map?: Json | null
          trend_alignment?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          adjacent_domains: string[] | null
          asymmetric_opportunity: string | null
          avatar_url: string | null
          bio: string | null
          capital_leverage: string[] | null
          company: string | null
          counterparty_stage: string | null
          counterparty_types: string[] | null
          created_at: string
          full_name: string | null
          hard_constraints: string | null
          id: string
          interests: string[] | null
          investment_thesis: string | null
          job_title: string | null
          linkedin_url: string | null
          looking_for: string | null
          onboarding_complete: boolean
          primary_interest: string | null
          strategic_outcomes: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          adjacent_domains?: string[] | null
          asymmetric_opportunity?: string | null
          avatar_url?: string | null
          bio?: string | null
          capital_leverage?: string[] | null
          company?: string | null
          counterparty_stage?: string | null
          counterparty_types?: string[] | null
          created_at?: string
          full_name?: string | null
          hard_constraints?: string | null
          id?: string
          interests?: string[] | null
          investment_thesis?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          looking_for?: string | null
          onboarding_complete?: boolean
          primary_interest?: string | null
          strategic_outcomes?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          adjacent_domains?: string[] | null
          asymmetric_opportunity?: string | null
          avatar_url?: string | null
          bio?: string | null
          capital_leverage?: string[] | null
          company?: string | null
          counterparty_stage?: string | null
          counterparty_types?: string[] | null
          created_at?: string
          full_name?: string | null
          hard_constraints?: string | null
          id?: string
          interests?: string[] | null
          investment_thesis?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          looking_for?: string | null
          onboarding_complete?: boolean
          primary_interest?: string | null
          strategic_outcomes?: string[] | null
          updated_at?: string
          user_id?: string
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
