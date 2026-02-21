/**
 * Unified voice analysis client using Vercel AI SDK.
 */
import { generateText } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'

import { getPresetType, type ProviderConfig } from './providers'

export interface AnalysisResult {
  text: string
  error?: string
}

export interface ProviderTestResult {
  ok: boolean
  message: string
}

function getVoiceAnalysisPrompt(locale: 'zh' | 'en'): string {
  return locale === 'zh'
    ? `你是一位专业的嗓音训练师和语音治疗师。请分析这段语音录音，提供以下方面的详细反馈：

1. **音高分析**：估计说话者的基频范围，判断音高的稳定性
2. **共振特征**：分析声音的共振位置（胸腔/口腔/头腔），共振是否明亮或暗沉
3. **音色评价**：声音的质感、气息感、是否有压喉或过度用力的迹象
4. **语调模式**：语调的自然度和表达力
5. **改进建议**：给出2-3条具体的练习建议来改善声音

请用中文回答，语气友好且专业。`
    : `You are a professional voice coach and speech therapist. Please analyze this voice recording and provide detailed feedback on:

1. **Pitch Analysis**: Estimate the speaker's fundamental frequency range and pitch stability
2. **Resonance Characteristics**: Analyze resonance placement (chest/oral/head), brightness vs darkness
3. **Timbre Evaluation**: Voice texture, breathiness, signs of strain or excessive effort
4. **Intonation Patterns**: Naturalness and expressiveness of intonation
5. **Improvement Suggestions**: Provide 2-3 specific exercises to improve the voice

Please respond in English with a friendly and professional tone.`
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

function getCandidateBaseURLs(config: ProviderConfig): string[] {
  const urls = [config.baseURL, ...(config.fallbackBaseURLs ?? [])]
    .map((v) => v.trim())
    .filter(Boolean)

  return [...new Set(urls)]
}

function createModel(config: ProviderConfig, overrideBaseURL?: string) {
  const providerType = getPresetType(config.id)

  switch (providerType) {
    case 'google': {
      const google = createGoogleGenerativeAI({ apiKey: config.apiKey })
      return google(config.model)
    }
    case 'openrouter': {
      const openrouter = createOpenRouter({ apiKey: config.apiKey })
      return openrouter.chat(config.model)
    }
    case 'openai-compatible': {
      const openai = createOpenAI({
        apiKey: config.apiKey,
        baseURL: overrideBaseURL ?? config.baseURL,
      })
      return openai(config.model)
    }
  }
}

async function tryGenerateWithFallbacks(
  config: ProviderConfig,
  run: (model: ReturnType<typeof createModel>) => Promise<void>
): Promise<void> {
  if (getPresetType(config.id) !== 'openai-compatible') {
    const model = createModel(config)
    await run(model)
    return
  }

  const candidates = getCandidateBaseURLs(config)
  let lastError: unknown = null

  for (const baseURL of candidates) {
    try {
      const model = createModel(config, baseURL)
      await run(model)
      return
    } catch (err) {
      lastError = err
    }
  }

  throw lastError ?? new Error('No available endpoint')
}

export async function testProviderConnection(
  config: ProviderConfig,
  locale: 'zh' | 'en' = 'zh'
): Promise<ProviderTestResult> {
  if (!config.apiKey.trim()) {
    return {
      ok: false,
      message: locale === 'zh' ? '请先填写 API Key' : 'Please fill in API key first',
    }
  }

  if (getPresetType(config.id) === 'openai-compatible' && getCandidateBaseURLs(config).length === 0) {
    return {
      ok: false,
      message: locale === 'zh' ? '请先填写 API 地址' : 'Please fill in API endpoint first',
    }
  }

  try {
    await tryGenerateWithFallbacks(config, async (model) => {
      await generateText({
        model,
        prompt: locale === 'zh' ? '回复 "ok"' : 'Reply with "ok"',
        maxOutputTokens: 10,
        temperature: 0,
      })
    })

    return {
      ok: true,
      message: locale === 'zh' ? '连接成功，API 可用' : 'Connection successful, API is available',
    }
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
    const mediaType = audioBlob.type || 'audio/webm'

    const prompt = getVoiceAnalysisPrompt(locale)
    let text = ''

    await tryGenerateWithFallbacks(config, async (model) => {
      const result = await generateText({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'file',
                data: audioBase64,
                mediaType,
              },
            ],
          },
        ],
        temperature: 0.7,
        maxOutputTokens: 2048,
      })

      text = result.text
    })

    return { text }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { text: '', error: `API Error: ${message}` }
  }
}
