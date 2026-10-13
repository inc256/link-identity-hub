CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

CREATE TABLE public.identity_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE
    CHECK (username ~ '^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])$'),
  display_name text NOT NULL
    CHECK (char_length(display_name) BETWEEN 1 AND 80),
  profile_data jsonb NOT NULL
    CHECK (jsonb_typeof(profile_data) = 'object' AND octet_length(profile_data::text) <= 100000),
  edit_token_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.identity_links ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.identity_links FROM PUBLIC, anon, authenticated;
GRANT ALL ON TABLE public.identity_links TO service_role;

CREATE OR REPLACE FUNCTION public.create_identity_link(
  p_username text,
  p_display_name text,
  p_profile_data jsonb,
  p_edit_token text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions, pg_temp
AS $$
DECLARE
  created_link public.identity_links%ROWTYPE;
BEGIN
  IF p_username IS NULL OR p_username !~ '^[a-z0-9]([a-z0-9-]{1,28}[a-z0-9])$' THEN
    RAISE EXCEPTION 'Username must be 3-30 lowercase letters, numbers, or hyphens'
      USING ERRCODE = '22023';
  END IF;

  IF p_display_name IS NULL OR char_length(btrim(p_display_name)) NOT BETWEEN 1 AND 80 THEN
    RAISE EXCEPTION 'Display name must be between 1 and 80 characters'
      USING ERRCODE = '22023';
  END IF;

  IF p_profile_data IS NULL OR jsonb_typeof(p_profile_data) <> 'object'
     OR octet_length(p_profile_data::text) > 100000 THEN
    RAISE EXCEPTION 'Profile data must be a JSON object no larger than 100 KB'
      USING ERRCODE = '22023';
  END IF;

  IF p_edit_token IS NULL OR p_edit_token !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid edit key'
      USING ERRCODE = '22023';
  END IF;

  INSERT INTO public.identity_links (username, display_name, profile_data, edit_token_hash)
  VALUES (
    p_username,
    btrim(p_display_name),
    p_profile_data,
    encode(extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256'), 'hex')
  )
  RETURNING * INTO created_link;

  RETURN jsonb_build_object(
    'id', created_link.id,
    'username', created_link.username,
    'display_name', created_link.display_name,
    'profile_data', created_link.profile_data,
    'created_at', created_link.created_at,
    'updated_at', created_link.updated_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_identity_link(p_username text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT jsonb_build_object(
    'id', id,
    'username', username,
    'display_name', display_name,
    'profile_data', profile_data,
    'created_at', created_at,
    'updated_at', updated_at
  )
  FROM public.identity_links
  WHERE username = lower(p_username)
$$;

CREATE OR REPLACE FUNCTION public.update_identity_link(
  p_username text,
  p_display_name text,
  p_profile_data jsonb,
  p_edit_token text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, extensions, pg_temp
AS $$
DECLARE
  affected_rows integer;
BEGIN
  IF p_display_name IS NULL OR char_length(btrim(p_display_name)) NOT BETWEEN 1 AND 80 THEN
    RAISE EXCEPTION 'Display name must be between 1 and 80 characters'
      USING ERRCODE = '22023';
  END IF;

  IF p_profile_data IS NULL OR jsonb_typeof(p_profile_data) <> 'object'
     OR octet_length(p_profile_data::text) > 100000 THEN
    RAISE EXCEPTION 'Profile data must be a JSON object no larger than 100 KB'
      USING ERRCODE = '22023';
  END IF;

  IF p_edit_token IS NULL OR p_edit_token !~ '^[a-f0-9]{64}$' THEN
    RAISE EXCEPTION 'Invalid edit key'
      USING ERRCODE = '22023';
  END IF;

  UPDATE public.identity_links
  SET display_name = btrim(p_display_name),
      profile_data = p_profile_data,
      updated_at = now()
  WHERE username = lower(p_username)
    AND edit_token_hash = encode(extensions.digest(convert_to(p_edit_token, 'UTF8'), 'sha256'), 'hex');

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN affected_rows = 1;
END;
$$;

REVOKE ALL ON FUNCTION public.create_identity_link(text, text, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_identity_link(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_identity_link(text, text, jsonb, text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.create_identity_link(text, text, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_identity_link(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_identity_link(text, text, jsonb, text) TO anon, authenticated;
