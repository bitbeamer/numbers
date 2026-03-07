import type { Language } from '../state/types'
import { translate } from '../i18n/translations'

export const getCarryHints = (onesA: number, onesB: number, language: Language): string[] => {
  const missingTo10 = Math.max(0, 10 - onesA)
  return [
    translate(language, 'carryHint1', { onesA, missing: missingTo10 }),
    translate(language, 'carryHint2', { count: Math.min(onesB, missingTo10) }),
  ]
}

export const labelForError = (errorKey: string, language: Language): string => {
  if (errorKey === 'sum_not_10') {
    return translate(language, 'errorSumNot10')
  }
  if (errorKey === 'carry_missed') {
    return translate(language, 'errorCarryMissed')
  }
  if (errorKey === 'place_value_confusion') {
    return translate(language, 'errorPlaceValue')
  }
  return translate(language, 'errorUnknown')
}
