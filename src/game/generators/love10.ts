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

export const generateLove10Round = (level: AdaptiveLevel, numberRange: NumberRange): Love10Round => {
  void level
  void numberRange
  const target = 10
  const shown = randomInt(0, target)
  const answer = target - shown
  const options = Array.from({ length: target + 1 }).map((_, value) => value)

  return {
    shown,
    options: shuffle(options),
    target,
    answer,
    missingOnLeft: Math.random() < 0.5,
  }
}
