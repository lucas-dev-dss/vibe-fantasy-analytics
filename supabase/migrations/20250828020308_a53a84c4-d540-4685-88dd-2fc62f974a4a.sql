-- Expand database schema to capture all Sleeper API data

-- Add more comprehensive league data
ALTER TABLE public.sleeper_leagues 
ADD COLUMN IF NOT EXISTS league_type text,
ADD COLUMN IF NOT EXISTS draft_id text,
ADD COLUMN IF NOT EXISTS previous_league_id text,
ADD COLUMN IF NOT EXISTS status text,
ADD COLUMN IF NOT EXISTS sport text,
ADD COLUMN IF NOT EXISTS settings jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Expand roster data  
ALTER TABLE public.sleeper_rosters
ADD COLUMN IF NOT EXISTS keepers text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS reserve text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS taxi text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS co_owners text[] DEFAULT ARRAY[]::text[],
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

-- Add comprehensive player statistics
CREATE TABLE IF NOT EXISTS public.player_weekly_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sleeper_player_id text NOT NULL,
  season_year integer NOT NULL DEFAULT 2024,
  week_number integer NOT NULL,
  season_type text NOT NULL DEFAULT 'regular',
  stats_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  fantasy_points numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sleeper_player_id, season_year, week_number, season_type)
);

-- Add player projections
CREATE TABLE IF NOT EXISTS public.player_projections_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sleeper_player_id text NOT NULL,
  season_year integer NOT NULL DEFAULT 2024,
  week_number integer,
  season_type text NOT NULL DEFAULT 'regular',
  projections jsonb NOT NULL DEFAULT '{}'::jsonb,
  projected_fantasy_points numeric DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(sleeper_player_id, season_year, week_number, season_type)
);

-- Add matchup data
CREATE TABLE IF NOT EXISTS public.league_matchups (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.sleeper_leagues(id) ON DELETE CASCADE,
  week_number integer NOT NULL,
  matchup_id integer,
  roster_id integer NOT NULL,
  points numeric DEFAULT 0,
  players text[] DEFAULT ARRAY[]::text[],
  starters text[] DEFAULT ARRAY[]::text[],
  players_points jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(league_id, week_number, roster_id)
);

-- Add draft data
CREATE TABLE IF NOT EXISTS public.draft_picks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.sleeper_leagues(id) ON DELETE CASCADE,
  draft_id text NOT NULL,
  pick_no integer NOT NULL,
  round integer NOT NULL,
  roster_id integer,
  sleeper_player_id text,
  picked_by text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(league_id, draft_id, pick_no)
);

-- Add transactions
CREATE TABLE IF NOT EXISTS public.league_transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  league_id uuid NOT NULL REFERENCES public.sleeper_leagues(id) ON DELETE CASCADE,
  transaction_id text NOT NULL UNIQUE,
  transaction_type text NOT NULL,
  week_number integer,
  roster_ids integer[] DEFAULT ARRAY[]::integer[],
  adds jsonb DEFAULT '{}'::jsonb,
  drops jsonb DEFAULT '{}'::jsonb,
  draft_picks jsonb DEFAULT ARRAY[]::jsonb,
  waiver_budget jsonb DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.player_weekly_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_projections_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_matchups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.draft_picks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.league_transactions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for new tables
CREATE POLICY "Public read access to player_weekly_stats" ON public.player_weekly_stats FOR SELECT USING (true);
CREATE POLICY "Public insert access to player_weekly_stats" ON public.player_weekly_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to player_weekly_stats" ON public.player_weekly_stats FOR UPDATE USING (true);

CREATE POLICY "Public read access to player_projections_data" ON public.player_projections_data FOR SELECT USING (true);
CREATE POLICY "Public insert access to player_projections_data" ON public.player_projections_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to player_projections_data" ON public.player_projections_data FOR UPDATE USING (true);

CREATE POLICY "Public read access to league_matchups" ON public.league_matchups FOR SELECT USING (true);
CREATE POLICY "Public insert access to league_matchups" ON public.league_matchups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to league_matchups" ON public.league_matchups FOR UPDATE USING (true);

CREATE POLICY "Public read access to draft_picks" ON public.draft_picks FOR SELECT USING (true);
CREATE POLICY "Public insert access to draft_picks" ON public.draft_picks FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to draft_picks" ON public.draft_picks FOR UPDATE USING (true);

CREATE POLICY "Public read access to league_transactions" ON public.league_transactions FOR SELECT USING (true);
CREATE POLICY "Public insert access to league_transactions" ON public.league_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access to league_transactions" ON public.league_transactions FOR UPDATE USING (true);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_player_weekly_stats_player_week ON public.player_weekly_stats(sleeper_player_id, week_number);
CREATE INDEX IF NOT EXISTS idx_player_projections_player_week ON public.player_projections_data(sleeper_player_id, week_number);
CREATE INDEX IF NOT EXISTS idx_league_matchups_league_week ON public.league_matchups(league_id, week_number);
CREATE INDEX IF NOT EXISTS idx_draft_picks_league_draft ON public.draft_picks(league_id, draft_id);
CREATE INDEX IF NOT EXISTS idx_league_transactions_league_week ON public.league_transactions(league_id, week_number);

-- Add triggers for updated_at on new tables
CREATE TRIGGER update_player_projections_data_updated_at BEFORE UPDATE ON public.player_projections_data FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();