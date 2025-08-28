/**
 * Test data and utilities for Sleeper integration
 * Uses actual user data to validate functionality
 */

export const USER_TEST_DATA = {
  leagueId: "1266575469566758912",
  userId: "457751357017812992",
  rosterId: 1,
  displayName: "Lucas0wnz"
};

export const SAMPLE_ROSTER_DATA = [
  {
    "roster_id": 1,
    "owner_id": "457751357017812992",
    "players": [],
    "starters": ["0","0","0","0","0","0","0","0","0","0"],
    "league_id": "1266575469566758912",
    "settings": {
      "wins": 0,
      "losses": 0,
      "ties": 0,
      "fpts": 0,
      "fpts_against": 0
    }
  }
];

export const SAMPLE_USER_DATA = {
  "user_id": "457751357017812992",
  "username": "lucas0wnz",
  "display_name": "Lucas0wnz",
  "avatar": "a7edf17a1956ebe79017732156625301"
};

/**
 * Mock successful league response for testing
 */
export const mockLeagueResponse = () => ({
  success: true,
  league_id: "test-uuid",
  sleeper_league_id: USER_TEST_DATA.leagueId,
  league_name: "Test League",
  rosters_count: 12,
  players_count: 0,
  is_empty_league: true
});

/**
 * Generate sample recommendations for empty league
 */
export const generateSampleRecommendations = () => {
  return [
    {
      sleeper_player_id: "sample_qb_1",
      player_name: "Josh Allen",
      position: "QB",
      nfl_team: "BUF",
      score: 95,
      reasoning: "Elite QB1 with rushing upside"
    },
    {
      sleeper_player_id: "sample_rb_1", 
      player_name: "Christian McCaffrey",
      position: "RB",
      nfl_team: "SF",
      score: 98,
      reasoning: "Premium RB1 with high floor"
    },
    {
      sleeper_player_id: "sample_wr_1",
      player_name: "Tyreek Hill", 
      position: "WR",
      nfl_team: "MIA",
      score: 92,
      reasoning: "WR1 with elite ceiling"
    }
  ];
};