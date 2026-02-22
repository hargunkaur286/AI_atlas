
-- Add strategic survey columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS primary_interest text,
  ADD COLUMN IF NOT EXISTS strategic_outcomes text[],
  ADD COLUMN IF NOT EXISTS asymmetric_opportunity text,
  ADD COLUMN IF NOT EXISTS capital_leverage text[],
  ADD COLUMN IF NOT EXISTS counterparty_types text[],
  ADD COLUMN IF NOT EXISTS adjacent_domains text[],
  ADD COLUMN IF NOT EXISTS counterparty_stage text,
  ADD COLUMN IF NOT EXISTS hard_constraints text;
