import { useRef, useEffect } from 'react'

interface SpectrogramProps {
  spectrumData: Uint8Array
  isActive: boolean
}

export function Spectrogram({ spectrumData, isActive }: SpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const historyRef = useRef<Uint8Array[]>([])
  const wasActiveRef = useRef(false)
  const MAX_COLUMNS = 300

  useEffect(() => {
    if (isActive && !wasActiveRef.current) {
      historyRef.current = []
    }
    wasActiveRef.current = isActive

    if (isActive && spectrumData.length > 0) {
      historyRef.current.push(new Uint8Array(spectrumData))
      if (historyRef.current.length > MAX_COLUMNS) historyRef.current.shift()
    }

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
    const history = historyRef.current

    ctx.fillStyle = '#0b1220'
    ctx.fillRect(0, 0, w, h)

    if (history.length === 0) return

    const binsToShow = Math.floor(history[history.length - 1].length / 4)

    for (let col = 0; col < history.length; col++) {
      const data = history[col]
      const x = (col / MAX_COLUMNS) * w
      const colWidth = w / MAX_COLUMNS

      for (let bin = 0; bin < binsToShow; bin++) {
        const value = data[bin]
        const y = h - (bin / binsToShow) * h
        const binHeight = h / binsToShow + 1

        const intensity = value / 255
        const r = Math.floor(intensity * intensity * 255)
        const g = Math.floor(intensity * 180 + 55 * intensity * intensity)
        const b = Math.floor(120 + intensity * 120)

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fillRect(x, y - binHeight, colWidth + 1, binHeight)
      }
    }
  }, [spectrumData, isActive])

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <h3 className="mb-3 text-sm font-medium text-slate-700 dark:text-slate-300">Spectrogram</h3>
      <canvas ref={canvasRef} className="h-36 w-full rounded-lg" />
    </div>
  )
}
