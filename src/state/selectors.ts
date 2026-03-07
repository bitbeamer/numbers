import { computeAdaptivePlan } from './persistence'
import type { DailyStat, Mode, Profile, RootState } from './types'

export const getActiveProfile = (state: RootState): Profile => {
  const profile = state.profiles[state.activeProfileId]
  if (profile) {
    return profile
  }

  const first = Object.values(state.profiles)[0]
  if (first) {
    return first
  }

  throw new Error('No profile available in state')
}

export const getAccuracy = (played: number, correct: number): number => {
  if (played <= 0) {
    return 0
  }

  return correct / played
}

export const getModeAccuracy = (profile: Profile, mode: Mode): number => {
  const stat = profile.modeStats[mode]
  return getAccuracy(stat.played, stat.correct)
}

export const getLastDays = (profile: Profile, days: number): Array<{ day: string; stat: DailyStat }> => {
  return Array.from({ length: days }).map((_, idx) => {
    const dayDate = new Date()
    dayDate.setDate(dayDate.getDate() - (days - 1 - idx))
    const day = dayDate.toISOString().slice(0, 10)

    return {
      day,
      stat: profile.daily[day] ?? { playSeconds: 0, tasks: 0, correct: 0 },
    }
  })
}

export const getTopErrors = (profile: Profile, limit = 3): Array<{ key: string; count: number }> => {
  return Object.entries(profile.errorPatterns)
    .map(([key, count]) => ({ key, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export const getAdaptiveSummary = (profile: Profile) => computeAdaptivePlan(profile)

export const formatPercent = (value: number): string => `${Math.round(value * 100)}%`

export const formatSeconds = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`
  }

  const mins = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${mins}m ${rest}s`
}
