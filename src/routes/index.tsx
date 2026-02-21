import { createFileRoute, Link } from '@tanstack/react-router'
import { Mic, Brain, BookOpen, AudioWaveform, ArrowRight } from 'lucide-react'
import { useI18n } from '#/lib/i18n'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  const { t } = useI18n()

  const features = [
    {
      icon: <AudioWaveform className="w-10 h-10 text-cyan-400" />,
      title: t.home.features.realtime.title,
      description: t.home.features.realtime.desc,
    },
    {
      icon: <Brain className="w-10 h-10 text-purple-400" />,
      title: t.home.features.ai.title,
      description: t.home.features.ai.desc,
    },
    {
      icon: <BookOpen className="w-10 h-10 text-amber-400" />,
      title: t.home.features.training.title,
      description: t.home.features.training.desc,
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative py-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-purple-500/5" />
        <div className="relative max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-3 mb-6">
            <AudioWaveform size={48} className="text-cyan-400" />
            <h1 className="text-5xl md:text-6xl font-black tracking-tight">
              <span className="text-cyan-400">Voice</span>
              <span className="text-white">HUD</span>
            </h1>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t.home.hero.title}
          </h2>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            {t.home.hero.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/practice"
              className="flex items-center gap-2 px-8 py-3.5 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-cyan-500/25"
            >
              <Mic size={20} />
              {t.home.hero.ctaPractice}
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/training"
              className="flex items-center gap-2 px-8 py-3.5 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl transition-colors"
            >
              <BookOpen size={20} />
              {t.home.hero.ctaTraining}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-cyan-500/30 transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
