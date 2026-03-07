import { useEffect, useRef, useState } from 'react'
import { FeedbackToast } from '../components/FeedbackToast'
import { PlaceValueBoard } from '../components/PlaceValueBoard'
import { ScoreBar } from '../components/ScoreBar'
import { generatePlaceValueTask } from '../game/generators/placevalue'
import { nowMs } from '../game/time'
import { useAppStore } from '../state/store'

export const PlaceValuePage = () => {
  const { activeProfile, adaptivePlan, registerSession, recordTaskResultInStore } = useAppStore()
  const [task, setTask] = useState(() => generatePlaceValueTask(adaptivePlan.level, activeProfile.settings.numberRange))
  const [selectedTens, setSelectedTens] = useState<number | null>(null)
  const [selectedOnes, setSelectedOnes] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [feedback, setFeedback] = useState<{ kind: 'success' | 'warning'; message: string } | null>(null)
  const startedAtRef = useRef(0)
  const roundTimeoutRef = useRef<number | null>(null)
  const lockedRef = useRef(false)

  useEffect(() => {
    registerSession('placevalue')
    startedAtRef.current = nowMs()

    return () => {
      if (roundTimeoutRef.current) {
        window.clearTimeout(roundTimeoutRef.current)
      }
    }
  }, [registerSession])

  const nextTask = () => {
    setTask(generatePlaceValueTask(adaptivePlan.level, activeProfile.settings.numberRange))
    setSelectedTens(null)
    setSelectedOnes(null)
    setFeedback(null)
    startedAtRef.current = nowMs()
    lockedRef.current = false
  }

  const evaluateSelection = (tensChoice: number, onesChoice: number) => {
    const durationMs = nowMs() - startedAtRef.current
    const correct = tensChoice === task.tens && onesChoice === task.ones

    if (correct) {
      lockedRef.current = true
      setStreak((prev) => {
        const next = prev + 1
        setScore((current) => current + 10 + Math.max(0, next - 1) * 2)
        return next
      })
      setFeedback({ kind: 'success', message: 'Richtig! Genau so viele Zehner und Einer.' })
      recordTaskResultInStore({ mode: 'placevalue', correct: true, durationMs })
      roundTimeoutRef.current = window.setTimeout(() => nextTask(), 900)
      return
    }

    setStreak(0)
    setFeedback({ kind: 'warning', message: 'Fast! Schau nochmal auf Zehner und Einer.' })
    recordTaskResultInStore({
      mode: 'placevalue',
      correct: false,
      durationMs,
      errorType: 'place_value_confusion',
    })
  }

  const chooseTens = (value: number) => {
    if (lockedRef.current) {
      return
    }
    setSelectedTens(value)
    if (selectedOnes !== null) {
      evaluateSelection(value, selectedOnes)
    }
  }

  const chooseOnes = (value: number) => {
    if (lockedRef.current) {
      return
    }
    setSelectedOnes(value)
    if (selectedTens !== null) {
      evaluateSelection(selectedTens, value)
    }
  }

  return (
    <div className="stack-lg">
      <h1>Zehner & Einer</h1>
      <p>Klicke an, aus wie vielen Zehnern und Einern die Zahl besteht. Die Icons zeigen deine Auswahl.</p>

      <ScoreBar score={score} streak={streak} />

      <section className="task-card">
        <p className="muted">Zahlraum bis {activeProfile.settings.numberRange}</p>
        <div className="placevalue-number" aria-live="polite">
          {task.value}
        </div>
      </section>

      <section className="task-card">
        <h2>Deine Visualisierung</h2>
        <p className="muted">So sieht deine aktuelle Auswahl als Zehner-Stäbe und Einer-Punkte aus.</p>
        <PlaceValueBoard tens={selectedTens ?? 0} ones={selectedOnes ?? 0} />
      </section>

      {feedback ? <FeedbackToast kind={feedback.kind} message={feedback.message} /> : null}

      <section className="task-card">
        <h2>Zehner wählen</h2>
        <div className="choice-grid">
          {Array.from({ length: task.maxTensOption + 1 }).map((_, index) => (
            <button
              key={`tens-${index}`}
              type="button"
              className={`answer-button ${selectedTens === index ? 'is-selected' : ''}`}
              onClick={() => chooseTens(index)}
            >
              {index}
            </button>
          ))}
        </div>
      </section>

      <section className="task-card">
        <h2>Einer wählen</h2>
        <div className="choice-grid">
          {Array.from({ length: 10 }).map((_, index) => (
            <button
              key={`ones-${index}`}
              type="button"
              className={`answer-button ${selectedOnes === index ? 'is-selected' : ''}`}
              onClick={() => chooseOnes(index)}
            >
              {index}
            </button>
          ))}
        </div>
      </section>

      <div className="row-actions">
        <button type="button" className="secondary-button" onClick={nextTask}>
          Neue Zahl
        </button>
      </div>
    </div>
  )
}
