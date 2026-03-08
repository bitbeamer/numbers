import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

type ConfettiPiece = {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
  rotation: number
  rotationSpeed: number
  swayPhase: number
  swaySpeed: number
  color: string
  opacity: number
}

interface FireworksOverlayProps {
  burstKey: number
}

const DEFAULT_COLORS = [
  'rgba(249, 168, 212, 0.82)',
  'rgba(253, 186, 116, 0.82)',
  'rgba(165, 243, 252, 0.82)',
  'rgba(167, 243, 208, 0.82)',
  'rgba(196, 181, 253, 0.82)',
  'rgba(253, 224, 71, 0.82)',
]

const createPiece = (width: number, height: number): ConfettiPiece => {
  return {
    x: Math.random() * width,
    y: Math.random() * height * 0.42,
    vx: -0.35 + Math.random() * 0.7,
    vy: 0.8 + Math.random() * 0.9,
    width: 16 + Math.random() * 10,
    height: 24 + Math.random() * 16,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: -0.08 + Math.random() * 0.16,
    swayPhase: Math.random() * Math.PI * 2,
    swaySpeed: 0.018 + Math.random() * 0.028,
    color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    opacity: 0.45 + Math.random() * 0.35,
  }
}

export const FireworksOverlay = ({ burstKey }: FireworksOverlayProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (burstKey <= 0) {
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    const particleCount = 25
    const gravity = 0.03
    const wind = 0.005
    const durationMs = 2600
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const pieces: ConfettiPiece[] = Array.from({ length: particleCount }, () => createPiece(window.innerWidth, window.innerHeight))
    const startedAt = performance.now()
    let rafId = 0

    const drawPiece = (piece: ConfettiPiece, fade: number) => {
      context.save()
      context.translate(piece.x, piece.y)
      context.rotate(piece.rotation)
      context.globalAlpha = piece.opacity * fade
      context.fillStyle = piece.color
      context.beginPath()
      context.moveTo(-piece.width / 2 + 2, -piece.height / 2)
      context.lineTo(piece.width / 2 - 2, -piece.height / 2)
      context.quadraticCurveTo(piece.width / 2, -piece.height / 2, piece.width / 2, -piece.height / 2 + 2)
      context.lineTo(piece.width / 2, piece.height / 2 - 2)
      context.quadraticCurveTo(piece.width / 2, piece.height / 2, piece.width / 2 - 2, piece.height / 2)
      context.lineTo(-piece.width / 2 + 2, piece.height / 2)
      context.quadraticCurveTo(-piece.width / 2, piece.height / 2, -piece.width / 2, piece.height / 2 - 2)
      context.lineTo(-piece.width / 2, -piece.height / 2 + 2)
      context.quadraticCurveTo(-piece.width / 2, -piece.height / 2, -piece.width / 2 + 2, -piece.height / 2)
      context.closePath()
      context.fill()
      context.restore()
    }

    const renderFrame = (now: number) => {
      const elapsed = now - startedAt
      const progress = Math.min(1, elapsed / durationMs)
      const fade = progress > 0.84 ? (1 - progress) / 0.16 : 1

      context.clearRect(0, 0, window.innerWidth, window.innerHeight)

      pieces.forEach((piece) => {
        piece.vx += wind * 0.03
        piece.vy += gravity
        piece.swayPhase += piece.swaySpeed
        piece.x += piece.vx + Math.sin(piece.swayPhase) * 0.28
        piece.y += piece.vy
        piece.rotation += piece.rotationSpeed
        drawPiece(piece, Math.max(0, fade))
      })

      if (progress < 1) {
        rafId = window.requestAnimationFrame(renderFrame)
      } else {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight)
      }
    }

    renderFrame(performance.now())
    rafId = window.requestAnimationFrame(renderFrame)
    window.addEventListener('resize', resize)

    return () => {
      window.cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      context.clearRect(0, 0, window.innerWidth, window.innerHeight)
    }
  }, [burstKey])

  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <div className="confetti-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="confetti-canvas" />
    </div>,
    document.body,
  )
}
