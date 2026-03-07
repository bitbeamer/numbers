import type { AdaptivePlan, Profile, RecentTask, RootState, TaskResultInput } from './types'

export const STATE_KEY = 'zahlenliebe:v1'
const BACKUP_KEY = 'zahlenliebe:v1:backup'
const MAX_RECENT_TASKS = 200

const MODES = ['love10', 'carry', 'sprint', 'placevalue'] as const

const createDefaultModeStats = () => ({
  love10: { played: 0, correct: 0, avgMs: 0 },
  carry: { played: 0, correct: 0, avgMs: 0 },
  sprint: { played: 0, correct: 0, avgMs: 0 },
  placevalue: { played: 0, correct: 0, avgMs: 0 },
})

export const createDefaultProfile = (name = 'Mia'): Profile => ({
  name,
  avatar: 'cat',
  createdAt: new Date().toISOString(),
  settings: {
    sound: true,
    difficulty: 'adaptive',
    uiScale: 'normal',
    numberRange: 25,
    language: 'de',
  },
  stats: {
    totalSessions: 0,
    totalPlaySeconds: 0,
    totalTasks: 0,
    totalCorrect: 0,
    currentStreak: 0,
    bestStreak: 0,
  },
  modeStats: createDefaultModeStats(),
  errorPatterns: {
    sum_not_10: 0,
    carry_missed: 0,
    place_value_confusion: 0,
  },
  daily: {},
  unlocks: {
    stickers: ['heart_gold'],
    themes: ['classic'],
  },
  recentTasks: [],
})

export const createDefaultState = (): RootState => {
  const profileId = 'kid_default'

  return {
    activeProfileId: profileId,
    profiles: {
      [profileId]: createDefaultProfile(),
    },
  }
}

const getStorage = (): Storage | null => {
  try {
    if (typeof window === 'undefined') {
      return null
    }

    return window.localStorage
  } catch {
    return null
  }
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const normalizeProfile = (raw: unknown): Profile | null => {
  if (!isObject(raw)) {
    return null
  }

  const defaults = createDefaultProfile()
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name : defaults.name
  const avatar = typeof raw.avatar === 'string' && raw.avatar.trim() ? raw.avatar : defaults.avatar
  const createdAt = typeof raw.createdAt === 'string' ? raw.createdAt : defaults.createdAt

  const settingsRaw = isObject(raw.settings) ? raw.settings : {}
  const numberRange =
    settingsRaw.numberRange === 10 ||
    settingsRaw.numberRange === 25 ||
    settingsRaw.numberRange === 50 ||
    settingsRaw.numberRange === 100
      ? settingsRaw.numberRange
      : defaults.settings.numberRange
  const language = settingsRaw.language === 'de' || settingsRaw.language === 'en' ? settingsRaw.language : defaults.settings.language
  const settings = {
    sound: typeof settingsRaw.sound === 'boolean' ? settingsRaw.sound : defaults.settings.sound,
    difficulty:
      settingsRaw.difficulty === 'easy' ||
      settingsRaw.difficulty === 'medium' ||
      settingsRaw.difficulty === 'adaptive'
        ? settingsRaw.difficulty
        : defaults.settings.difficulty,
    uiScale:
      settingsRaw.uiScale === 'small' || settingsRaw.uiScale === 'normal' || settingsRaw.uiScale === 'large'
        ? settingsRaw.uiScale
        : defaults.settings.uiScale,
    numberRange,
    language,
  }

  const statsRaw = isObject(raw.stats) ? raw.stats : {}
  const numberOr = (value: unknown, fallback: number) => (typeof value === 'number' && Number.isFinite(value) ? value : fallback)
  const stats = {
    totalSessions: numberOr(statsRaw.totalSessions, defaults.stats.totalSessions),
    totalPlaySeconds: numberOr(statsRaw.totalPlaySeconds, defaults.stats.totalPlaySeconds),
    totalTasks: numberOr(statsRaw.totalTasks, defaults.stats.totalTasks),
    totalCorrect: numberOr(statsRaw.totalCorrect, defaults.stats.totalCorrect),
    currentStreak: numberOr(statsRaw.currentStreak, defaults.stats.currentStreak),
    bestStreak: numberOr(statsRaw.bestStreak, defaults.stats.bestStreak),
  }

  const modeStatsRaw = isObject(raw.modeStats) ? raw.modeStats : {}
  const modeStats = createDefaultModeStats()
  MODES.forEach((mode) => {
    const rawMode = isObject(modeStatsRaw[mode]) ? modeStatsRaw[mode] : {}
    modeStats[mode] = {
      played: numberOr(rawMode.played, 0),
      correct: numberOr(rawMode.correct, 0),
      avgMs: numberOr(rawMode.avgMs, 0),
    }
  })

  const errorPatternsRaw = isObject(raw.errorPatterns) ? raw.errorPatterns : {}
  const errorPatterns: Record<string, number> = { ...defaults.errorPatterns }
  Object.entries(errorPatternsRaw).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      errorPatterns[key] = value
    }
  })

  const dailyRaw = isObject(raw.daily) ? raw.daily : {}
  const daily: Profile['daily'] = {}
  Object.entries(dailyRaw).forEach(([day, stat]) => {
    if (!isObject(stat)) {
      return
    }

    daily[day] = {
      playSeconds: numberOr(stat.playSeconds, 0),
      tasks: numberOr(stat.tasks, 0),
      correct: numberOr(stat.correct, 0),
    }
  })

  const unlocksRaw = isObject(raw.unlocks) ? raw.unlocks : {}
  const stickers = Array.isArray(unlocksRaw.stickers) ? unlocksRaw.stickers.filter((v): v is string => typeof v === 'string') : defaults.unlocks.stickers
  const themes = Array.isArray(unlocksRaw.themes) ? unlocksRaw.themes.filter((v): v is string => typeof v === 'string') : defaults.unlocks.themes

  const recentRaw = Array.isArray(raw.recentTasks) ? raw.recentTasks : []
  const recentTasks: RecentTask[] = recentRaw
    .filter(isObject)
    .map((entry): RecentTask => {
      const mode =
        entry.mode === 'love10' || entry.mode === 'carry' || entry.mode === 'sprint' || entry.mode === 'placevalue'
          ? entry.mode
          : 'love10'
      return {
        mode,
        correct: typeof entry.correct === 'boolean' ? entry.correct : false,
        durationMs: numberOr(entry.durationMs, 0),
        errorType: typeof entry.errorType === 'string' ? entry.errorType : undefined,
        createdAt: typeof entry.createdAt === 'string' ? entry.createdAt : new Date().toISOString(),
      }
    })
    .slice(-MAX_RECENT_TASKS)

  return {
    name,
    avatar,
    createdAt,
    settings,
    stats,
    modeStats,
    errorPatterns,
    daily,
    unlocks: {
      stickers,
      themes,
    },
    recentTasks,
  }
}

