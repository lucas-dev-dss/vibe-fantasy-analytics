-- Create comprehensive database schema for ESPN Fantasy Football data

-- Leagues table to store league information
CREATE TABLE public.leagues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  espn_league_id TEXT NOT NULL UNIQUE,
  league_name TEXT NOT NULL,
  season_year INTEGER NOT NULL,
  scoring_type TEXT NOT NULL DEFAULT 'standard',
  roster_settings JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Teams table for league rosters
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  espn_team_id INTEGER NOT NULL,
  team_name TEXT NOT NULL,
  owner_name TEXT,
  roster_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(league_id, espn_team_id)
);

-- Players table for all available players and their data
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  espn_player_id INTEGER NOT NULL UNIQUE,
  player_name TEXT NOT NULL,
  position TEXT NOT NULL,
  nfl_team TEXT,
  bye_week INTEGER,
  season_projections JSONB, -- {points, targets, carries, etc}
  weekly_projections JSONB, -- Array of weekly projection data
  ownership_pct DECIMAL(5,2) DEFAULT 0,
  expert_rankings JSONB, -- {standard: rank, ppr: rank, etc}
  advanced_stats JSONB, -- {snap_share, target_share, red_zone, etc}
  injury_status TEXT DEFAULT 'healthy',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Player projections with statistical distributions
CREATE TABLE public.player_projections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  projected_points DECIMAL(6,2) NOT NULL,
  floor_projection DECIMAL(6,2) NOT NULL, -- 10th percentile
  ceiling_projection DECIMAL(6,2) NOT NULL, -- 90th percentile
  std_deviation DECIMAL(6,2) NOT NULL,
  confidence_interval JSONB, -- {lower_bound, upper_bound, confidence_level}
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(player_id, league_id, week_number)
);

-- Analysis sessions to track recommendation runs
CREATE TABLE public.analysis_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id UUID NOT NULL REFERENCES public.leagues(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  analysis_weights JSONB NOT NULL, -- {roster_balance: value, risk: value}
  recommendations JSONB NOT NULL, -- Array of recommended players with scores
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_projections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow public read access for now (can be restricted later)
CREATE POLICY "Allow public read access to leagues" ON public.leagues FOR SELECT USING (true);
CREATE POLICY "Allow public read access to teams" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Allow public read access to players" ON public.players FOR SELECT USING (true);
CREATE POLICY "Allow public read access to player_projections" ON public.player_projections FOR SELECT USING (true);
CREATE POLICY "Allow public read access to analysis_sessions" ON public.analysis_sessions FOR SELECT USING (true);

-- Allow inserts for data loading
CREATE POLICY "Allow public insert to leagues" ON public.leagues FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to teams" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to players" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to player_projections" ON public.player_projections FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public insert to analysis_sessions" ON public.analysis_sessions FOR INSERT WITH CHECK (true);

-- Allow updates for data refreshes
CREATE POLICY "Allow public update to leagues" ON public.leagues FOR UPDATE USING (true);
CREATE POLICY "Allow public update to teams" ON public.teams FOR UPDATE USING (true);
CREATE POLICY "Allow public update to players" ON public.players FOR UPDATE USING (true);
CREATE POLICY "Allow public update to player_projections" ON public.player_projections FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_leagues_updated_at
  BEFORE UPDATE ON public.leagues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_players_updated_at
  BEFORE UPDATE ON public.players
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_teams_league_id ON public.teams(league_id);
CREATE INDEX idx_teams_espn_team_id ON public.teams(espn_team_id);
CREATE INDEX idx_players_position ON public.players(position);
CREATE INDEX idx_players_espn_id ON public.players(espn_player_id);
CREATE INDEX idx_projections_player_league ON public.player_projections(player_id, league_id);
CREATE INDEX idx_projections_week ON public.player_projections(week_number);
CREATE INDEX idx_analysis_sessions_league ON public.analysis_sessions(league_id);