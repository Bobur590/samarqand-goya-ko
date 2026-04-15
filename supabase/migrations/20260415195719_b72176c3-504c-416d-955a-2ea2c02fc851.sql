
-- 1. Create app_users table for custom authentication
CREATE TABLE IF NOT EXISTS public.app_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text,
  email text,
  region text,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read app_users" ON public.app_users FOR SELECT TO public USING (true);
CREATE POLICY "Public insert app_users" ON public.app_users FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public update app_users" ON public.app_users FOR UPDATE TO public USING (true) WITH CHECK (true);

CREATE TRIGGER update_app_users_updated_at
  BEFORE UPDATE ON public.app_users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 2. Add new columns to startups table
ALTER TABLE public.startups
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES public.app_users(id),
  ADD COLUMN IF NOT EXISTS founder_name text,
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS business_model text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS current_stage text,
  ADD COLUMN IF NOT EXISTS team_info text,
  ADD COLUMN IF NOT EXISTS investment_needed text,
  ADD COLUMN IF NOT EXISTS additional_notes text;

-- 3. Create startup_documents table
CREATE TABLE IF NOT EXISTS public.startup_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text DEFAULT 'pdf',
  file_size bigint,
  document_type text NOT NULL DEFAULT 'other',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.startup_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read startup_documents" ON public.startup_documents FOR SELECT TO public USING (true);
CREATE POLICY "Public insert startup_documents" ON public.startup_documents FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Public delete startup_documents" ON public.startup_documents FOR DELETE TO public USING (true);

-- 4. Create admin_notes table
CREATE TABLE IF NOT EXISTS public.admin_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  startup_id uuid REFERENCES public.startups(id) ON DELETE CASCADE NOT NULL,
  admin_username text NOT NULL,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read admin_notes" ON public.admin_notes FOR SELECT TO public USING (true);
CREATE POLICY "Public insert admin_notes" ON public.admin_notes FOR INSERT TO public WITH CHECK (true);

-- 5. Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.startups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.admin_notes;
