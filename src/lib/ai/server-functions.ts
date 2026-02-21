import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { createOpenAI } from '@ai-sdk/openai'
import { createOpenRouter } from '@openrouter/ai-sdk-provider'
import { createServerFn } from '@tanstack/react-start'
import { generateText } from 'ai'
import { getPresetType } from './providers'

const MAX_AUDIO_UPLOAD_BYTES = 20 * 1024 * 1024

type Locale = 'zh' | 'en'

interface ProviderRequestInput {
  id: string
  apiKey: string
  model: string
  baseURL: string
  fallbackBaseURLs: string[]
  locale: Locale
}

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

interface AnalyzeVoiceRequestInput extends ProviderRequestInput {
  conversation: ConversationTurn[]
  audio: {
    base64: string
    mediaType: string
    size: number
  }
}

export interface AnalysisResult {
  text: string
  error?: string
}

export interface ProviderTestResult {
  ok: boolean
  message: string
}

function localize(locale: Locale, zh: string, en: string): string {
  return locale === 'zh' ? zh : en
}

function asObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

function parseLocale(value: unknown): Locale {
  return value === 'en' ? 'en' : 'zh'
}

function parseProviderInput(input: unknown): ProviderRequestInput {
  const data = asObject(input)
  return {
    id: asString(data.id).trim(),
    apiKey: asString(data.apiKey).trim(),
    model: asString(data.model).trim(),
    baseURL: asString(data.baseURL).trim(),
    fallbackBaseURLs: asStringArray(data.fallbackBaseURLs).map((item) => item.trim()),
    locale: parseLocale(data.locale),
  }
}

function parseAnalyzeVoiceInput(input: unknown): AnalyzeVoiceRequestInput {
  const data = asObject(input)
  const provider = parseProviderInput(data)
  const audioData = asObject(data.audio)
  const sizeValue = Number(audioData.size)
  const conversationRaw = Array.isArray(data.conversation) ? data.conversation : []
  const conversation: ConversationTurn[] = conversationRaw
    .map((item) => {
      const turn = asObject(item)
      const role = asString(turn.role)
      const content = asString(turn.content).trim()
      if ((role === 'user' || role === 'assistant') && content) {
        return { role, content } as ConversationTurn
      }
      return null
    })
    .filter((item): item is ConversationTurn => item !== null)
    .slice(-12)

  return {
    ...provider,
    conversation,
    audio: {
      base64: asString(audioData.base64).trim(),
      mediaType: asString(audioData.mediaType).trim().toLowerCase(),
      size: Number.isFinite(sizeValue) ? sizeValue : 0,
    },
  }
}

function getVoiceAnalysisPrompt(locale: Locale): string {
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

function getRawEndpoints(config: ProviderRequestInput): string[] {
  return [config.baseURL, ...config.fallbackBaseURLs]
}

function getCandidateBaseURLs(config: ProviderRequestInput): string[] {
  const candidates = getRawEndpoints(config)
  const valid = new Set<string>()

  for (const raw of candidates) {
    const value = raw.trim()
    if (!value) continue

    try {
      const url = new URL(value)
      if (url.protocol === 'https:') {
        valid.add(value)
      }
    } catch {
      // ignore invalid endpoint
    }
  }

  return [...valid]
}

function hasInsecureEndpoint(config: ProviderRequestInput): boolean {
  for (const raw of getRawEndpoints(config)) {
    const value = raw.trim()
    if (!value) continue

    try {
      const url = new URL(value)
      if (url.protocol !== 'https:') {
        return true
      }
    } catch {
      // ignore invalid endpoint; handled elsewhere
    }
  }

  return false
}

function estimateBase64Size(base64: string): number {
  const trimmed = base64.replace(/=+$/, '')
  return Math.floor((trimmed.length * 3) / 4)
}

function createModel(config: ProviderRequestInput, overrideBaseURL?: string) {
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
  config: ProviderRequestInput,
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

function validateProviderConfig(config: ProviderRequestInput): ProviderTestResult | null {
  if (!config.apiKey) {
    return {
      ok: false,
      message: localize(config.locale, '请先填写 API Key', 'Please fill in API key first'),
    }
  }

  if (!config.model) {
    return {
      ok: false,
      message: localize(config.locale, '请先填写模型名称', 'Please fill in model name first'),
    }
  }

  if (getPresetType(config.id) === 'openai-compatible') {
    if (hasInsecureEndpoint(config)) {
      return {
        ok: false,
        message: localize(
          config.locale,
          '仅支持 HTTPS API 地址，请使用 https:// 开头的端点',
          'Only HTTPS API endpoints are allowed. Please use an https:// URL.'
        ),
      }
    }

    if (getCandidateBaseURLs(config).length === 0) {
      return {
        ok: false,
        message: localize(config.locale, '请先填写 API 地址', 'Please fill in API endpoint first'),
      }
    }
  }

  return null
}

export const testProviderConnectionServerFn = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => parseProviderInput(input))
  .handler(async ({ data }) => {
    const validationResult = validateProviderConfig(data)
    if (validationResult) {
      return validationResult
    }

    try {
      await tryGenerateWithFallbacks(data, async (model) => {
        await generateText({
          model,
          prompt: data.locale === 'zh' ? '回复 "ok"' : 'Reply with "ok"',
          maxOutputTokens: 10,
          temperature: 0,
        })
      })

      return {
        ok: true,
        message: localize(data.locale, '连接成功，API 可用', 'Connection successful, API is available'),
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      return { ok: false, message: `API Error: ${message}` }
    }
  })

export const analyzeVoiceServerFn = createServerFn({ method: 'POST' })
  .inputValidator((input: unknown) => parseAnalyzeVoiceInput(input))
  .handler(async ({ data }) => {
    const validationResult = validateProviderConfig(data)
    if (validationResult) {
      return { text: '', error: validationResult.message }
    }

    const estimatedSize = data.audio.size > 0 ? data.audio.size : estimateBase64Size(data.audio.base64)
    if (estimatedSize <= 0) {
      return {
        text: '',
        error: localize(data.locale, '音频数据为空，请重新上传或录制', 'Audio payload is empty. Please record or upload again.'),
      }
    }

    if (estimatedSize > MAX_AUDIO_UPLOAD_BYTES) {
      return {
        text: '',
        error: localize(
          data.locale,
          '音频文件过大，最大支持 20MB',
          'Audio file is too large. Maximum supported size is 20MB.'
        ),
      }
    }

    const mediaType = data.audio.mediaType || 'audio/webm'
    if (!mediaType.startsWith('audio/')) {
      return {
        text: '',
        error: localize(
          data.locale,
          '音频 MIME 类型无效，请上传标准音频文件',
          'Invalid audio MIME type. Please upload a supported audio file.'
        ),
      }
    }

    try {
      const prompt = getVoiceAnalysisPrompt(data.locale)
      let text = ''

      await tryGenerateWithFallbacks(data, async (model) => {
        const history = data.conversation.map((turn) => ({
          role: turn.role,
          content: turn.content,
        }))

        const result = await generateText({
          model,
          messages: [
            ...history,
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text:
                    data.locale === 'zh'
                      ? `${prompt}\n\n请结合此前多轮对话上下文继续给出建议，保持和上一次建议连贯。`
                      : `${prompt}\n\nContinue from previous turns and keep the coaching suggestions coherent with prior feedback.`,
                },
                {
                  type: 'file',
                  data: data.audio.base64,
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
  })
