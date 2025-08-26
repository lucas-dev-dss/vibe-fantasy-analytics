import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SleeperLeague {
  league_id: string;
  name: string;
  season: string;
  total_rosters: number;
  roster_positions: string[];
  scoring_settings: Record<string, number>;
}

interface SleeperRoster {
  roster_id: number;
  owner_id: string;
  players: string[];
  starters: string[];
  settings: {
    wins: number;
    losses: number;
    ties: number;
    fpts: number;
    fpts_against: number;
  };
}

interface SleeperUser {
  user_id: string;
  display_name: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { leagueId, season = '2024' } = await req.json();

    if (!leagueId) {
      return new Response(
        JSON.stringify({ error: 'League ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching Sleeper league data for league ${leagueId}, season ${season}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Step 1: Fetch league information
    const leagueResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
    if (!leagueResponse.ok) {
      throw new Error(`Failed to fetch league data: ${leagueResponse.status}`);
    }
    const leagueData: SleeperLeague = await leagueResponse.json();

    // Step 2: Fetch rosters
    const rostersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`);
    if (!rostersResponse.ok) {
      throw new Error(`Failed to fetch rosters: ${rostersResponse.status}`);
    }
    const rostersData: SleeperRoster[] = await rostersResponse.json();

    // Step 3: Fetch users for display names
    const usersResponse = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`);
    if (!usersResponse.ok) {
      throw new Error(`Failed to fetch users: ${usersResponse.status}`);
    }
    const usersData: SleeperUser[] = await usersResponse.json();

    // Step 4: Fetch all NFL players
    const playersResponse = await fetch('https://api.sleeper.app/v1/players/nfl');
    if (!playersResponse.ok) {
      throw new Error(`Failed to fetch players: ${playersResponse.status}`);
    }
    const playersData: Record<string, any> = await playersResponse.json();

    // Step 5: Store league data
    const { data: leagueRecord, error: leagueError } = await supabase
      .from('sleeper_leagues')
      .upsert({
        sleeper_league_id: leagueData.league_id,
        league_name: leagueData.name,
        season_year: parseInt(season),
        total_rosters: leagueData.total_rosters,
        roster_positions: leagueData.roster_positions,
        scoring_settings: leagueData.scoring_settings
      })
      .select()
      .single();

    if (leagueError) throw leagueError;

    // Step 6: Store roster data
    const userLookup = usersData.reduce((acc, user) => {
      acc[user.user_id] = user.display_name;
      return acc;
    }, {} as Record<string, string>);

    const rosterInserts = rostersData.map(roster => ({
      league_id: leagueRecord.id,
      roster_id: roster.roster_id,
      owner_id: roster.owner_id,
      display_name: userLookup[roster.owner_id] || 'Unknown',
      wins: roster.settings?.wins || 0,
      losses: roster.settings?.losses || 0,
      ties: roster.settings?.ties || 0,
      fpts: roster.settings?.fpts || 0,
      fpts_against: roster.settings?.fpts_against || 0,
      player_ids: roster.players || [],
      starters: roster.starters || []
    }));

    const { data: rosterRecords, error: rostersError } = await supabase
      .from('sleeper_rosters')
      .upsert(rosterInserts)
      .select();

    if (rostersError) throw rostersError;

    // Step 7: Store player data
    const allPlayerIds = new Set<string>();
    rostersData.forEach(roster => {
      (roster.players || []).forEach(playerId => allPlayerIds.add(playerId));
    });

    const playerInserts = Array.from(allPlayerIds)
      .map(playerId => {
        const player = playersData[playerId];
        if (!player) return null;
        
        return {
          sleeper_player_id: playerId,
          player_name: `${player.first_name || ''} ${player.last_name || ''}`.trim(),
          position: player.position || 'UNK',
          nfl_team: player.team || null,
          age: player.age || null,
          injury_status: player.injury_status || 'healthy',
          fantasy_positions: player.fantasy_positions || [],
          years_exp: player.years_exp || 0
        };
      })
      .filter(Boolean);

    if (playerInserts.length > 0) {
      const { data: playerRecords, error: playersError } = await supabase
        .from('sleeper_players')
        .upsert(playerInserts)
        .select();

      if (playersError) throw playersError;
    }

    console.log(`Successfully stored ${rosterInserts.length} rosters and ${playerInserts.length} players`);

    return new Response(
      JSON.stringify({
        success: true,
        league_id: leagueRecord.id,
        sleeper_league_id: leagueData.league_id,
        league_name: leagueData.name,
        rosters_count: rosterInserts.length,
        players_count: playerInserts.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sleeper-fetch-league:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to fetch Sleeper league data'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});