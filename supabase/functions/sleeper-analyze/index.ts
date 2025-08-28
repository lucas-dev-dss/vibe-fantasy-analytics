import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisWeights {
  rosterBalance: number; // 0-100: 0=prioritize holes, 100=best available
  risk: number; // 0-100: 0=safe floor, 100=high ceiling  
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leagueId, rosterId, weights } = await req.json();

    if (!leagueId || !rosterId) {
      return new Response(
        JSON.stringify({ error: 'League ID and Roster ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing roster ${rosterId} in league ${leagueId}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get league and roster data
    const { data: league, error: leagueError } = await supabase
      .from('sleeper_leagues')
      .select('*')
      .eq('sleeper_league_id', leagueId)
      .single();

    if (leagueError || !league) {
      return new Response(
        JSON.stringify({ 
          error: 'League not found. Please load the league data first using the fetch-league function.' 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all rosters for this league
    const { data: allRosters, error: allRostersError } = await supabase
      .from('sleeper_rosters')
      .select('*')
      .eq('league_id', league.id);

    if (allRostersError || !allRosters) {
      return new Response(
        JSON.stringify({ error: 'No roster data found for this league' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find user's roster
    const userRoster = allRosters.find(r => r.roster_id === parseInt(rosterId));
    if (!userRoster) {
      return new Response(
        JSON.stringify({ 
          error: `Roster ${rosterId} not found in league. Valid roster IDs: ${allRosters.map(r => r.roster_id).join(', ')}` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if league is empty (no actual players drafted)
    const hasActualPlayers = allRosters.some(roster => 
      roster.player_ids && 
      roster.player_ids.length > 0 && 
      roster.player_ids.some((id: string) => id !== "0")
    );

    if (!hasActualPlayers) {
      // Return empty league response with helpful message
      return new Response(
        JSON.stringify({
          success: true,
          userRoster: {
            roster_id: userRoster.roster_id,
            display_name: userRoster.display_name,
            players: [],
            isEmpty: true
          },
          recommendations: [],
          message: 'This league appears to be empty (no draft has occurred yet). Recommendations will be available after players are drafted.',
          isEmpty: true,
          league: league
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: rosterPlayers, error: rosterPlayersError } = await supabase
      .from('sleeper_players')
      .select('*')
      .in('sleeper_player_id', userRoster.player_ids || []);

    if (rosterPlayersError) throw rosterPlayersError;

    // Get available players (not on any roster in this league) 
    const ownedPlayerIds = new Set<string>();
    allRosters.forEach(r => {
      (r.player_ids || []).forEach((id: string) => {
        if (id && id !== "0") {
          ownedPlayerIds.add(id);
        }
      });
    });

    // Get available players by position
    const positionNeeds = ['QB', 'RB', 'WR', 'TE'];
    const availablePlayersByPosition: Record<string, any[]> = {};

    for (const position of positionNeeds) {
      const { data: availablePlayers, error: availableError } = await supabase
        .from('sleeper_players')
        .select('*')
        .eq('position', position)
        .not('sleeper_player_id', 'in', `(${Array.from(ownedPlayerIds).join(',') || 'none'})`)
        .limit(50);

      if (availableError) continue;
      availablePlayersByPosition[position] = availablePlayers || [];
    }

    // Simple scoring algorithm for Sleeper
    const scorePlayer = (player: any, rosterAnalysis: any, weights: AnalysisWeights): number => {
      const positionCount = rosterPlayers.filter(p => p.position === player.position).length;
      const isNeeded = positionCount < 3; // Assume 3 is good depth
      
      let score = 50; // Base score
      
      // Position need multiplier
      if (isNeeded && weights.rosterBalance < 50) {
        score += 30; // Prioritize roster holes
      }
      
      // Add some randomness to simulate player rankings
      const randomFactor = Math.random() * 20 - 10; // -10 to +10
      score += randomFactor;
      
      return Math.max(0, Math.min(100, score));
    };

    // Analyze roster composition
    const rosterAnalysis = {
      QB: rosterPlayers.filter(p => p.position === 'QB').length,
      RB: rosterPlayers.filter(p => p.position === 'RB').length,
      WR: rosterPlayers.filter(p => p.position === 'WR').length,
      TE: rosterPlayers.filter(p => p.position === 'TE').length,
    };

    // Generate recommendations
    const recommendations: any[] = [];
    
    positionNeeds.forEach(position => {
      const players = availablePlayersByPosition[position] || [];
      const scoredPlayers = players
        .map(player => ({
          ...player,
          score: scorePlayer(player, rosterAnalysis, weights || { rosterBalance: 50, risk: 50 }),
          reasoning: `${position} depth needed` + (rosterAnalysis[position as keyof typeof rosterAnalysis] < 2 ? ' - position priority' : '')
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 5); // Top 5 per position
      
      recommendations.push(...scoredPlayers);
    });

    // Sort all recommendations by score
    recommendations.sort((a, b) => b.score - a.score);
    const topRecommendations = recommendations.slice(0, 20);

    console.log(`Generated ${topRecommendations.length} recommendations for roster ${rosterId}`);

    return new Response(
      JSON.stringify({
        success: true,
        userRoster: rosterPlayers,
        recommendations: topRecommendations,
        rosterAnalysis,
        league: league
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sleeper-analyze:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to analyze Sleeper data'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});