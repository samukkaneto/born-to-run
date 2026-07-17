'use client'

import { Heart, MessageCircle, MapPin, Activity } from 'lucide-react'
import Image from 'next/image'

interface PostProps {
  authorName: string
  authorInitials: string
  timeAgo: string
  content: string
  imageUrl?: string
  distance?: string
  pace?: string
  likes: number
  comments: number
}

export function PostCard({
  authorName,
  authorInitials,
  timeAgo,
  content,
  imageUrl,
  distance,
  pace,
  likes,
  comments,
}: PostProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6 transition-shadow hover:shadow-md">
      {/* Header do Post */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-[#DC2626] font-bold">
            {authorInitials}
          </div>
          <div>
            <p className="font-semibold text-gray-900 leading-tight">{authorName}</p>
            <p className="text-xs text-gray-500 mt-0.5">{timeAgo}</p>
          </div>
        </div>
      </div>

      {/* Conteúdo (Texto) */}
      <div className="px-4 pb-3">
        <p className="text-gray-800 whitespace-pre-wrap">{content}</p>
      </div>

      {/* Estatísticas do Treino (estilo Strava) */}
      {(distance || pace) && (
        <div className="px-4 pb-4">
          <div className="flex items-center space-x-6 bg-gray-50 rounded-lg p-3 border border-gray-100">
            {distance && (
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Distância</span>
                <span className="text-lg font-bold text-gray-900">{distance} km</span>
              </div>
            )}
            {pace && (
              <div className="flex flex-col border-l border-gray-200 pl-6">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Ritmo (Pace)</span>
                <span className="text-lg font-bold text-gray-900">{pace} /km</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Imagem do Post (se houver) */}
      {imageUrl && (
        <div className="relative w-full aspect-square bg-gray-100">
          <Image 
            src={imageUrl} 
            alt="Foto do treino" 
            fill 
            style={{ objectFit: 'cover' }} 
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}

      {/* Ações (Curtir / Comentar) */}
      <div className="p-4 border-t border-gray-50 flex items-center space-x-6">
        <button className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-[#DC2626] transition-colors group">
          <Heart className="w-5 h-5 group-hover:fill-[#DC2626] transition-colors" />
          <span>{likes}</span>
        </button>
        <button className="flex items-center space-x-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{comments}</span>
        </button>
      </div>
    </div>
  )
}
