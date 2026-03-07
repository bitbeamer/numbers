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

export const generatePlaceValueTask = (level: AdaptiveLevel, numberRange: NumberRange): PlaceValueTask => {
  const absoluteMax = numberRange

  let value = 0
  if (level === 'easy') {
    const band = pickBand(absoluteMax, 0.65, 0.25)
    value = randomInt(band.min, band.max)
  } else if (level === 'medium') {
    const band = pickBand(absoluteMax, 0.45, 0.35)
    value = randomInt(band.min, band.max)
  } else {
    value = randomInt(0, absoluteMax)
  }

  // Ensure full range appears regularly, including the selected maximum.
  if (Math.random() < 0.08) {
    value = absoluteMax
  }

  return {
    value,
    tens: Math.floor(value / 10),
    ones: value % 10,
    maxTensOption: Math.floor(absoluteMax / 10),
  }
}
