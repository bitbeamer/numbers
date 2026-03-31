import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  STATE_KEY,
  computeAdaptivePlan,
  createDefaultState,
  loadState,
  recordTaskResult,
  saveState,
  updateProfile,
} from './persistence'

const BACKUP_KEY = 'zahlenliebe:v1:backup'

describe('persistence utilities', () => {
  beforeEach(() => {
    window.localStorage.clear()
    vi.restoreAllMocks()
  })

  it('returns default state when storage is empty', () => {
    const state = loadState()
    expect(state.activeProfileId).toBe('kid_default')
    expect(state.profiles.kid_default.name).toBeTruthy()
    expect(state.profiles.kid_default.settings.numberRange).toBe(25)
    expect(state.profiles.kid_default.settings.language).toBe('de')
    expect(state.profiles.kid_default.modeStats.placevalue.played).toBe(0)
    expect(state.profiles.kid_default.modeStats.zerlegen.played).toBe(0)
  })

  it('uses backup when primary state cannot be parsed', () => {
    const backup = createDefaultState()
    backup.profiles.kid_default.name = 'BackupKid'

    window.localStorage.setItem(STATE_KEY, '{broken-json')
    window.localStorage.setItem(BACKUP_KEY, JSON.stringify(backup))

    const state = loadState()
    expect(state.profiles.kid_default.name).toBe('BackupKid')
  })

  it('saves and loads the same structure', () => {
    const state = createDefaultState()
    state.profiles.kid_default.name = 'Lina'

    saveState(state)
    const loaded = loadState()

    expect(loaded.profiles.kid_default.name).toBe('Lina')
    expect(JSON.parse(window.localStorage.getItem(STATE_KEY) ?? '{}').activeProfileId).toBe('kid_default')
  })

  it('updates profile data and keeps nested settings', () => {
    const initial = createDefaultState()
    saveState(initial)

    const next = updateProfile('kid_default', {
      name: 'Noah',
      settings: {
        ...initial.profiles.kid_default.settings,
        sound: false,
      },
    })

    expect(next.profiles.kid_default.name).toBe('Noah')
    expect(next.profiles.kid_default.settings.sound).toBe(false)
    expect(next.profiles.kid_default.settings.numberRange).toBe(25)
    expect(loadState().profiles.kid_default.name).toBe('Noah')
  })

  it('normalizes missing number range to default', () => {
    const legacy = createDefaultState()
    const profile = legacy.profiles[legacy.activeProfileId]
    const legacySettings = {
      sound: profile.settings.sound,
      difficulty: profile.settings.difficulty,
      uiScale: profile.settings.uiScale,
    }

    window.localStorage.setItem(
      STATE_KEY,
      JSON.stringify({
        ...legacy,
        profiles: {
          [legacy.activeProfileId]: {
            ...profile,
            settings: legacySettings,
          },
        },
      }),
    )

    const loaded = loadState()
    expect(loaded.profiles[loaded.activeProfileId].settings.numberRange).toBe(25)
    expect(loaded.profiles[loaded.activeProfileId].settings.language).toBe('de')
  })

  it('records task result including error pattern counters', () => {
    saveState(createDefaultState())

    const next = recordTaskResult({
      mode: 'carry',
      correct: false,
      durationMs: 4200,
      errorType: 'carry_missed',
    })

    const profile = next.profiles[next.activeProfileId]
    expect(profile.stats.totalTasks).toBe(1)
    expect(profile.stats.totalCorrect).toBe(0)
    expect(profile.modeStats.carry.played).toBe(1)
    expect(profile.modeStats.carry.correct).toBe(0)
    expect(profile.errorPatterns.carry_missed).toBeGreaterThan(0)
    expect(profile.recentTasks).toHaveLength(1)
  })

  it('records task result for placevalue mode', () => {
    saveState(createDefaultState())

    const next = recordTaskResult({
      mode: 'placevalue',
      correct: true,
      durationMs: 2100,
    })

    const profile = next.profiles[next.activeProfileId]
    expect(profile.modeStats.placevalue.played).toBe(1)
    expect(profile.modeStats.placevalue.correct).toBe(1)
  })

  it('records task result for zerlegen mode', () => {
    saveState(createDefaultState())

    const next = recordTaskResult({
      mode: 'zerlegen',
      correct: false,
      durationMs: 1600,
      errorType: 'decomposition_missed',
    })

    const profile = next.profiles[next.activeProfileId]
    expect(profile.modeStats.zerlegen.played).toBe(1)
    expect(profile.modeStats.zerlegen.correct).toBe(0)
    expect(profile.errorPatterns.decomposition_missed).toBe(1)
  })

  it('falls back to default state when storage access throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('fail')
    })

    const state = loadState()
    expect(state.activeProfileId).toBe('kid_default')
  })
})

describe('computeAdaptivePlan', () => {
  it('returns hard level for high accuracy and low duration', () => {
    const state = createDefaultState()
    const profile = state.profiles[state.activeProfileId]

    profile.recentTasks = Array.from({ length: 20 }).map((_, index) => ({
      mode: index % 2 === 0 ? 'love10' : 'sprint',
      correct: true,
      durationMs: 2000,
      createdAt: new Date().toISOString(),
    }))

    const plan = computeAdaptivePlan(profile)
    expect(plan.level).toBe('hard')
    expect(plan.hintBoost).toBe(false)
  })

  it('returns easy level and carry focus when many carry errors exist', () => {
    const state = createDefaultState()
    const profile = state.profiles[state.activeProfileId]

    profile.recentTasks = Array.from({ length: 20 }).map((_, index) => ({
      mode: 'carry',
      correct: index < 8,
      durationMs: 6500,
      errorType: index < 6 ? 'carry_missed' : undefined,
      createdAt: new Date().toISOString(),
    }))

    const plan = computeAdaptivePlan(profile)
    expect(plan.level).toBe('easy')
    expect(plan.hintBoost).toBe(true)
    expect(plan.needsCarryFocus).toBe(true)
  })
})
