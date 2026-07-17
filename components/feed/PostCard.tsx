'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Heart, MessageCircle, Trash2, Loader2, Send } from 'lucide-react'
import { toggleLike, addComment, deletePost } from '@/lib/actions/feed'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import type { Post, Comment } from '@/types'

export interface FeedPost extends Post {
  comments?: Comment[]
  likes?: { id: string; user_id: string }[]
}

interface PostCardProps {
  post: FeedPost
  currentUserId: string
  isAdmin?: boolean
}

export default function PostCard({ post, currentUserId, isAdmin = false }: PostCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isLiking, startLike] = useTransition()

  const authorName = post.profiles?.full_name || 'Atleta'
  const canDelete = post.user_id === currentUserId || isAdmin
  const comments = post.comments ?? []
  const likesCount = post.likes_count ?? (post.likes ?? []).length

  function handleLike() {
    startLike(() => {
      void toggleLike(post.id)
    })
  }

  function handleDelete() {
    if (!confirm('Excluir esta publicação?')) return
    startTransition(() => {
      void deletePost(post.id)
    })
  }

  function handleComment(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!commentText.trim()) return
    const formData = new FormData()
    formData.set('post_id', post.id)
    formData.set('content', commentText.trim())
    startTransition(async () => {
      const result = await addComment(formData)
      if (!result?.error) setCommentText('')
    })
  }

  return (
    <article className="card overflow-hidden">
      {/* Cabeçalho */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center overflow-hidden shrink-0">
            {post.profiles?.avatar_url ? (
              <Image
                src={post.profiles.avatar_url}
                alt={`Avatar de ${authorName}`}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="text-[#DC2626] font-bold text-sm">
                {getInitials(authorName)}
              </span>
            )}
          </div>
          <div>
            <p className="font-semibold text-stone-900 leading-tight">{authorName}</p>
            <p className="text-xs text-stone-500 mt-0.5">
              {formatRelativeTime(post.created_at)}
            </p>
          </div>
        </div>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-stone-300 hover:text-[#DC2626] transition-colors rounded-full hover:bg-stone-50"
            aria-label="Excluir publicação"
          >
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {/* Legenda */}
      {post.caption && (
        <div className="px-4 pb-3">
          <p className="text-stone-800 whitespace-pre-wrap text-sm leading-relaxed">
            {post.caption}
          </p>
        </div>
      )}

      {/* Métricas do treino */}
      {(post.distance_km || post.pace || post.duration_minutes) && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-6 bg-stone-50 rounded-lg p-3 border border-stone-100">
            {post.distance_km != null && (
              <div className="flex flex-col">
                <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-0.5">
                  Distância
                </span>
                <span className="text-base font-bold text-stone-900">
                  {post.distance_km} km
                </span>
              </div>
            )}
            {post.duration_minutes != null && (
              <div className="flex flex-col border-l border-stone-200 pl-6">
                <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-0.5">
                  Duração
                </span>
                <span className="text-base font-bold text-stone-900">
                  {post.duration_minutes} min
                </span>
              </div>
            )}
            {post.pace && (
              <div className="flex flex-col border-l border-stone-200 pl-6">
                <span className="text-[10px] text-stone-500 font-semibold uppercase tracking-wider mb-0.5">
                  Pace
                </span>
                <span className="text-base font-bold text-stone-900">{post.pace} /km</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Foto */}
      {post.photo_url && (
        <div className="relative w-full aspect-square bg-stone-100">
          <Image
            src={post.photo_url}
            alt="Foto do treino"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, 672px"
          />
        </div>
      )}

      {/* Ações */}
      <div className="px-4 py-3 border-t border-stone-100 flex items-center gap-6">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 text-sm font-medium transition-colors group ${
            post.user_has_liked ? 'text-[#DC2626]' : 'text-stone-500 hover:text-[#DC2626]'
          }`}
          aria-label={post.user_has_liked ? 'Remover curtida' : 'Curtir'}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              post.user_has_liked ? 'fill-[#DC2626]' : 'group-hover:fill-[#FEE2E2]'
            }`}
          />
          <span>{likesCount}</span>
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
          aria-expanded={showComments}
          aria-label="Ver comentários"
        >
          <MessageCircle className="w-5 h-5" />
          <span>{comments.length}</span>
        </button>
      </div>

      {/* Comentários */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-stone-50 pt-3 space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center shrink-0 text-[10px] font-bold text-stone-500">
                {getInitials(c.profiles?.full_name || 'A')}
              </div>
              <div className="bg-stone-50 rounded-xl px-3 py-2 text-sm flex-1 min-w-0">
                <span className="font-semibold text-stone-800">
                  {c.profiles?.full_name || 'Atleta'}
                </span>{' '}
                <span className="text-stone-600">{c.content}</span>
              </div>
            </div>
          ))}

          <form onSubmit={handleComment} className="flex items-center gap-2 pt-1">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Escreva um comentário..."
              maxLength={500}
              className="input-base text-sm flex-1"
            />
            <button
              type="submit"
              disabled={isPending || !commentText.trim()}
              className="p-2.5 rounded-full bg-[#DC2626] text-white hover:bg-[#B91C1C] transition-colors disabled:opacity-50"
              aria-label="Enviar comentário"
            >
              {isPending ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </form>
        </div>
      )}
    </article>
  )
}
