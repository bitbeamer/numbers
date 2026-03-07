import { applyProfilePatch, applyTaskResult, createDefaultState } from './persistence'
import type { Profile, RootState, TaskResultInput } from './types'

export const setActiveProfile = (state: RootState, profileId: string): RootState => {
  if (!state.profiles[profileId]) {
    return state
  }

  return {
    ...state,
    activeProfileId: profileId,
  }
}

export const patchActiveProfile = (state: RootState, patch: Partial<Profile>): RootState => {
  return applyProfilePatch(state, state.activeProfileId, patch)
}

export const addTaskResult = (state: RootState, result: TaskResultInput): RootState => {
  return applyTaskResult(state, result)
}

export const resetAllData = (): RootState => {
  return createDefaultState()
}
