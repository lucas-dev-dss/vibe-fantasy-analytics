-- Drop existing tables and create new Sleeper-optimized schema
DROP TABLE IF EXISTS player_projections CASCADE;
DROP TABLE IF EXISTS analysis_sessions CASCADE;
DROP TABLE IF EXISTS players CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS leagues CASCADE;
DROP TABLE IF EXISTS LeagueDataTrial CASCADE;

-- Create sleeper_leagues table
CREATE TABLE public.sleeper_leagues (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sleeper_league_id text NOT NULL UNIQUE,
  league_name text NOT NULL,
  season_year integer NOT NULL DEFAULT 2024,
  total_rosters integer NOT NULL DEFAULT 12,
  roster_positions jsonb NOT NULL DEFAULT '[]'::jsonb,
  scoring_settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create sleeper_rosters table (teams/rosters)
CREATE TABLE public.sleeper_rosters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL,
  roster_id integer NOT NULL,
  owner_id text,
  display_name text,
  team_name text,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  ties integer DEFAULT 0,
  fpts numeric DEFAULT 0,
  fpts_against numeric DEFAULT 0,
  player_ids text[] DEFAULT ARRAY[]::text[],
  starters text[] DEFAULT ARRAY[]::text[],
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(league_id, roster_id)
);

-- Create sleeper_players table
CREATE TABLE public.sleeper_players (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sleeper_player_id text NOT NULL UNIQUE,
  player_name text NOT NULL,
  position text NOT NULL,
  nfl_team text,
  age integer,
  injury_status text DEFAULT 'healthy',
  fantasy_positions text[] DEFAULT ARRAY[]::text[],
  years_exp integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create player_stats table for weekly performance
CREATE TABLE public.player_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id uuid NOT NULL,
  league_id uuid NOT NULL,
  week_number integer NOT NULL,
  season_year integer NOT NULL DEFAULT 2024,
  points_scored numeric DEFAULT 0,
  projected_points numeric DEFAULT 0,
  stats_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(player_id, league_id, week_number, season_year)
);

-- Enable RLS on all tables
ALTER TABLE public.sleeper_leagues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleeper_rosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleeper_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access
CREATE POLICY "Public read access to sleeper_leagues" ON public.sleeper_leagues FOR SELECT USING (true);
CREATE POLICY "Public insert access to sleeper_leagues" ON public.sleeper_leagues FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to sleeper_leagues" ON public.sleeper_leagues FOR UPDATE USING (true);

CREATE POLICY "Public read access to sleeper_rosters" ON public.sleeper_rosters FOR SELECT USING (true);
CREATE POLICY "Public insert access to sleeper_rosters" ON public.sleeper_rosters FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to sleeper_rosters" ON public.sleeper_rosters FOR UPDATE USING (true);

CREATE POLICY "Public read access to sleeper_players" ON public.sleeper_players FOR SELECT USING (true);
CREATE POLICY "Public insert access to sleeper_players" ON public.sleeper_players FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to sleeper_players" ON public.sleeper_players FOR UPDATE USING (true);

CREATE POLICY "Public read access to player_stats" ON public.player_stats FOR SELECT USING (true);
CREATE POLICY "Public insert access to player_stats" ON public.player_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to player_stats" ON public.player_stats FOR UPDATE USING (true);

-- Create foreign key relationships
ALTER TABLE public.sleeper_rosters ADD CONSTRAINT fk_sleeper_rosters_league FOREIGN KEY (league_id) REFERENCES public.sleeper_leagues(id) ON DELETE CASCADE;
ALTER TABLE public.player_stats ADD CONSTRAINT fk_player_stats_player FOREIGN KEY (player_id) REFERENCES public.sleeper_players(id) ON DELETE CASCADE;
ALTER TABLE public.player_stats ADD CONSTRAINT fk_player_stats_league FOREIGN KEY (league_id) REFERENCES public.sleeper_leagues(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_sleeper_leagues_sleeper_id ON public.sleeper_leagues(sleeper_league_id);
CREATE INDEX idx_sleeper_rosters_league_id ON public.sleeper_rosters(league_id);
CREATE INDEX idx_sleeper_rosters_roster_id ON public.sleeper_rosters(roster_id);
CREATE INDEX idx_sleeper_players_sleeper_id ON public.sleeper_players(sleeper_player_id);
CREATE INDEX idx_sleeper_players_position ON public.sleeper_players(position);
CREATE INDEX idx_player_stats_player_week ON public.player_stats(player_id, week_number);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_sleeper_leagues_updated_at BEFORE UPDATE ON public.sleeper_leagues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sleeper_rosters_updated_at BEFORE UPDATE ON public.sleeper_rosters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sleeper_players_updated_at BEFORE UPDATE ON public.sleeper_players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();