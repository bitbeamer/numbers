import { Link } from 'react-router-dom'
import { useI18n } from '../i18n/useI18n'
import { formatPercent, getAdaptiveSummary, getModeAccuracy } from '../state/selectors'
import { useAppStore } from '../state/store'

export const HomePage = () => {
  const { activeProfile } = useAppStore()
  const { t } = useI18n()
  const adaptive = getAdaptiveSummary(activeProfile)
  const difficultyLabel =
    activeProfile.settings.difficulty === 'easy'
      ? t('settingsDifficultyEasy')
      : activeProfile.settings.difficulty === 'medium'
        ? t('settingsDifficultyMedium')
        : t('settingsDifficultyAdaptive')
  const adaptiveLevelLabel =
    adaptive.level === 'easy'
      ? t('settingsDifficultyEasy')
      : adaptive.level === 'medium'
        ? t('settingsDifficultyMedium')
        : t('difficultyHard')

  const modeCards = [
    {
      to: '/mode/love10',
      title: t('homeModeLove10Title'),
      text: t('homeModeLove10Text'),
      colorClass: 'mode-card--love10',
    },
    {
      to: '/mode/placevalue',
      title: t('homeModePlaceValueTitle'),
      text: t('homeModePlaceValueText'),
      colorClass: 'mode-card--placevalue',
    },
    {
      to: '/mode/carry',
      title: t('homeModeCarryTitle'),
      text: t('homeModeCarryText'),
      colorClass: 'mode-card--carry',
    },
    {
      to: '/mode/sprint',
      title: t('homeModeSprintTitle'),
      text: t('homeModeSprintText'),
      colorClass: 'mode-card--sprint',
    },
    {
      to: '/mode/zerlegen',
      title: t('homeModeZerlegenTitle'),
      text: t('homeModeZerlegenText'),
      colorClass: 'mode-card--zerlegen',
    },
  ]

  return (
    <div className="stack-lg">
      <section className="hero-card">
        <h1>{t('homeGreeting', { name: activeProfile.name })}</h1>
        <p>{t('homeSubtitle')}</p>
      </section>

      <section className="mode-grid" aria-label={t('homeModeSelectionLabel')}>
        {modeCards.map((mode) => (
          <Link key={mode.to} to={mode.to} className={`mode-card ${mode.colorClass}`}>
            <h2>{mode.title}</h2>
            <p>{mode.text}</p>
          </Link>
        ))}
      </section>

      <section className="stats-row">
        <div className="mini-card">
          <h3>{t('homeProgressTitle')}</h3>
          <div className="progress-lines">
            <p>
              {t('homeProgressTotal')}: {formatPercent(activeProfile.stats.totalTasks ? activeProfile.stats.totalCorrect / activeProfile.stats.totalTasks : 0)}
            </p>
            <p>
              {t('homeProgressLove10')}: {formatPercent(getModeAccuracy(activeProfile, 'love10'))}
            </p>
            <p>
              {t('homeProgressCarry')}: {formatPercent(getModeAccuracy(activeProfile, 'carry'))}
            </p>
            <p>
              {t('homeProgressPlaceValue')}: {formatPercent(getModeAccuracy(activeProfile, 'placevalue'))}
            </p>
            <p>
              {t('homeProgressSprint')}: {formatPercent(getModeAccuracy(activeProfile, 'sprint'))}
            </p>
            <p>
              {t('homeProgressZerlegen')}: {formatPercent(getModeAccuracy(activeProfile, 'zerlegen'))}
            </p>
          </div>
        </div>
      </section>

      <section className="mini-card">
        <h3>{t('homeSettingsTitle')}</h3>
        <p>
          {t('homeNumberRange')}: <strong>{t('settingsRangeOption', { value: activeProfile.settings.numberRange })}</strong>
        </p>
        {activeProfile.settings.difficulty === 'adaptive' ? (
          <p>
            {t('homeAdaptiveLevel')}: <strong>{adaptiveLevelLabel}</strong> | {t('homeAdaptiveAccuracy', { count: adaptive.sampleSize })}:{' '}
            <strong>{formatPercent(adaptive.accuracy)}</strong>
            {adaptive.needsCarryFocus ? ` | ${t('homeAdaptiveFocus')}` : ''}
          </p>
        ) : (
          <p>
            {t('homeFixedDifficulty')}: {difficultyLabel}
          </p>
        )}
      </section>
    </div>
  )
}
