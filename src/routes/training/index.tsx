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
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
      <h1 className="text-2xl font-bold">{t.training.title}</h1>

      {/* Training Programs */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">{t.training.programs}</h2>
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

      {/* Exercise Library */}
      <section>
        <h2 className="text-lg font-semibold text-slate-200 mb-4">{t.training.exercises}</h2>
        <div className="space-y-3">
          {exercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </section>
    </div>
  )
}
