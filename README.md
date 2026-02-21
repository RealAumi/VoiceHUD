# VoiceHUD

Real-time voice visualization + AI analysis for scientific voice training.

## Features

- **Real-time Voice HUD** - Pitch (F0) detection via YIN algorithm, formant/resonance analysis, live spectrogram, and volume meter using Web Audio API
- **Multi-provider AI Analysis** - Analyze voice recordings with Gemini, OpenRouter, Zenmux, or any OpenAI-compatible endpoint via Vercel AI SDK
- **Training Programs** - Pre-built voice training methods from Dr. Chen Zhen and others, with 8 exercises across breathing, pitch, resonance, articulation, and intonation
- **Bilingual** - Full Chinese/English i18n support

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [TanStack Start](https://tanstack.com/start) (file-based routing, SSR) |
| UI | [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/) |
| Audio | Web Audio API + YIN pitch detection + Canvas rendering |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/google`, `@ai-sdk/openai`, `@openrouter/ai-sdk-provider`) |
| Deploy | [Cloudflare Workers](https://workers.cloudflare.com/) via `@cloudflare/vite-plugin` |

## Getting Started

```bash
# Install dependencies
pnpm install

# Start dev server (localhost:3000)
pnpm dev

# Production build
pnpm build

# Deploy to Cloudflare Workers
pnpm deploy
```

## Configuration

All configuration is done through the in-app Settings page:

1. **AI Provider** - Choose from Google Gemini, OpenRouter, Zenmux, or a custom OpenAI-compatible endpoint
2. **API Key** - Enter your own API key for the selected provider
3. **Model** - Select the AI model to use for voice analysis
4. **Language** - Switch between Chinese and English

API keys are stored in the browser's localStorage. No server-side secrets are required.

## Project Structure

```
src/
├── routes/                  # Pages (file-based routing)
│   ├── index.tsx            # Landing page
│   ├── practice.tsx         # Real-time voice practice with HUD
│   ├── analysis.tsx         # AI voice analysis
│   ├── settings.tsx         # Provider & language settings
│   └── training/            # Training programs & exercises
├── components/
│   ├── audio/               # VoiceHUD, PitchDisplay, Spectrogram, etc.
│   └── training/            # ExerciseCard, TrainingPlan
├── hooks/                   # useAudioInput, usePitchDetection, useVoiceRecorder
└── lib/
    ├── ai/                  # Vercel AI SDK client, provider presets, storage
    ├── audio/               # YIN pitch detection, formant analysis, constants
    ├── i18n/                # Chinese & English translations
    └── training/            # Exercise & program definitions
```

## License

[MIT](LICENSE)
