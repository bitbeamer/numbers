import type { AdaptiveLevel, NumberRange } from '../../state/types'

export interface Love10Card {
  id: string
  value: number
}

export interface Love10Round {
  cards: Love10Card[]
  target: number
  solution: [number, number]
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

const getCardCount = (level: AdaptiveLevel): number => {
  if (level === 'easy') {
    return 5
  }
  if (level === 'hard') {
    return 8
  }
  return 6
}

export const generateLove10Round = (level: AdaptiveLevel, numberRange: NumberRange): Love10Round => {
  const target = numberRange
  const first = randomInt(level === 'easy' ? 1 : 0, level === 'easy' ? target - 1 : target)
  const second = target - first
  const values: number[] = [first, second]
  const cardCount = getCardCount(level)

  while (values.length < cardCount) {
    values.push(randomInt(0, target))
  }

  const cards = shuffle(values).map((value, idx) => ({
    id: `love-card-${idx}-${value}-${Math.random().toString(36).slice(2, 8)}`,
    value,
  }))

  return {
    cards,
    target,
    solution: [first, second],
  }
}
