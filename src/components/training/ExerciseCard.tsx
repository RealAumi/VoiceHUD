import { useState } from 'react'
import { ChevronDown, ChevronUp, Clock, Dumbbell } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import type { Exercise } from '#/lib/training/exercises'

interface ExerciseCardProps {
  exercise: Exercise
}

const categoryIcons: Record<string, string> = {
  pitch: '🎵',
  resonance: '🔊',
  breathing: '🌬️',
  articulation: '👄',
  intonation: '🎶',
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { locale, t } = useI18n()

  const name = exercise.name[locale]
  const description = exercise.description[locale]
  const steps = exercise.steps[locale]
  const tips = exercise.tips[locale]
  const diffLabel = t.training.difficulty[exercise.difficulty]
  const catLabel = t.training.categories[exercise.category]

  return (
    <div className="rounded-xl bg-slate-800/60 border border-slate-700 overflow-hidden">
      <button
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-slate-800/80 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="text-2xl mt-0.5">{categoryIcons[exercise.category]}</span>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white">{name}</h4>
          <p className="text-sm text-slate-400 mt-1 line-clamp-2">{description}</p>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {exercise.durationMinutes} min
            </span>
            <span className="flex items-center gap-1">
              <Dumbbell size={12} />
              {diffLabel}
            </span>
            <span className="px-2 py-0.5 bg-slate-700 rounded-full">{catLabel}</span>
          </div>
        </div>
        <span className="text-slate-400 mt-1">
          {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-3 space-y-3">
          <div>
            <h5 className="text-sm font-medium text-cyan-400 mb-2">
              {locale === 'zh' ? '步骤' : 'Steps'}
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-300">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <h5 className="text-sm font-medium text-amber-400 mb-2">
              {locale === 'zh' ? '提示' : 'Tips'}
            </h5>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
