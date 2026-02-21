import { useState, useRef, useCallback } from 'react'

export interface RecorderState {
  isRecording: boolean
  audioBlob: Blob | null
  duration: number
  error: string | null
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
    setState((s) => ({
      ...s,
      isRecording: false,
      duration: 0,
      audioBlob: file,
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
