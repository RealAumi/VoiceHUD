import { createFileRoute, Link } from '@tanstack/react-router'
import { Mic, Brain, BookOpen, AudioWaveform, ArrowRight, Sparkles } from 'lucide-react'
import { useI18n } from '#/lib/i18n'
import { motion } from 'motion/react'

export const Route = createFileRoute('/')({ component: HomePage })

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24, filter: 'blur(4px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const featureCardVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.96 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: 0.4 + i * 0.12,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
}

function HomePage() {
  const { t } = useI18n()

  const features = [
    {
      icon: <AudioWaveform className="h-6 w-6" />,
      title: t.home.features.realtime.title,
      description: t.home.features.realtime.desc,
      accent: 'from-teal-400 to-cyan-500',
      accentBg: 'bg-teal-500/10 text-teal-600 dark:bg-teal-400/10 dark:text-teal-300',
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: t.home.features.ai.title,
      description: t.home.features.ai.desc,
      accent: 'from-violet-400 to-indigo-500',
      accentBg: 'bg-violet-500/10 text-violet-600 dark:bg-violet-400/10 dark:text-violet-300',
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: t.home.features.training.title,
      description: t.home.features.training.desc,
      accent: 'from-amber-400 to-orange-500',
      accentBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300',
    },
  ]

  return (
    <div className="relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-200/30 to-cyan-200/20 blur-3xl dark:from-teal-900/20 dark:to-cyan-900/10" />
        <div className="absolute top-60 -left-20 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-violet-200/20 to-indigo-200/15 blur-3xl dark:from-violet-900/15 dark:to-indigo-900/10" />
        <div className="absolute right-[20%] bottom-20 h-[300px] w-[300px] rounded-full bg-gradient-to-br from-amber-200/20 to-orange-200/15 blur-3xl dark:from-amber-900/10 dark:to-orange-900/5" />
      </div>

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-20 md:pt-24 md:pb-28">
        <motion.div
          className="mx-auto max-w-4xl text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/60 px-4 py-1.5 text-xs font-medium text-slate-600 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-300">
              <Sparkles size={13} className="text-amber-500" />
              {t.common.appTagline}
            </span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="font-display mt-8 text-5xl leading-[1.1] tracking-tight text-slate-900 md:text-7xl lg:text-8xl dark:text-white"
          >
            {t.home.hero.title}
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-slate-500 md:text-lg dark:text-slate-400"
          >
            {t.home.hero.subtitle}
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link
              to="/practice"
              className="group inline-flex items-center gap-2.5 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all duration-300 hover:scale-[1.02] hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/25 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:shadow-white/10 dark:hover:bg-slate-100"
            >
              <Mic size={17} />
              {t.home.hero.ctaPractice}
              <ArrowRight
                size={15}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
            </Link>
            <Link
              to="/analysis"
              className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-white/70 px-7 py-3.5 text-sm font-semibold text-slate-700 backdrop-blur-sm transition-all duration-300 hover:scale-[1.02] hover:border-slate-300 hover:bg-white hover:shadow-md active:scale-[0.98] dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              <Brain size={17} />
              {t.nav.analysis}
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative px-6 pb-24">
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={featureCardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -4, transition: { duration: 0.25, ease: 'easeOut' } }}
              className="group relative rounded-2xl border border-slate-200/70 bg-white/50 p-6 shadow-sm backdrop-blur-sm transition-shadow duration-300 hover:shadow-lg dark:border-slate-800/70 dark:bg-slate-900/40 dark:hover:border-slate-700"
            >
              <div
                className={`mb-4 inline-flex rounded-xl p-2.5 ${feature.accentBg}`}
              >
                {feature.icon}
              </div>
              <h3 className="mb-2 text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
              {/* Subtle gradient line at bottom on hover */}
              <div
                className={`absolute right-6 bottom-0 left-6 h-[2px] rounded-full bg-gradient-to-r opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${feature.accent}`}
              />
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  )
}
