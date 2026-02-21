# VoiceHUD

[English](README.md) | 中文

实时声音可视化 + AI 分析，用于科学的嗓音训练。

## 功能特点

- **实时声音 HUD** - 通过 YIN 算法进行音高 (F0) 检测，共鸣/共振峰分析，实时语图，以及使用 Web Audio API 的音量计
- **多提供商 AI 分析** - 通过 Vercel AI SDK 使用 Gemini、OpenRouter、Zenmux 或任何兼容 OpenAI 的端点分析语音录音
- **训练计划** - 内置陈震博士等人的嗓音训练方法，包含呼吸、音高、共鸣、咬字和语调等 8 项练习
- **双语支持** - 完整的中文/英文 i18n 支持

## 技术栈

| 层级 | 技术 |
|-------|-----------|
| 框架 | [TanStack Start](https://tanstack.com/start) (基于文件的路由, SSR) |
| UI | [Tailwind CSS](https://tailwindcss.com/) v4 + [shadcn/ui](https://ui.shadcn.com/) |
| 音频 | Web Audio API + YIN 音高检测 + Canvas 渲染 |
| AI | [Vercel AI SDK](https://sdk.vercel.ai/) (`@ai-sdk/google`, `@ai-sdk/openai`, `@openrouter/ai-sdk-provider`) |
| 部署 | [Cloudflare Workers](https://workers.cloudflare.com/) 通过 `@cloudflare/vite-plugin` |

## 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (localhost:3000)
pnpm dev

# 生产环境构建
pnpm build

# 部署到 Cloudflare Workers
pnpm deploy
```

## 配置

所有配置均通过应用内的“设置”页面完成：

1. **AI 提供商** - 选择 Google Gemini、OpenRouter、Zenmux 或自定义的兼容 OpenAI 的端点
2. **API 密钥** - 输入所选提供商的 API 密钥
3. **模型** - 选择用于语音分析的 AI 模型
4. **语言** - 在中文和英文之间切换

API 密钥存储在浏览器的 localStorage 中。不需要服务器端密钥。

## 项目结构

```
src/
├── routes/                  # 页面 (基于文件的路由)
│   ├── index.tsx            # 落地页
│   ├── practice.tsx         # 带有 HUD 的实时发声练习
│   ├── analysis.tsx         # AI 语音分析
│   ├── settings.tsx         # 提供商和语言设置
│   └── training/            # 训练计划和练习
├── components/
│   ├── audio/               # VoiceHUD, PitchDisplay, Spectrogram 等
│   └── training/            # ExerciseCard, TrainingPlan
├── hooks/                   # useAudioInput, usePitchDetection, useVoiceRecorder
└── lib/
    ├── ai/                  # Vercel AI SDK 客户端, 提供商预设, 存储
    ├── audio/               # YIN 音高检测, 共振峰分析, 常量
    ├── i18n/                # 中文和英文翻译
    └── training/            # 练习和计划定义
```

## 许可证

[MIT](LICENSE)
