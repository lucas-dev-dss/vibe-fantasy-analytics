import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client for server operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface ESPNLeagueRequest {
  leagueId: string;
  teamId?: string;
  season?: number;
  espnCookies?: string;
}

/**
 * ESPN API Integration Edge Function
 * Fetches league data, rosters, and available players from ESPN Fantasy Football API
 * Stores data in Supabase with statistical distributions for projections
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leagueId, teamId, season = 2024, espnCookies }: ESPNLeagueRequest = await req.json();

    if (!leagueId) {
      return new Response(
        JSON.stringify({ error: 'League ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching ESPN league data for: ${leagueId}`);

    // Build ESPN API headers
    const headers: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 Fantasy Football Assistant',
    };

    if (espnCookies) {
      headers['Cookie'] = espnCookies;
    }

    // Fetch league info and teams
    const leagueResponse = await fetch(
      `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=mTeam&view=mRoster&view=mSettings`,
      { headers }
    );

    if (!leagueResponse.ok) {
      console.error(`ESPN API error: ${leagueResponse.status}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch league data from ESPN' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const leagueData = await leagueResponse.json();

    // Fetch available players with projections
    const playersResponse = await fetch(
      `https://lm-api-reads.fantasy.espn.com/apis/v3/games/ffl/seasons/${season}/segments/0/leagues/${leagueId}?view=kona_player_info&view=kona_projections`,
      { headers }
    );

    const playersData = await playersResponse.json();

    // Transform and store league data
    const { data: existingLeague } = await supabase
      .from('leagues')
      .select('id')
      .eq('espn_league_id', leagueId)
      .single();

    let leagueDbId;

    if (!existingLeague) {
      // Create new league record
      const { data: newLeague, error: leagueError } = await supabase
        .from('leagues')
        .insert({
          espn_league_id: leagueId,
          league_name: leagueData.settings?.name || `League ${leagueId}`,
          season_year: season,
          scoring_type: leagueData.settings?.scoringSettings?.scoringType === 1 ? 'ppr' : 'standard',
          roster_settings: leagueData.settings?.rosterSettings || {}
        })
        .select('id')
        .single();

      if (leagueError) throw leagueError;
      leagueDbId = newLeague.id;
    } else {
      leagueDbId = existingLeague.id;
    }

    // Process and store teams
    const teams = leagueData.teams || [];
    for (const team of teams) {
      await supabase
        .from('teams')
        .upsert({
          league_id: leagueDbId,
          espn_team_id: team.id,
          team_name: team.name || `Team ${team.id}`,
          owner_name: team.primaryOwner,
          roster_data: {
            roster: team.roster?.entries || [],
            lineup: team.roster?.lineup || []
          }
        }, { 
          onConflict: 'league_id,espn_team_id' 
        });
    }

    // Process and store players with statistical distributions
    const players = playersData.players || [];
    for (const playerData of players) {
      const player = playerData.player;
      
      // Calculate statistical distributions from projections
      const projections = player.stats || [];
      const seasonProjection = projections.find((s: any) => s.seasonId === season && s.statSourceId === 1);
      const weeklyProjections = projections.filter((s: any) => s.seasonId === season && s.statSourceId === 0);
      
      if (!seasonProjection) continue;

      // Extract key stats for distribution calculation
      const projectedPoints = seasonProjection.appliedTotal || 0;
      
      // Calculate floor (conservative estimate) and ceiling (optimistic estimate)
      // Floor = 80% of projection, Ceiling = 120% of projection
      const floor = projectedPoints * 0.8;
      const ceiling = projectedPoints * 1.2;
      const stdDev = (ceiling - floor) / 4; // Approximate std dev using empirical rule

      // Store player data
      await supabase
        .from('players')
        .upsert({
          espn_player_id: player.id,
          player_name: player.fullName,
          position: getPositionAbbreviation(player.defaultPositionId),
          nfl_team: getNFLTeamAbbreviation(player.proTeamId),
          bye_week: player.byeWeek || null,
          season_projections: {
            points: projectedPoints,
            targets: seasonProjection.stats?.[53] || 0, // Targets
            carries: seasonProjection.stats?.[23] || 0, // Carries
            receiving_yards: seasonProjection.stats?.[42] || 0,
            rushing_yards: seasonProjection.stats?.[24] || 0
          },
          weekly_projections: weeklyProjections.map((wp: any) => ({
            week: wp.scoringPeriodId,
            points: wp.appliedTotal || 0,
            stats: wp.stats
          })),
          ownership_pct: playerData.ownership?.percentOwned || 0,
          expert_rankings: {
            overall: player.rankings?.overall || 999,
            position: player.rankings?.position || 999
          },
          advanced_stats: {
            snap_share: Math.random() * 100, // Mock data - replace with real API call
            target_share: Math.random() * 100,
            red_zone_share: Math.random() * 100
          }
        }, { 
          onConflict: 'espn_player_id' 
        });

      // Store weekly projections with distributions
      for (let week = 1; week <= 18; week++) {
        const weekProjection = weeklyProjections.find((wp: any) => wp.scoringPeriodId === week);
        const weekPoints = weekProjection?.appliedTotal || projectedPoints / 17;
        
        await supabase
          .from('player_projections')
          .upsert({
            player_id: player.id,
            league_id: leagueDbId,
            week_number: week,
            projected_points: weekPoints,
            floor_projection: weekPoints * 0.8,
            ceiling_projection: weekPoints * 1.2,
            std_deviation: (weekPoints * 0.4) / 4,
            confidence_interval: {
              lower_bound: weekPoints * 0.7,
              upper_bound: weekPoints * 1.3,
              confidence_level: 0.8
            }
          }, { 
            onConflict: 'player_id,league_id,week_number' 
          });
      }
    }

    console.log(`Successfully processed ${players.length} players for league ${leagueId}`);

    return new Response(
      JSON.stringify({
        success: true,
        league_id: leagueDbId,
        teams_count: teams.length,
        players_count: players.length,
        message: 'League data successfully fetched and stored'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in espn-fetch-league function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions for ESPN position and team mappings
function getPositionAbbreviation(positionId: number): string {
  const positions: Record<number, string> = {
    1: 'QB', 2: 'RB', 3: 'WR', 4: 'TE', 5: 'K', 16: 'DST'
  };
  return positions[positionId] || 'FLEX';
}

function getNFLTeamAbbreviation(teamId: number): string {
  const teams: Record<number, string> = {
    1: 'ATL', 2: 'BUF', 3: 'CHI', 4: 'CIN', 5: 'CLE', 6: 'DAL', 7: 'DEN', 8: 'DET',
    9: 'GB', 10: 'TEN', 11: 'IND', 12: 'KC', 13: 'LV', 14: 'LAR', 15: 'MIA',
    16: 'MIN', 17: 'NE', 18: 'NO', 19: 'NYG', 20: 'NYJ', 21: 'PHI', 22: 'ARI',
    23: 'PIT', 24: 'LAC', 25: 'SF', 26: 'SEA', 27: 'TB', 28: 'WAS', 29: 'CAR',
    30: 'JAX', 33: 'BAL', 34: 'HOU'
  };
  return teams[teamId] || 'FA';
}