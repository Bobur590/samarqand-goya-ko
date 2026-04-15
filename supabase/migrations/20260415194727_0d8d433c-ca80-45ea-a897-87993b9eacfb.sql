
-- Add pdf_url column to startups table
ALTER TABLE public.startups ADD COLUMN IF NOT EXISTS pdf_url text;

-- Create storage bucket for startup PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('startup-pdfs', 'startup-pdfs', true) ON CONFLICT DO NOTHING;

-- Allow anyone to upload to startup-pdfs bucket
CREATE POLICY "Anyone can upload startup PDFs" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'startup-pdfs');

-- Allow anyone to read startup PDFs
CREATE POLICY "Anyone can read startup PDFs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'startup-pdfs');
