'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Eye, EyeOff, ImagePlus, Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react'
import AdminModal from '@/components/admin/AdminModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/Toaster'
import { deleteGalleryItem, saveGalleryItem } from '@/lib/actions/gallery'
import { formatDate } from '@/lib/utils'
import type { GalleryItem } from '@/types'

export type GalleryItemWithUrl = GalleryItem & { public_url: string }

export default function GalleryManager({ items }: { items: GalleryItemWithUrl[] }) {
  const { toast } = useToast()
  const [modal, setModal] = useState<'create' | GalleryItemWithUrl | null>(null)
  const [toDelete, setToDelete] = useState<GalleryItemWithUrl | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const editing = modal && modal !== 'create' ? modal : null

  function openModal(value: 'create' | GalleryItemWithUrl) {
    setError('')
    setModal(value)
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const result = await saveGalleryItem(editing?.id ?? null, new FormData(event.currentTarget))
      if (result.error) {
        setError(result.error)
        return
      }
      toast('success', editing ? 'Foto atualizada com sucesso.' : 'Foto adicionada à galeria.')
      setModal(null)
    } catch {
      setError('Não foi possível salvar a foto. Tente novamente.')
    } finally {
      setWorking(false)
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    setWorking(true)
    try {
      const result = await deleteGalleryItem(toDelete.id)
      if (result.error) toast('error', result.error)
      else {
        toast('success', 'Foto removida da galeria.')
        setToDelete(null)
      }
    } catch {
      toast('error', 'Não foi possível remover a foto.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[#D6D3D1] bg-white p-4 sm:flex sm:items-center sm:justify-between sm:gap-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#DCFCE7] text-[#15803D]">
            <ShieldCheck size={19} aria-hidden="true" />
          </span>
          <div>
            <h2 className="font-condensed text-sm font-semibold uppercase tracking-[0.08em] text-[#171717]">Galeria institucional protegida</h2>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#57534E]">
              Somente administrador e treinador publicam fotos no site. Fotos pessoais dos atletas continuam separadas no feed privado.
            </p>
          </div>
        </div>
        <button type="button" onClick={() => openModal('create')} className="btn-primary mt-4 w-full shrink-0 sm:mt-0 sm:w-auto">
          <Plus size={16} aria-hidden="true" /> Nova foto
        </button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="card overflow-hidden">
              <div className="relative aspect-[16/10] bg-[#E7E5E4]">
                <Image src={item.public_url} alt={item.alt_text} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
                <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${item.is_published ? 'bg-[#DCFCE7] text-[#166534]' : 'bg-[#171717]/85 text-white'}`}>
                  {item.is_published ? <Eye size={12} aria-hidden="true" /> : <EyeOff size={12} aria-hidden="true" />}
                  {item.is_published ? 'Publicada' : 'Rascunho'}
                </span>
              </div>
              <div className="flex items-start gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-condensed text-base font-semibold uppercase tracking-[0.04em] text-[#171717]">
                    {item.title || 'Foto sem título'}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-[#57534E]">{item.caption || 'Sem legenda — ela não aparecerá no site.'}</p>
                  <p className="mt-2 text-xs text-[#78716C]">
                    {item.taken_at ? formatDate(item.taken_at) : 'Data não informada'} · ordem {item.sort_order}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => openModal(item)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4] hover:text-[#171717]" aria-label={`Editar ${item.title || 'foto'}`}><Pencil size={16} /></button>
                  <button type="button" onClick={() => setToDelete(item)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label={`Remover ${item.title || 'foto'}`}><Trash2 size={16} /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-[#57534E]">
          <ImagePlus size={32} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
          <p className="text-sm">Nenhuma foto foi cadastrada pelo painel ainda.</p>
        </div>
      )}

      <AdminModal
        open={modal !== null}
        title={editing ? 'Editar foto' : 'Nova foto'}
        subtitle="Basta escolher a foto. Título, legenda e descrição são opcionais."
        onClose={() => !working && setModal(null)}
      >
        <form key={editing?.id ?? 'create'} onSubmit={handleSave} className="space-y-4">
          {editing && (
            <div className="relative aspect-[16/8] overflow-hidden rounded-lg bg-[#E7E5E4]">
              <Image src={editing.public_url} alt="Foto atualmente cadastrada" fill className="object-cover" sizes="480px" />
            </div>
          )}
          <div>
            <label htmlFor="gallery-photo" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Foto {editing ? '(opcional para substituir)' : ''}</label>
            <input id="gallery-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" required={!editing} className="input-base file:mr-3 file:rounded-md file:border-0 file:bg-[#171717] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
            <p className="mt-1 text-xs text-[#78716C]">JPG, PNG ou WebP · máximo 12 MB.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gallery-title" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Título opcional</label>
              <input id="gallery-title" name="title" defaultValue={editing?.title ?? ''} maxLength={120} className="input-base" placeholder="Ex: Treino de sábado" />
            </div>
            <div>
              <label htmlFor="gallery-taken-at" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Data da foto</label>
              <input id="gallery-taken-at" name="taken_at" type="date" defaultValue={editing?.taken_at ?? ''} className="input-base" />
            </div>
          </div>
          <div>
            <label htmlFor="gallery-caption" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Legenda opcional</label>
            <textarea id="gallery-caption" name="caption" defaultValue={editing?.caption ?? ''} maxLength={500} rows={3} className="input-base resize-none" placeholder="Se ficar vazio, nenhuma faixa de legenda será exibida." />
          </div>
          <div>
            <label htmlFor="gallery-alt" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Descrição acessível opcional</label>
            <input id="gallery-alt" name="alt_text" defaultValue={editing?.alt_text === 'Foto da equipe Born to Run' ? '' : editing?.alt_text ?? ''} maxLength={250} className="input-base" placeholder="Opcional · usado apenas por leitores de tela" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="gallery-layout" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Formato</label>
              <select id="gallery-layout" name="layout" defaultValue={editing?.layout ?? 'standard'} className="input-base">
                <option value="standard">Normal</option>
                <option value="wide">Destaque largo</option>
              </select>
            </div>
            <div>
              <label htmlFor="gallery-order" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Ordem</label>
              <input id="gallery-order" name="sort_order" type="number" min="0" max="10000" defaultValue={editing?.sort_order ?? 0} required className="input-base" />
            </div>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E1D8] p-3 text-sm text-[#44403C]">
            <input name="consent_confirmed" type="checkbox" defaultChecked={editing?.consent_confirmed ?? false} className="mt-0.5 h-4 w-4 accent-[#DC2626]" />
            <span><strong className="block text-[#171717]">Uso de imagem autorizado</strong>Confirmo que a equipe pode usar esta foto na divulgação institucional.</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[#E5E1D8] p-3 text-sm text-[#44403C]">
            <input name="is_published" type="checkbox" defaultChecked={editing?.is_published ?? true} className="mt-0.5 h-4 w-4 accent-[#DC2626]" />
            <span><strong className="block text-[#171717]">Publicar no site</strong>Desmarque para guardar como rascunho.</span>
          </label>
          {error && <p role="alert" className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p>}
          <button type="submit" disabled={working} className="btn-primary w-full sm:w-auto">{working ? 'Salvando…' : 'Salvar foto'}</button>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Remover foto"
        description="A foto será apagada da galeria e do armazenamento. Esta ação não pode ser desfeita."
        confirmLabel="Remover foto"
        loadingLabel="Removendo…"
        loading={working}
        onConfirm={handleDelete}
        onCancel={() => !working && setToDelete(null)}
      />
    </div>
  )
}
