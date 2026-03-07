import { useI18n } from '../i18n/useI18n'

interface PlaceValueBoardProps {
  tens: number
  ones: number
  highlightCount?: number
}

export const PlaceValueBoard = ({ tens, ones, highlightCount = 0 }: PlaceValueBoardProps) => {
  const { t } = useI18n()
  const safeHighlight = Math.max(0, Math.min(highlightCount, ones))

  return (
    <div className="place-value-board" aria-label="Stellenwerttafel">
      <div className="place-column">
        <h4>{t('placeValueSelectTens')}</h4>
        <div className="tens-wrap">
          {Array.from({ length: tens }).map((_, index) => (
            <div key={`ten-${index}`} className="ten-bar" />
          ))}
        </div>
      </div>

      <div className="place-column">
        <h4>{t('placeValueSelectOnes')}</h4>
        <div className="ones-wrap">
          {Array.from({ length: ones }).map((_, index) => (
            <span key={`one-${index}`} className={`one-dot ${index < safeHighlight ? 'is-highlight' : ''}`} />
          ))}
        </div>
      </div>
    </div>
  )
}
