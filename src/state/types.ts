export type Mode = 'love10' | 'carry' | 'sprint' | 'placevalue'

export type DifficultySetting = 'easy' | 'medium' | 'adaptive'
export type AdaptiveLevel = 'easy' | 'medium' | 'hard'
export type NumberRange = 10 | 25 | 50 | 100
export type Language = 'de' | 'en'

export interface DailyStat {
  playSeconds: number
  tasks: number
  correct: number
}

export interface ModeStat {
  played: number
  correct: number
  avgMs: number
}

export interface RecentTask {
  mode: Mode
  correct: boolean
  durationMs: number
  errorType?: string
  createdAt: string
}

export interface Profile {
  name: string
  avatar: string
  createdAt: string
  settings: {
    sound: boolean
    difficulty: DifficultySetting
    uiScale: 'small' | 'normal' | 'large'
    numberRange: NumberRange
    language: Language
  }
  stats: {
    totalSessions: number
    totalPlaySeconds: number
    totalTasks: number
    totalCorrect: number
    currentStreak: number
    bestStreak: number
  }
  modeStats: Record<Mode, ModeStat>
  errorPatterns: Record<string, number>
  daily: Record<string, DailyStat>
  unlocks: {
    stickers: string[]
    themes: string[]
  }
  recentTasks: RecentTask[]
}

export interface RootState {
  activeProfileId: string
  profiles: Record<string, Profile>
}

export interface TaskResultInput {
  mode: Mode
  correct: boolean
  durationMs: number
  errorType?: string
}

export interface AdaptivePlan {
  level: AdaptiveLevel
  hintBoost: boolean
  needsCarryFocus: boolean
  accuracy: number
  avgMs: number
  sampleSize: number
}
