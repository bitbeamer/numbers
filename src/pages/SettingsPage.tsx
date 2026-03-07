import { AVATAR_OPTIONS } from '../app/avatarCatalog'
import { useI18n } from '../i18n/useI18n'
import { saveState } from '../state/persistence'
import { useAppStore } from '../state/store'
import type { DifficultySetting, Language, NumberRange } from '../state/types'

const numberRanges: NumberRange[] = [10, 25, 50, 100]

const avatarLabelKeyById: Record<string, 'avatarCat' | 'avatarFox' | 'avatarPanda' | 'avatarRocket'> = {
  cat: 'avatarCat',
  fox: 'avatarFox',
  panda: 'avatarPanda',
  rocket: 'avatarRocket',
}

export const SettingsPage = () => {
  const { activeProfile, state, patchProfile, resetData } = useAppStore()
  const { t } = useI18n()

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

  const updateLanguage = (language: Language) => {
    patchProfile({
      settings: {
        ...activeProfile.settings,
        language,
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
    const accepted = window.confirm(t('settingsResetConfirm'))
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
      <h1>{t('settingsTitle')}</h1>

      <section className="task-card">
        <h2>{t('settingsProfile')}</h2>
        <div className="form-row">
          <label htmlFor="profile-name">{t('settingsName')}</label>
          <input
            id="profile-name"
            key={activeProfile.name}
            defaultValue={activeProfile.name}
            onBlur={(event) => saveName(event.target.value)}
            className="text-input"
            maxLength={20}
          />
        </div>

        <div className="avatar-row" role="group" aria-label={t('settingsAvatarLabel')}>
          {AVATAR_OPTIONS.map((avatar) => {
            const labelKey = avatarLabelKeyById[avatar.id]
            return (
              <button
                key={avatar.id}
                type="button"
                className={`avatar-button ${activeProfile.avatar === avatar.id ? 'is-selected' : ''}`}
                onClick={() => patchProfile({ avatar: avatar.id })}
                aria-label={`${t('settingsAvatarLabel')}: ${t(labelKey)}`}
              >
                <img src={avatar.image} alt="" className="avatar-image" />
                <span>{t(labelKey)}</span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="task-card">
        <h2>{t('settingsGame')}</h2>
        <div className="form-row inline">
          <label htmlFor="sound-toggle">{t('settingsSound')}</label>
          <input
            id="sound-toggle"
            type="checkbox"
            checked={activeProfile.settings.sound}
            onChange={(event) => updateSound(event.target.checked)}
          />
        </div>

        <div className="form-row">
          <label htmlFor="difficulty-select">{t('settingsDifficulty')}</label>
          <select
            id="difficulty-select"
            value={activeProfile.settings.difficulty}
            onChange={(event) => updateDifficulty(event.target.value as DifficultySetting)}
            className="text-input"
          >
            <option value="easy">{t('settingsDifficultyEasy')}</option>
            <option value="medium">{t('settingsDifficultyMedium')}</option>
            <option value="adaptive">{t('settingsDifficultyAdaptive')}</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="ui-scale-select">{t('settingsUiScale')}</label>
          <select
            id="ui-scale-select"
            value={activeProfile.settings.uiScale}
            onChange={(event) => updateUiScale(event.target.value as 'small' | 'normal' | 'large')}
            className="text-input"
          >
            <option value="small">{t('settingsUiScaleSmall')}</option>
            <option value="normal">{t('settingsUiScaleNormal')}</option>
            <option value="large">{t('settingsUiScaleLarge')}</option>
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="number-range-select">{t('settingsNumberRange')}</label>
          <select
            id="number-range-select"
            value={activeProfile.settings.numberRange}
            onChange={(event) => updateNumberRange(Number(event.target.value) as NumberRange)}
            className="text-input"
          >
            {numberRanges.map((range) => (
              <option key={range} value={range}>
                {t('settingsRangeOption', { value: range })}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <label htmlFor="language-select">{t('settingsLanguage')}</label>
          <select
            id="language-select"
            value={activeProfile.settings.language}
            onChange={(event) => updateLanguage(event.target.value as Language)}
            className="text-input"
          >
            <option value="de">{t('settingsLanguageGerman')}</option>
            <option value="en">{t('settingsLanguageEnglish')}</option>
          </select>
        </div>
      </section>

      <section className="task-card">
        <h2>{t('settingsData')}</h2>
        <div className="row-actions">
          <button type="button" className="secondary-button" onClick={persistNow}>
            {t('settingsSaveNow')}
          </button>
          <button type="button" className="danger-button" onClick={resetAll}>
            {t('settingsReset')}
          </button>
        </div>
      </section>
    </div>
  )
}
