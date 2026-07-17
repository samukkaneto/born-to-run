-- ============================================================
-- MIGRAÇÃO 0002 — Correções de RLS (Fase 2 do plano de reconstrução)
-- Aplicar SOMENTE em bancos que já rodaram o schema original
-- (0001 já incorpora estas correções para instalações novas).
-- ============================================================

-- 1. Admin pode remover perfis (corrige "remover membro" que
--    falhava silenciosamente por ausência de policy DELETE).
DROP POLICY IF EXISTS "profiles_delete_admin" ON public.profiles;
CREATE POLICY "profiles_delete_admin"
  ON public.profiles FOR DELETE TO authenticated
  USING (public.is_admin());

-- 2. WITH CHECK na policy de UPDATE do admin em profiles
--    (antes, faltava validar a linha resultante da atualização).
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Storage avatars: UPDATE também com WITH CHECK
DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT)
  WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- 4. Storage post-images: INSERT restrito à pasta do próprio usuário
--    (antes, qualquer autenticado escrevia em qualquer pasta do bucket).
DROP POLICY IF EXISTS "post_images_insert" ON storage.objects;
CREATE POLICY "post_images_insert"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::TEXT);

-- ============================================================
-- Decisões documentadas (ver DATABASE_AND_SECURITY_REVIEW.md):
-- · Papéis: apenas 'member' e 'admin' (treinador = admin).
-- · Treinos: visíveis a todos os autenticados (sem assigned_to).
-- ============================================================
