import { supabase } from "@/integrations/supabase/client";

export interface ESPNConfig {
  leagueId: string;
  teamId?: string;
  season?: number;
  espnCookies?: string;
}

export interface AnalysisWeights {
  rosterBalance: number; // 0-100: 0=prioritize holes, 100=best available
  risk: number; // 0-100: 0=safe floor, 100=high ceiling
}

/**
 * Fantasy Football Service
 * Handles all ESPN API and analysis operations through Supabase Edge Functions
 */
export class FantasyService {
  
  /**
   * Fetch league data from ESPN and store in Supabase
   */
  static async fetchESPNLeague(config: ESPNConfig) {
    const { data, error } = await supabase.functions.invoke('espn-fetch-league', {
      body: {
        leagueId: config.leagueId,
        teamId: config.teamId,
        season: config.season || 2024,
        espnCookies: config.espnCookies
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Generate player recommendations based on user's team and preferences
   */
  static async generateRecommendations(
    leagueId: string, 
    teamId: string, 
    weights: AnalysisWeights
  ) {
    const { data, error } = await supabase.functions.invoke('analyze-recommendations', {
      body: {
        leagueId,
        teamId,
        weights
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get stored league data from Supabase
   */
  static async getLeagueData(leagueId: string) {
    const { data: league, error: leagueError } = await supabase
      .from('leagues')
      .select('*')
      .eq('espn_league_id', leagueId)
      .single();

    if (leagueError) throw leagueError;

    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('league_id', league.id);

    if (teamsError) throw teamsError;

    return { league, teams };
  }

  /**
   * Get available players for a league
   */
  static async getAvailablePlayers(leagueId: string, limit = 500) {
    const { data, error } = await supabase
      .from('players')
      .select(`
        *,
        player_projections(
          projected_points,
          floor_projection,
          ceiling_projection,
          std_deviation
        )
      `)
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * Store analysis session for tracking
   */
  static async saveAnalysisSession(
    leagueId: string,
    teamId: string,
    weights: AnalysisWeights,
    recommendations: any[]
  ) {
    const { data, error } = await supabase
      .from('analysis_sessions')
      .insert({
        league_id: leagueId,
        team_id: teamId,
        analysis_weights: weights as any, // Cast to satisfy Json type
        recommendations: recommendations.slice(0, 20) as any // Top 20 only
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Transform Supabase data to frontend format
   */
  static transformToLeagueData(
    players: any[], 
    userRoster: any[], 
    recommendations: any[]
  ) {
    return {
      teams: [], // Can be populated if needed
      availablePlayers: recommendations.filter((p: any) => p.ownership < 50),
      myRoster: userRoster,
      allPlayers: recommendations
    };
  }
}