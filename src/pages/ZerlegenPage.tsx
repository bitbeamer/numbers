import { useEffect, useRef, useState } from 'react'
import { FeedbackToast } from '../components/FeedbackToast'
import { FireworksOverlay } from '../components/FireworksOverlay'
import { ScoreBar } from '../components/ScoreBar'
import { generateZerlegenTask } from '../game/generators/zerlegen'
import { nowMs } from '../game/time'
import { useI18n } from '../i18n/useI18n'
import { useAppStore } from '../state/store'

export const ZerlegenPage = () => {
  const { activeProfile, adaptivePlan, recordTaskResultInStore, registerSession } = useAppStore()
  const { t } = useI18n()
  const [task, setTask] = useState(() => generateZerlegenTask(adaptivePlan.level, activeProfile.settings.numberRange))
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [fireworksBurstKey, setFireworksBurstKey] = useState(0)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'warning'; message: string } | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const roundStartedAtRef = useRef(0)
  const lockedRef = useRef(false)

  useEffect(() => {
    registerSession('zerlegen')
    roundStartedAtRef.current = nowMs()

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [registerSession])

  useEffect(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    setTask(generateZerlegenTask(adaptivePlan.level, activeProfile.settings.numberRange))
    setFeedback(null)
    roundStartedAtRef.current = nowMs()
    lockedRef.current = false
  }, [activeProfile.settings.numberRange, adaptivePlan.level])

  const startNewRound = () => {
    setTask(generateZerlegenTask(adaptivePlan.level, activeProfile.settings.numberRange))
    setFeedback(null)
    roundStartedAtRef.current = nowMs()
    lockedRef.current = false
  }

  const handleAnswer = (a: number, b: number) => {
    if (lockedRef.current) {
      return
    }

    lockedRef.current = true
    const durationMs = nowMs() - roundStartedAtRef.current
    const isCorrect = a + b === task.target

    if (isCorrect) {
      setStreak((prev) => {
        const next = prev + 1
        setScore((current) => current + 10 + Math.max(0, next - 1) * 2)
        return next
      })
      setFeedback(null)
      setFireworksBurstKey((prev) => prev + 1)
      recordTaskResultInStore({ mode: 'zerlegen', correct: true, durationMs })
      timeoutRef.current = window.setTimeout(() => startNewRound(), 900)
      return
    }

    setStreak(0)
    setFeedback({ kind: 'warning', message: t('zerlegenRetry') })
    recordTaskResultInStore({
      mode: 'zerlegen',
      correct: false,
      durationMs,
      errorType: 'decomposition_missed',
    })
    timeoutRef.current = window.setTimeout(() => {
      setFeedback(null)
      lockedRef.current = false
    }, 900)
  }

  return (
    <div className="stack-lg">
      <FireworksOverlay burstKey={fireworksBurstKey} />
      <h1>{t('zerlegenTitle')}</h1>
      <p>{t('zerlegenSubtitle', { range: activeProfile.settings.numberRange })}</p>

      <ScoreBar score={score} streak={streak} />

      <section className="task-card">
        <p className="muted">{t('zerlegenChoose')}</p>
        <div className="placevalue-number" aria-live="polite">
          {task.target}
        </div>
      </section>

      {feedback ? <FeedbackToast kind={feedback.kind} message={feedback.message} /> : null}

      <div className="answer-grid big">
        {task.options.map((option) => {
          const key = `${option.a}+${option.b}`
          return (
            <button key={key} type="button" className="answer-button big" onClick={() => handleAnswer(option.a, option.b)}>
              <span className="tuple-answer">
                <span>{option.a}</span>
                <span className="tuple-answer__plus">+</span>
                <span>{option.b}</span>
              </span>
            </button>
          )
        })}
      </div>

      <button type="button" className="secondary-button" onClick={startNewRound}>
        {t('zerlegenNewTask')}
      </button>
    </div>
  )
}
