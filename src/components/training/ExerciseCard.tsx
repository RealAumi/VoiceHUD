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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
      <button
        className="flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-900"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="mt-0.5 text-2xl">{categoryIcons[exercise.category]}</span>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-slate-900 dark:text-slate-100">{name}</h4>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
          <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {exercise.durationMinutes} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Dumbbell size={12} />
              {diffLabel}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">{catLabel}</span>
          </div>
        </div>
        <span className="mt-1 text-slate-400">{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span>
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-200 px-4 pt-3 pb-4 dark:border-slate-800">
          <div>
            <h5 className="mb-2 text-sm font-medium text-teal-700 dark:text-teal-300">{locale === 'zh' ? '步骤' : 'Steps'}</h5>
            <ol className="list-inside list-decimal space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
              {steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
          <div>
            <h5 className="mb-2 text-sm font-medium text-amber-700 dark:text-amber-300">{locale === 'zh' ? '提示' : 'Tips'}</h5>
            <ul className="list-inside list-disc space-y-1 text-sm text-slate-600 dark:text-slate-400">
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
