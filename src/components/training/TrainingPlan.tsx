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
    beginner: 'bg-green-500/20 text-green-400',
    intermediate: 'bg-amber-500/20 text-amber-400',
    advanced: 'bg-red-500/20 text-red-400',
  }

  return (
    <button
      className="w-full text-left rounded-xl bg-slate-800/60 border border-slate-700 p-5 hover:border-cyan-500/50 transition-all hover:shadow-lg hover:shadow-cyan-500/5"
      onClick={() => onSelect(program.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-white">{name}</h3>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${diffColors[program.difficulty]}`}>
          {diffLabel}
        </span>
      </div>

      <p className="text-sm text-slate-400 mb-4">{description}</p>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Calendar size={13} />
          {program.durationWeeks} {locale === 'zh' ? '周' : 'weeks'}
        </span>
        <span className="flex items-center gap-1.5">
          <Clock size={13} />
          {program.dailyMinutes} min/{locale === 'zh' ? '天' : 'day'}
        </span>
        <span className="flex items-center gap-1.5">
          <Dumbbell size={13} />
          {program.schedule.length} {locale === 'zh' ? '个训练日' : 'sessions'}
        </span>
      </div>
    </button>
  )
}
