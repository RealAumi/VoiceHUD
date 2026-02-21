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
    return directType
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

export async function analyzeVoice(
  audioBlob: Blob,
  config: ProviderConfig,
  locale: 'zh' | 'en' = 'zh'
): Promise<AnalysisResult> {
  if (!config.apiKey.trim()) {
    return {
      text: '',
      error: locale === 'zh' ? '请先设置 API Key' : 'Please set your API Key first',
    }
  }

  try {
    const audioBase64 = await blobToBase64(audioBlob)
    const mediaType = resolveAudioMediaType(audioBlob)

    return await analyzeVoiceServerFn({
      data: {
        id: config.id,
        apiKey: config.apiKey,
        model: config.model,
        baseURL: config.baseURL,
        fallbackBaseURLs: config.fallbackBaseURLs,
        locale,
        audio: {
          base64: audioBase64,
          mediaType,
          size: audioBlob.size,
        },
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { text: '', error: `API Error: ${message}` }
  }
}
