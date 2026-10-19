INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'link_identity_photos',
  'link_identity_photos',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE
SET public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Anyone can read identity link photos" ON storage.objects;
CREATE POLICY "Anyone can read identity link photos"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'link_identity_photos');

DROP POLICY IF EXISTS "Anyone can upload identity link photos" ON storage.objects;
CREATE POLICY "Anyone can upload identity link photos"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (
    bucket_id = 'link_identity_photos'
    AND (storage.foldername(name))[1] = 'identity-links'
    AND (storage.foldername(name))[2] ~ '^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])$'
    AND storage.filename(name) ~ '^[0-9a-f-]{36}\.(jpg|png|webp)$'
  );

