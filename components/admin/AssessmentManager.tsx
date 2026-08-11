'use client'

import { useState } from 'react'
import { Activity, CheckCircle2, ClipboardList, ExternalLink, FileSearch, FileUp, LoaderCircle, LockKeyhole, Pencil, Plus, Scale, Trash2 } from 'lucide-react'
import { deleteBodyAssessment, saveBodyAssessment } from '@/lib/actions/admin'
import { extractTanitaFile } from '@/lib/assessments/ocr-client'
import { formatDate, getTodayCalendarDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import AdminModal from '@/components/admin/AdminModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { BodyAssessment, MemberProfile } from '@/types'

function formatMeasurement(value: number | null, suffix: string) {
  if (value === null) return '—'
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`
}

const MEASUREMENT_KEYS = [
  'weight_kg',
  'body_fat_pct',
  'muscle_mass_kg',
  'visceral_fat_level',
  'body_water_pct',
  'bmi',
  'metabolic_age',
  'bone_mass_kg',
  'basal_metabolic_rate',
  'physique_rating',
] as const

type AssessmentDraft = Record<(typeof MEASUREMENT_KEYS)[number], string> & {
  assessed_at: string
}

function draftFromAssessment(assessment: BodyAssessment | null): AssessmentDraft {
  return {
    assessed_at: assessment?.assessed_at ?? getTodayCalendarDate(),
    weight_kg: assessment?.weight_kg?.toString() ?? '',
    body_fat_pct: assessment?.body_fat_pct?.toString() ?? '',
    muscle_mass_kg: assessment?.muscle_mass_kg?.toString() ?? '',
    visceral_fat_level: assessment?.visceral_fat_level?.toString() ?? '',
    body_water_pct: assessment?.body_water_pct?.toString() ?? '',
    bmi: assessment?.bmi?.toString() ?? '',
    metabolic_age: assessment?.metabolic_age?.toString() ?? '',
    bone_mass_kg: assessment?.bone_mass_kg?.toString() ?? '',
    basal_metabolic_rate: assessment?.basal_metabolic_rate?.toString() ?? '',
    physique_rating: assessment?.physique_rating?.toString() ?? '',
  }
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
  const [draft, setDraft] = useState<AssessmentDraft>(() => draftFromAssessment(null))
  const [ocrState, setOcrState] = useState<{
    status: 'idle' | 'reading' | 'done' | 'error'
    progress: number
    message: string
  }>({ status: 'idle', progress: 0, message: '' })
  const editing = modal && modal !== 'create' ? modal : null
  const athleteNames = new Map(athletes.map((athlete) => [athlete.user_id, athlete.full_name]))

  function openCreate() {
    setError('')
    setDraft(draftFromAssessment(null))
    setOcrState({ status: 'idle', progress: 0, message: '' })
    setModal('create')
  }

  function openEdit(assessment: BodyAssessment) {
    setError('')
    setDraft(draftFromAssessment(assessment))
    setOcrState({ status: 'idle', progress: 0, message: '' })
    setModal(assessment)
  }

  function updateDraft(key: keyof AssessmentDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleSourceFile(file: File | undefined) {
    if (!file) {
      setOcrState({ status: 'idle', progress: 0, message: '' })
      return
    }
    setError('')
    setOcrState({ status: 'reading', progress: 0.02, message: 'Iniciando leitura privada…' })
    try {
      const result = await extractTanitaFile(file, (progress, message) => {
        setOcrState({ status: 'reading', progress, message })
      })
      setDraft((current) => {
        const next = { ...current }
        for (const key of MEASUREMENT_KEYS) {
          const value = result.measurements[key]
          if (value !== undefined) next[key] = String(value)
        }
        if (result.assessedAt && result.assessedAt <= getTodayCalendarDate()) {
          next.assessed_at = result.assessedAt
        }
        return next
      })
      const confidence = result.confidence === null ? '' : ` · confiança visual ${Math.round(result.confidence)}%`
      setOcrState({
        status: 'done',
        progress: 1,
        message: `${result.detectedCount} medida(s) reconhecida(s)${confidence}. ${result.warnings[0]}`,
      })
    } catch (caught) {
      setOcrState({
        status: 'error',
        progress: 0,
        message: caught instanceof Error ? caught.message : 'Não foi possível ler o arquivo automaticamente.',
      })
    }
  }

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
          <p className="mt-1 text-sm text-[#57534E]">Cada pessoa vê somente o próprio histórico. Administrador e treinador podem registrar ou revisar avaliações.</p>
        </div>
        <button type="button" onClick={openCreate} disabled={athletes.length === 0} className="btn-primary shrink-0">
          <Plus size={16} aria-hidden="true" /> Nova avaliação
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-3" aria-label="Como registrar uma avaliação Tanita">
        {[
          ['01', 'Anexe a origem', 'Envie o PDF, JPG ou PNG gerado pela Tanita.'],
          ['02', 'Leitura automática', 'O sistema lê o arquivo no navegador e preenche uma prévia em português.'],
          ['03', 'Confira e publique', 'Revise cada número antes de salvar o acompanhamento privado.'],
        ].map(([number, title, description]) => (
          <div key={number} className="rounded-xl border border-[#E5E1D8] bg-white p-4">
            <span className="font-display text-2xl text-[#DC2626]">{number}</span>
            <p className="mt-1 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#171717]">{title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[#57534E]">{description}</p>
          </div>
        ))}
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
              <button type="button" onClick={() => openEdit(assessment)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4]" aria-label={`Editar avaliação de ${athleteNames.get(assessment.athlete_user_id) ?? 'atleta'}`}><Pencil size={16} /></button>
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
        subtitle="Anexe o relatório Tanita, confira as medidas e publique a apresentação em português."
        onClose={() => !working && ocrState.status !== 'reading' && setModal(null)}
      >
        <form key={editing?.id ?? 'create'} onSubmit={handleSave} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="assessment-athlete" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Pessoa avaliada</label>
              {editing ? (
                <>
                  <input type="hidden" name="athlete_user_id" value={editing.athlete_user_id} />
                  <input id="assessment-athlete" value={athleteNames.get(editing.athlete_user_id) ?? 'Atleta'} disabled className="input-base bg-[#F5F5F4]" />
                </>
              ) : (
                <select id="assessment-athlete" name="athlete_user_id" required defaultValue="" className="input-base bg-white">
                  <option value="" disabled>Selecione um perfil ativo</option>
                  {athletes.map((athlete) => <option key={athlete.user_id} value={athlete.user_id}>{athlete.full_name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label htmlFor="assessment-date" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Data</label>
              <input id="assessment-date" name="assessed_at" type="date" required max={getTodayCalendarDate()} value={draft.assessed_at} onChange={(event) => updateDraft('assessed_at', event.target.value)} className="input-base" />
            </div>
          </div>

          <fieldset className="rounded-xl border border-[#E5E1D8] p-4">
            <legend className="px-1 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Medidas</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <MeasurementInput id="weight_kg" label="Peso (kg)" value={draft.weight_kg} min="20" max="400" onChange={updateDraft} />
              <MeasurementInput id="body_fat_pct" label="Gordura corporal (%)" value={draft.body_fat_pct} min="1" max="75" onChange={updateDraft} />
              <MeasurementInput id="muscle_mass_kg" label="Massa muscular (kg)" value={draft.muscle_mass_kg} min="5" max="250" onChange={updateDraft} />
              <MeasurementInput id="visceral_fat_level" label="Gordura visceral (nível)" value={draft.visceral_fat_level} min="1" max="60" onChange={updateDraft} />
              <MeasurementInput id="body_water_pct" label="Água corporal (%)" value={draft.body_water_pct} min="20" max="80" onChange={updateDraft} />
              <MeasurementInput id="bmi" label="IMC" value={draft.bmi} min="8" max="80" onChange={updateDraft} />
              <MeasurementInput id="bone_mass_kg" label="Massa óssea (kg)" value={draft.bone_mass_kg} min="0.5" max="15" onChange={updateDraft} />
              <div>
                <label htmlFor="metabolic_age" className="mb-1.5 block text-xs font-medium text-[#57534E]">Idade metabólica</label>
                <input id="metabolic_age" name="metabolic_age" type="number" inputMode="numeric" min={10} max={120} step={1} value={draft.metabolic_age} onChange={(event) => updateDraft('metabolic_age', event.target.value)} className="input-base" />
              </div>
              <div>
                <label htmlFor="basal_metabolic_rate" className="mb-1.5 block text-xs font-medium text-[#57534E]">Metabolismo basal (kcal)</label>
                <input id="basal_metabolic_rate" name="basal_metabolic_rate" type="number" inputMode="numeric" min={500} max={10000} step={1} value={draft.basal_metabolic_rate} onChange={(event) => updateDraft('basal_metabolic_rate', event.target.value)} className="input-base" />
              </div>
              <div>
                <label htmlFor="physique_rating" className="mb-1.5 block text-xs font-medium text-[#57534E]">Classificação física Tanita (1–9)</label>
                <input id="physique_rating" name="physique_rating" type="number" inputMode="numeric" min={1} max={9} step={1} value={draft.physique_rating} onChange={(event) => updateDraft('physique_rating', event.target.value)} className="input-base" />
              </div>
            </div>
          </fieldset>

          <div className="rounded-xl border border-[#DBEAFE] bg-[#EFF6FF] p-4">
            <label htmlFor="assessment-source" className="mb-1.5 flex items-center gap-2 font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#1E3A8A]"><FileUp size={16} aria-hidden="true" /> Arquivo original Tanita</label>
            <input id="assessment-source" name="source_file" type="file" accept="application/pdf,image/jpeg,image/png" onChange={(event) => void handleSourceFile(event.target.files?.[0])} disabled={ocrState.status === 'reading'} className="input-base bg-white file:mr-3 file:rounded-md file:border-0 file:bg-[#1E3A8A] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white" />
            <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-relaxed text-[#1E40AF]"><LockKeyhole size={13} className="mt-0.5 shrink-0" aria-hidden="true" /> PDF, JPG ou PNG · máximo 15 MB. A leitura acontece neste navegador; o arquivo só é enviado ao armazenamento privado quando você salva.</p>
            {ocrState.status !== 'idle' && (
              <div className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${ocrState.status === 'error' ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]' : 'border-[#BFDBFE] bg-white text-[#1E3A8A]'}`} role={ocrState.status === 'error' ? 'alert' : 'status'}>
                <div className="flex items-start gap-2">
                  {ocrState.status === 'reading' ? <LoaderCircle size={15} className="mt-0.5 shrink-0 animate-spin" aria-hidden="true" /> : ocrState.status === 'done' ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-[#15803D]" aria-hidden="true" /> : <FileSearch size={15} className="mt-0.5 shrink-0" aria-hidden="true" />}
                  <span>{ocrState.message}</span>
                </div>
                {ocrState.status === 'reading' && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#DBEAFE]"><div className="h-full rounded-full bg-[#2563EB] transition-[width]" style={{ width: `${Math.round(ocrState.progress * 100)}%` }} /></div>}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="assessment-notes" className="mb-1.5 block font-condensed text-sm font-semibold uppercase tracking-[0.06em] text-[#44403C]">Observações</label>
            <textarea id="assessment-notes" name="notes" maxLength={2000} rows={3} defaultValue={editing?.notes ?? ''} className="input-base resize-none" placeholder="Contexto da avaliação, orientações ou observações técnicas…" />
          </div>
          {error && <p role="alert" className="rounded-lg border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p>}
          <button type="submit" disabled={working || ocrState.status === 'reading'} className="btn-primary w-full sm:w-auto"><Activity size={16} aria-hidden="true" /> {working ? 'Salvando…' : ocrState.status === 'reading' ? 'Aguarde a leitura…' : 'Salvar avaliação'}</button>
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
  onChange,
}: {
  id: Exclude<keyof AssessmentDraft, 'assessed_at'>
  label: string
  value: string
  min: string
  max: string
  onChange: (key: keyof AssessmentDraft, value: string) => void
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[#57534E]">{label}</label>
      <input id={id} name={id} type="number" inputMode="decimal" min={min} max={max} step="0.01" value={value} onChange={(event) => onChange(id, event.target.value)} className="input-base" />
    </div>
  )
}
