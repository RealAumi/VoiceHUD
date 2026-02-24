import { useEffect, useRef, useState, useCallback } from 'react'
import { Play, Pause } from 'lucide-react'

interface AudioWaveformProps {
  audioBlob: Blob
  compact?: boolean
}

export function AudioWaveform({ audioBlob, compact = false }: AudioWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animFrameRef = useRef<number>(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [waveformData, setWaveformData] = useState<number[]>([])
  const [duration, setDuration] = useState(0)
  const urlRef = useRef<string>('')

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob)
    urlRef.current = url

    const audio = new Audio(url)
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
    })

    audio.addEventListener('ended', () => {
      setIsPlaying(false)
      setProgress(0)
    })

    // Decode audio for waveform visualization
    const ctx = new AudioContext()
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const buffer = await ctx.decodeAudioData(reader.result as ArrayBuffer)
        const raw = buffer.getChannelData(0)
        const samples = compact ? 40 : 80
        const blockSize = Math.floor(raw.length / samples)
        const peaks: number[] = []
        for (let i = 0; i < samples; i++) {
          let sum = 0
          for (let j = 0; j < blockSize; j++) {
            sum += Math.abs(raw[i * blockSize + j])
          }
          peaks.push(sum / blockSize)
        }
        const max = Math.max(...peaks, 0.01)
        setWaveformData(peaks.map((p) => p / max))
      } catch {
        // fallback: no waveform
      } finally {
        void ctx.close()
      }
    }
    reader.readAsArrayBuffer(audioBlob)

    return () => {
      audio.pause()
      cancelAnimationFrame(animFrameRef.current)
      URL.revokeObjectURL(url)
    }
  }, [audioBlob, compact])

  const updateProgress = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.duration > 0) {
      setProgress(audio.currentTime / audio.duration)
    }
    if (!audio.paused) {
      animFrameRef.current = requestAnimationFrame(updateProgress)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      void audio.play()
      setIsPlaying(true)
      animFrameRef.current = requestAnimationFrame(updateProgress)
    } else {
      audio.pause()
      setIsPlaying(false)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [updateProgress])

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const audio = audioRef.current
      const canvas = canvasRef.current
      if (!audio || !canvas || !audio.duration) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const ratio = x / rect.width
      audio.currentTime = ratio * audio.duration
      setProgress(ratio)
    },
    []
  )

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || waveformData.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, w, h)

    const barWidth = w / waveformData.length
    const gap = 1
    const maxBarHeight = h * 0.8

    for (let i = 0; i < waveformData.length; i++) {
      const barH = Math.max(2, waveformData[i] * maxBarHeight)
      const x = i * barWidth
      const y = (h - barH) / 2

      const playedRatio = i / waveformData.length
      if (playedRatio <= progress) {
        ctx.fillStyle = '#14b8a6' // teal-500
      } else {
        ctx.fillStyle = '#94a3b8' // slate-400
      }

      ctx.beginPath()
      ctx.roundRect(x + gap / 2, y, barWidth - gap, barH, 1)
      ctx.fill()
    }
  }, [waveformData, progress])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? 'gap-1.5' : 'gap-3'}`}>
      <button
        onClick={togglePlay}
        className={`flex shrink-0 items-center justify-center rounded-full bg-teal-600 text-white transition-colors hover:bg-teal-500 ${
          compact ? 'h-7 w-7' : 'h-9 w-9'
        }`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={compact ? 12 : 16} /> : <Play size={compact ? 12 : 16} className="ml-0.5" />}
      </button>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className={`flex-1 cursor-pointer ${compact ? 'h-6' : 'h-10'}`}
      />
      {duration > 0 && (
        <span className={`shrink-0 font-mono text-slate-500 dark:text-slate-400 ${compact ? 'text-[10px]' : 'text-xs'}`}>
          {formatTime(progress * duration)}/{formatTime(duration)}
        </span>
      )}
    </div>
  )
}
