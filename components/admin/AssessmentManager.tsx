'use client'

import { useState } from 'react'
import { Activity, ClipboardList, ExternalLink, FileUp, Pencil, Plus, Scale, Trash2 } from 'lucide-react'
import { deleteBodyAssessment, saveBodyAssessment } from '@/lib/actions/admin'
import { formatDate, getTodayCalendarDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import AdminModal from '@/components/admin/AdminModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { BodyAssessment, MemberProfile } from '@/types'

function formatMeasurement(value: number | null, suffix: string) {
  if (value === null) return '—'
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`
}

export default function AssessmentManager({
  assessments,
  athletes,
}: {
  assessments: (BodyAssessment & { source_url?: string | null })[]
  athletes: MemberProfile[]
}) {
  const { toast } = useToast()
  const [modal, setModal] = useState<'create' | BodyAssessment | null>(null)
  const [toDelete, setToDelete] = useState<BodyAssessment | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const editing = modal && modal !== 'create' ? modal : null
  const athleteNames = new Map(athletes.map((athlete) => [athlete.user_id, athlete.full_name]))

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const result = await saveBodyAssessment(editing?.id ?? null, new FormData(event.currentTarget))
      if (result.error) {
        setError(result.error)
        return
      }
      toast('success', editing ? 'Avaliação atualizada.' : 'Avaliação registrada com segurança.')
      setModal(null)
    } catch {
      setError('Não foi possível salvar a avaliação. Tente novamente.')
    } finally {
      setWorking(false)
    }
  }

  async function handleDelete() {
    if (!toDelete) return
    setWorking(true)
    try {
      const result = await deleteBodyAssessment(toDelete.id)
      if (result.error) toast('error', result.error)
      else {
        toast('success', 'Avaliação removida.')
        setToDelete(null)
      }
    } catch {
      toast('error', 'Não foi possível remover a avaliação.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 rounded-xl border border-[#E5E1D8] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-condensed text-sm font-semibold uppercase tracking-[0.08em] text-[#171717]">Dados privados de saúde</p>
          <p className="mt-1 text-sm text-[#57534E]">Cada atleta vê somente o próprio histórico. Administrador e treinador podem registrar ou revisar avaliações.</p>
        </div>
        <button type="button" onClick={() => { setError(''); setModal('create') }} disabled={athletes.length === 0} className="btn-primary shrink-0">
          <Plus size={16} aria-hidden="true" /> Nova avaliação
        </button>
      </div>

      <div className="space-y-3">
        {assessments.length > 0 ? assessments.map((assessment) => (
          <article key={assessment.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#7C3AED]">
              <Scale size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-[#171717]">{athleteNames.get(assessment.athlete_user_id) ?? 'Atleta'}</h3>
                <span className="badge badge-gray">{formatDate(assessment.assessed_at)}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#57534E]">
                <span>Peso: <strong>{formatMeasurement(assessment.weight_kg, ' kg')}</strong></span>
                <span>Gordura: <strong>{formatMeasurement(assessment.body_fat_pct, '%')}</strong></span>
                <span>Massa muscular: <strong>{formatMeasurement(assessment.muscle_mass_kg, ' kg')}</strong></span>
                <span>IMC: <strong>{formatMeasurement(assessment.bmi, '')}</strong></span>
                <span>Massa óssea: <strong>{formatMeasurement(assessment.bone_mass_kg, ' kg')}</strong></span>
              </div>
            </div>
            <div className="flex shrink-0 gap-1 self-end sm:self-auto">
              {assessment.source_url && <a href={assessment.source_url} target="_blank" rel="noreferrer" className="flex min-h-11 items-center rounded-lg p-2.5 text-[#57534E] hover:bg-[#EFF6FF] hover:text-[#2563EB]" aria-label="Abrir arquivo original da avaliação"><ExternalLink size={16} /></a>}
              <button type="button" onClick={() => { setError(''); setModal(assessment) }} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4]" aria-label={`Editar avaliação de ${athleteNames.get(assessment.athlete_user_id) ?? 'atleta'}`}><Pencil size={16} /></button>
              <button type="button" onClick={() => setToDelete(assessment)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label={`Remover avaliação de ${athleteNames.get(assessment.athlete_user_id) ?? 'atleta'}`}><Trash2 size={16} /></button>
            </div>
          </article>
        )) : (
          <div className="card p-10 text-center text-[#57534E]">
            <ClipboardList size={30} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
            <p className="text-sm">Nenhuma avaliação registrada ainda.</p>
          </div>
        )}
      </div>

      <AdminModal
        open={modal !== null}
        title={editing ? 'Editar avaliação' : 'Nova avaliação'}
        subtitle="Anexe o relatório Tanita e registre os valores que serão apresentados em português."
        onClose={() => !working && setModal(null)}
      >
        <form key={editing?.id ?? 'create'} onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="assessment-athlete" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Atleta</label>
              {editing ? (
                <>
                  <input type="hidden" name="athlete_user_id" value={editing.athlete_user_id} />
                  <input id="assessment-athlete" value={athleteNames.get(editing.athlete_user_id) ?? 'Atleta'} disabled className="input-base bg-[#F5F5F4]" />
                </>
              ) : (
                <select id="assessment-athlete" name="athlete_user_id" required defaultValue="" className="input-base bg-white">
                  <option value="" disabled>Selecione o atleta</option>
                  {athletes.map((athlete) => <option key={athlete.user_id} value={athlete.user_id}>{athlete.full_name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label htmlFor="assessment-date" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Data</label>
              <input id="assessment-date" name="assessed_at" type="date" required max={getTodayCalendarDate()} defaultValue={editing?.assessed_at ?? getTodayCalendarDate()} className="input-base" />
            </div>
          </div>

          <fieldset className="rounded-xl border border-[#E5E1D8] p-4">
            <legend className="px-1 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Medidas</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <MeasurementInput id="weight_kg" label="Peso (kg)" value={editing?.weight_kg} min="20" max="400" />
              <MeasurementInput id="body_fat_pct" label="Gordura corporal (%)" value={editing?.body_fat_pct} min="1" max="75" />
              <MeasurementInput id="muscle_mass_kg" label="Massa muscular (kg)" value={editing?.muscle_mass_kg} min="5" max="250" />
              <MeasurementInput id="visceral_fat_level" label="Gordura visceral (nível)" value={editing?.visceral_fat_level} min="1" max="60" />
              <MeasurementInput id="body_water_pct" label="Água corporal (%)" value={editing?.body_water_pct} min="20" max="80" />
              <MeasurementInput id="bmi" label="IMC" value={editing?.bmi} min="8" max="80" />
              <MeasurementInput id="bone_mass_kg" label="Massa óssea (kg)" value={editing?.bone_mass_kg} min="0.5" max="15" />
              <div>
                <label htmlFor="metabolic_age" className="mb-1.5 block text-xs font-medium text-[#57534E]">Idade metabólica</label>
                <input id="metabolic_age" name="metabolic_age" type="number" inputMode="numeric" min={10} max={120} step={1} defaultValue={editing?.metabolic_age ?? ''} className="input-base" />
              </div>
              <div>
                <label htmlFor="basal_metabolic_rate" className="mb-1.5 block text-xs font-medium text-[#57534E]">Metabolismo basal (kcal)</label>
                <input id="basal_metabolic_rate" name="basal_metabolic_rate" type="number" inputMode="numeric" min={500} max={10000} step={1} defaultValue={editing?.basal_metabolic_rate ?? ''} className="input-base" />
              </div>
              <div>
                <label htmlFor="physique_rating" className="mb-1.5 block text-xs font-medium text-[#57534E]">Classificação física Tanita (1–9)</label>
                <input id="physique_rating" name="physique_rating" type="number" inputMode="numeric" min={1} max={9} step={1} defaultValue={editing?.physique_rating ?? ''} className="input-base" />
              </div>
            </div>
          </fieldset>

          <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
            <label htmlFor="assessment-source" className="mb-1.5 flex items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#1E3A8A]"><FileUp size={16} aria-hidden="true" /> Arquivo original Tanita</label>
            <input id="assessment-source" name="source_file" type="file" accept="application/pdf,image/jpeg,image/png" className="input-base bg-white file:mr-3 file:rounded-md file:border-0 file:bg-[#1E3A8A] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
            <p className="mt-1.5 text-xs leading-relaxed text-[#1E40AF]">PDF, JPG ou PNG · máximo 15 MB. O arquivo fica privado entre atleta e equipe técnica. Nesta etapa ele serve como fonte conferível; a leitura automática será calibrada depois que recebermos um exemplo real da Tanita.</p>
          </div>

          <div>
            <label htmlFor="assessment-notes" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Observações</label>
            <textarea id="assessment-notes" name="notes" maxLength={2000} rows={3} defaultValue={editing?.notes ?? ''} className="input-base resize-none" placeholder="Contexto da avaliação, orientações ou observações técnicas…" />
          </div>
          {error && <p role="alert" className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p>}
          <button type="submit" disabled={working} className="btn-primary w-full sm:w-auto"><Activity size={16} aria-hidden="true" /> {working ? 'Salvando…' : 'Salvar avaliação'}</button>
        </form>
      </AdminModal>

      <ConfirmDialog
        open={toDelete !== null}
        title="Remover avaliação"
        description="A avaliação será apagada do histórico do atleta. Esta ação não pode ser desfeita."
        confirmLabel="Remover avaliação"
        loadingLabel="Removendo…"
        loading={working}
        onConfirm={handleDelete}
        onCancel={() => !working && setToDelete(null)}
      />
    </div>
  )
}

function MeasurementInput({
  id,
  label,
  value,
  min,
  max,
}: {
  id: string
  label: string
  value?: number | null
  min: string
  max: string
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[#57534E]">{label}</label>
      <input id={id} name={id} type="number" inputMode="decimal" min={min} max={max} step="0.01" defaultValue={value ?? ''} className="input-base" />
    </div>
  )
}
