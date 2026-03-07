import { useEffect, useMemo, useRef, useState } from 'react'
import { FeedbackToast } from '../components/FeedbackToast'
import { PlaceValueBoard } from '../components/PlaceValueBoard'
import { ScoreBar } from '../components/ScoreBar'
import { generateCarryTask } from '../game/generators/carry'
import { getCarryHints } from '../game/hints'
import { nowMs } from '../game/time'
import { useI18n } from '../i18n/useI18n'
import { useAppStore } from '../state/store'

export const CarryPage = () => {
  const { activeProfile, adaptivePlan, recordTaskResultInStore, registerSession } = useAppStore()
  const { language, t } = useI18n()
  const [task, setTask] = useState(() => generateCarryTask(adaptivePlan, activeProfile.settings.numberRange))
  const [bundled, setBundled] = useState(false)
  const [hintStep, setHintStep] = useState(0)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'warning' | 'info'; message: string } | null>(null)
  const nextTimeoutRef = useRef<number | null>(null)
  const taskStartedAtRef = useRef(0)

  useEffect(() => {
    registerSession('carry')
    taskStartedAtRef.current = nowMs()
  }, [registerSession])

  useEffect(() => {
    return () => {
      if (nextTimeoutRef.current) {
        window.clearTimeout(nextTimeoutRef.current)
      }
    }
  }, [])

  const onesA = task.a % 10
  const onesB = task.b % 10
  const baseOnes = onesA + onesB
  const baseTens = Math.floor(task.a / 10) + Math.floor(task.b / 10)
  const canBundle = baseOnes >= 10 && !bundled
  const shownOnes = bundled ? baseOnes - 10 : baseOnes
  const shownTens = bundled ? baseTens + 1 : baseTens
  const highlightCount = hintStep >= 2 ? Math.min(onesB, Math.max(0, 10 - onesA)) : 0

  const hints = useMemo(() => getCarryHints(onesA, onesB, language), [language, onesA, onesB])

  const nextTask = () => {
    setTask(generateCarryTask(adaptivePlan, activeProfile.settings.numberRange))
    setBundled(false)
    setHintStep(0)
    setFeedback(null)
    taskStartedAtRef.current = nowMs()
  }

  const handleBundle = () => {
    if (!canBundle) {
      return
    }

    setBundled(true)
    setFeedback({ kind: 'success', message: t('carryBundleSuccess') })
  }

  const handleAnswer = (value: number) => {
    const durationMs = nowMs() - taskStartedAtRef.current

    if (task.requiresCarry && !bundled) {
      setStreak(0)
      setFeedback({ kind: 'warning', message: t('carryNeedBundle') })
      setHintStep((prev) => Math.max(prev, 1))
      recordTaskResultInStore({
        mode: 'carry',
        correct: false,
        durationMs,
        errorType: 'carry_missed',
      })
      return
    }

    if (value === task.result) {
      setStreak((prev) => {
        const next = prev + 1
        setScore((prevScore) => prevScore + 12 + next * 2)
        return next
      })
      setFeedback({ kind: 'success', message: t('carryCorrect') })
      recordTaskResultInStore({ mode: 'carry', correct: true, durationMs })
      nextTimeoutRef.current = window.setTimeout(() => nextTask(), 900)
      return
    }

    setStreak(0)
    setFeedback({ kind: 'info', message: t('carryRetry') })
    if (adaptivePlan.hintBoost) {
      setHintStep((prev) => Math.max(prev, 1))
    }
    recordTaskResultInStore({
      mode: 'carry',
      correct: false,
      durationMs,
      errorType: 'place_value_confusion',
    })
  }

  return (
    <div className="stack-lg">
      <h1>{t('carryTitle')}</h1>
      <p>{t('carrySubtitle', { range: activeProfile.settings.numberRange })}</p>

      <ScoreBar score={score} streak={streak} />

      <section className="task-card">
        <h2>
          {task.a} + {task.b}
        </h2>
        <p className="muted">{t('carryModelHint')}</p>

        <PlaceValueBoard tens={shownTens} ones={shownOnes} highlightCount={highlightCount} />

        <div className="row-actions">
          <button type="button" className="secondary-button" onClick={handleBundle} disabled={!canBundle}>
            {t('carryBundle')}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => setHintStep((prev) => Math.min(2, prev + 1))}
            disabled={hintStep >= 2}
          >
            {t('carryHint')}
          </button>
          <button type="button" className="secondary-button" onClick={nextTask}>
            {t('carryNewTask')}
          </button>
        </div>

        {hintStep > 0 ? <div className="hint-box">{hints[hintStep - 1]}</div> : null}
      </section>

      {feedback ? <FeedbackToast kind={feedback.kind} message={feedback.message} /> : null}

      <section>
        <h3>{t('carrySelectResult')}</h3>
        <div className="answer-grid">
          {task.options.map((option) => (
            <button key={option} type="button" className="answer-button" onClick={() => handleAnswer(option)}>
              {option}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
