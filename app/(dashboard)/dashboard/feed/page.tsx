import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NewPostForm from '@/components/feed/NewPostForm'
import PostCard from '@/components/feed/PostCard'

export default async function FeedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('user_id', user.id)
    .single()

  // Busca posts com perfil, likes e comentários
  const { data: posts } = await supabase
    .from('posts')
    .select(`
      *,
      profiles ( id, user_id, full_name, avatar_url, role ),
      comments (
        id, content, created_at, user_id,
        profiles ( id, full_name, avatar_url )
      ),
      likes ( id, user_id )
    `)
    .order('created_at', { ascending: false })
    .limit(30)

  const enrichedPosts = (posts ?? []).map((post) => ({
    ...post,
    likes_count:    (post.likes ?? []).length,
    user_has_liked: (post.likes ?? []).some((l: { user_id: string }) => l.user_id === user.id),
  }))

  const isAdmin = profile?.role === 'admin'

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-black text-stone-900">Feed da Equipe 🏃</h1>
        <p className="text-stone-500 text-sm mt-1">
          Compartilhe sua corrida e veja as atividades da galera!
        </p>
      </div>

      {/* Formulário novo post */}
      <NewPostForm
        avatarUrl={profile?.avatar_url}
        fullName={profile?.full_name || 'Atleta'}
      />

      {/* Lista de posts */}
      {enrichedPosts.length > 0 ? (
        <div className="space-y-5">
          {enrichedPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={user.id}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <div className="text-5xl mb-4">🏃</div>
          <h3 className="font-display font-bold text-stone-700 mb-2">Nenhuma atividade ainda</h3>
          <p className="text-stone-400 text-sm">
            Seja o primeiro a compartilhar um treino com a equipe!
          </p>
        </div>
      )}
    </div>
  )
}
