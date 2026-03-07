import type { DragEvent } from 'react'
import { useI18n } from '../i18n/useI18n'

interface NumberCardProps {
  value: number
  cardId: string
  disabled?: boolean
  selected?: boolean
  onSelect?: (cardId: string) => void
}

export const NumberCard = ({ value, cardId, disabled = false, selected = false, onSelect }: NumberCardProps) => {
  const { language } = useI18n()

  const handleDragStart = (event: DragEvent<HTMLButtonElement>) => {
    if (disabled) {
      return
    }
    event.dataTransfer.setData('text/plain', cardId)
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <button
      type="button"
      className={`number-card ${selected ? 'is-selected' : ''}`}
      draggable={!disabled}
      onDragStart={handleDragStart}
      onClick={() => onSelect?.(cardId)}
      disabled={disabled}
      aria-label={language === 'de' ? `Zahlkarte ${value}` : `Number card ${value}`}
    >
      {value}
    </button>
  )
}
