import type { DragEvent, ReactNode } from 'react'

interface DropZoneProps {
  title: string
  subtitle?: string
  onDropCard: (cardId: string) => void
  children?: ReactNode
}

export const DropZone = ({ title, subtitle, onDropCard, children }: DropZoneProps) => {
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const cardId = event.dataTransfer.getData('text/plain')
    if (cardId) {
      onDropCard(cardId)
    }
  }

  return (
    <div
      className="drop-zone"
      onDrop={handleDrop}
      onDragOver={(event) => event.preventDefault()}
      role="region"
      aria-label={title}
    >
      <h3>{title}</h3>
      {subtitle ? <p className="muted">{subtitle}</p> : null}
      <div className="drop-zone-content">{children}</div>
    </div>
  )
}
