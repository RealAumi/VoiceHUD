/**
 * AI provider configuration and presets.
 *
 * Supports:
 * - Google Gemini (native via @ai-sdk/google)
 * - OpenRouter (via @openrouter/ai-sdk-provider)
 * - Any OpenAI-compatible endpoint (Zenmux, custom, etc.)
 */

export type ProviderType = 'google' | 'openrouter' | 'openai-compatible'

export interface ProviderConfig {
  id: string
  apiKey: string
  model: string
  /** Only used for openai-compatible providers */
  baseURL: string
}

export interface ProviderPreset {
  id: string
  type: ProviderType
  name: { zh: string; en: string }
  description: { zh: string; en: string }
  defaultBaseURL: string
  defaultModel: string
  /** Whether baseURL is user-editable */
  customBaseURL: boolean
  /** Placeholder suggestions for model names */
  modelHint: string
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'google',
    type: 'google',
    name: { zh: 'Google Gemini', en: 'Google Gemini' },
    description: {
      zh: '直连 Google Gemini API，原生多模态音频支持',
      en: 'Direct Google Gemini API with native multimodal audio support',
    },
    defaultBaseURL: '',
    defaultModel: 'gemini-3-flash',
    customBaseURL: false,
    modelHint: 'gemini-3-flash, gemini-3-pro ...',
  },
  {
    id: 'openrouter',
    type: 'openrouter',
    name: { zh: 'OpenRouter', en: 'OpenRouter' },
    description: {
      zh: '通过 OpenRouter 接入数百种模型，统一 API',
      en: 'Access hundreds of models through OpenRouter unified API',
    },
    defaultBaseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'google/gemini-3-flash',
    customBaseURL: false,
    modelHint: 'google/gemini-3-flash, openai/gpt-4.1-mini ...',
  },
  {
    id: 'zenmux',
    type: 'openai-compatible',
    name: { zh: 'Zenmux', en: 'Zenmux' },
    description: {
      zh: 'Zenmux API 代理服务，OpenAI 兼容接口',
      en: 'Zenmux API proxy service, OpenAI-compatible interface',
    },
    defaultBaseURL: 'https://api.zenmux.top/v1',
    defaultModel: 'gemini-3-flash',
    customBaseURL: true,
    modelHint: 'gemini-3-flash, gemini-3-pro, gpt-4.1-mini ...',
  },
  {
    id: 'custom',
    type: 'openai-compatible',
    name: { zh: '自定义接入点', en: 'Custom Endpoint' },
    description: {
      zh: '接入任何 OpenAI 兼容的 API 端点',
      en: 'Connect to any OpenAI-compatible API endpoint',
    },
    defaultBaseURL: '',
    defaultModel: '',
    customBaseURL: true,
    modelHint: 'https://your-api.example.com/v1',
  },
]

export function getPreset(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id)
}

export function getPresetType(id: string): ProviderType {
  return getPreset(id)?.type ?? 'openai-compatible'
}
