import type { AdaptivePlan, NumberRange } from '../../state/types'

export interface CarryTask {
  a: number
  b: number
  result: number
  requiresCarry: boolean
  options: number[]
}

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const shuffle = <T,>(arr: T[]): T[] => {
  const next = [...arr]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

const uniqueOptions = (correct: number, count: number, numberRange: NumberRange): number[] => {
  const options = new Set<number>([correct])
  let guard = 0

  while (options.size < count && guard < 200) {
    const offset = randomInt(-12, 12)
    if (offset === 0) {
      guard += 1
      continue
    }

    const candidate = Math.max(0, Math.min(numberRange, correct + offset))
    options.add(candidate)
    guard += 1
  }

  for (let fill = 0; options.size < count; fill += 1) {
    options.add((correct + fill + 1) % (numberRange + 1))
  }

  return shuffle(Array.from(options))
}

export const generateCarryTask = (plan: AdaptivePlan, numberRange: NumberRange): CarryTask => {
  let carryChance = 0.5
  const minOperand = 1
  let maxOperand: number = numberRange

  if (plan.level === 'easy') {
    carryChance = 0.35
    maxOperand = Math.max(9, Math.floor(numberRange * 0.55))
  } else if (plan.level === 'hard') {
    carryChance = 0.75
    maxOperand = numberRange
  } else {
    maxOperand = Math.max(10, Math.floor(numberRange * 0.8))
  }

  if (plan.needsCarryFocus) {
    carryChance = 0.95
  }

  for (let attempt = 0; attempt < 180; attempt += 1) {
    const a = randomInt(minOperand, maxOperand)
    const b = randomInt(minOperand, maxOperand)
    const result = a + b

    if (result > numberRange) {
      continue
    }

    const requiresCarry = a % 10 + (b % 10) >= 10
    const shouldCarry = Math.random() < carryChance

    if (shouldCarry !== requiresCarry) {
      continue
    }

    return {
      a,
      b,
      result,
      requiresCarry,
      options: uniqueOptions(result, 3, numberRange),
    }
  }

  const fallbackA = numberRange >= 10 ? 6 : 5
  const fallbackB = numberRange >= 10 ? 4 : 3
  const fallbackResult = Math.min(numberRange, fallbackA + fallbackB)

  return {
    a: fallbackA,
    b: fallbackB,
    result: fallbackResult,
    requiresCarry: fallbackA % 10 + fallbackB % 10 >= 10,
    options: uniqueOptions(fallbackResult, 3, numberRange),
  }
}
