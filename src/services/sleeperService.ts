import { supabase } from "@/integrations/supabase/client";

export interface SleeperConfig {
  leagueId: string;
  rosterId?: string;
}

export interface AnalysisWeights {
  rosterBalance: number; // 0-100: 0=prioritize holes, 100=best available
  risk: number; // 0-100: 0=safe floor, 100=high ceiling
}

/**
 * Sleeper Fantasy Football Service
 * Handles all Sleeper API and analysis operations through Supabase Edge Functions
 */
export class SleeperService {
  
  /**
   * Fetch league data from Sleeper and store in Supabase
   */
  static async fetchSleeperLeague(config: SleeperConfig) {
    const { data, error } = await supabase.functions.invoke('sleeper-fetch-league', {
      body: {
        leagueId: config.leagueId,
        season: 2024
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Generate player recommendations based on user's roster and preferences
   */
  static async generateRecommendations(
    leagueId: string, 
    rosterId: string, 
    weights: AnalysisWeights
  ) {
    const { data, error } = await supabase.functions.invoke('sleeper-analyze', {
      body: {
        leagueId,
        rosterId,
        weights
      }
    });

    if (error) throw error;
    return data;
  }

  /**
   * Get stored league data from Supabase
   */
  static async getLeagueData(sleeperLeagueId: string) {
    const { data: league, error: leagueError } = await supabase
      .from('sleeper_leagues')
      .select('*')
      .eq('sleeper_league_id', sleeperLeagueId)
      .single();

    if (leagueError) throw leagueError;

    const { data: rosters, error: rostersError } = await supabase
      .from('sleeper_rosters')
      .select('*')
      .eq('league_id', league.id);

    if (rostersError) throw rostersError;

    return { league, rosters };
  }

  /**
   * Transform Sleeper data to frontend format
   */
  static transformToLeagueData(
    userRoster: any[], 
    recommendations: any[]
  ) {
    return {
      teams: [], 
      availablePlayers: recommendations.filter((p: any) => p.score > 50),
      myRoster: userRoster,
      allPlayers: recommendations
    };
  }
}