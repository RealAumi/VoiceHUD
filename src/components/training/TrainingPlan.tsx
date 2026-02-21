import { Calendar, Clock, Dumbbell } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import type { TrainingProgram } from '#/lib/training/programs'

interface TrainingPlanCardProps {
  program: TrainingProgram
  onSelect: (id: string) => void
}

export function TrainingPlanCard({ program, onSelect }: TrainingPlanCardProps) {
  const { locale, t } = useI18n()

  const name = program.name[locale]
  const description = program.description[locale]
  const diffLabel = t.training.difficulty[program.difficulty]

  const diffColors = {
    beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    advanced: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
  }

  return (
    <button
      className="w-full rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700"
      onClick={() => onSelect(program.id)}
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${diffColors[program.difficulty]}`}>
          {diffLabel}
        </span>
      </div>

      <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">{description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="inline-flex items-center gap-1.5">
          <Calendar size={13} />
          {program.durationWeeks} {locale === 'zh' ? '周' : 'weeks'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} />
          {program.dailyMinutes} min/{locale === 'zh' ? '天' : 'day'}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Dumbbell size={13} />
          {program.schedule.length} {locale === 'zh' ? '个训练日' : 'sessions'}
        </span>
      </div>
    </button>
  )
}
