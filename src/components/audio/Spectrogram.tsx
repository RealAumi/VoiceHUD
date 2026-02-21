import { useRef, useEffect } from 'react'

interface SpectrogramProps {
  spectrumData: Uint8Array
  isActive: boolean
}

export function Spectrogram({ spectrumData, isActive }: SpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const historyRef = useRef<Uint8Array[]>([])
  const MAX_COLUMNS = 300

  useEffect(() => {
    if (isActive && spectrumData.length > 0) {
      historyRef.current.push(new Uint8Array(spectrumData))
      if (historyRef.current.length > MAX_COLUMNS) {
        historyRef.current.shift()
      }
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

    if (history.length === 0) {
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, w, h)
      return
    }

    const binsToShow = Math.floor(history[history.length - 1].length / 4)

    ctx.fillStyle = '#0f172a'
    ctx.fillRect(0, 0, w, h)

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
        const g = Math.floor(intensity * 200 + 55 * intensity * intensity)
        const b = Math.floor(100 + intensity * 155)

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fillRect(x, y - binHeight, colWidth + 1, binHeight)
      }
    }
  }, [spectrumData, isActive])

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-700 p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">
        Spectrogram
      </h3>
      <canvas
        ref={canvasRef}
        className="w-full h-32 rounded-lg"
      />
    </div>
  )
}
