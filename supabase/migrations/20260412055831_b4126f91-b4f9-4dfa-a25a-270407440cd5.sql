
DROP POLICY IF EXISTS "Service role can read all startups" ON public.startups;
DROP POLICY IF EXISTS "Service role can update startups" ON public.startups;

CREATE POLICY "Anyone can read startups" ON public.startups FOR SELECT USING (true);
CREATE POLICY "Anyone can update startups" ON public.startups FOR UPDATE USING (true) WITH CHECK (true);
