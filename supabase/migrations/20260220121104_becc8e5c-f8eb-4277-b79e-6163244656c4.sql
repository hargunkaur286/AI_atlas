
-- Table to store AI-extracted intent vectors and content from profiles
CREATE TABLE public.profile_analyses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  intent_vector JSONB,
  content_tags TEXT[],
  power_map JSONB,
  trend_alignment TEXT,
  execution_compatibility TEXT,
  embedding_text TEXT,
  analyzed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profile_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all analyses for matching"
  ON public.profile_analyses FOR SELECT
  USING (true);

CREATE POLICY "Service role can insert/update analyses"
  ON public.profile_analyses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update analyses"
  ON public.profile_analyses FOR UPDATE
  USING (true);

-- Table to store computed matches between users
CREATE TABLE public.matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  matched_user_id UUID NOT NULL,
  strategic_alignment_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  meeting_value_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  complementarity_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  overall_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  ai_summary TEXT,
  match_reasons JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, matched_user_id)
);

ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own matches"
  ON public.matches FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service can insert matches"
  ON public.matches FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update matches"
  ON public.matches FOR UPDATE
  USING (true);

CREATE POLICY "Service can delete matches"
  ON public.matches FOR DELETE
  USING (true);

-- Trigger for updated_at on matches
CREATE TRIGGER update_matches_updated_at
  BEFORE UPDATE ON public.matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
