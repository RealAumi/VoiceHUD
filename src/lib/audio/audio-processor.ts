import { FFT_SIZE } from './constants'

/**
 * Manages the Web Audio API AudioContext and AnalyserNode
 * for real-time microphone input processing.
 */
export class AudioProcessor {
  private audioContext: AudioContext | null = null
  private analyser: AnalyserNode | null = null
  private mediaStream: MediaStream | null = null
  private sourceNode: MediaStreamAudioSourceNode | null = null
  private _isActive = false

  get isActive() {
    return this._isActive
  }

  get sampleRate() {
    return this.audioContext?.sampleRate ?? 44100
  }

  /**
   * Initialize and start microphone capture
   */
  async start(): Promise<void> {
    if (this._isActive) return

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      })

      this.audioContext = new AudioContext()
      this.analyser = this.audioContext.createAnalyser()
      this.analyser.fftSize = FFT_SIZE
      this.analyser.smoothingTimeConstant = 0.8

      this.sourceNode = this.audioContext.createMediaStreamSource(this.mediaStream)
      this.sourceNode.connect(this.analyser)

      this._isActive = true
    } catch (err) {
      this.stop()
      throw err
    }
  }

  /**
   * Stop microphone capture and release resources
   */
  stop(): void {
    this.sourceNode?.disconnect()
    this.mediaStream?.getTracks().forEach((track) => track.stop())
    if (this.audioContext?.state !== 'closed') {
      this.audioContext?.close()
    }

    this.sourceNode = null
    this.mediaStream = null
    this.analyser = null
    this.audioContext = null
    this._isActive = false
  }

  /**
   * Get time-domain data (waveform) as Float32Array
   */
  getTimeDomainData(): Float32Array {
    if (!this.analyser) return new Float32Array(0)
    const data = new Float32Array(this.analyser.fftSize)
    this.analyser.getFloatTimeDomainData(data)
    return data
  }

  /**
   * Get frequency-domain data (spectrum) as Float32Array (in dB)
   */
  getFrequencyData(): Float32Array {
    if (!this.analyser) return new Float32Array(0)
    const data = new Float32Array(this.analyser.frequencyBinCount)
    this.analyser.getFloatFrequencyData(data)
    return data
  }

  /**
   * Get frequency-domain data as Uint8Array (0-255 range)
   */
  getByteFrequencyData(): Uint8Array {
    if (!this.analyser) return new Uint8Array(0)
    const data = new Uint8Array(this.analyser.frequencyBinCount)
    this.analyser.getByteFrequencyData(data)
    return data
  }

  get fftSize(): number {
    return this.analyser?.fftSize ?? FFT_SIZE
  }
}
