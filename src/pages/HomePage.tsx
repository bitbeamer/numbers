import { Link } from 'react-router-dom'
import { getAdaptiveSummary, getModeAccuracy, formatPercent } from '../state/selectors'
import { useAppStore } from '../state/store'

const modeCards = [
  {
    to: '/mode/love10',
    title: 'Verliebte Zahlen',
    text: 'Ziehe zwei Zahlkarten in die Herz-Zone und bilde 10.',
    colorClass: 'mode-card--love10',
  },
  {
    to: '/mode/placevalue',
    title: 'Zehner & Einer',
    text: 'Sieh eine Zahl und wähle die richtige Anzahl Zehner und Einer.',
    colorClass: 'mode-card--placevalue',
  },
  {
    to: '/mode/carry',
    title: 'Übertrag-Werkstatt',
    text: 'Bündle 10 Einer zu 1 Zehner und löse die Aufgabe.',
    colorClass: 'mode-card--carry',
  },
  {
    to: '/mode/sprint',
    title: 'Tempo-Spiel (60s)',
    text: 'Schnelle Aufgaben, große Antwortfelder und Combo-Punkte.',
    colorClass: 'mode-card--sprint',
  },
]

export const HomePage = () => {
  const { activeProfile } = useAppStore()
  const adaptive = getAdaptiveSummary(activeProfile)

  return (
    <div className="stack-lg">
      <section className="hero-card">
        <h1>Hallo {activeProfile.name}! Bereit für Zahlenliebe?</h1>
        <p>Wähle einen Modus und starte direkt mit der Maus.</p>
      </section>

      <section className="mode-grid" aria-label="Modi auswählen">
        {modeCards.map((mode) => (
          <Link key={mode.to} to={mode.to} className={`mode-card ${mode.colorClass}`}>
            <h2>{mode.title}</h2>
            <p>{mode.text}</p>
          </Link>
        ))}
      </section>

      <section className="stats-row">
        <div className="mini-card">
          <h3>Fortschritt pro Modus</h3>
          <div className="progress-lines">
            <p>
              Gesamt: {formatPercent(activeProfile.stats.totalTasks ? activeProfile.stats.totalCorrect / activeProfile.stats.totalTasks : 0)}
            </p>
            <p>Love10: {formatPercent(getModeAccuracy(activeProfile, 'love10'))}</p>
            <p>Carry: {formatPercent(getModeAccuracy(activeProfile, 'carry'))}</p>
            <p>Zehner & Einer: {formatPercent(getModeAccuracy(activeProfile, 'placevalue'))}</p>
            <p>Sprint: {formatPercent(getModeAccuracy(activeProfile, 'sprint'))}</p>
          </div>
        </div>
      </section>

      <section className="mini-card">
        <h3>Einstellungen</h3>
        <p>
          Zahlenraum: <strong>bis {activeProfile.settings.numberRange}</strong>
        </p>
        {activeProfile.settings.difficulty === 'adaptive' ? (
          <p>
            Level: <strong>{adaptive.level}</strong> | Genauigkeit letzte {adaptive.sampleSize} Aufgaben:{' '}
            <strong>{formatPercent(adaptive.accuracy)}</strong>
            {adaptive.needsCarryFocus ? ' | Fokus: mehr Übertrag-Aufgaben' : ''}
          </p>
        ) : (
          <p>Fix eingestellt auf: {activeProfile.settings.difficulty}</p>
        )}
      </section>
    </div>
  )
}
