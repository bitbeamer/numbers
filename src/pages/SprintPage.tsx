import { useEffect, useState } from 'react'
import { FeedbackToast } from '../components/FeedbackToast'
import { ScoreBar } from '../components/ScoreBar'
import { generateSprintTask } from '../game/generators/sprint'
import { calculateSprintPoints } from '../game/scoring'
import { nowMs } from '../game/time'
import { useAppStore } from '../state/store'

const ROUND_SECONDS = 60

export const SprintPage = () => {
  const { activeProfile, adaptivePlan, recordTaskResultInStore, registerSession } = useAppStore()
  const [running, setRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS)
  const [task, setTask] = useState(() => generateSprintTask(adaptivePlan, activeProfile.settings.numberRange))
  const [taskStartedAt, setTaskStartedAt] = useState(0)
  const [score, setScore] = useState(0)
  const [combo, setCombo] = useState(0)
  const [bestCombo, setBestCombo] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'warning'; message: string } | null>(null)

  useEffect(() => {
    if (!running) {
      return
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timerId)
          setRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      window.clearInterval(timerId)
    }
  }, [running])

  const startRound = () => {
    registerSession('sprint')
    setRunning(true)
    setTimeLeft(ROUND_SECONDS)
    setScore(0)
    setCombo(0)
    setBestCombo(0)
    setAnswered(0)
    setCorrect(0)
    setFeedback(null)
    setTask(generateSprintTask(adaptivePlan, activeProfile.settings.numberRange))
    setTaskStartedAt(nowMs())
  }

  const handleAnswer = (value: number) => {
    if (!running || timeLeft <= 0) {
      return
    }

    const durationMs = nowMs() - taskStartedAt
    const isCorrect = value === task.answer

    setAnswered((prev) => prev + 1)

    if (isCorrect) {
      setCorrect((prev) => prev + 1)
      setCombo((prev) => {
        const next = prev + 1
        setBestCombo((currentBest) => Math.max(currentBest, next))
        setScore((prevScore) => prevScore + calculateSprintPoints(next))
        return next
      })
      setFeedback({ kind: 'success', message: 'Treffer!' })
      recordTaskResultInStore({ mode: 'sprint', correct: true, durationMs })
    } else {
      setCombo(0)
      setFeedback({ kind: 'warning', message: 'Knapp vorbei. Weiter!' })
      recordTaskResultInStore({
        mode: 'sprint',
        correct: false,
        durationMs,
        errorType: task.errorTypeOnWrong,
      })
    }

    setTask(generateSprintTask(adaptivePlan, activeProfile.settings.numberRange))
    setTaskStartedAt(nowMs())
  }

  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0

  return (
    <div className="stack-lg">
      <h1>Tempo-Spiel</h1>
      <p>60 Sekunden, große Antwortfelder und Combo-Punkte. Zahlraum bis {activeProfile.settings.numberRange}.</p>

      {!running && timeLeft === ROUND_SECONDS ? (
        <section className="hero-card">
          <h2>Bereit?</h2>
          <p>Klicke auf Start und löse so viele Aufgaben wie möglich.</p>
          <button type="button" className="primary-button" onClick={startRound}>
            Start
          </button>
        </section>
      ) : null}

      {(running || timeLeft === 0) && <ScoreBar score={score} combo={combo} timeLeft={timeLeft} />}

      {running ? (
        <section className="task-card">
          <h2 className="sprint-question">{task.prompt}</h2>
          {feedback ? <FeedbackToast kind={feedback.kind} message={feedback.message} /> : null}
          <div className="answer-grid big">
            {task.options.map((option) => (
              <button key={option} type="button" className="answer-button big" onClick={() => handleAnswer(option)}>
                {option}
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {!running && timeLeft === 0 ? (
        <section className="hero-card">
          <h2>Zeit vorbei!</h2>
          <p>
            Punkte: <strong>{score}</strong> | Aufgaben: <strong>{answered}</strong> | Trefferquote:{' '}
            <strong>{accuracy}%</strong> | Beste Combo: <strong>{bestCombo}</strong>
          </p>
          <button type="button" className="primary-button" onClick={startRound}>
            Nochmal spielen
          </button>
        </section>
      ) : null}
    </div>
  )
}
