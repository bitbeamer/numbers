import { saveState } from '../state/persistence'
import { useAppStore } from '../state/store'
import type { DifficultySetting, NumberRange } from '../state/types'
import { AVATAR_OPTIONS } from '../app/avatarCatalog'

const numberRanges: NumberRange[] = [10, 25, 50, 100]

export const SettingsPage = () => {
  const { activeProfile, state, patchProfile, resetData } = useAppStore()

  const updateDifficulty = (difficulty: DifficultySetting) => {
    patchProfile({
      settings: {
        ...activeProfile.settings,
        difficulty,
      },
    })
  }

  const updateSound = (sound: boolean) => {
    patchProfile({
      settings: {
        ...activeProfile.settings,
        sound,
      },
    })
  }

  const updateUiScale = (uiScale: 'small' | 'normal' | 'large') => {
    patchProfile({
      settings: {
        ...activeProfile.settings,
        uiScale,
      },
    })
  }

  const updateNumberRange = (numberRange: NumberRange) => {
    patchProfile({
      settings: {
        ...activeProfile.settings,
        numberRange,
      },
    })
  }

  const saveName = (rawValue: string) => {
    const trimmed = rawValue.trim()
    if (!trimmed) {
      patchProfile({ name: activeProfile.name })
      return
    }

    patchProfile({ name: trimmed })
  }

  const resetAll = () => {
    const accepted = window.confirm('Willst du wirklich alle Daten löschen? Das kann nicht rückgängig gemacht werden.')
    if (!accepted) {
      return
    }
    resetData()
  }

  const persistNow = () => {
    saveState(state)
  }

  return (
    <div className="stack-lg">
      <h1>Einstellungen</h1>

      <section className="task-card">
        <h2>Profil</h2>
        <div className="form-row">
          <label htmlFor="profile-name">Name</label>
          <input
            id="profile-name"
            key={activeProfile.name}
            defaultValue={activeProfile.name}
            onBlur={(event) => saveName(event.target.value)}
            className="text-input"
            maxLength={20}
          />
        </div>

        <div className="avatar-row" role="group" aria-label="Avatar auswählen">
          {AVATAR_OPTIONS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              className={`avatar-button ${activeProfile.avatar === avatar.id ? 'is-selected' : ''}`}
              onClick={() => patchProfile({ avatar: avatar.id })}
              aria-label={`Avatar ${avatar.label}`}
            >
              <img src={avatar.image} alt="" className="avatar-image" />
              <span>{avatar.label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="task-card">
        <h2>Spiel</h2>
        <div className="form-row inline">
          <label htmlFor="sound-toggle">Sound</label>
          <input
            id="sound-toggle"
            type="checkbox"
            checked={activeProfile.settings.sound}
            onChange={(event) => updateSound(event.target.checked)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="difficulty-select">Schwierigkeit</label>
          <select
            id="difficulty-select"
            value={activeProfile.settings.difficulty}
            onChange={(event) => updateDifficulty(event.target.value as DifficultySetting)}
            className="text-input"
          >
            <option value="easy">Leicht</option>
            <option value="medium">Mittel</option>
            <option value="adaptive">Adaptiv</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="ui-scale-select">UI-Größe</label>
          <select
            id="ui-scale-select"
            value={activeProfile.settings.uiScale}
            onChange={(event) => updateUiScale(event.target.value as 'small' | 'normal' | 'large')}
            className="text-input"
          >
            <option value="small">Klein</option>
            <option value="normal">Normal</option>
            <option value="large">Groß</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="number-range-select">Zahlenraum</label>
          <select
            id="number-range-select"
            value={activeProfile.settings.numberRange}
            onChange={(event) => updateNumberRange(Number(event.target.value) as NumberRange)}
            className="text-input"
          >
            {numberRanges.map((range) => (
              <option key={range} value={range}>
                bis {range}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="task-card">
        <h2>Daten</h2>
        <div className="row-actions">
          <button type="button" className="secondary-button" onClick={persistNow}>
            Jetzt sichern
          </button>
          <button type="button" className="danger-button" onClick={resetAll}>
            Daten zurücksetzen
          </button>
        </div>
      </section>
    </div>
  )
}
