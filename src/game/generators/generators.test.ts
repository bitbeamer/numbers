import { describe, expect, it } from 'vitest'
import { generateCarryTask } from './carry'
import { generateLove10Round } from './love10'
import { generatePlaceValueTask } from './placevalue'
import { generateSprintTask } from './sprint'
import type { AdaptivePlan } from '../../state/types'

const mediumPlan: AdaptivePlan = {
  level: 'medium',
  hintBoost: false,
  needsCarryFocus: false,
  accuracy: 0.7,
  avgMs: 4200,
  sampleSize: 20,
}

describe('game generators support number ranges', () => {
  it('creates love tasks with selected target', () => {
    const round = generateLove10Round('easy', 25)

    expect(round.target).toBe(25)
    expect(round.solution[0] + round.solution[1]).toBe(25)
    expect(round.cards.every((card) => card.value >= 0 && card.value <= 25)).toBe(true)
  })

  it('creates carry tasks within selected range', () => {
    const task = generateCarryTask(mediumPlan, 50)

    expect(task.a + task.b).toBe(task.result)
    expect(task.result).toBeLessThanOrEqual(50)
    expect(task.options.every((option) => option >= 0 && option <= 50)).toBe(true)
  })

  it('keeps sprint answers and options inside selected range', () => {
    const samples = Array.from({ length: 20 }).map(() => generateSprintTask(mediumPlan, 25))

    expect(samples.every((task) => task.answer >= 0 && task.answer <= 25)).toBe(true)
    expect(samples.every((task) => task.options.every((option) => option >= 0 && option <= 25))).toBe(true)
  })

  it('creates place-value tasks with valid tens and ones', () => {
    const samples = Array.from({ length: 20 }).map(() => generatePlaceValueTask('hard', 100))

    expect(samples.every((task) => task.value >= 0 && task.value <= 99)).toBe(true)
    expect(samples.every((task) => task.tens === Math.floor(task.value / 10))).toBe(true)
    expect(samples.every((task) => task.ones === task.value % 10)).toBe(true)
  })
})
