import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface AnalysisRequest {
  leagueId: string;
  teamId: string;
  weights: {
    rosterBalance: number; // 0-100: 0=prioritize holes, 100=best available
    risk: number; // 0-100: 0=safe floor, 100=high ceiling
  };
}

/**
 * Player Recommendation Analysis Engine
 * Uses statistical distributions and roster composition to generate intelligent recommendations
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leagueId, teamId, weights }: AnalysisRequest = await req.json();

    console.log(`Analyzing recommendations for league ${leagueId}, team ${teamId}`);

    // Fetch league data
    const { data: league } = await supabase
      .from('leagues')
      .select('*')
      .eq('id', leagueId)
      .single();

    // Fetch user's team roster
    const { data: userTeam } = await supabase
      .from('teams')
      .select('*')
      .eq('league_id', leagueId)
      .eq('espn_team_id', teamId)
      .single();

    // Fetch all available players with projections
    const { data: players } = await supabase
      .from('players')
      .select(`
        *,
        player_projections!inner(
          projected_points,
          floor_projection,
          ceiling_projection,
          std_deviation,
          confidence_interval
        )
      `)
      .limit(500);

    if (!players || !userTeam) {
      return new Response(
        JSON.stringify({ error: 'League or team data not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform data to match frontend interface
    const transformedPlayers = players.map(p => ({
      name: p.player_name,
      position: p.position,
      seasonAvg: p.season_projections?.points || 0,
      recentAvg: p.season_projections?.points || 0, // Mock recent avg
      weeklyScores: generateMockWeeklyScores(p.season_projections?.points || 0),
      ownership: p.ownership_pct || 0,
      expertRank: p.expert_rankings?.overall || 999,
      advancedRank: p.expert_rankings?.position || 999,
      targetShare: p.advanced_stats?.target_share || 0,
      snapShare: p.advanced_stats?.snap_share || 0,
      redZoneShares: p.advanced_stats?.red_zone_share || 0,
      byeWeek: p.bye_week,
      // Statistical distribution data
      floorProjection: p.player_projections[0]?.floor_projection || 0,
      ceilingProjection: p.player_projections[0]?.ceiling_projection || 0,
      stdDeviation: p.player_projections[0]?.std_deviation || 0
    }));

    // Transform user roster
    const userRoster = (userTeam.roster_data?.roster || []).map((rp: any) => {
      const player = players.find(p => p.espn_player_id === rp.playerId);
      if (!player) return null;
      
      return {
        name: player.player_name,
        position: player.position,
        seasonAvg: player.season_projections?.points || 0,
        recentAvg: player.season_projections?.points || 0,
        weeklyScores: generateMockWeeklyScores(player.season_projections?.points || 0),
        ownership: player.ownership_pct || 0,
        expertRank: player.expert_rankings?.overall || 999,
        advancedRank: player.expert_rankings?.position || 999,
        targetShare: player.advanced_stats?.target_share || 0,
        snapShare: player.advanced_stats?.snap_share || 0,
        redZoneShares: player.advanced_stats?.red_zone_share || 0,
        byeWeek: player.bye_week,
        floorProjection: player.player_projections?.[0]?.floor_projection || 0,
        ceilingProjection: player.player_projections?.[0]?.ceiling_projection || 0,
        stdDeviation: player.player_projections?.[0]?.std_deviation || 0
      };
    }).filter(Boolean);

    // Run analysis using the same math model logic
    const rosterAnalysis = analyzeRosterStrength(userRoster);
    const recommendations = transformedPlayers
      .filter(p => !userRoster.some(ur => ur.name === p.name)) // Exclude rostered players
      .map(player => {
        const score = calculateRecommendationScore(player, weights, rosterAnalysis, userRoster);
        const reason = generateRecommendationReason(player, score, rosterAnalysis, weights);
        
        return {
          ...player,
          recommendationScore: score,
          analysisReason: reason
        };
      })
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 50); // Top 50 recommendations

    // Store analysis session
    await supabase
      .from('analysis_sessions')
      .insert({
        league_id: leagueId,
        team_id: userTeam.id,
        analysis_weights: weights,
        recommendations: recommendations.slice(0, 20)
      });

    console.log(`Analysis complete: ${recommendations.length} recommendations generated`);

    return new Response(
      JSON.stringify({
        success: true,
        recommendations,
        rosterAnalysis,
        userRoster,
        league: league?.league_name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-recommendations function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Helper functions (simplified versions of the math model)
function analyzeRosterStrength(roster: any[]) {
  const positionGroups = {
    QB: roster.filter(p => p.position === 'QB'),
    RB: roster.filter(p => p.position === 'RB'),
    WR: roster.filter(p => p.position === 'WR'),
    TE: roster.filter(p => p.position === 'TE')
  };

  return Object.entries(positionGroups).map(([pos, players]) => {
    if (players.length === 0) return { position: pos, avgScore: 0, depth: 0, strength: 0 };
    
    const avgScore = players.reduce((sum, p) => sum + p.seasonAvg, 0) / players.length;
    const depth = players.length;
    const topPlayerScore = Math.max(...players.map(p => p.seasonAvg));
    const avgFloor = players.reduce((sum, p) => sum + (p.floorProjection || 0), 0) / players.length;
    
    const strength = (topPlayerScore * 0.4) + (avgFloor * 0.3) + (avgScore * 0.2) + (depth * 2);
    
    return { position: pos, avgScore, depth, strength };
  });
}

function calculateRecommendationScore(player: any, weights: any, rosterAnalysis: any[], userRoster: any[]) {
  // Simplified scoring algorithm
  const positionStrength = rosterAnalysis.find(p => p.position === player.position)?.strength || 0;
  const avgStrength = rosterAnalysis.reduce((sum, p) => sum + p.strength, 0) / rosterAnalysis.length;
  
  // Base performance score
  let score = player.seasonAvg * 2;
  
  // Roster hole bonus (when rosterBalance is low, prioritize holes)
  if (weights.rosterBalance < 50 && positionStrength < avgStrength) {
    const holeBonus = ((avgStrength - positionStrength) / avgStrength) * 50;
    score += holeBonus;
  }
  
  // Risk adjustment (risk tolerance affects floor vs ceiling preference)
  const riskFactor = weights.risk / 100;
  const floorWeight = 1 - riskFactor;
  const ceilingWeight = riskFactor;
  
  score += (player.floorProjection || 0) * floorWeight * 10;
  score += (player.ceilingProjection || 0) * ceilingWeight * 5;
  
  // Low ownership bonus
  if (player.ownership < 15) {
    score += (15 - player.ownership) * 2;
  }
  
  return Math.round(score);
}

function generateRecommendationReason(player: any, score: number, rosterAnalysis: any[], weights: any) {
  const reasons = [];
  
  const positionStrength = rosterAnalysis.find(p => p.position === player.position)?.strength || 0;
  const avgStrength = rosterAnalysis.reduce((sum, p) => sum + p.strength, 0) / rosterAnalysis.length;
  
  if (positionStrength < avgStrength && weights.rosterBalance < 60) {
    reasons.push(`Fills ${player.position} roster hole`);
  }
  
  if (player.ownership < 15) {
    reasons.push(`Low owned (${player.ownership}%)`);
  }
  
  if (weights.risk > 60 && player.ceilingProjection > player.seasonAvg * 1.3) {
    reasons.push(`High upside play`);
  }
  
  if (weights.risk < 40 && player.floorProjection > player.seasonAvg * 0.8) {
    reasons.push(`Reliable floor`);
  }
  
  return reasons.slice(0, 2).join(". ") || "Strong statistical profile";
}

function generateMockWeeklyScores(seasonAvg: number) {
  // Generate realistic weekly score distribution
  const scores = [];
  const baseScore = seasonAvg;
  
  for (let i = 0; i < 16; i++) {
    const variance = (Math.random() - 0.5) * baseScore * 0.6;
    scores.push(Math.max(0, baseScore + variance));
  }
  
  return scores;
}