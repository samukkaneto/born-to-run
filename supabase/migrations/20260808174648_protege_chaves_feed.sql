-- Protege as chaves temporais do feed. O produto não oferece edição de posts,
-- e posts/comentários/curtidas devem receber UUID e timestamps dos defaults do
-- banco, nunca de valores arbitrários enviados pelo cliente Data API.

revoke update on table public.posts from authenticated;

drop policy if exists posts_update_own_active on public.posts;

-- INSERT continua disponível, mas UUID e timestamps passam a vir sempre dos
-- defaults confiáveis do banco. Isso impede publicar artificialmente no topo.
revoke insert on table public.posts from authenticated;
grant insert (user_id, caption, photo_url, distance_km, duration_minutes, pace)
  on table public.posts to authenticated;

revoke insert on table public.comments from authenticated;
grant insert (post_id, user_id, content)
  on table public.comments to authenticated;

revoke insert on table public.likes from authenticated;
grant insert (post_id, user_id)
  on table public.likes to authenticated;
