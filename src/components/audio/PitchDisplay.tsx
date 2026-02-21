import { useRef, useEffect } from 'react'
import { PITCH_RANGES, type PitchRangeKey } from '#/lib/audio/constants'
import { frequencyToNote } from '#/lib/audio/pitch-detection'

interface PitchDisplayProps {
  pitch: number | null
  pitchHistory: (number | null)[]
  targetRange: PitchRangeKey
  voiced: boolean
  heightClassName?: string
}

export function PitchDisplay({
  pitch,
  pitchHistory,
  targetRange,
  voiced,
  heightClassName = 'h-48 lg:h-64',
}: PitchDisplayProps) {
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

    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, w, h)

    const minY = h - ((range.min - 50) / 550) * h
    const maxY = h - ((range.max - 50) / 550) * h

    ctx.fillStyle = 'rgba(20, 184, 166, 0.12)'
    ctx.fillRect(0, maxY, w, minY - maxY)

    ctx.strokeStyle = 'rgba(20, 184, 166, 0.35)'
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(0, minY)
    ctx.lineTo(w, minY)
    ctx.moveTo(0, maxY)
    ctx.lineTo(w, maxY)
    ctx.stroke()
    ctx.setLineDash([])

    ctx.fillStyle = 'rgba(148, 163, 184, 0.9)'
    ctx.font = '11px sans-serif'
    ctx.fillText(`${range.min} Hz`, 6, minY - 4)
    ctx.fillText(`${range.max} Hz`, 6, maxY + 14)

    if (pitchHistory.length > 1) {
      ctx.beginPath()
      ctx.strokeStyle = '#2dd4bf'
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

      if (pitch !== null) {
        const x = w
        const y = h - ((pitch - 50) / 550) * h
        const inRange = pitch >= range.min && pitch <= range.max

        ctx.beginPath()
        ctx.arc(x - 2, y, 7, 0, Math.PI * 2)
        ctx.fillStyle = inRange ? 'rgba(45, 212, 191, 0.35)' : 'rgba(251, 146, 60, 0.35)'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x - 2, y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = inRange ? '#2dd4bf' : '#fb923c'
        ctx.fill()
      }
    }

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)'
    ctx.lineWidth = 1
    for (let freq = 100; freq <= 500; freq += 50) {
      const y = h - ((freq - 50) / 550) * h
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(w, y)
      ctx.stroke()

      if (freq % 100 === 0) {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.4)'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(`${freq}`, w - 6, y - 3)
        ctx.textAlign = 'left'
      }
    }
  }, [pitch, pitchHistory, range])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Pitch (F0)</h3>
        <div className="text-right">
          {voiced && pitch !== null ? (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-teal-700 dark:text-teal-300">{Math.round(pitch)}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Hz</span>
              <span className="font-mono text-sm text-slate-500 dark:text-slate-400">{frequencyToNote(pitch)}</span>
            </div>
          ) : (
            <span className="text-sm text-slate-500 dark:text-slate-400">--</span>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className={`w-full rounded-lg ${heightClassName}`} style={{ imageRendering: 'pixelated' }} />
    </div>
  )
}
