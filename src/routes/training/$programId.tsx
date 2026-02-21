import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Calendar } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { getProgramById } from '#/lib/training/programs'
import { exercises as allExercises } from '#/lib/training/exercises'
import { ExerciseCard } from '#/components/training/ExerciseCard'

export const Route = createFileRoute('/training/$programId')({
  component: ProgramDetailPage,
})

function ProgramDetailPage() {
  const { programId } = Route.useParams()
  const { locale, t } = useI18n()
  const program = getProgramById(programId)

  if (!program) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-400">
          {locale === 'zh' ? '未找到该训练计划' : 'Training program not found'}
        </p>
        <Link to="/training" className="text-cyan-400 hover:underline mt-4 inline-block">
          {t.common.back}
        </Link>
      </div>
    )
  }

  const diffColors = {
    beginner: 'text-green-400',
    intermediate: 'text-amber-400',
    advanced: 'text-red-400',
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Back link */}
      <Link
        to="/training"
        className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={16} />
        {t.common.back}
      </Link>

      {/* Program header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{program.name[locale]}</h1>
          <span className={`text-sm font-medium ${diffColors[program.difficulty]}`}>
            {t.training.difficulty[program.difficulty]}
          </span>
        </div>
        <p className="text-slate-400">{program.description[locale]}</p>
        <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
          <span>{program.durationWeeks} {locale === 'zh' ? '周' : 'weeks'}</span>
          <span>{program.dailyMinutes} min/{locale === 'zh' ? '天' : 'day'}</span>
        </div>
      </div>

      {/* Daily schedule */}
      <section className="space-y-6">
        {program.schedule.map((day) => {
          const dayExercises = day.exerciseIds
            .map((id) => allExercises.find((e) => e.id === id))
            .filter(Boolean) as typeof allExercises

          return (
            <div key={day.day} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Calendar size={16} />
                  <span className="font-medium">
                    {locale === 'zh' ? `第 ${day.day} 天` : `Day ${day.day}`}
                  </span>
                </div>
                <span className="text-sm text-slate-500">{day.focus[locale]}</span>
              </div>

              <div className="space-y-2 pl-2 border-l-2 border-slate-800">
                {dayExercises.map((exercise) => (
                  <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
              </div>
            </div>
          )
        })}
      </section>
    </div>
  )
}
