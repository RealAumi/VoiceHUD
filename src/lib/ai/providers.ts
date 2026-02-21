/**
 * AI provider configuration and presets.
 */

export type ProviderType = 'google' | 'openrouter' | 'openai-compatible'

export interface ProviderConfig {
  id: string
  apiKey: string
  model: string
  /** Primary endpoint for OpenAI-compatible providers */
  baseURL: string
  /** Optional fallback endpoints (tried in order if primary fails) */
  fallbackBaseURLs: string[]
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
  apiKeyUrl?: string
  endpointCandidates?: string[]
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
    defaultModel: 'gemini-3-flash-preview',
    customBaseURL: false,
    modelHint: 'gemini-3-flash-preview, gemini-3-pro-preview ...',
    apiKeyUrl: 'https://aistudio.google.com/apikey',
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
    defaultModel: 'google/gemini-3-flash-preview',
    customBaseURL: false,
    modelHint: 'google/gemini-3-flash-preview, openai/gpt-4.1-mini ...',
    apiKeyUrl: 'https://openrouter.ai/settings/keys',
    endpointCandidates: ['https://openrouter.ai/api/v1'],
  },
  {
    id: 'zenmux',
    type: 'openai-compatible',
    name: { zh: 'Zenmux', en: 'Zenmux' },
    description: {
      zh: 'Zenmux OpenAI 兼容网关（支持多端点容灾）',
      en: 'Zenmux OpenAI-compatible gateway (multi-endpoint fallback)',
    },
    defaultBaseURL: 'https://zenmux.ai/api/v1',
    defaultModel: 'gemini-3-flash-preview',
    customBaseURL: true,
    modelHint: 'gemini-3-flash-preview, gemini-3-pro-preview, gpt-4.1-mini ...',
    apiKeyUrl: 'https://dash.zenmux.top',
    endpointCandidates: [
      'https://zenmux.ai/api/v1',
    ],
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
    modelHint: 'gpt-4.1-mini, gemini-3-flash, claude-3.7-sonnet ...',
  },
]

export function getPreset(id: string): ProviderPreset | undefined {
  return PROVIDER_PRESETS.find((p) => p.id === id)
}

export function getPresetType(id: string): ProviderType {
  return getPreset(id)?.type ?? 'openai-compatible'
}