const normalizeState = (raw: unknown): RootState | null => {
  if (!isObject(raw) || !isObject(raw.profiles)) {
    return null
  }

  const profiles: RootState['profiles'] = {}
  Object.entries(raw.profiles).forEach(([id, profileRaw]) => {
    const normalized = normalizeProfile(profileRaw)
    if (normalized) {
      profiles[id] = normalized
    }
  })

  const profileIds = Object.keys(profiles)
  if (profileIds.length === 0) {
    return null
  }

  const activeProfileId =
    typeof raw.activeProfileId === 'string' && profiles[raw.activeProfileId] ? raw.activeProfileId : profileIds[0]

  return {
    activeProfileId,
    profiles,
  }
}

export const loadState = (): RootState => {
  const storage = getStorage()
  const fallback = createDefaultState()

  if (!storage) {
    return fallback
  }

  try {
    const raw = storage.getItem(STATE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      const normalized = normalizeState(parsed)
      if (normalized) {
        return normalized
      }
    }
  } catch {
    // Ignore and continue with backup strategy.
  }

  try {
    const rawBackup = storage.getItem(BACKUP_KEY)
    if (rawBackup) {
      const parsedBackup = JSON.parse(rawBackup)
      const normalizedBackup = normalizeState(parsedBackup)
      if (normalizedBackup) {
        saveState(normalizedBackup)
        return normalizedBackup
      }
    }
  } catch {
    // Ignore and return fallback.
  }

  return fallback
}

export const saveState = (state: RootState): void => {
  const storage = getStorage()
  if (!storage) {
    return
  }

  const payload = JSON.stringify(state)
  try {
    storage.setItem(STATE_KEY, payload)
    storage.setItem(BACKUP_KEY, payload)
  } catch {
    // Ignore write errors (private mode / quota).
  }
}

const todayKey = () => new Date().toISOString().slice(0, 10)

const mergeProfile = (current: Profile, patch: Partial<Profile>): Profile => {
  return {
    ...current,
    ...patch,
    settings: {
      ...current.settings,
      ...patch.settings,
    },
    stats: {
      ...current.stats,
      ...patch.stats,
    },
    modeStats: {
      ...current.modeStats,
      ...patch.modeStats,
    },
    errorPatterns: {
      ...current.errorPatterns,
      ...patch.errorPatterns,
    },
    daily: {
      ...current.daily,
      ...patch.daily,
    },
    unlocks: {
      ...current.unlocks,
      ...patch.unlocks,
      stickers: patch.unlocks?.stickers ?? current.unlocks.stickers,
      themes: patch.unlocks?.themes ?? current.unlocks.themes,
    },
    recentTasks: patch.recentTasks ?? current.recentTasks,
  }
}

