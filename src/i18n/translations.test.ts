import { describe, expect, it } from 'vitest'
import { translate } from './translations'

describe('translations', () => {
  it('returns proper english labels', () => {
    expect(translate('en', 'settingsTitle')).toBe('Settings')
    expect(translate('en', 'progressTitle')).toBe('Progress')
    expect(translate('en', 'carryNeedBundle')).toBe('Look at the ones: bundle 10 ones into 1 ten first.')
  })

  it('applies interpolation placeholders', () => {
    expect(translate('en', 'homeGreeting', { name: 'Anna' })).toBe('Hi Anna! Ready for Zahlenliebe?')
    expect(translate('de', 'settingsRangeOption', { value: 50 })).toBe('bis 50')
  })
})
