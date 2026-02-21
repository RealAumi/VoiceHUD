import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { AlertCircle, KeyRound } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { useVoiceRecorder } from '#/hooks/useVoiceRecorder'
import { AudioRecorder, AnalyzeButton } from '#/components/audio/AudioRecorder'
import { getStoredApiKey, analyzeVoice } from '#/lib/gemini/client'

export const Route = createFileRoute('/analysis')({ component: AnalysisPage })

function AnalysisPage() {
  const { t, locale } = useI18n()
  const recorder = useVoiceRecorder()
  const [analysisResult, setAnalysisResult] = useState<string>('')
  const [analysisError, setAnalysisError] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const apiKey = typeof window !== 'undefined' ? getStoredApiKey() : ''

  const handleAnalyze = async () => {
    if (!recorder.audioBlob) return

    setIsAnalyzing(true)
    setAnalysisResult('')
    setAnalysisError('')

    const result = await analyzeVoice(recorder.audioBlob, apiKey, locale)

    if (result.error) {
      setAnalysisError(result.error)
    } else {
      setAnalysisResult(result.text)
    }
    setIsAnalyzing(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">{t.analysis.title}</h1>

      <p className="text-slate-400">{t.analysis.recordPrompt}</p>

      {/* API Key warning */}
      {!apiKey && (
        <div className="flex items-center justify-between gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
          <div className="flex items-center gap-3">
            <KeyRound size={20} />
            <span className="text-sm">{t.analysis.noApiKey}</span>
          </div>
          <Link
            to="/settings"
            className="text-sm px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
          >
            {t.analysis.goToSettings}
          </Link>
        </div>
      )}

      {/* Recorder */}
      <AudioRecorder
        isRecording={recorder.isRecording}
        duration={recorder.duration}
        audioBlob={recorder.audioBlob}
        onStartRecording={recorder.startRecording}
        onStopRecording={recorder.stopRecording}
        onClear={recorder.clearRecording}
      />

      {/* Recorder error */}
      {recorder.error && (
        <div className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          <AlertCircle size={16} />
          {recorder.error}
        </div>
      )}

      {/* Analyze button */}
      {recorder.audioBlob && !recorder.isRecording && (
        <AnalyzeButton
          onClick={handleAnalyze}
          isAnalyzing={isAnalyzing}
          disabled={!apiKey}
          label={isAnalyzing ? t.analysis.analyzing : t.analysis.analyzeButton}
        />
      )}

      {/* Analysis error */}
      {analysisError && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {analysisError}
        </div>
      )}

      {/* Analysis result */}
      {analysisResult && (
        <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">{t.analysis.result}</h3>
          <div className="prose prose-invert prose-sm max-w-none text-slate-300 whitespace-pre-wrap">
            {analysisResult}
          </div>
        </div>
      )}
    </div>
  )
}
