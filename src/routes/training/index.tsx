import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useI18n } from '#/lib/i18n'
import { programs } from '#/lib/training/programs'
import { exercises } from '#/lib/training/exercises'
import { TrainingPlanCard } from '#/components/training/TrainingPlan'
import { ExerciseCard } from '#/components/training/ExerciseCard'
import { PageTransition, PageSection } from '#/components/ui/page-transition'
import { motion } from 'motion/react'

export const Route = createFileRoute('/training/')({ component: TrainingPage })

function TrainingPage() {
  const { t } = useI18n()
  const navigate = useNavigate()

  return (
    <PageTransition className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <PageSection>
        <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{t.training.title}</h1>
        </header>
      </PageSection>

      <PageSection>
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{t.training.programs}</h2>
          <div className="space-y-4">
            {programs.map((program, index) => (
              <motion.div
                key={program.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 + index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <TrainingPlanCard
                  program={program}
                  onSelect={(id) => navigate({ to: '/training/$programId', params: { programId: id } })}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </PageSection>

      <PageSection>
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{t.training.exercises}</h2>
          <div className="space-y-3">
            {exercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <ExerciseCard exercise={exercise} />
              </motion.div>
            ))}
          </div>
        </section>
      </PageSection>
    </PageTransition>
  )
}
