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
      draft_picks: {
        Row: {
          created_at: string
          draft_id: string
          id: string
          league_id: string
          metadata: Json | null
          pick_no: number
          picked_by: string | null
          roster_id: number | null
          round: number
          sleeper_player_id: string | null
        }
        Insert: {
          created_at?: string
          draft_id: string
          id?: string
          league_id: string
          metadata?: Json | null
          pick_no: number
          picked_by?: string | null
          roster_id?: number | null
          round: number
          sleeper_player_id?: string | null
        }
        Update: {
          created_at?: string
          draft_id?: string
          id?: string
          league_id?: string
          metadata?: Json | null
          pick_no?: number
          picked_by?: string | null
          roster_id?: number | null
          round?: number
          sleeper_player_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "sleeper_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_matchups: {
        Row: {
          created_at: string
          id: string
          league_id: string
          matchup_id: number | null
          players: string[] | null
          players_points: Json | null
          points: number | null
          roster_id: number
          starters: string[] | null
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          league_id: string
          matchup_id?: number | null
          players?: string[] | null
          players_points?: Json | null
          points?: number | null
          roster_id: number
          starters?: string[] | null
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          league_id?: string
          matchup_id?: number | null
          players?: string[] | null
          players_points?: Json | null
          points?: number | null
          roster_id?: number
          starters?: string[] | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "league_matchups_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "sleeper_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_transactions: {
        Row: {
          adds: Json | null
          created_at: string
          draft_picks: string[] | null
          drops: Json | null
          id: string
          league_id: string
          metadata: Json | null
          roster_ids: number[] | null
          transaction_id: string
          transaction_type: string
          waiver_budget: Json | null
          week_number: number | null
        }
        Insert: {
          adds?: Json | null
          created_at?: string
          draft_picks?: string[] | null
          drops?: Json | null
          id?: string
          league_id: string
          metadata?: Json | null
          roster_ids?: number[] | null
          transaction_id: string
          transaction_type: string
          waiver_budget?: Json | null
          week_number?: number | null
        }
        Update: {
          adds?: Json | null
          created_at?: string
          draft_picks?: string[] | null
          drops?: Json | null
          id?: string
          league_id?: string
          metadata?: Json | null
          roster_ids?: number[] | null
          transaction_id?: string
          transaction_type?: string
          waiver_budget?: Json | null
          week_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "league_transactions_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "sleeper_leagues"
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
      player_projections_data: {
        Row: {
          created_at: string
          id: string
          projected_fantasy_points: number | null
          projections: Json
          season_type: string
          season_year: number
          sleeper_player_id: string
          updated_at: string
          week_number: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          projected_fantasy_points?: number | null
          projections?: Json
          season_type?: string
          season_year?: number
          sleeper_player_id: string
          updated_at?: string
          week_number?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          projected_fantasy_points?: number | null
          projections?: Json
          season_type?: string
          season_year?: number
          sleeper_player_id?: string
          updated_at?: string
          week_number?: number | null
        }
        Relationships: []
      }
      player_stats: {
        Row: {
          created_at: string
          id: string
          league_id: string
          player_id: string
          points_scored: number | null
          projected_points: number | null
          season_year: number
          stats_data: Json | null
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          league_id: string
          player_id: string
          points_scored?: number | null
          projected_points?: number | null
          season_year?: number
          stats_data?: Json | null
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          league_id?: string
          player_id?: string
          points_scored?: number | null
          projected_points?: number | null
          season_year?: number
          stats_data?: Json | null
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_player_stats_league"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "sleeper_leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_player_stats_player"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "sleeper_players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_weekly_stats: {
        Row: {
          created_at: string
          fantasy_points: number | null
          id: string
          season_type: string
          season_year: number
          sleeper_player_id: string
          stats_data: Json
          week_number: number
        }
        Insert: {
          created_at?: string
          fantasy_points?: number | null
          id?: string
          season_type?: string
          season_year?: number
          sleeper_player_id: string
          stats_data?: Json
          week_number: number
        }
        Update: {
          created_at?: string
          fantasy_points?: number | null
          id?: string
          season_type?: string
          season_year?: number
          sleeper_player_id?: string
          stats_data?: Json
          week_number?: number
        }
        Relationships: []
      }
      sleeper_leagues: {
        Row: {
          created_at: string
          draft_id: string | null
          id: string
          league_name: string
          league_type: string | null
          metadata: Json | null
          previous_league_id: string | null
          roster_positions: Json
          scoring_settings: Json
          season_year: number
          settings: Json | null
          sleeper_league_id: string
          sport: string | null
          status: string | null
          total_rosters: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          draft_id?: string | null
          id?: string
          league_name: string
          league_type?: string | null
          metadata?: Json | null
          previous_league_id?: string | null
          roster_positions?: Json
          scoring_settings?: Json
          season_year?: number
          settings?: Json | null
          sleeper_league_id: string
          sport?: string | null
          status?: string | null
          total_rosters?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          draft_id?: string | null
          id?: string
          league_name?: string
          league_type?: string | null
          metadata?: Json | null
          previous_league_id?: string | null
          roster_positions?: Json
          scoring_settings?: Json
          season_year?: number
          settings?: Json | null
          sleeper_league_id?: string
          sport?: string | null
          status?: string | null
          total_rosters?: number
          updated_at?: string
        }
        Relationships: []
      }
      sleeper_players: {
        Row: {
          age: number | null
          created_at: string
          fantasy_positions: string[] | null
          id: string
          injury_status: string | null
          nfl_team: string | null
          player_name: string
          position: string
          sleeper_player_id: string
          updated_at: string
          years_exp: number | null
        }
        Insert: {
          age?: number | null
          created_at?: string
          fantasy_positions?: string[] | null
          id?: string
          injury_status?: string | null
          nfl_team?: string | null
          player_name: string
          position: string
          sleeper_player_id: string
          updated_at?: string
          years_exp?: number | null
        }
        Update: {
          age?: number | null
          created_at?: string
          fantasy_positions?: string[] | null
          id?: string
          injury_status?: string | null
          nfl_team?: string | null
          player_name?: string
          position?: string
          sleeper_player_id?: string
          updated_at?: string
          years_exp?: number | null
        }
        Relationships: []
      }
      sleeper_rosters: {
        Row: {
          co_owners: string[] | null
          created_at: string
          display_name: string | null
          fpts: number | null
          fpts_against: number | null
          id: string
          keepers: string[] | null
          league_id: string
          losses: number | null
          metadata: Json | null
          owner_id: string | null
          player_ids: string[] | null
          reserve: string[] | null
          roster_id: number
          starters: string[] | null
          taxi: string[] | null
          team_name: string | null
          ties: number | null
          updated_at: string
          wins: number | null
        }
        Insert: {
          co_owners?: string[] | null
          created_at?: string
          display_name?: string | null
          fpts?: number | null
          fpts_against?: number | null
          id?: string
          keepers?: string[] | null
          league_id: string
          losses?: number | null
          metadata?: Json | null
          owner_id?: string | null
          player_ids?: string[] | null
          reserve?: string[] | null
          roster_id: number
          starters?: string[] | null
          taxi?: string[] | null
          team_name?: string | null
          ties?: number | null
          updated_at?: string
          wins?: number | null
        }
        Update: {
          co_owners?: string[] | null
          created_at?: string
          display_name?: string | null
          fpts?: number | null
          fpts_against?: number | null
          id?: string
          keepers?: string[] | null
          league_id?: string
          losses?: number | null
          metadata?: Json | null
          owner_id?: string | null
          player_ids?: string[] | null
          reserve?: string[] | null
          roster_id?: number
          starters?: string[] | null
          taxi?: string[] | null
          team_name?: string | null
          ties?: number | null
          updated_at?: string
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_sleeper_rosters_league"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "sleeper_leagues"
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
