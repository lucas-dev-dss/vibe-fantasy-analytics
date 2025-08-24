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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analysis_sessions: {
        Row: {
          analysis_weights: Json
          created_at: string
          id: string
          league_id: string
          recommendations: Json
          team_id: string
        }
        Insert: {
          analysis_weights: Json
          created_at?: string
          id?: string
          league_id: string
          recommendations: Json
          team_id: string
        }
        Update: {
          analysis_weights?: Json
          created_at?: string
          id?: string
          league_id?: string
          recommendations?: Json
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_sessions_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analysis_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      LeagueDataTrial: {
        Row: {
          content: string | null
          created_at: string
          id: number
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: number
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      leagues: {
        Row: {
          created_at: string
          espn_league_id: string
          id: string
          league_name: string
          roster_settings: Json | null
          scoring_type: string
          season_year: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          espn_league_id: string
          id?: string
          league_name: string
          roster_settings?: Json | null
          scoring_type?: string
          season_year: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          espn_league_id?: string
          id?: string
          league_name?: string
          roster_settings?: Json | null
          scoring_type?: string
          season_year?: number
          updated_at?: string
        }
        Relationships: []
      }
      player_projections: {
        Row: {
          ceiling_projection: number
          confidence_interval: Json | null
          created_at: string
          floor_projection: number
          id: string
          league_id: string
          player_id: string
          projected_points: number
          std_deviation: number
          week_number: number
        }
        Insert: {
          ceiling_projection: number
          confidence_interval?: Json | null
          created_at?: string
          floor_projection: number
          id?: string
          league_id: string
          player_id: string
          projected_points: number
          std_deviation: number
          week_number: number
        }
        Update: {
          ceiling_projection?: number
          confidence_interval?: Json | null
          created_at?: string
          floor_projection?: number
          id?: string
          league_id?: string
          player_id?: string
          projected_points?: number
          std_deviation?: number
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "player_projections_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_projections_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          advanced_stats: Json | null
          bye_week: number | null
          created_at: string
          espn_player_id: number
          expert_rankings: Json | null
          id: string
          injury_status: string | null
          nfl_team: string | null
          ownership_pct: number | null
          player_name: string
          position: string
          season_projections: Json | null
          updated_at: string
          weekly_projections: Json | null
        }
        Insert: {
          advanced_stats?: Json | null
          bye_week?: number | null
          created_at?: string
          espn_player_id: number
          expert_rankings?: Json | null
          id?: string
          injury_status?: string | null
          nfl_team?: string | null
          ownership_pct?: number | null
          player_name: string
          position: string
          season_projections?: Json | null
          updated_at?: string
          weekly_projections?: Json | null
        }
        Update: {
          advanced_stats?: Json | null
          bye_week?: number | null
          created_at?: string
          espn_player_id?: number
          expert_rankings?: Json | null
          id?: string
          injury_status?: string | null
          nfl_team?: string | null
          ownership_pct?: number | null
          player_name?: string
          position?: string
          season_projections?: Json | null
          updated_at?: string
          weekly_projections?: Json | null
        }
        Relationships: []
      }
      teams: {
        Row: {
          created_at: string
          espn_team_id: number
          id: string
          league_id: string
          owner_name: string | null
          roster_data: Json | null
          team_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          espn_team_id: number
          id?: string
          league_id: string
          owner_name?: string | null
          roster_data?: Json | null
          team_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          espn_team_id?: number
          id?: string
          league_id?: string
          owner_name?: string | null
          roster_data?: Json | null
          team_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
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
