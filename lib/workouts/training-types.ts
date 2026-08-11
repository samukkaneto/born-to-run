export const TRAINING_TYPES = [
  'rest',
  'continuous',
  'fast_interval',
  'easy_moderate',
  'aerobic_power',
  'competition',
] as const

export type TrainingType = (typeof TRAINING_TYPES)[number]

export type TrainingTypeVisual = {
  label: string
  shortLabel: string
  description: string
  color: string
  background: string
  border: string
  text: string
}

/**
 * Linguagem oficial definida pelo Prof. Robson Alves a partir dos treinos
 * presenciais da Born to Run. Alterações aqui precisam preservar a semântica.
 */
export const TRAINING_TYPE_VISUALS: Record<TrainingType, TrainingTypeVisual> = {
  rest: {
    label: 'Descanso',
    shortLabel: 'Descanso',
    description: 'Recuperação programada',
    color: '#38BDF8',
    background: '#E0F2FE',
    border: '#7DD3FC',
    text: '#075985',
  },
  continuous: {
    label: 'Ritmo contínuo',
    shortLabel: 'Contínuo',
    description: 'Ritmo sustentado e controlado',
    color: '#FACC15',
    background: '#FEF9C3',
    border: '#FDE047',
    text: '#713F12',
  },
  fast_interval: {
    label: 'Intervalado rápido',
    shortLabel: 'Intervalado',
    description: 'Séries rápidas com recuperação',
    color: '#8B5CF6',
    background: '#F3E8FF',
    border: '#C4B5FD',
    text: '#5B21B6',
  },
  easy_moderate: {
    label: 'Leve a moderado',
    shortLabel: 'Leve/moderado',
    description: 'Volume confortável e construção de base',
    color: '#22C55E',
    background: '#DCFCE7',
    border: '#86EFAC',
    text: '#166534',
  },
  aerobic_power: {
    label: 'Potência aeróbia',
    shortLabel: 'Potência',
    description: 'Estímulo forte de capacidade aeróbia',
    color: '#C49317',
    background: '#FEF3C7',
    border: '#D6B75C',
    text: '#78350F',
  },
  competition: {
    label: 'Competição',
    shortLabel: 'Competição',
    description: 'Prova ou evento competitivo',
    color: '#DC2626',
    background: '#FEE2E2',
    border: '#FCA5A5',
    text: '#991B1B',
  },
}

export function isTrainingType(value: string): value is TrainingType {
  return TRAINING_TYPES.includes(value as TrainingType)
}

export function getTrainingTypeVisual(value: string | null | undefined): TrainingTypeVisual {
  return TRAINING_TYPE_VISUALS[isTrainingType(value ?? '') ? value as TrainingType : 'easy_moderate']
}
