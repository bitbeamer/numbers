import type { AdaptiveLevel, NumberRange } from '../../state/types'

export interface Love10Round {
  shown: number
  options: number[]
  target: number
  answer: number
  missingOnLeft: boolean
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

const getOptionCount = (level: AdaptiveLevel): number => {
  if (level === 'easy') {
    return 4
  }
  if (level === 'hard') {
    return 6
  }
  return 5
}

export const generateLove10Round = (level: AdaptiveLevel, numberRange: NumberRange): Love10Round => {
  void numberRange
  const target = 10
  const shown = randomInt(0, target)
  const answer = target - shown
  const options = new Set<number>([answer])
  const optionCount = getOptionCount(level)

  while (options.size < optionCount) {
    options.add(randomInt(0, target))
  }

  return {
    shown,
    options: shuffle(Array.from(options)),
    target,
    answer,
    missingOnLeft: Math.random() < 0.5,
  }
}
