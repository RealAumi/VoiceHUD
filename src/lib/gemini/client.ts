/**
 * Gemini API client for voice analysis
 * Runs entirely on the client side since users provide their own API key
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

export function getStoredApiKey(): string {
  if (typeof window === 'undefined') return ''
  return localStorage.getItem('voicehud-gemini-key') || ''
}

export function setStoredApiKey(key: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('voicehud-gemini-key', key)
  }
}

export interface GeminiAnalysisResult {
  text: string
  error?: string
}

/**
 * Convert a Blob to base64 data URI
 */
async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const result = reader.result as string
      // Extract just the base64 part (after the comma in data URI)
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Analyze voice audio using Gemini multimodal API
 */
export async function analyzeVoice(
  audioBlob: Blob,
  apiKey: string,
  locale: 'zh' | 'en' = 'zh'
): Promise<GeminiAnalysisResult> {
  if (!apiKey) {
    return {
      text: '',
      error: locale === 'zh' ? '请先设置 Gemini API Key' : 'Please set your Gemini API Key first',
    }
  }

  try {
    const audioBase64 = await blobToBase64(audioBlob)
    const mimeType = audioBlob.type || 'audio/webm'

    const prompt =
      locale === 'zh'
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

    const response = await fetch(
      `${GEMINI_API_BASE}/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: audioBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMsg = (errorData as { error?: { message?: string } })?.error?.message || response.statusText
      return {
        text: '',
        error: `API Error: ${errorMsg}`,
      }
    }

    const result = await response.json()
    const text = (result as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
    })?.candidates?.[0]?.content?.parts?.[0]?.text || ''

    return { text }
  } catch (err) {
    return {
      text: '',
      error: `${err instanceof Error ? err.message : 'Unknown error'}`,
    }
  }
}
