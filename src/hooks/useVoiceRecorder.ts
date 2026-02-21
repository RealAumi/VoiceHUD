import { useState, useRef, useCallback } from 'react'

const MAX_AUDIO_UPLOAD_BYTES = 20 * 1024 * 1024

const AUDIO_MIME_ALIASES: Record<string, string> = {
  'audio/mp3': 'audio/mpeg',
  'audio/x-wav': 'audio/wav',
  'audio/wave': 'audio/wav',
  'audio/x-m4a': 'audio/mp4',
}

const MIME_BY_EXTENSION: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  aac: 'audio/aac',
  ogg: 'audio/ogg',
  webm: 'audio/webm',
  flac: 'audio/flac',
  mp4: 'audio/mp4',
}

const SUPPORTED_AUDIO_MIME_TYPES = new Set<string>(Object.values(MIME_BY_EXTENSION))

export interface RecorderState {
  isRecording: boolean
  audioBlob: Blob | null
  duration: number
  error: string | null
}

function getFileExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match?.[1] ?? ''
}

function normalizeAudioMimeType(mimeType: string): string {
  const normalized = mimeType.split(';')[0]?.trim().toLowerCase() ?? ''
  return AUDIO_MIME_ALIASES[normalized] ?? normalized
}

function resolveUploadAudioMimeType(file: File): string | null {
  const normalizedMimeType = normalizeAudioMimeType(file.type)
  if (SUPPORTED_AUDIO_MIME_TYPES.has(normalizedMimeType)) {
    return normalizedMimeType
  }

  const extension = getFileExtension(file.name)
  return MIME_BY_EXTENSION[extension] ?? null
}

function formatMegabytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1)
}

export function useVoiceRecorder() {
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    audioBlob: null,
    duration: 0,
    error: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef<number>(0)
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      })

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm'

      const mediaRecorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []
      startTimeRef.current = Date.now()

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        stream.getTracks().forEach((track) => track.stop())
        clearInterval(timerRef.current)

        setState((s) => ({
          ...s,
          isRecording: false,
          audioBlob: blob,
        }))
      }

      mediaRecorder.start(100)

      timerRef.current = setInterval(() => {
        setState((s) => ({
          ...s,
          duration: Math.floor((Date.now() - startTimeRef.current) / 1000),
        }))
      }, 1000)

      setState({
        isRecording: true,
        audioBlob: null,
        duration: 0,
        error: null,
      })
    } catch {
      setState((s) => ({
        ...s,
        error: 'Failed to access microphone',
      }))
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop()
    }
  }, [])

  const loadAudioFile = useCallback((file: File) => {
    const resolvedMimeType = resolveUploadAudioMimeType(file)
    if (!resolvedMimeType) {
      setState((s) => ({
        ...s,
        error:
          'Unsupported audio type. Use MP3, WAV, M4A, AAC, OGG, WebM, FLAC, or MP4 audio.',
      }))
      return
    }

    if (file.size <= 0) {
      setState((s) => ({
        ...s,
        error: 'The selected audio file is empty.',
      }))
      return
    }

    if (file.size > MAX_AUDIO_UPLOAD_BYTES) {
      setState((s) => ({
        ...s,
        error: `Audio file is too large (${formatMegabytes(file.size)}MB). Maximum is 20MB.`,
      }))
      return
    }

    const normalizedFile =
      file.type === resolvedMimeType
        ? file
        : new File([file], file.name, {
            type: resolvedMimeType,
            lastModified: file.lastModified,
          })

    setState((s) => ({
      ...s,
      isRecording: false,
      duration: 0,
      audioBlob: normalizedFile,
      error: null,
    }))
  }, [])

  const clearRecording = useCallback(() => {
    setState({
      isRecording: false,
      audioBlob: null,
      duration: 0,
      error: null,
    })
  }, [])

  return { ...state, startRecording, stopRecording, loadAudioFile, clearRecording }
}
