
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'master', 'player');
CREATE TYPE public.campaign_status AS ENUM ('active', 'paused', 'archived');
CREATE TYPE public.campaign_member_role AS ENUM ('master', 'player');
CREATE TYPE public.cosmic_element AS ENUM ('prisma', 'chama', 'nebulosa', 'luz', 'raiz', 'eter', 'sombra');
CREATE TYPE public.relic AS ENUM (
  'prisma_harmonia',
  'lamina_paixao',
  'calice_astros',
  'lanterna_solar',
  'coroa_vitalidade',
  'escudo_celestial',
  'manto_sombras'
);

-- =========================================================
-- UTIL: updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Portador',
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_all_authenticated"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'Portador'
    )
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- USER ROLES (global roles: admin)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_roles_select_own"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- =========================================================
-- CAMPAIGNS
-- =========================================================
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  master_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  synopsis TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  status public.campaign_status NOT NULL DEFAULT 'active',
  banner_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campaigns_master ON public.campaigns(master_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaigns TO authenticated;
GRANT ALL ON public.campaigns TO service_role;

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- CAMPAIGN MEMBERS
-- =========================================================
CREATE TABLE public.campaign_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.campaign_member_role NOT NULL DEFAULT 'player',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id)
);

CREATE INDEX idx_campaign_members_user ON public.campaign_members(user_id);
CREATE INDEX idx_campaign_members_campaign ON public.campaign_members(campaign_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.campaign_members TO authenticated;
GRANT ALL ON public.campaign_members TO service_role;

ALTER TABLE public.campaign_members ENABLE ROW LEVEL SECURITY;

-- Helper: is user a member of the campaign?
CREATE OR REPLACE FUNCTION public.is_campaign_member(_campaign_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaign_members
    WHERE campaign_id = _campaign_id AND user_id = _user_id
  );
$$;

-- Helper: is user the master of the campaign?
CREATE OR REPLACE FUNCTION public.is_campaign_master(_campaign_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE id = _campaign_id AND master_id = _user_id
  );
$$;

-- Campaign policies
CREATE POLICY "campaigns_select_members"
  ON public.campaigns FOR SELECT TO authenticated
  USING (
    master_id = auth.uid()
    OR public.is_campaign_member(id, auth.uid())
  );

CREATE POLICY "campaigns_insert_own"
  ON public.campaigns FOR INSERT TO authenticated
  WITH CHECK (master_id = auth.uid());

CREATE POLICY "campaigns_update_master"
  ON public.campaigns FOR UPDATE TO authenticated
  USING (master_id = auth.uid())
  WITH CHECK (master_id = auth.uid());

CREATE POLICY "campaigns_delete_master"
  ON public.campaigns FOR DELETE TO authenticated
  USING (master_id = auth.uid());

-- Campaign member policies
CREATE POLICY "campaign_members_select_related"
  ON public.campaign_members FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_campaign_master(campaign_id, auth.uid())
    OR public.is_campaign_member(campaign_id, auth.uid())
  );

CREATE POLICY "campaign_members_insert_self_or_master"
  ON public.campaign_members FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR public.is_campaign_master(campaign_id, auth.uid())
  );

CREATE POLICY "campaign_members_delete_self_or_master"
  ON public.campaign_members FOR DELETE TO authenticated
  USING (
    user_id = auth.uid()
    OR public.is_campaign_master(campaign_id, auth.uid())
  );

-- When a campaign is created, add the master as a member automatically
CREATE OR REPLACE FUNCTION public.handle_new_campaign()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.campaign_members (campaign_id, user_id, role)
  VALUES (NEW.id, NEW.master_id, 'master')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_campaign_created
  AFTER INSERT ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_campaign();

CREATE TRIGGER trg_campaigns_updated
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- CHARACTERS
-- =========================================================
CREATE TABLE public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Identidade
  name TEXT NOT NULL,
  concept TEXT,
  origin TEXT,
  portrait_url TEXT,
  level INTEGER NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 20),

  -- Elemento cósmico e relíquia
  element public.cosmic_element,
  relic public.relic,

  -- Atributos (padrão: 8 base, 3 pontos livres na criação)
  str_score INTEGER NOT NULL DEFAULT 10 CHECK (str_score BETWEEN 1 AND 30),
  dex_score INTEGER NOT NULL DEFAULT 10 CHECK (dex_score BETWEEN 1 AND 30),
  int_score INTEGER NOT NULL DEFAULT 10 CHECK (int_score BETWEEN 1 AND 30),
  res_score INTEGER NOT NULL DEFAULT 10 CHECK (res_score BETWEEN 1 AND 30),
  cha_score INTEGER NOT NULL DEFAULT 10 CHECK (cha_score BETWEEN 1 AND 30),
  per_score INTEGER NOT NULL DEFAULT 10 CHECK (per_score BETWEEN 1 AND 30),

  -- Recursos vitais
  hp_current INTEGER NOT NULL DEFAULT 10,
  hp_max INTEGER NOT NULL DEFAULT 10,
  sanity_current INTEGER NOT NULL DEFAULT 10,
  sanity_max INTEGER NOT NULL DEFAULT 10,
  pa_current INTEGER NOT NULL DEFAULT 3,
  pa_max INTEGER NOT NULL DEFAULT 3,

  -- Corrupção e transtornos
  corruption INTEGER NOT NULL DEFAULT 0 CHECK (corruption BETWEEN 0 AND 100),
  disorders JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Perícias, inventário, poderes, cicatrizes narrativas
  skills JSONB NOT NULL DEFAULT '{}'::jsonb,
  inventory JSONB NOT NULL DEFAULT '[]'::jsonb,
  powers JSONB NOT NULL DEFAULT '[]'::jsonb,
  scars JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_characters_owner ON public.characters(owner_id);
CREATE INDEX idx_characters_campaign ON public.characters(campaign_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.characters TO authenticated;
GRANT ALL ON public.characters TO service_role;

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "characters_select_owner_or_master"
  ON public.characters FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid()
    OR (campaign_id IS NOT NULL AND public.is_campaign_master(campaign_id, auth.uid()))
  );

CREATE POLICY "characters_insert_own"
  ON public.characters FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "characters_update_owner_or_master"
  ON public.characters FOR UPDATE TO authenticated
  USING (
    owner_id = auth.uid()
    OR (campaign_id IS NOT NULL AND public.is_campaign_master(campaign_id, auth.uid()))
  )
  WITH CHECK (
    owner_id = auth.uid()
    OR (campaign_id IS NOT NULL AND public.is_campaign_master(campaign_id, auth.uid()))
  );

CREATE POLICY "characters_delete_owner"
  ON public.characters FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

CREATE TRIGGER trg_characters_updated
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
