-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  title TEXT,
  bio TEXT,
  description TEXT,
  profile_image TEXT,
  cover_image TEXT,
  image_shape TEXT NOT NULL DEFAULT 'circle',
  show_cover BOOLEAN NOT NULL DEFAULT false,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  maps_url TEXT,
  opening_hours JSONB NOT NULL DEFAULT '[]'::jsonb,
  template TEXT,
  theme TEXT NOT NULL DEFAULT 'light',
  layout TEXT NOT NULL DEFAULT 'centered',
  button_style TEXT NOT NULL DEFAULT 'rounded',
  status TEXT NOT NULL DEFAULT 'draft',
  analytics_enabled BOOLEAN NOT NULL DEFAULT true,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX profiles_username_idx ON public.profiles (username);
CREATE INDEX profiles_user_id_idx ON public.profiles (user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners manage own profile" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Published profiles are public" ON public.profiles
  FOR SELECT TO anon USING (status = 'published');

-- helper: is a profile publicly visible
CREATE OR REPLACE FUNCTION public.is_profile_public(_profile_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _profile_id AND p.status = 'published');
$$;

CREATE OR REPLACE FUNCTION public.owns_profile(_profile_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _profile_id AND p.user_id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- SOCIAL LINKS
CREATE TABLE public.social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  label TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX social_links_profile_idx ON public.social_links (profile_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.social_links TO authenticated;
GRANT SELECT ON public.social_links TO anon;
GRANT ALL ON public.social_links TO service_role;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage social links" ON public.social_links
  FOR ALL TO authenticated USING (public.owns_profile(profile_id)) WITH CHECK (public.owns_profile(profile_id));
CREATE POLICY "Public social links" ON public.social_links
  FOR SELECT TO anon USING (public.is_profile_public(profile_id) AND visible);

-- PAGE BLOCKS
CREATE TABLE public.page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  visible BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX page_blocks_profile_idx ON public.page_blocks (profile_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_blocks TO authenticated;
GRANT SELECT ON public.page_blocks TO anon;
GRANT ALL ON public.page_blocks TO service_role;
ALTER TABLE public.page_blocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage blocks" ON public.page_blocks
  FOR ALL TO authenticated USING (public.owns_profile(profile_id)) WITH CHECK (public.owns_profile(profile_id));
CREATE POLICY "Public blocks" ON public.page_blocks
  FOR SELECT TO anon USING (public.is_profile_public(profile_id) AND visible);
CREATE TRIGGER page_blocks_touch BEFORE UPDATE ON public.page_blocks
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- CUSTOM LINKS
CREATE TABLE public.custom_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  visible BOOLEAN NOT NULL DEFAULT true,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX custom_links_profile_idx ON public.custom_links (profile_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.custom_links TO authenticated;
GRANT SELECT ON public.custom_links TO anon;
GRANT ALL ON public.custom_links TO service_role;
ALTER TABLE public.custom_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage links" ON public.custom_links
  FOR ALL TO authenticated USING (public.owns_profile(profile_id)) WITH CHECK (public.owns_profile(profile_id));
CREATE POLICY "Public links" ON public.custom_links
  FOR SELECT TO anon USING (public.is_profile_public(profile_id) AND visible);

-- SERVICES
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  image TEXT,
  url TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX services_profile_idx ON public.services (profile_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT SELECT ON public.services TO anon;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage services" ON public.services
  FOR ALL TO authenticated USING (public.owns_profile(profile_id)) WITH CHECK (public.owns_profile(profile_id));
CREATE POLICY "Public services" ON public.services
  FOR SELECT TO anon USING (public.is_profile_public(profile_id));

-- PRODUCTS
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price TEXT,
  image TEXT,
  url TEXT,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX products_profile_idx ON public.products (profile_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT SELECT ON public.products TO anon;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owners manage products" ON public.products
  FOR ALL TO authenticated USING (public.owns_profile(profile_id)) WITH CHECK (public.owns_profile(profile_id));
CREATE POLICY "Public products" ON public.products
  FOR SELECT TO anon USING (public.is_profile_public(profile_id));

-- ANALYTICS
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX analytics_profile_idx ON public.analytics_events (profile_id, created_at DESC);
GRANT SELECT, INSERT ON public.analytics_events TO authenticated;
GRANT INSERT ON public.analytics_events TO anon;
GRANT ALL ON public.analytics_events TO service_role;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can record events for public profiles" ON public.analytics_events
  FOR INSERT TO anon, authenticated WITH CHECK (public.is_profile_public(profile_id));
CREATE POLICY "Owners read own analytics" ON public.analytics_events
  FOR SELECT TO authenticated USING (public.owns_profile(profile_id));