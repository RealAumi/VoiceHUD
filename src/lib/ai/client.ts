import { analyzeVoiceServerFn, testProviderConnectionServerFn } from './server-functions'
import type { ProviderConfig } from './providers'

export interface AnalysisResult {
  text: string
  error?: string
}

export interface ProviderTestResult {
  ok: boolean
  message: string
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      resolve(result.split(',')[1])
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
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

function getFileExtension(fileName: string): string {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match?.[1] ?? ''
}

function resolveAudioMediaType(audioBlob: Blob): string {
  const directType = audioBlob.type.trim().toLowerCase()
  if (directType.startsWith('audio/')) {
    const normalized = directType.split(';')[0]?.trim() ?? ''
    if (normalized === 'audio/mp3') return 'audio/mpeg'
    if (normalized === 'audio/x-wav' || normalized === 'audio/wave') return 'audio/wav'
    if (normalized === 'audio/x-m4a') return 'audio/mp4'
    return normalized || 'audio/webm'
  }

  if (audioBlob instanceof File) {
    const extension = getFileExtension(audioBlob.name)
    const mappedType = MIME_BY_EXTENSION[extension]
    if (mappedType) {
      return mappedType
    }
  }

  return 'audio/webm'
}

export async function testProviderConnection(
  config: ProviderConfig,
  locale: 'zh' | 'en' = 'zh'
): Promise<ProviderTestResult> {
  try {
    return await testProviderConnectionServerFn({
      data: {
        id: config.id,
        apiKey: config.apiKey,
        model: config.model,
        baseURL: config.baseURL,
        fallbackBaseURLs: config.fallbackBaseURLs,
        locale,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { ok: false, message: `API Error: ${message}` }
  }
}

export interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

export async function analyzeVoice(
  audioBlob: Blob | null,
  config: ProviderConfig,
  locale: 'zh' | 'en' = 'zh',
  conversation: ConversationTurn[] = [],
  customPrompt = ''
): Promise<AnalysisResult> {
  if (!config.apiKey.trim()) {
    return {
      text: '',
      error: locale === 'zh' ? '请先设置 API Key' : 'Please set your API Key first',
    }
  }

  try {
    let audioBase64 = ''
    let mediaType = ''

    if (audioBlob) {
      audioBase64 = await blobToBase64(audioBlob)
      mediaType = resolveAudioMediaType(audioBlob)

      if (config.id === 'openrouter' && mediaType === 'audio/webm') {
        return {
          text: '',
          error:
            locale === 'zh'
              ? 'OpenRouter 当前不支持 WebM 录音。请改用上传 MP3/WAV/M4A/OGG，或在支持 OGG/MP4 录音的浏览器中重试。'
              : 'OpenRouter does not currently accept WebM recordings. Please upload MP3/WAV/M4A/OGG, or retry in a browser that records OGG/MP4.',
        }
      }
    }

    return await analyzeVoiceServerFn({
      data: {
        id: config.id,
        apiKey: config.apiKey,
        model: config.model,
        baseURL: config.baseURL,
        fallbackBaseURLs: config.fallbackBaseURLs,
        locale,
        conversation,
        customPrompt,
        audio: {
          base64: audioBase64,
          mediaType,
          size: audioBlob?.size ?? 0,
        },
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { text: '', error: `API Error: ${message}` }
  }
}
