import { translate } from './translations'
import type { TranslationKey } from './translations'
import { useAppStore } from '../state/store'

export const useI18n = () => {
  const { activeProfile } = useAppStore()
  const language = activeProfile.settings.language

  const t = (key: TranslationKey, variables?: Record<string, string | number>) => {
    return translate(language, key, variables)
  }

  return {
    language,
    t,
  }
}
