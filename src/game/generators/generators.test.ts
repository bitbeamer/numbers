import { describe, expect, it, vi } from 'vitest'
import { generateCarryTask } from './carry'
import { generateLove10Round } from './love10'
import { generatePlaceValueTask } from './placevalue'
import { generateSprintTask } from './sprint'
import { generateZerlegenTask } from './zerlegen'
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
  it('creates love tasks that always target 10 and ignore number range', () => {
    const rounds = Array.from({ length: 30 }).map(() => generateLove10Round('easy', 25))
    const allOptions = new Set(Array.from({ length: 11 }).map((_, value) => value))

    expect(rounds.every((round) => round.target === 10)).toBe(true)
    expect(rounds.every((round) => round.shown >= 0 && round.shown <= 10)).toBe(true)
    expect(rounds.every((round) => round.answer + round.shown === 10)).toBe(true)
    expect(rounds.every((round) => round.options.includes(round.answer))).toBe(true)
    expect(rounds.every((round) => round.options.length === 11)).toBe(true)
    expect(rounds.every((round) => new Set(round.options).size === 11)).toBe(true)
    expect(rounds.every((round) => round.options.every((option) => allOptions.has(option)))).toBe(true)
    expect(rounds.every((round) => round.options.every((option) => option >= 0 && option <= 10))).toBe(true)
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

    expect(samples.every((task) => task.value >= 0 && task.value <= 100)).toBe(true)
    expect(samples.every((task) => task.tens === Math.floor(task.value / 10))).toBe(true)
    expect(samples.every((task) => task.ones === task.value % 10)).toBe(true)
  })

  it('can generate the selected maximum value', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const task = generatePlaceValueTask('medium', 25)
    randomSpy.mockRestore()

    expect(task.value).toBe(25)
    expect(task.tens).toBe(2)
    expect(task.ones).toBe(5)
  })

  it('creates zerlegen tasks with exactly one matching tuple among three options', () => {
    const samples = Array.from({ length: 20 }).map(() => generateZerlegenTask('hard', 50))

    expect(samples.every((task) => task.target >= 2 && task.target <= 50)).toBe(true)
    expect(samples.every((task) => task.options.length === 3)).toBe(true)
    expect(samples.every((task) => new Set(task.options.map((option) => `${option.a}+${option.b}`)).size === 3)).toBe(true)
    expect(samples.every((task) => task.options.filter((option) => option.a + option.b === task.target).length === 1)).toBe(true)
    expect(samples.every((task) => task.options.every((option) => option.a >= 0 && option.b >= 0))).toBe(true)
  })
})
