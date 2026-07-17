-- ============================================================
-- BORN TO RUN — BANCO DE DADOS COMPLETO
-- Supabase / PostgreSQL
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABELA: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT,
  bio           TEXT,
  cidade        TEXT,
  objetivo      TEXT,
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TABELA: posts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.posts (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  caption           TEXT,
  photo_url         TEXT,
  distance_km       NUMERIC(6,2),
  duration_minutes  INTEGER,
  pace              TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. TABELA: comments
-- ============================================================
CREATE TABLE IF NOT EXISTS public.comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (length(content) > 0 AND length(content) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. TABELA: likes
-- ============================================================
CREATE TABLE IF NOT EXISTS public.likes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- ============================================================
-- 5. TABELA: workouts
-- ============================================================
CREATE TABLE IF NOT EXISTS public.workouts (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title          TEXT NOT NULL,
  description    TEXT NOT NULL,
  level          TEXT NOT NULL DEFAULT 'iniciante'
                   CHECK (level IN ('iniciante', 'intermediario', 'avancado')),
  objective      TEXT NOT NULL,
  scheduled_date DATE,
  created_by     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 6. TABELA: announcements
-- ============================================================
CREATE TABLE IF NOT EXISTS public.announcements (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id        ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id            ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at         ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id         ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id            ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_workouts_scheduled_date  ON public.workouts(scheduled_date ASC);
CREATE INDEX IF NOT EXISTS idx_announcements_created    ON public.announcements(created_at DESC);

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: Criar perfil automaticamente no cadastro
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNÇÃO: verificar se usuário é admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "profiles_update_admin" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin());

-- POSTS
CREATE POLICY "posts_select" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert" ON public.posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "posts_delete" ON public.posts FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- COMMENTS
CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_delete" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.is_admin());

-- LIKES
CREATE POLICY "likes_select" ON public.likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "likes_insert" ON public.likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "likes_delete" ON public.likes FOR DELETE TO authenticated USING (user_id = auth.uid());

-- WORKOUTS
CREATE POLICY "workouts_select" ON public.workouts FOR SELECT TO authenticated USING (true);
CREATE POLICY "workouts_insert" ON public.workouts FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "workouts_update" ON public.workouts FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "workouts_delete" ON public.workouts FOR DELETE TO authenticated USING (public.is_admin());

-- ANNOUNCEMENTS
CREATE POLICY "announcements_select" ON public.announcements FOR SELECT TO authenticated USING (true);
CREATE POLICY "announcements_insert" ON public.announcements FOR INSERT TO authenticated WITH CHECK (public.is_admin());
CREATE POLICY "announcements_update" ON public.announcements FOR UPDATE TO authenticated USING (public.is_admin());
CREATE POLICY "announcements_delete" ON public.announcements FOR DELETE TO authenticated USING (public.is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg','image/jpg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('post-images', 'post-images', true, 10485760, ARRAY['image/jpeg','image/jpg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Storage: avatars
CREATE POLICY "avatars_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "avatars_insert_own" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);
CREATE POLICY "avatars_delete_own" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- Storage: post-images
CREATE POLICY "post_images_select_public" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');
CREATE POLICY "post_images_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images');
CREATE POLICY "post_images_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-images' AND ((storage.foldername(name))[1] = auth.uid()::TEXT OR public.is_admin()));

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================
