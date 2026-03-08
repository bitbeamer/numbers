import { useEffect, useRef, useState } from 'react'
import { FeedbackToast } from '../components/FeedbackToast'
import { FireworksOverlay } from '../components/FireworksOverlay'
import { ScoreBar } from '../components/ScoreBar'
import { generateLove10Round } from '../game/generators/love10'
import { calculateLove10Points } from '../game/scoring'
import { nowMs } from '../game/time'
import { useI18n } from '../i18n/useI18n'
import { useAppStore } from '../state/store'

export const Love10Page = () => {
  const { activeProfile, adaptivePlan, recordTaskResultInStore, registerSession } = useAppStore()
  const { t } = useI18n()
  const [round, setRound] = useState(() => generateLove10Round(adaptivePlan.level, activeProfile.settings.numberRange))
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [isCorrectFlash, setIsCorrectFlash] = useState(false)
  const [fireworksBurstKey, setFireworksBurstKey] = useState(0)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'warning'; message: string } | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const lockedRef = useRef(false)
  const roundStartedAtRef = useRef(0)

  useEffect(() => {
    registerSession('love10')
    roundStartedAtRef.current = nowMs()
  }, [registerSession])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const startNewRound = () => {
    setRound(generateLove10Round(adaptivePlan.level, activeProfile.settings.numberRange))
    setIsCorrectFlash(false)
    roundStartedAtRef.current = nowMs()
    lockedRef.current = false
  }

  const handleAnswer = (value: number) => {
    if (lockedRef.current) {
      return
    }

    lockedRef.current = true
    const durationMs = nowMs() - roundStartedAtRef.current

    if (value === round.answer) {
      setStreak((prev) => {
        const next = prev + 1
        setScore((prevScore) => prevScore + calculateLove10Points(next))
        return next
      })
      setFeedback(null)
      setIsCorrectFlash(true)
      setFireworksBurstKey((prev) => prev + 1)
      recordTaskResultInStore({ mode: 'love10', correct: true, durationMs })
      timeoutRef.current = window.setTimeout(() => {
        startNewRound()
      }, 900)
      return
    }

    setStreak(0)
    setIsCorrectFlash(false)
    setFeedback({ kind: 'warning', message: t('love10Retry') })
    recordTaskResultInStore({
      mode: 'love10',
      correct: false,
      durationMs,
      errorType: 'sum_not_10',
    })
    timeoutRef.current = window.setTimeout(() => {
      setFeedback(null)
      lockedRef.current = false
    }, 900)
  }

  return (
    <div className="stack-lg">
      <FireworksOverlay burstKey={fireworksBurstKey} />
      <h1>{t('love10Title')}</h1>
      <p>{t('love10Subtitle')}</p>

      <ScoreBar score={score} streak={streak} />

      <section className={`task-card ${isCorrectFlash ? 'is-correct' : ''}`}>
        <h2 className="sprint-question">
          {round.missingOnLeft ? `? + ${round.shown} = ${round.target}` : `${round.shown} + ? = ${round.target}`}
        </h2>
      </section>

      {feedback ? <FeedbackToast kind={feedback.kind} message={feedback.message} /> : null}

      <div className="answer-grid big">
        {round.options.map((option) => (
          <button key={option} type="button" className="answer-button big" onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))}
      </div>

      <button type="button" className="secondary-button" onClick={startNewRound}>
        {t('love10NewCards')}
      </button>
    </div>
  )
}
