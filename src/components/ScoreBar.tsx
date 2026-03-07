import { useI18n } from '../i18n/useI18n'

interface ScoreBarProps {
  score: number
  streak?: number
  combo?: number
  timeLeft?: number
}

export const ScoreBar = ({ score, streak, combo, timeLeft }: ScoreBarProps) => {
  const { t } = useI18n()

  return (
    <div className="score-bar" role="status" aria-live="polite">
      <div className="score-pill">
        {t('scorePoints')}: {score}
      </div>
      {typeof streak === 'number' ? (
        <div className="score-pill">
          {t('scoreStreak')}: {streak}
        </div>
      ) : null}
      {typeof combo === 'number' ? (
        <div className="score-pill">
          {t('scoreCombo')}: x{Math.max(1, combo)}
        </div>
      ) : null}
      {typeof timeLeft === 'number' ? (
        <div className="score-pill">
          {t('scoreTime')}: {timeLeft}s
        </div>
      ) : null}
    </div>
  )
}
