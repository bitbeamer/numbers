import type { AdaptiveLevel, NumberRange } from '../../state/types'

export interface PlaceValueTask {
  value: number
  tens: number
  ones: number
  maxTensOption: number
}

const randomInt = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const generatePlaceValueTask = (level: AdaptiveLevel, numberRange: NumberRange): PlaceValueTask => {
  const absoluteMax = numberRange === 100 ? 99 : numberRange

  let levelMax = absoluteMax
  if (level === 'easy') {
    levelMax = Math.max(10, Math.floor(absoluteMax * 0.45))
  } else if (level === 'medium') {
    levelMax = Math.max(15, Math.floor(absoluteMax * 0.75))
  }

  const minValue = levelMax >= 10 && Math.random() < 0.7 ? 10 : 0
  const value = randomInt(minValue, levelMax)

  return {
    value,
    tens: Math.floor(value / 10),
    ones: value % 10,
    maxTensOption: Math.floor(absoluteMax / 10),
  }
}
