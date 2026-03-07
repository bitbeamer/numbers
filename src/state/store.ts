import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { addTaskResult, patchActiveProfile, resetAllData } from './actions'
import { computeAdaptivePlan, loadState, saveState } from './persistence'
import { getActiveProfile } from './selectors'
import type { Mode, Profile, RootState, TaskResultInput } from './types'

interface StoreValue {
  state: RootState
  activeProfile: Profile
  adaptivePlan: ReturnType<typeof computeAdaptivePlan>
  patchProfile: (patch: Partial<Profile>) => void
  recordTaskResultInStore: (result: TaskResultInput) => void
  registerSession: (mode: Mode) => void
  resetData: () => void
}

const AppStoreContext = createContext<StoreValue | null>(null)

export const AppStoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<RootState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const activeProfile = useMemo(() => getActiveProfile(state), [state])
  const adaptivePlan = useMemo(() => computeAdaptivePlan(activeProfile), [activeProfile])

  const patchProfile = useCallback((patch: Partial<Profile>) => {
    setState((prev) => patchActiveProfile(prev, patch))
  }, [])

  const recordTaskResultInStore = useCallback((result: TaskResultInput) => {
    const safeResult: TaskResultInput = {
      ...result,
      durationMs: Math.max(100, Math.round(result.durationMs)),
    }
    setState((prev) => addTaskResult(prev, safeResult))
  }, [])

  const registerSession = useCallback((mode: Mode) => {
    void mode
    setState((prev) => {
      const profile = getActiveProfile(prev)
      return patchActiveProfile(prev, {
        stats: {
          ...profile.stats,
          totalSessions: profile.stats.totalSessions + 1,
        },
      })
    })
  }, [])

  const resetData = useCallback(() => {
    setState(resetAllData())
  }, [])

  const value = useMemo(
    () => ({
      state,
      activeProfile,
      adaptivePlan,
      patchProfile,
      recordTaskResultInStore,
      registerSession,
      resetData,
    }),
    [activeProfile, adaptivePlan, patchProfile, recordTaskResultInStore, registerSession, resetData, state],
  )

  return createElement(AppStoreContext.Provider, { value }, children)
}

export const useAppStore = () => {
  const context = useContext(AppStoreContext)
  if (!context) {
    throw new Error('useAppStore must be used inside AppStoreProvider')
  }

  return context
}
