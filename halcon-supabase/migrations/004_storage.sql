INSERT INTO storage.buckets (id, name, public) VALUES ('evidence', 'evidence', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "evidence_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'evidence');

CREATE POLICY "evidence_authenticated_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'evidence');
