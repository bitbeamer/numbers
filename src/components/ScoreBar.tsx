interface ScoreBarProps {
  score: number
  streak?: number
  combo?: number
  timeLeft?: number
}

export const ScoreBar = ({ score, streak, combo, timeLeft }: ScoreBarProps) => {
  return (
    <div className="score-bar" role="status" aria-live="polite">
      <div className="score-pill">Punkte: {score}</div>
      {typeof streak === 'number' ? <div className="score-pill">Serie: {streak}</div> : null}
      {typeof combo === 'number' ? <div className="score-pill">Combo: x{Math.max(1, combo)}</div> : null}
      {typeof timeLeft === 'number' ? <div className="score-pill">Zeit: {timeLeft}s</div> : null}
    </div>
  )
}
