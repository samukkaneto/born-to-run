import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createMediaUrl } from '@/lib/supabase/media'
import {
  buildFeedCursorFilter,
  buildFeedPageHref,
  FEED_PAGE_SIZE,
  parseFeedPagination,
} from '@/lib/feed/pagination'
import NewPostForm from '@/components/feed/NewPostForm'
import PostCard, { type FeedPost } from '@/components/feed/PostCard'
import type { Comment, PublicProfile } from '@/types'

type RawComment = Comment & {
  profiles?: Pick<PublicProfile, 'id' | 'user_id' | 'full_name' | 'avatar_url'> | null
}

type RawFeedPost = Omit<FeedPost, 'profiles' | 'comments'> & {
  profiles?: PublicProfile | null
  comments?: RawComment[]
}

type FeedPageProps = {
  searchParams: Promise<{
    cursor?: string | string[]
    direction?: string | string[]
  }>
}

export default async function FeedPage({ searchParams }: FeedPageProps) {
  const pagination = parseFeedPagination(await searchParams)
  if (pagination.kind === 'invalid') redirect('/dashboard/feed')

  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError) throw new Error('Não foi possível validar sua sessão.')
  if (!user) redirect('/login')

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('user_id', user.id)
    .single()
  if (profileError) throw new Error('Não foi possível carregar seu perfil.')

  const ascending = pagination.kind === 'cursor' && pagination.direction === 'newer'
  let postsQuery = supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_user_profile_fkey ( id, user_id, full_name, avatar_url, role ),
      comments (
        id, post_id, content, created_at, user_id,
        profiles!comments_user_profile_fkey ( id, user_id, full_name, avatar_url )
      ),
      likes ( id, user_id )
    `)

  if (pagination.kind === 'cursor') {
    postsQuery = postsQuery.or(
      buildFeedCursorFilter(pagination.direction, pagination.cursor),
    )
  }

  const { data, error: postsError } = await postsQuery
    .order('created_at', { ascending })
    .order('id', { ascending })
    .limit(FEED_PAGE_SIZE + 1)

  if (postsError) throw new Error('Não foi possível carregar o feed da equipe.')

  const fetchedPosts = (data ?? []) as unknown as RawFeedPost[]
  if (pagination.kind === 'cursor' && fetchedPosts.length === 0) {
    redirect('/dashboard/feed')
  }

  const hasExtraPost = fetchedPosts.length > FEED_PAGE_SIZE
  const pagePosts = fetchedPosts.slice(0, FEED_PAGE_SIZE)
  const rawPosts = ascending ? pagePosts.reverse() : pagePosts
  const hasNewerPosts = pagination.kind === 'cursor'
    ? pagination.direction === 'newer'
      ? hasExtraPost
      : rawPosts.length > 0
    : false
  const hasOlderPosts = pagination.kind === 'cursor' && pagination.direction === 'newer'
    ? rawPosts.length > 0
    : hasExtraPost

  const enrichedPosts: FeedPost[] = await Promise.all(
    rawPosts.map(async (post) => {
      const comments = await Promise.all(
        (post.comments ?? [])
          .sort((a, b) => a.created_at.localeCompare(b.created_at))
          .map(async (comment) => ({
            ...comment,
            profiles: comment.profiles
              ? {
                  ...comment.profiles,
                  avatar_url: await createMediaUrl(
                    supabase,
                    'avatars',
                    comment.profiles.avatar_url,
                  ),
                }
              : undefined,
          })),
      )

      return {
        ...post,
        photo_url: await createMediaUrl(supabase, 'post-images', post.photo_url),
        profiles: post.profiles
          ? {
              ...post.profiles,
              avatar_url: await createMediaUrl(supabase, 'avatars', post.profiles.avatar_url),
            }
          : undefined,
        comments,
        likes_count: (post.likes ?? []).length,
        user_has_liked: (post.likes ?? []).some((like) => like.user_id === user.id),
      }
    }),
  )

  const avatarUrl = await createMediaUrl(supabase, 'avatars', profile.avatar_url)
  const isAdmin = profile.role === 'admin'
  const firstPost = rawPosts[0]
  const lastPost = rawPosts.at(-1)
  const previousHref = hasNewerPosts && firstPost
    ? buildFeedPageHref('newer', firstPost)
    : null
  const nextHref = hasOlderPosts && lastPost
    ? buildFeedPageHref('older', lastPost)
    : null

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-black text-stone-900">Feed da Equipe 🏃</h1>
        <p className="mt-1 text-sm text-stone-500">
          Compartilhe sua corrida e acompanhe as atividades da equipe.
        </p>
      </div>

      <NewPostForm avatarUrl={avatarUrl} fullName={profile.full_name || 'Atleta'} />

      {enrichedPosts.length > 0 ? (
        <>
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

          <nav
            aria-label="Navegação entre páginas do feed"
            className="grid grid-cols-3 items-center gap-2 border-t border-[#E5E1D8] pt-5"
          >
            <div>
              {previousHref && (
                <Link
                  href={previousHref}
                  rel="prev"
                  prefetch={false}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[#D6D3D1] bg-white px-3 py-2 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
                  aria-label="Ver publicações mais recentes"
                >
                  <ChevronLeft size={16} aria-hidden="true" /> Anterior
                </Link>
              )}
            </div>

            <div className="text-center">
              {pagination.kind === 'cursor' && (
                <Link
                  href="/dashboard/feed"
                  prefetch={false}
                  className="inline-flex min-h-11 items-center justify-center px-2 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[#57534E] hover:text-[#DC2626]"
                >
                  Mais recentes
                </Link>
              )}
            </div>

            <div className="justify-self-end">
              {nextHref && (
                <Link
                  href={nextHref}
                  rel="next"
                  prefetch={false}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-[#D6D3D1] bg-white px-3 py-2 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C] transition-colors hover:border-[#DC2626] hover:text-[#DC2626]"
                  aria-label="Ver publicações mais antigas"
                >
                  Próxima <ChevronRight size={16} aria-hidden="true" />
                </Link>
              )}
            </div>
          </nav>
        </>
      ) : (
        <div className="card p-12 text-center">
          <div className="mb-4 text-5xl">🏃</div>
          <h3 className="mb-2 font-display font-bold text-stone-700">Nenhuma atividade ainda</h3>
          <p className="text-sm text-stone-500">
            Seja o primeiro a compartilhar um treino com a equipe!
          </p>
        </div>
      )}
    </div>
  )
}
