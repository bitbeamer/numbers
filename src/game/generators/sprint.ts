import type { AdaptivePlan, NumberRange } from '../../state/types'
import { generateCarryTask } from './carry'

export interface SprintTask {
  prompt: string
  options: number[]
  answer: number
  errorTypeOnWrong: string
  requiresCarry?: boolean
}

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const makeLoveTask = (numberRange: NumberRange): SprintTask => {
  const left = randomInt(0, numberRange)
  const answer = numberRange - left
  const options = new Set<number>([answer])

  while (options.size < 4) {
    options.add(randomInt(0, numberRange))
  }

  return {
    prompt: `${left} + ? = ${numberRange}`,
    options: Array.from(options).sort(() => Math.random() - 0.5),
    answer,
    errorTypeOnWrong: 'sum_not_10',
  }
}

const makeAdditionTask = (plan: AdaptivePlan, numberRange: NumberRange): SprintTask => {
  const task = generateCarryTask(plan, numberRange)
  const options = new Set<number>(task.options)
  options.add(task.result)

  while (options.size < 4) {
    options.add(Math.max(0, Math.min(numberRange, task.result + randomInt(-9, 9))))
  }

  return {
    prompt: `${task.a} + ${task.b} = ?`,
    options: Array.from(options).sort(() => Math.random() - 0.5),
    answer: task.result,
    errorTypeOnWrong: task.requiresCarry ? 'carry_missed' : 'place_value_confusion',
    requiresCarry: task.requiresCarry,
  }
}

export const generateSprintTask = (plan: AdaptivePlan, numberRange: NumberRange): SprintTask => {
  const loveChance = plan.level === 'easy' ? 0.5 : 0.35
  if (Math.random() < loveChance) {
    return makeLoveTask(numberRange)
  }

  return makeAdditionTask(plan, numberRange)
}
