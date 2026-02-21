export interface TrainingProgram {
  id: string
  name: { zh: string; en: string }
  description: { zh: string; en: string }
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  durationWeeks: number
  dailyMinutes: number
  /** Exercise IDs for each day's session */
  schedule: DaySchedule[]
}

export interface DaySchedule {
  day: number
  exerciseIds: string[]
  focus: { zh: string; en: string }
}

export const programs: TrainingProgram[] = [
  {
    id: 'chen-zhen-beginner',
    name: {
      zh: '陈臻基础训练法',
      en: 'Chen Zhen Beginner Method',
    },
    description: {
      zh: '基于陈臻医生嗓音训练理念的入门课程。从呼吸基础开始，循序渐进地建立音高控制和共振意识。适合零基础的嗓音训练者。',
      en: "A beginner course based on Dr. Chen Zhen's voice training philosophy. Starting from breathing fundamentals, progressively building pitch control and resonance awareness. Suitable for complete beginners.",
    },
    difficulty: 'beginner',
    durationWeeks: 4,
    dailyMinutes: 20,
    schedule: [
      {
        day: 1,
        exerciseIds: ['diaphragm-breathing', 'sustained-tone', 'lip-trills'],
        focus: { zh: '呼吸基础与热身', en: 'Breathing Basics & Warmup' },
      },
      {
        day: 2,
        exerciseIds: ['diaphragm-breathing', 'pitch-glide', 'lip-trills'],
        focus: { zh: '音高感知', en: 'Pitch Awareness' },
      },
      {
        day: 3,
        exerciseIds: ['lip-trills', 'resonance-exploration', 'sustained-tone'],
        focus: { zh: '共振入门', en: 'Resonance Introduction' },
      },
      {
        day: 4,
        exerciseIds: ['diaphragm-breathing', 'pitch-glide', 'resonance-exploration'],
        focus: { zh: '综合复习', en: 'Combined Review' },
      },
      {
        day: 5,
        exerciseIds: ['lip-trills', 'pitch-glide', 'forward-resonance'],
        focus: { zh: '前置共振初探', en: 'Forward Resonance Introduction' },
      },
      {
        day: 6,
        exerciseIds: ['diaphragm-breathing', 'target-pitch-hold', 'resonance-exploration'],
        focus: { zh: '音高精确控制', en: 'Precise Pitch Control' },
      },
      {
        day: 7,
        exerciseIds: ['lip-trills', 'forward-resonance', 'sentence-intonation'],
        focus: { zh: '语调与表达', en: 'Intonation & Expression' },
      },
    ],
  },
  {
    id: 'resonance-focus',
    name: {
      zh: '共振强化训练',
      en: 'Resonance Intensive',
    },
    description: {
      zh: '专注于共振位置调整和声音色彩变化的进阶课程。陈臻医生认为，共振是改变声音特质最有效的途径。',
      en: "An intermediate course focused on resonance placement and tonal color changes. Dr. Chen Zhen considers resonance the most effective way to transform voice quality.",
    },
    difficulty: 'intermediate',
    durationWeeks: 3,
    dailyMinutes: 25,
    schedule: [
      {
        day: 1,
        exerciseIds: ['lip-trills', 'resonance-exploration', 'forward-resonance'],
        focus: { zh: '共振位置感知', en: 'Resonance Awareness' },
      },
      {
        day: 2,
        exerciseIds: ['diaphragm-breathing', 'forward-resonance', 'sentence-intonation'],
        focus: { zh: '前置共振应用', en: 'Applying Forward Resonance' },
      },
      {
        day: 3,
        exerciseIds: ['lip-trills', 'target-pitch-hold', 'forward-resonance'],
        focus: { zh: '共振与音高结合', en: 'Resonance + Pitch Integration' },
      },
      {
        day: 4,
        exerciseIds: ['resonance-exploration', 'forward-resonance', 'sentence-intonation'],
        focus: { zh: '日常说话中应用', en: 'Daily Speech Application' },
      },
      {
        day: 5,
        exerciseIds: ['lip-trills', 'pitch-glide', 'forward-resonance'],
        focus: { zh: '动态共振控制', en: 'Dynamic Resonance Control' },
      },
    ],
  },
  {
    id: 'daily-warmup',
    name: {
      zh: '每日热身',
      en: 'Daily Warmup',
    },
    description: {
      zh: '简短的日常热身程序，适合每天开始练习前使用，或作为日常声音保养。',
      en: 'A short daily warmup routine, ideal for starting each practice session or as daily voice maintenance.',
    },
    difficulty: 'beginner',
    durationWeeks: 1,
    dailyMinutes: 10,
    schedule: [
      {
        day: 1,
        exerciseIds: ['diaphragm-breathing', 'lip-trills', 'pitch-glide'],
        focus: { zh: '基础热身', en: 'Basic Warmup' },
      },
    ],
  },
]

export function getProgramById(id: string): TrainingProgram | undefined {
  return programs.find((p) => p.id === id)
}
