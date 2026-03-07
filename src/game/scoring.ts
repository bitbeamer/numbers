export const calculateLove10Points = (nextStreak: number): number => {
  const base = 10
  const streakBonus = nextStreak >= 3 ? Math.min(20, (nextStreak - 2) * 5) : 0
  return base + streakBonus
}

export const calculateSprintPoints = (combo: number): number => {
  const multiplier = 1 + Math.floor(combo / 3) * 0.5
  return Math.round(10 * multiplier)
}
