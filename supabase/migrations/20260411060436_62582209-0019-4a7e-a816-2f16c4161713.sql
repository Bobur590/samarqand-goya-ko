CREATE TABLE public.startups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  budget TEXT,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_phone TEXT NOT NULL,
  author_email TEXT,
  score INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'scored', 'rejected', 'approved', 'top')),
  ai_feedback JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.startups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit startups"
  ON public.startups FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can read all startups"
  ON public.startups FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update startups"
  ON public.startups FOR UPDATE
  TO service_role
  USING (true);

CREATE INDEX idx_startups_status ON public.startups (status);
CREATE INDEX idx_startups_score ON public.startups (score DESC NULLS LAST);
CREATE INDEX idx_startups_created ON public.startups (created_at DESC);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_startups_updated_at
  BEFORE UPDATE ON public.startups
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();