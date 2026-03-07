import { useEffect, useMemo, useRef, useState } from 'react'
import { DropZone } from '../components/DropZone'
import { FeedbackToast } from '../components/FeedbackToast'
import { NumberCard } from '../components/NumberCard'
import { ScoreBar } from '../components/ScoreBar'
import { generateLove10Round } from '../game/generators/love10'
import { calculateLove10Points } from '../game/scoring'
import { nowMs } from '../game/time'
import { useAppStore } from '../state/store'

export const Love10Page = () => {
  const { activeProfile, adaptivePlan, recordTaskResultInStore, registerSession } = useAppStore()
  const [round, setRound] = useState(() => generateLove10Round(adaptivePlan.level, activeProfile.settings.numberRange))
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
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

  const cardsById = useMemo(() => {
    return Object.fromEntries(round.cards.map((card) => [card.id, card]))
  }, [round.cards])

  const startNewRound = () => {
    setRound(generateLove10Round(adaptivePlan.level, activeProfile.settings.numberRange))
    setSelectedIds([])
    roundStartedAtRef.current = nowMs()
    lockedRef.current = false
  }

  const evaluateCards = (ids: string[]) => {
    if (lockedRef.current || ids.length !== 2) {
      return
    }

    lockedRef.current = true
    const selected = ids.map((id) => cardsById[id]).filter(Boolean)
    if (selected.length !== 2) {
      lockedRef.current = false
      return
    }

    const sum = selected[0].value + selected[1].value
    const durationMs = nowMs() - roundStartedAtRef.current

    if (sum === round.target) {
      setStreak((prev) => {
        const next = prev + 1
        setScore((prevScore) => prevScore + calculateLove10Points(next))
        return next
      })
      setFeedback({ kind: 'success', message: `Super! Zusammen ist das ${round.target}.` })
      recordTaskResultInStore({ mode: 'love10', correct: true, durationMs })
      timeoutRef.current = window.setTimeout(() => {
        setFeedback(null)
        startNewRound()
      }, 900)
      return
    }

    setStreak(0)
    setFeedback({ kind: 'warning', message: 'Fast! Versuch es nochmal mit zwei anderen Karten.' })
    recordTaskResultInStore({
      mode: 'love10',
      correct: false,
      durationMs,
      errorType: 'sum_not_10',
    })
    timeoutRef.current = window.setTimeout(() => {
      setSelectedIds([])
      setFeedback(null)
      lockedRef.current = false
    }, 900)
  }

  const addCard = (cardId: string) => {
    if (lockedRef.current) {
      return
    }

    setSelectedIds((prev) => {
      if (prev.includes(cardId) || prev.length >= 2) {
        return prev
      }
      const next = [...prev, cardId]
      if (next.length === 2) {
        window.setTimeout(() => evaluateCards(next), 40)
      }
      return next
    })
  }

  const removeCard = (cardId: string) => {
    if (lockedRef.current) {
      return
    }
    setSelectedIds((prev) => prev.filter((id) => id !== cardId))
  }

  return (
    <div className="stack-lg">
      <h1>Verliebte Zahlen</h1>
      <p>Ziehe zwei Karten in die Herz-Zone. Zusammen sollen sie {round.target} ergeben.</p>

      <ScoreBar score={score} streak={streak} />

      <DropZone title="Herz-Zone" subtitle="Lege hier genau 2 Karten ab." onDropCard={addCard}>
        <div className="selected-cards">
          {selectedIds.length > 0 ? (
            selectedIds.map((id) => {
              const card = cardsById[id]
              if (!card) {
                return null
              }

              return (
                <button key={id} type="button" className="chip-card" onClick={() => removeCard(id)}>
                  {card.value}
                </button>
              )
            })
          ) : (
            <span className="muted">Ziehe zwei Karten hier hinein.</span>
          )}
        </div>
      </DropZone>

      {feedback ? <FeedbackToast kind={feedback.kind} message={feedback.message} /> : null}

      <div className="number-grid">
        {round.cards.map((card) => (
          <NumberCard
            key={card.id}
            value={card.value}
            cardId={card.id}
            selected={selectedIds.includes(card.id)}
            onSelect={addCard}
          />
        ))}
      </div>

      <button type="button" className="secondary-button" onClick={startNewRound}>
        Neue Karten
      </button>
    </div>
  )
}
