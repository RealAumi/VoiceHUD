import { useRef, useEffect } from 'react'
import { PITCH_DISPLAY, PITCH_RANGES, type PitchRangeKey } from '#/lib/audio/constants'
import { frequencyToNote } from '#/lib/audio/pitch-detection'
import { useI18n } from '#/lib/i18n'

interface PitchDisplayProps {
  pitch: number | null
  pitchHistory: (number | null)[]
  targetRange: PitchRangeKey
  voiced: boolean
  heightClassName?: string
  yMin: number
  yMax: number
  onYMinChange: (v: number) => void
  onYMaxChange: (v: number) => void
}

/** Compute nice grid step for a given range */
function niceStep(range: number): number {
  if (range <= 100) return 20
  if (range <= 200) return 25
  if (range <= 400) return 50
  return 100
}

export function PitchDisplay({
  pitch,
  pitchHistory,
  targetRange,
  voiced,
  heightClassName = 'h-48 lg:h-64',
  yMin,
  yMax,
  onYMinChange,
  onYMaxChange,
}: PitchDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const range = PITCH_RANGES[targetRange]
  const { locale } = useI18n()

  const hasValidRange = Number.isFinite(yMin) && Number.isFinite(yMax) && yMin < yMax
  const yRange = yMax - yMin

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
    const pad = { left: 44, right: 12, top: 8, bottom: 20 }
    const plotW = w - pad.left - pad.right
    const plotH = h - pad.top - pad.bottom

    // Background
    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, w, h)

    if (!hasValidRange) {
      ctx.fillStyle = 'rgba(248, 113, 113, 0.9)'
      ctx.font = '11px system-ui, sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(locale === 'zh' ? '音高范围无效' : 'Invalid pitch range', pad.left, pad.top + 12)
      return
    }

    const toY = (hz: number) => pad.top + plotH - ((hz - yMin) / yRange) * plotH

    // Target range highlight
    const tMinY = toY(range.min)
    const tMaxY = toY(range.max)
    ctx.fillStyle = 'rgba(20, 184, 166, 0.10)'
    ctx.fillRect(pad.left, tMaxY, plotW, tMinY - tMaxY)

    // Target range dashed borders
    ctx.strokeStyle = 'rgba(20, 184, 166, 0.4)'
    ctx.lineWidth = 1
    ctx.setLineDash([6, 4])
    ctx.beginPath()
    ctx.moveTo(pad.left, tMinY)
    ctx.lineTo(pad.left + plotW, tMinY)
    ctx.moveTo(pad.left, tMaxY)
    ctx.lineTo(pad.left + plotW, tMaxY)
    ctx.stroke()
    ctx.setLineDash([])

    // Target range labels
    ctx.fillStyle = 'rgba(20, 184, 166, 0.7)'
    ctx.font = '10px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(`${range.min} Hz`, pad.left + 4, tMinY - 3)
    ctx.fillText(`${range.max} Hz`, pad.left + 4, tMaxY + 12)

    // Grid lines and Y-axis labels
    const step = niceStep(yRange)
    const firstGrid = Math.ceil(yMin / step) * step
    ctx.textAlign = 'right'

    for (let freq = firstGrid; freq <= yMax; freq += step) {
      const y = toY(freq)
      if (y < pad.top || y > pad.top + plotH) continue

      ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(pad.left, y)
      ctx.lineTo(pad.left + plotW, y)
      ctx.stroke()

      ctx.fillStyle = 'rgba(148, 163, 184, 0.5)'
      ctx.font = '10px system-ui, sans-serif'
      ctx.fillText(`${freq}`, pad.left - 6, y + 3)
    }

    // Pitch history line
    if (pitchHistory.length > 1) {
      // Clip to plot area
      ctx.save()
      ctx.beginPath()
      ctx.rect(pad.left, pad.top, plotW, plotH)
      ctx.clip()

      ctx.beginPath()
      ctx.strokeStyle = '#2dd4bf'
      ctx.lineWidth = 2
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'

      let started = false
      for (let i = 0; i < pitchHistory.length; i++) {
        const val = pitchHistory[i]
        if (val === null) {
          if (started) ctx.stroke()
          ctx.beginPath()
          started = false
          continue
        }
        const x = pad.left + (i / (pitchHistory.length - 1)) * plotW
        const y = toY(val)
        if (!started) {
          ctx.moveTo(x, y)
          started = true
        } else {
          ctx.lineTo(x, y)
        }
      }
      if (started) ctx.stroke()

      // Current pitch indicator
      if (pitch !== null) {
        const x = pad.left + plotW
        const y = toY(pitch)
        const inRange = pitch >= range.min && pitch <= range.max
        const baseColor = inRange ? '#2dd4bf' : '#fb923c'
        const glowColor = inRange ? 'rgba(45, 212, 191, 0.3)' : 'rgba(251, 146, 60, 0.3)'

        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.fillStyle = glowColor
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = baseColor
        ctx.fill()
      }

      ctx.restore()
    }
  }, [pitch, pitchHistory, range, yMin, yMax, yRange, hasValidRange, locale])

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
      {/* Y-axis range controls */}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <label className="flex items-center gap-1">
          {locale === 'zh' ? '下限' : 'Min'}
          <select
            value={yMin}
            onChange={(e) => onYMinChange(Number(e.target.value))}
            className="rounded border border-slate-300 bg-transparent px-1.5 py-0.5 text-xs dark:border-slate-700"
          >
            {PITCH_DISPLAY.Y_MIN_OPTIONS.map((v) => (
              <option key={v} value={v}>{v} Hz</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-1">
          {locale === 'zh' ? '上限' : 'Max'}
          <select
            value={yMax}
            onChange={(e) => onYMaxChange(Number(e.target.value))}
            className="rounded border border-slate-300 bg-transparent px-1.5 py-0.5 text-xs dark:border-slate-700"
          >
            {PITCH_DISPLAY.Y_MAX_OPTIONS.map((v) => (
              <option key={v} value={v}>{v} Hz</option>
            ))}
          </select>
        </label>
        {hasValidRange ? (
          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500">
            {locale === 'zh'
              ? `目标区间 ${range.min}–${range.max} Hz`
              : `Target ${range.min}–${range.max} Hz`}
          </span>
        ) : (
          <span className="ml-auto text-[10px] text-rose-500 dark:text-rose-400">
            {locale === 'zh' ? '请将下限设置为小于上限' : 'Set Min lower than Max'}
          </span>
        )}
      </div>
    </div>
  )
}
