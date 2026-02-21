import { useRef, useEffect } from 'react'
import { PITCH_RANGES, type PitchRangeKey } from '#/lib/audio/constants'
import { frequencyToNote } from '#/lib/audio/pitch-detection'

interface PitchDisplayProps {
  pitch: number | null
  pitchHistory: (number | null)[]
  targetRange: PitchRangeKey
  voiced: boolean
}

export function PitchDisplay({ pitch, pitchHistory, targetRange, voiced }: PitchDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const range = PITCH_RANGES[targetRange]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height

    // Clear
    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

    // Draw target range
    const minY = h - ((range.min - 50) / 550) * h
    const maxY = h - ((range.max - 50) / 550) * h

    ctx.fillStyle = 'rgba(34, 211, 238, 0.08)'
    ctx.fillRect(0, maxY, w, minY - maxY)

    // Range labels
    ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)'
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(0, minY)
    ctx.lineTo(w, minY)
    ctx.moveTo(0, maxY)
    ctx.lineTo(w, maxY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(34, 211, 238, 0.6)'
    ctx.font = '11px sans-serif'
    ctx.fillText(`${range.min} Hz`, 4, minY - 4)
    ctx.fillText(`${range.max} Hz`, 4, maxY + 14)

    // Draw pitch history line
    if (pitchHistory.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#22d3ee'
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'

      let started = false
      for (let i = 0; i < pitchHistory.length; i++) {
        const val = pitchHistory[i]
        if (val === null) {
          started = false
          continue
        }
        const x = (i / (pitchHistory.length - 1)) * w
        const y = h - ((val - 50) / 550) * h
        if (!started) {
          ctx.moveTo(x, y)
          started = true
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      // Draw glow effect for the latest point
      if (pitch !== null) {
        const x = w
        const y = h - ((pitch - 50) / 550) * h
        const inRange = pitch >= range.min && pitch <= range.max

        ctx.beginPath()
        ctx.arc(x - 2, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = inRange ? 'rgba(34, 211, 238, 0.4)' : 'rgba(251, 146, 60, 0.4)'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x - 2, y, 3, 0, Math.PI * 2)
        ctx.fillStyle = inRange ? '#22d3ee' : '#fb923c'
        ctx.fill()
      }
    }

    // Draw grid lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)'
    ctx.lineWidth = 1
    for (let freq = 100; freq <= 500; freq += 50) {
      const y = h - ((freq - 50) / 550) * h
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()

      if (freq % 100 === 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.3)'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`${freq}`, w - 4, y - 3)
        ctx.textAlign = 'left'
      }
    }
  }, [pitch, pitchHistory, range])

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-slate-300">Pitch (F0)</h3>
        <div className="text-right">
          {voiced && pitch !== null ? (
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-mono font-bold text-cyan-400">
                {Math.round(pitch)}
              </span>
              <span className="text-xs text-slate-400">Hz</span>
              <span className="text-sm text-slate-500 font-mono">
                {frequencyToNote(pitch)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-slate-500">--</span>
          )}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="w-full h-40 rounded-lg"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  )
}
