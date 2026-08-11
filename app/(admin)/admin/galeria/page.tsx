import { redirect } from 'next/navigation'
import { Images } from 'lucide-react'
import GalleryManager, { type GalleryItemWithUrl } from '@/components/admin/GalleryManager'
import { getAccessContext } from '@/lib/auth/access'
import { createClient } from '@/lib/supabase/server'

export default async function AdminGaleriaPage() {
  const [{ profile }, supabase] = await Promise.all([getAccessContext(), createClient()])
  if (!profile || !['admin', 'coach'].includes(profile.role)) redirect('/dashboard')

  const { data, error } = await supabase
    .from('gallery_items')
    .select('*')
    .order('sort_order')
    .order('created_at', { ascending: false })

  if (error) throw new Error('Não foi possível carregar a galeria institucional.')

  const items = (data ?? []).map((item) => ({
    ...item,
    public_url: supabase.storage.from('gallery').getPublicUrl(item.storage_path).data.publicUrl,
  })) as GalleryItemWithUrl[]

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <p className="section-kicker mb-3">Conteúdo do site</p>
        <h1 className="font-display text-4xl uppercase leading-[0.95] text-[#171717] sm:text-5xl">
          Galeria <span className="text-[#DC2626]">institucional</span>
        </h1>
        <p className="mt-3 flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-[#57534E]">
          <Images size={17} className="mt-0.5 shrink-0 text-[#DC2626]" aria-hidden="true" />
          Publique, ordene, edite legendas e retire fotos sem precisar alterar o código do projeto.
        </p>
      </div>
      <GalleryManager items={items} />
    </div>
  )
}
