import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Camera } from 'lucide-react'

export default async function FotosPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch only posts that have photos for this specific user
  const { data: photos } = await supabase
    .from('posts')
    .select('id, image_url, caption, created_at')
    .eq('user_id', user.id)
    .not('image_url', 'is', null)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeria de Momentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Seu álbum pessoal. Todas as fotos que você posta no Feed ficam guardadas aqui.
          </p>
        </div>
      </div>

      {!photos || photos.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-gray-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-red-50 text-[#DC2626] rounded-full flex items-center justify-center mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma foto ainda</h3>
          <p className="text-gray-500 max-w-sm">
            Para adicionar fotos na sua galeria pessoal, faça uma postagem com imagem no "Feed da Equipe".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo: any) => (
            <div key={photo.id} className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <Image 
                src={photo.image_url} 
                alt={photo.caption || 'Foto do treino'} 
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                <p className="text-white text-xs p-3 truncate w-full font-medium">
                  {new Date(photo.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