const ensureProfile = (state: RootState, profileId: string): Profile => {
  return state.profiles[profileId] ?? createDefaultProfile()
}

export const applyProfilePatch = (state: RootState, profileId: string, patch: Partial<Profile>): RootState => {
  const profile = ensureProfile(state, profileId)
  return {
    ...state,
    profiles: {
      ...state.profiles,
      [profileId]: mergeProfile(profile, patch),
    },
  }
}

export const applyTaskResult = (state: RootState, result: TaskResultInput): RootState => {
  const profileId = state.activeProfileId
  const profile = ensureProfile(state, profileId)
  const modeStat = profile.modeStats[result.mode]
  const playedNext = modeStat.played + 1
  const correctNext = result.correct ? modeStat.correct + 1 : modeStat.correct
  const avgMsNext = modeStat.played === 0 ? result.durationMs : Math.round((modeStat.avgMs * modeStat.played + result.durationMs) / playedNext)

  const today = todayKey()
  const dayStat = profile.daily[today] ?? { playSeconds: 0, tasks: 0, correct: 0 }

  const nextProfile: Profile = {
    ...profile,
    stats: {
      ...profile.stats,
      totalTasks: profile.stats.totalTasks + 1,
      totalCorrect: result.correct ? profile.stats.totalCorrect + 1 : profile.stats.totalCorrect,
      currentStreak: result.correct ? profile.stats.currentStreak + 1 : 0,
      bestStreak: result.correct
        ? Math.max(profile.stats.bestStreak, profile.stats.currentStreak + 1)
        : profile.stats.bestStreak,
      totalPlaySeconds: profile.stats.totalPlaySeconds + Math.max(1, Math.round(result.durationMs / 1000)),
    },
    modeStats: {
      ...profile.modeStats,
      [result.mode]: {
        played: playedNext,
        correct: correctNext,
        avgMs: avgMsNext,
      },
    },
    errorPatterns: result.errorType
      ? {
          ...profile.errorPatterns,
          [result.errorType]: (profile.errorPatterns[result.errorType] ?? 0) + 1,
        }
      : profile.errorPatterns,
    daily: {
      ...profile.daily,
      [today]: {
        playSeconds: dayStat.playSeconds + Math.max(1, Math.round(result.durationMs / 1000)),
        tasks: dayStat.tasks + 1,
        correct: result.correct ? dayStat.correct + 1 : dayStat.correct,
      },
    },
    recentTasks: [
      ...profile.recentTasks,
      {
        mode: result.mode,
        correct: result.correct,
        durationMs: result.durationMs,
        errorType: result.errorType,
        createdAt: new Date().toISOString(),
      },
    ].slice(-MAX_RECENT_TASKS),
  }

  return {
    ...state,
    profiles: {
      ...state.profiles,
      [profileId]: nextProfile,
    },
  }
}

export const updateProfile = (profileId: string, patch: Partial<Profile>): RootState => {
  try {
    const current = loadState()
    const next = applyProfilePatch(current, profileId, patch)
    saveState(next)
    return next
  } catch {
    const fallback = createDefaultState()
    saveState(fallback)
    return fallback
  }
}

export const recordTaskResult = (result: TaskResultInput): RootState => {
  try {
    const current = loadState()
    const next = applyTaskResult(current, result)
    saveState(next)
    return next
  } catch {
    const fallback = createDefaultState()
    saveState(fallback)
    return fallback
  }
}

export const computeAdaptivePlan = (profile: Profile): AdaptivePlan => {
  const recent = profile.recentTasks.slice(-20)
  if (recent.length === 0 || profile.settings.difficulty !== 'adaptive') {
    return {
      level: profile.settings.difficulty === 'easy' ? 'easy' : 'medium',
      hintBoost: profile.settings.difficulty === 'easy',
      needsCarryFocus: false,
      accuracy: 0,
      avgMs: 0,
      sampleSize: 0,
    }
  }

  const correct = recent.filter((task) => task.correct).length
  const accuracy = correct / recent.length
  const avgMs = recent.reduce((sum, task) => sum + task.durationMs, 0) / recent.length

  let level: AdaptivePlan['level'] = 'medium'
  let hintBoost = false
  if (accuracy > 0.85 && avgMs < 5500) {
    level = 'hard'
  } else if (accuracy < 0.6) {
    level = 'easy'
    hintBoost = true
  }

  const carryErrors = recent.filter((task) => task.errorType === 'carry_missed').length
  const needsCarryFocus = carryErrors >= 3 || carryErrors / recent.length >= 0.25

  return {
    level,
    hintBoost,
    needsCarryFocus,
    accuracy,
    avgMs,
    sampleSize: recent.length,
  }
}
