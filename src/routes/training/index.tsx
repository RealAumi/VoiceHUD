import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useI18n } from '#/lib/i18n'
import { programs } from '#/lib/training/programs'
import { exercises } from '#/lib/training/exercises'
import { TrainingPlanCard } from '#/components/training/TrainingPlan'
import { ExerciseCard } from '#/components/training/ExerciseCard'

export const Route = createFileRoute('/training/')({ component: TrainingPage })

function TrainingPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.training.title}</h1>
      </header>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{t.training.programs}</h2>
        <div className="space-y-4">
          {programs.map((program) => (
            <TrainingPlanCard
              key={program.id}
              program={program}
              onSelect={(id) => navigate({ to: '/training/$programId', params: { programId: id } })}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{t.training.exercises}</h2>
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </section>
    </div>
  )
}
