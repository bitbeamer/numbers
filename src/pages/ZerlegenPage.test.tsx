import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import { AppStoreProvider, useAppStore } from '../state/store'
import { ZerlegenPage } from './ZerlegenPage'
import * as zerlegenGenerator from '../game/generators/zerlegen'

const RangeChanger = () => {
  const { activeProfile, patchProfile } = useAppStore()

  return (
    <button
      type="button"
      onClick={() =>
        patchProfile({
          settings: {
            ...activeProfile.settings,
            numberRange: 10,
          },
        })
      }
    >
      set range to 10
    </button>
  )
}

describe('ZerlegenPage', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('regenerates the task when the selected number range changes', async () => {
    const generatorSpy = vi.spyOn(zerlegenGenerator, 'generateZerlegenTask').mockImplementation((_level, numberRange) => ({
      target: numberRange,
      correct: { a: 0, b: numberRange },
      options: [
        { a: 0, b: numberRange },
        { a: 1, b: Math.max(0, numberRange - 2) },
        { a: 2, b: Math.max(0, numberRange - 4) },
        { a: 3, b: Math.max(0, numberRange - 6) },
        { a: 4, b: Math.max(0, numberRange - 8) },
      ],
    }))

    const { container } = render(
      <AppStoreProvider>
        <RangeChanger />
        <ZerlegenPage />
      </AppStoreProvider>,
    )

    expect(container.querySelector('.placevalue-number')?.textContent).toBe('25')

    fireEvent.click(screen.getByRole('button', { name: /set range to 10/i }))

    expect(container.querySelector('.placevalue-number')?.textContent).toBe('10')
    expect(generatorSpy).toHaveBeenLastCalledWith('medium', 10)
  })
})
