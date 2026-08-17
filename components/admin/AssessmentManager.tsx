'use client'

import { useState } from 'react'
import { Activity, CheckCircle2, ClipboardList, ExternalLink, FileImage, FileSearch, LoaderCircle, LockKeyhole, Pencil, Plus, Scale, Trash2 } from 'lucide-react'
import { deleteBodyAssessment, saveBodyAssessment } from '@/lib/actions/admin'
import { extractTanitaFile } from '@/lib/assessments/ocr-client'
import type { TanitaPhotoSlot } from '@/lib/assessments/tanita-template'
import { formatDate, getTodayCalendarDate } from '@/lib/utils'
import { useToast } from '@/components/ui/Toaster'
import AdminModal from '@/components/admin/AdminModal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import type { BodyAssessment, MemberProfile } from '@/types'

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
  'fat_mass_kg',
  'fat_free_mass_kg',
  'body_water_mass_kg',
  'daily_calorie_intake',
  'heart_rate_bpm',
  'segment_left_arm_fat_pct',
  'segment_right_arm_fat_pct',
  'segment_trunk_fat_pct',
  'segment_left_leg_fat_pct',
  'segment_right_leg_fat_pct',
  'segment_left_arm_muscle_kg',
  'segment_right_arm_muscle_kg',
  'segment_trunk_muscle_kg',
  'segment_left_leg_muscle_kg',
  'segment_right_leg_muscle_kg',
] as const

type MeasurementKey = (typeof MEASUREMENT_KEYS)[number]
type AssessmentDraft = Record<MeasurementKey, string> & { assessed_at: string; body_fat_category: string }
type AssessmentSource = { slot: number; storage_path: string; mime_type: string; source_url: string | null }
type AssessmentView = BodyAssessment & { source_url?: string | null; source_files?: AssessmentSource[] }

type FieldDefinition = {
  id: MeasurementKey
  label: string
  min: number
  max: number
  step?: number
}

const FIELD_GROUPS: { title: string; description: string; fields: FieldDefinition[] }[] = [
  {
    title: 'Composição corporal',
    description: 'Resumo principal da Foto 1.',
    fields: [
      { id: 'weight_kg', label: 'Peso (kg)', min: 20, max: 400 },
      { id: 'bmi', label: 'IMC', min: 8, max: 80 },
      { id: 'body_fat_pct', label: 'Gordura corporal (%)', min: 1, max: 75 },
      { id: 'fat_mass_kg', label: 'Massa de gordura (kg)', min: 1, max: 300 },
      { id: 'fat_free_mass_kg', label: 'Massa livre de gordura (kg)', min: 1, max: 300 },
      { id: 'muscle_mass_kg', label: 'Massa muscular (kg)', min: 5, max: 250 },
      { id: 'bone_mass_kg', label: 'Massa óssea (kg)', min: 0.5, max: 15 },
      { id: 'body_water_pct', label: 'Água corporal (%)', min: 20, max: 80 },
      { id: 'body_water_mass_kg', label: 'Massa de água (kg)', min: 1, max: 300 },
      { id: 'visceral_fat_level', label: 'Gordura visceral (nível)', min: 1, max: 60 },
    ],
  },
  {
    title: 'Metabolismo e classificação',
    description: 'Indicadores metabólicos traduzidos da Foto 1.',
    fields: [
      { id: 'basal_metabolic_rate', label: 'Metabolismo basal (kcal)', min: 500, max: 10000, step: 1 },
      { id: 'daily_calorie_intake', label: 'Ingestão calórica diária (kcal)', min: 500, max: 15000, step: 1 },
      { id: 'metabolic_age', label: 'Idade metabólica', min: 10, max: 120, step: 1 },
      { id: 'physique_rating', label: 'Classificação física Tanita (1–9)', min: 1, max: 9, step: 1 },
      { id: 'heart_rate_bpm', label: 'Frequência cardíaca (bpm)', min: 30, max: 240, step: 1 },
    ],
  },
  {
    title: 'Gordura segmental',
    description: 'Percentuais da Foto 3.',
    fields: [
      { id: 'segment_left_arm_fat_pct', label: 'Braço esquerdo (%)', min: 1, max: 75 },
      { id: 'segment_right_arm_fat_pct', label: 'Braço direito (%)', min: 1, max: 75 },
      { id: 'segment_trunk_fat_pct', label: 'Tronco (%)', min: 1, max: 75 },
      { id: 'segment_left_leg_fat_pct', label: 'Perna esquerda (%)', min: 1, max: 75 },
      { id: 'segment_right_leg_fat_pct', label: 'Perna direita (%)', min: 1, max: 75 },
    ],
  },
  {
    title: 'Massa muscular segmental',
    description: 'Massa muscular em cada região da Foto 3.',
    fields: [
      { id: 'segment_left_arm_muscle_kg', label: 'Braço esquerdo (kg)', min: 0.1, max: 100 },
      { id: 'segment_right_arm_muscle_kg', label: 'Braço direito (kg)', min: 0.1, max: 100 },
      { id: 'segment_trunk_muscle_kg', label: 'Tronco (kg)', min: 0.1, max: 150 },
      { id: 'segment_left_leg_muscle_kg', label: 'Perna esquerda (kg)', min: 0.1, max: 100 },
      { id: 'segment_right_leg_muscle_kg', label: 'Perna direita (kg)', min: 0.1, max: 100 },
    ],
  },
]

