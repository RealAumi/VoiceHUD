import { createFileRoute, Link } from '@tanstack/react-router'
import { Mic, Brain, BookOpen, AudioWaveform, ArrowRight } from 'lucide-react'
import { useI18n } from '#/lib/i18n'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { t } = useI18n()

  const features = [
    {
      icon: <AudioWaveform className="h-8 w-8 text-teal-700" />,
      title: t.home.features.realtime.title,
      description: t.home.features.realtime.desc,
    },
    {
      icon: <Brain className="h-8 w-8 text-slate-800" />,
      title: t.home.features.ai.title,
      description: t.home.features.ai.desc,
    },
    {
      icon: <BookOpen className="h-8 w-8 text-emerald-700" />,
      title: t.home.features.training.title,
      description: t.home.features.training.desc,
    },
  ]

  return (
    <div className="px-6 pb-14">
      <section className="mx-auto max-w-5xl py-14">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <AudioWaveform size={14} className="text-teal-700 dark:text-teal-300" /> {t.common.appTagline}
          </div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 md:text-5xl">{t.home.hero.title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 md:text-lg">{t.home.hero.subtitle}</p>

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-medium text-white transition-colors hover:bg-slate-700"
            >
              <Mic size={18} />
              {t.home.hero.ctaPractice}
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/analysis"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition-colors hover:border-slate-400 hover:text-slate-900"
            >
              <Brain size={18} />
              {t.nav.analysis}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
        {features.map((feature, index) => (
          <div key={index} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <div className="mb-3">{feature.icon}</div>
            <h3 className="mb-2 text-base font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
