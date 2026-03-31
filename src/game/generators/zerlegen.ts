import type { AdaptiveLevel, NumberRange } from '../../state/types'

export interface ZerlegenOption {
  a: number
  b: number
}

export interface ZerlegenTask {
  target: number
  correct: ZerlegenOption
  options: ZerlegenOption[]
}

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const pickBand = (
  max: number,
  lowWeight: number,
  midWeight: number,
): { min: number; max: number } => {
  const lowMax = Math.floor(max * 0.45)
  const midMax = Math.floor(max * 0.8)
  const roll = Math.random()

  if (roll < lowWeight) {
    return { min: 0, max: lowMax }
  }

  if (roll < lowWeight + midWeight) {
    return { min: Math.min(lowMax + 1, max), max: Math.min(midMax, max) }
  }

  return { min: Math.min(midMax + 1, max), max }
}

const shuffle = <T,>(values: T[]) => {
  const copy = [...values]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

const pickTarget = (level: AdaptiveLevel, numberRange: NumberRange) => {
  if (level === 'easy') {
    const band = pickBand(numberRange, 0.65, 0.25)
    return randomInt(Math.max(2, band.min), Math.max(2, band.max))
  }

  if (level === 'medium') {
    const band = pickBand(numberRange, 0.45, 0.35)
    return randomInt(Math.max(3, band.min), Math.max(3, band.max))
  }

  return randomInt(3, numberRange)
}

const keyFor = ({ a, b }: ZerlegenOption) => `${a}+${b}`

export const generateZerlegenTask = (level: AdaptiveLevel, numberRange: NumberRange): ZerlegenTask => {
  const target = Math.max(2, pickTarget(level, numberRange))
  const correctA = randomInt(0, target)
  const correct = { a: correctA, b: target - correctA }
  const used = new Set([keyFor(correct)])
  const options: ZerlegenOption[] = [correct]

  while (options.length < 3) {
    const sumOffset = randomInt(-4, 4)
    const distractorSum = Math.min(numberRange, Math.max(0, target + (sumOffset === 0 ? 1 : sumOffset)))
    if (distractorSum === target) {
      continue
    }

    const a = randomInt(0, distractorSum)
    const candidate = { a, b: distractorSum - a }
    const candidateKey = keyFor(candidate)

    if (used.has(candidateKey)) {
      continue
    }

    used.add(candidateKey)
    options.push(candidate)
  }

  return {
    target,
    correct,
    options: shuffle(options),
  }
}
