-- Fix security warnings from the linter

-- Fix RLS policies for LeagueDataTrial table (if it doesn't have policies)
CREATE POLICY "Allow public read access to LeagueDataTrial" ON public.LeagueDataTrial FOR SELECT USING (true);
CREATE POLICY "Allow public insert to LeagueDataTrial" ON public.LeagueDataTrial FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update to LeagueDataTrial" ON public.LeagueDataTrial FOR UPDATE USING (true);

-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;