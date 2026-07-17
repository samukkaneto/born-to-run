import { createClient } from '@/lib/supabase/server'
import { CreatePost } from '@/components/feed/CreatePost'
import { PostCard } from '@/components/feed/PostCard'

// Define the type based on the Supabase response
type Post = {
  id: string
  content: string
  image_url: string | null
  distance_km: number | null
  pace: string | null
  created_at: string
  profiles: {
    full_name: string | null
    avatar_url: string | null
  }
}

// Helper to format date
function formatTimeAgo(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Agora mesmo'
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) return `Há ${diffInMinutes} min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Há ${diffInHours} h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Há ${diffInDays} d`
  
  return date.toLocaleDateString('pt-BR')
}

// Helper to get initials
function getInitials(name: string | null) {
  if (!name) return 'AT'
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch real posts from Supabase!
  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_created_by_fkey(full_name, avatar_url)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header do Feed */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feed da Equipe</h1>
        <p className="text-sm text-gray-500 mt-1">Acompanhe os treinos e resultados dos seus colegas.</p>
      </div>

      {/* Área de Criação de Post (Rede Social) */}
      <CreatePost />

      {/* Lista de Posts (Mural) */}
      <div className="space-y-6">
        {!posts || posts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
            <p className="text-gray-500">Nenhum post ainda. Seja o primeiro a postar!</p>
          </div>
        ) : (
          posts.map((post: any) => (
            <PostCard 
              key={post.id} 
              authorName={post.profiles?.full_name || 'Atleta Anônimo'}
              authorInitials={getInitials(post.profiles?.full_name)}
              timeAgo={formatTimeAgo(post.created_at)}
              content={post.content}
              imageUrl={post.image_url}
              distance={post.distance_km?.toString()}
              pace={post.pace}
              likes={0} // To implement: Likes table
              comments={0} // To implement: Comments table
            />
          ))
        )}
      </div>
    </div>
  )
}