const TANITA_PHOTOS = [
  { slot: 1, title: 'Foto 1 · Resumo', description: 'Peso, composição corporal, metabolismo e classificação.' },
  { slot: 2, title: 'Foto 2 · Faixas', description: 'Gráficos de referência de IMC, gordura, água e gordura visceral.' },
  { slot: 3, title: 'Foto 3 · Segmentos', description: 'Gordura e massa muscular em braços, tronco e pernas.' },
] as const

const SUMMARY_KEYS = MEASUREMENT_KEYS.filter((key) => !key.startsWith('segment_'))
const GRAPH_KEYS: MeasurementKey[] = ['bmi', 'body_fat_pct', 'body_water_pct', 'visceral_fat_level']
const SEGMENT_KEYS = MEASUREMENT_KEYS.filter((key) => key.startsWith('segment_'))
const PHOTO_KEYS: Record<TanitaPhotoSlot, readonly MeasurementKey[]> = {
  1: SUMMARY_KEYS,
  2: GRAPH_KEYS,
  3: SEGMENT_KEYS,
}

function emptyDraft(): AssessmentDraft {
  return Object.fromEntries([
    ['assessed_at', getTodayCalendarDate()],
    ['body_fat_category', ''],
    ...MEASUREMENT_KEYS.map((key) => [key, '']),
  ]) as AssessmentDraft
}

function draftFromAssessment(assessment: BodyAssessment | null): AssessmentDraft {
  const draft = emptyDraft()
  if (!assessment) return draft
  draft.assessed_at = assessment.assessed_at
  draft.body_fat_category = assessment.body_fat_category ?? ''
  for (const key of MEASUREMENT_KEYS) draft[key] = assessment[key]?.toString() ?? ''
  return draft
}

function formatMeasurement(value: number | null, suffix: string) {
  if (value === null) return '—'
  return `${Number(value).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}${suffix}`
}

