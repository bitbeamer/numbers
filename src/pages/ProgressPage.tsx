import { labelForError } from '../game/hints'
import { useI18n } from '../i18n/useI18n'
import { formatPercent, formatSeconds, getLastDays, getModeAccuracy, getTopErrors } from '../state/selectors'
import { useAppStore } from '../state/store'

export const ProgressPage = () => {
  const { activeProfile } = useAppStore()
  const { language, t } = useI18n()
  const today = new Date().toISOString().slice(0, 10)
  const todayStat = activeProfile.daily[today] ?? { playSeconds: 0, tasks: 0, correct: 0 }
  const totalAccuracy =
    activeProfile.stats.totalTasks > 0 ? activeProfile.stats.totalCorrect / activeProfile.stats.totalTasks : 0

  const last7 = getLastDays(activeProfile, 7)
  const maxTasks = Math.max(1, ...last7.map((entry) => entry.stat.tasks))
  const topErrors = getTopErrors(activeProfile, 3)

  return (
    <div className="stack-lg">
      <h1>{t('progressTitle')}</h1>

      <section className="stats-row">
        <div className="mini-card">
          <h3>{t('progressPlaytimeToday')}</h3>
          <strong>{formatSeconds(todayStat.playSeconds)}</strong>
        </div>
        <div className="mini-card">
          <h3>{t('progressTotalAccuracy')}</h3>
          <strong>{formatPercent(totalAccuracy)}</strong>
        </div>
        <div className="mini-card">
          <h3>{t('progressBestStreak')}</h3>
          <strong>{activeProfile.stats.bestStreak}</strong>
        </div>
      </section>

      <section className="task-card">
        <h2>{t('progressPerMode')}</h2>
        <div className="mode-accuracy-grid">
          <div className="mini-card">
            <h3>{t('modeLove10')}</h3>
            <p>{formatPercent(getModeAccuracy(activeProfile, 'love10'))}</p>
          </div>
          <div className="mini-card">
            <h3>{t('modeCarry')}</h3>
            <p>{formatPercent(getModeAccuracy(activeProfile, 'carry'))}</p>
          </div>
          <div className="mini-card">
            <h3>{t('modePlaceValue')}</h3>
            <p>{formatPercent(getModeAccuracy(activeProfile, 'placevalue'))}</p>
          </div>
          <div className="mini-card">
            <h3>{t('modeSprint')}</h3>
            <p>{formatPercent(getModeAccuracy(activeProfile, 'sprint'))}</p>
          </div>
        </div>
      </section>

      <section className="task-card">
        <h2>{t('progressLast7Days')}</h2>
        <div className="bar-chart">
          {last7.map(({ day, stat }) => {
            const widthPercent = Math.round((stat.tasks / maxTasks) * 100)
            return (
              <div key={day} className="bar-row">
                <span className="bar-label">{day.slice(5)}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${widthPercent}%` }} />
                </div>
                <span className="bar-value">{t('progressTasksLabel', { count: stat.tasks })}</span>
              </div>
            )
          })}
        </div>
      </section>

      <section className="task-card">
        <h2>{t('progressTopErrors')}</h2>
        {topErrors.length > 0 ? (
          <ul className="error-list">
            {topErrors.map((error) => (
              <li key={error.key}>
                <span>{labelForError(error.key, language)}</span>
                <strong>{error.count}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>{t('progressNoErrors')}</p>
        )}
      </section>
    </div>
  )
}
