import { describe, expect, it } from 'vitest'
import {
  TRAINING_TYPES,
  TRAINING_TYPE_VISUALS,
  getTrainingTypeVisual,
  isTrainingType,
} from '@/lib/workouts/training-types'

describe('linguagem visual de treinos do Prof. Robson', () => {
  it('mantém exatamente as seis categorias oficiais', () => {
    expect(TRAINING_TYPES).toEqual([
      'rest',
      'continuous',
      'fast_interval',
      'easy_moderate',
      'aerobic_power',
      'competition',
    ])
  })

  it('reproduz os conceitos de cor definidos pelo treinador', () => {
    expect(TRAINING_TYPE_VISUALS.rest.label).toBe('Descanso')
    expect(TRAINING_TYPE_VISUALS.continuous.label).toBe('Ritmo contínuo')
    expect(TRAINING_TYPE_VISUALS.fast_interval.label).toBe('Intervalado rápido')
    expect(TRAINING_TYPE_VISUALS.easy_moderate.label).toBe('Leve a moderado')
    expect(TRAINING_TYPE_VISUALS.aerobic_power.label).toBe('Potência aeróbia')
    expect(TRAINING_TYPE_VISUALS.competition.label).toBe('Competição')
  })

  it('rejeita valores inventados e usa verde como fallback seguro', () => {
    expect(isTrainingType('competition')).toBe(true)
    expect(isTrainingType('long_run')).toBe(false)
    expect(getTrainingTypeVisual('long_run')).toBe(TRAINING_TYPE_VISUALS.easy_moderate)
  })
})