export default function AssessmentManager({
  assessments,
  athletes,
}: {
  assessments: AssessmentView[]
  athletes: MemberProfile[]
}) {
  const { toast } = useToast()
  const [modal, setModal] = useState<'create' | AssessmentView | null>(null)
  const [toDelete, setToDelete] = useState<AssessmentView | null>(null)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState('')
  const [draft, setDraft] = useState<AssessmentDraft>(() => emptyDraft())
  const [ocrState, setOcrState] = useState<{ status: 'idle' | 'reading' | 'done' | 'error'; progress: number; message: string }>({ status: 'idle', progress: 0, message: '' })
  const editing = modal && modal !== 'create' ? modal : null
  const athleteNames = new Map(athletes.map((athlete) => [athlete.user_id, athlete.full_name]))

  function openCreate() {
    setError('')
    setDraft(emptyDraft())
    setOcrState({ status: 'idle', progress: 0, message: '' })
    setModal('create')
  }

  function openEdit(assessment: AssessmentView) {
    setError('')
    setDraft(draftFromAssessment(assessment))
    setOcrState({ status: 'idle', progress: 0, message: '' })
    setModal(assessment)
  }

  function updateDraft(key: keyof AssessmentDraft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  async function handleSourceFile(slot: TanitaPhotoSlot, file: File | undefined) {
    if (!file) return
    setError('')
    setOcrState({ status: 'reading', progress: 0.02, message: `Preparando a Foto ${slot}…` })
    try {
      const result = await extractTanitaFile(file, slot, (progress, message) => {
        setOcrState({ status: 'reading', progress, message: `Foto ${slot}: ${message}` })
      })
      setDraft((current) => {
        const next = { ...current }
        for (const key of PHOTO_KEYS[slot]) {
          const value = result.measurements[key]
          if (value !== undefined) next[key] = String(value)
        }
        if (result.assessedAt && result.assessedAt <= getTodayCalendarDate()) next.assessed_at = result.assessedAt
        if (result.labels.bodyFatCategory) next.body_fat_category = result.labels.bodyFatCategory
        return next
      })
      const recognizedCount = PHOTO_KEYS[slot].filter((key) => result.measurements[key] !== undefined).length
      const confidence = result.confidence === null ? '' : ` · confiança visual ${Math.round(result.confidence)}%`
      setOcrState({ status: 'done', progress: 1, message: `Foto ${slot}: ${recognizedCount} campo(s) preenchido(s)${confidence}. Confira os valores antes de salvar.` })
    } catch (caught) {
      setOcrState({ status: 'error', progress: 0, message: caught instanceof Error ? caught.message : `Não foi possível ler a Foto ${slot}.` })
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setWorking(true)
    setError('')
    try {
      const result = await saveBodyAssessment(editing?.id ?? null, new FormData(event.currentTarget))
      if (result.error) setError(result.error)
      else {
        toast('success', editing ? 'Avaliação atualizada.' : 'Avaliação registrada com segurança.')
        setModal(null)
      }
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
      else { toast('success', 'Avaliação removida.'); setToDelete(null) }
    } catch {
      toast('error', 'Não foi possível remover a avaliação.')
    } finally {
      setWorking(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 border-l-4 border-l-[#7C3AED] bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="font-condensed text-sm font-semibold uppercase tracking-[0.08em] text-[#171717]">Avaliação Tetrapolar Segmentada</p><p className="mt-1 text-sm text-[#57534E]">Foto 1: resumo · Foto 2: faixas · Foto 3: segmentos. Administrador e treinador podem registrar qualquer perfil ativo.</p></div>
        <button type="button" onClick={openCreate} disabled={athletes.length === 0} className="btn-primary shrink-0"><Plus size={16} aria-hidden="true" /> Nova avaliação</button>
      </div>

      <div className="space-y-3">
        {assessments.length ? assessments.map((assessment) => (
          <article key={assessment.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#EDE9FE] text-[#7C3AED]"><Scale size={20} aria-hidden="true" /></span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#171717]">{athleteNames.get(assessment.athlete_user_id) ?? 'Atleta'}</h3><span className="badge badge-gray">{formatDate(assessment.assessed_at)}</span><span className="badge badge-green">{assessment.source_files?.length ?? 0}/3 fotos</span></div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#57534E]"><span>Peso: <strong>{formatMeasurement(assessment.weight_kg, ' kg')}</strong></span><span>Gordura: <strong>{formatMeasurement(assessment.body_fat_pct, '%')}</strong></span><span>Massa muscular: <strong>{formatMeasurement(assessment.muscle_mass_kg, ' kg')}</strong></span><span>IMC: <strong>{formatMeasurement(assessment.bmi, '')}</strong></span></div>
            </div>
            <div className="flex shrink-0 gap-1 self-end sm:self-auto">
              {(assessment.source_files ?? []).map((file) => file.source_url && <a key={file.slot} href={file.source_url} target="_blank" rel="noreferrer" className="flex min-h-11 items-center rounded-lg p-2.5 text-[#57534E] hover:bg-[#EFF6FF] hover:text-[#2563EB]" aria-label={`Abrir Foto ${file.slot} da Tanita`}><span className="mr-1 text-[10px] font-bold">{file.slot}</span><ExternalLink size={15} /></a>)}
              {assessment.source_url && <a href={assessment.source_url} target="_blank" rel="noreferrer" className="flex min-h-11 items-center rounded-lg p-2.5 text-[#57534E] hover:bg-[#EFF6FF] hover:text-[#2563EB]" aria-label="Abrir arquivo Tanita antigo"><ExternalLink size={16} /></a>}
              <button type="button" onClick={() => openEdit(assessment)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#F5F5F4]" aria-label="Editar avaliação"><Pencil size={16} /></button>
              <button type="button" onClick={() => setToDelete(assessment)} className="min-h-11 rounded-lg p-2.5 text-[#57534E] hover:bg-[#FEE2E2] hover:text-[#DC2626]" aria-label="Remover avaliação"><Trash2 size={16} /></button>
            </div>
          </article>
        )) : <div className="card p-10 text-center text-[#57534E]"><ClipboardList size={30} className="mx-auto mb-3 opacity-40" aria-hidden="true" /><p className="text-sm">Nenhuma avaliação registrada ainda.</p></div>}
      </div>

      <AdminModal open={modal !== null} title={editing ? 'Editar Avaliação Tetrapolar Segmentada' : 'Nova Avaliação Tetrapolar Segmentada'} subtitle="Anexe as três imagens na ordem correta e confira a leitura automática antes de salvar." onClose={() => !working && ocrState.status !== 'reading' && setModal(null)}>
        <form key={editing?.id ?? 'create'} onSubmit={handleSave} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="assessment-athlete" className="mb-1.5 block font-condensed text-sm font-semibold uppercase text-[#44403C]">Pessoa avaliada</label>{editing ? <><input type="hidden" name="athlete_user_id" value={editing.athlete_user_id} /><input id="assessment-athlete" value={athleteNames.get(editing.athlete_user_id) ?? 'Atleta'} disabled className="input-base bg-[#F5F5F4]" /></> : <select id="assessment-athlete" name="athlete_user_id" required defaultValue="" className="input-base bg-white"><option value="" disabled>Selecione o aluno ou atleta</option>{athletes.map((athlete) => <option key={athlete.user_id} value={athlete.user_id}>{athlete.full_name}{athlete.role === 'admin' ? ' · Perfil de aluno' : athlete.role === 'coach' ? ' · Perfil de atleta' : ''}</option>)}</select>}</div>
            <div><label htmlFor="assessment-date" className="mb-1.5 block font-condensed text-sm font-semibold uppercase text-[#44403C]">Data</label><input id="assessment-date" name="assessed_at" type="date" required max={getTodayCalendarDate()} value={draft.assessed_at} onChange={(event) => updateDraft('assessed_at', event.target.value)} className="input-base" /></div>
          </div>

          <fieldset className="border border-[#C7D2FE] bg-[#EEF2FF] p-4">
            <legend className="px-1 font-condensed text-sm font-semibold uppercase text-[#3730A3]">Relatório original · 3 imagens</legend>
            <div className="grid gap-3 lg:grid-cols-3">
              {TANITA_PHOTOS.map((photo) => {
                const existingSource = editing?.source_files?.find((file) => file.slot === photo.slot)
                return <div key={photo.slot} className="border border-[#C7D2FE] bg-white p-3"><p className="flex items-center gap-2 text-sm font-semibold text-[#171717]"><FileImage size={15} className="text-[#4F46E5]" />{photo.title}</p><p className="mt-1 min-h-10 text-xs leading-relaxed text-[#57534E]">{photo.description}</p><input name={`source_photo_${photo.slot}`} type="file" accept="image/jpeg,image/png" required={!editing} onChange={(event) => void handleSourceFile(photo.slot, event.target.files?.[0])} disabled={ocrState.status === 'reading'} className="mt-3 block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-[#3730A3] file:px-2 file:py-2 file:font-semibold file:text-white" />{existingSource?.source_url && <a href={existingSource.source_url} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#3730A3]">Ver imagem atual <ExternalLink size={12} /></a>}</div>
              })}
            </div>
            <p className="mt-3 flex items-start gap-1.5 text-xs leading-relaxed text-[#3730A3]"><LockKeyhole size={13} className="mt-0.5 shrink-0" /> JPG ou PNG · até 15 MB por imagem. Na edição, deixe os três campos vazios para manter as fotos atuais; para substituir, envie as três novamente.</p>
            {ocrState.status !== 'idle' && <div className={`mt-3 border px-3 py-2 text-xs ${ocrState.status === 'error' ? 'border-[#FECACA] bg-[#FEF2F2] text-[#B91C1C]' : 'border-[#BFDBFE] bg-white text-[#1E3A8A]'}`} role={ocrState.status === 'error' ? 'alert' : 'status'}><div className="flex items-start gap-2">{ocrState.status === 'reading' ? <LoaderCircle size={15} className="mt-0.5 animate-spin" /> : ocrState.status === 'done' ? <CheckCircle2 size={15} className="mt-0.5 text-[#15803D]" /> : <FileSearch size={15} className="mt-0.5" />}<span>{ocrState.message}</span></div>{ocrState.status === 'reading' && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#DBEAFE]"><div className="h-full bg-[#2563EB]" style={{ width: `${Math.round(ocrState.progress * 100)}%` }} /></div>}</div>}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="body-fat-category" className="mb-1.5 block font-condensed text-sm font-semibold uppercase text-[#44403C]">Faixa de gordura corporal</label><select id="body-fat-category" name="body_fat_category" value={draft.body_fat_category} onChange={(event) => updateDraft('body_fat_category', event.target.value)} className="input-base bg-white"><option value="">Não informada</option><option value="underfat">Abaixo da faixa</option><option value="healthy">Saudável</option><option value="overfat">Acima da faixa</option><option value="obese">Obesidade</option></select><p className="mt-1 text-[11px] text-[#78716C]">A ilustração é calculada automaticamente a partir do perfil e dos dados da Tanita.</p></div>
          </div>

          {FIELD_GROUPS.map((group) => <fieldset key={group.title} className="border border-[#E5E1D8] p-4"><legend className="px-1 font-condensed text-sm font-semibold uppercase text-[#44403C]">{group.title}</legend><p className="mb-3 text-xs text-[#78716C]">{group.description}</p><div className="grid gap-4 sm:grid-cols-2">{group.fields.map((field) => <MeasurementInput key={field.id} {...field} value={draft[field.id]} onChange={updateDraft} />)}</div></fieldset>)}

          <div><label htmlFor="assessment-notes" className="mb-1.5 block font-condensed text-sm font-semibold uppercase text-[#44403C]">Observações opcionais</label><textarea id="assessment-notes" name="notes" maxLength={2000} rows={3} defaultValue={editing?.notes ?? ''} className="input-base resize-none" placeholder="Orientações técnicas do treinador…" /></div>
          {error && <p role="alert" className="border border-[#FECACA] bg-[#FEE2E2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p>}
          <button type="submit" disabled={working || ocrState.status === 'reading'} className="btn-primary w-full sm:w-auto"><Activity size={16} aria-hidden="true" />{working ? 'Salvando…' : 'Salvar avaliação completa'}</button>
        </form>
      </AdminModal>

      <ConfirmDialog open={toDelete !== null} title="Remover avaliação" description="A avaliação e as três imagens privadas serão apagadas. Esta ação não pode ser desfeita." confirmLabel="Remover avaliação" loadingLabel="Removendo…" loading={working} onConfirm={handleDelete} onCancel={() => !working && setToDelete(null)} />
    </div>
  )
}

function MeasurementInput({ id, label, value, min, max, step = 0.01, onChange }: FieldDefinition & { value: string; onChange: (key: keyof AssessmentDraft, value: string) => void }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-xs font-medium text-[#57534E]">{label}</label><input id={id} name={id} type="number" inputMode={step === 1 ? 'numeric' : 'decimal'} min={min} max={max} step={step} value={value} onChange={(event) => onChange(id, event.target.value)} className="input-base" /></div>
}
