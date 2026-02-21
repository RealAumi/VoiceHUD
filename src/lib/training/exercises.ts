export interface Exercise {
  id: string
  category: 'pitch' | 'resonance' | 'breathing' | 'articulation' | 'intonation'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  durationMinutes: number
  name: { zh: string; en: string }
  description: { zh: string; en: string }
  steps: { zh: string[]; en: string[] }
  tips: { zh: string[]; en: string[] }
}

export const exercises: Exercise[] = [
  // === Breathing Exercises ===
  {
    id: 'diaphragm-breathing',
    category: 'breathing',
    difficulty: 'beginner',
    durationMinutes: 5,
    name: {
      zh: '腹式呼吸练习',
      en: 'Diaphragmatic Breathing',
    },
    description: {
      zh: '建立正确的呼吸支撑，这是所有声音训练的基础',
      en: 'Establish proper breath support — the foundation of all voice training',
    },
    steps: {
      zh: [
        '平躺或坐直，一只手放在胸部，另一只手放在腹部',
        '用鼻子慢慢吸气4秒，感受腹部隆起，胸部尽量不动',
        '保持2秒',
        '用嘴慢慢呼气6秒，感受腹部收缩',
        '重复10次',
      ],
      en: [
        'Lie down or sit upright, place one hand on your chest and the other on your abdomen',
        'Breathe in slowly through your nose for 4 seconds, feel your belly rise while keeping your chest still',
        'Hold for 2 seconds',
        'Exhale slowly through your mouth for 6 seconds, feel your belly contract',
        'Repeat 10 times',
      ],
    },
    tips: {
      zh: ['吸气时不要耸肩', '呼气时保持稳定的气流', '每天练习可以显著改善呼吸支撑'],
      en: ["Don't raise your shoulders while inhaling", 'Maintain a steady airflow while exhaling', 'Daily practice significantly improves breath support'],
    },
  },
  {
    id: 'sustained-tone',
    category: 'breathing',
    difficulty: 'beginner',
    durationMinutes: 5,
    name: {
      zh: '持续发声练习',
      en: 'Sustained Tone Exercise',
    },
    description: {
      zh: '练习稳定的气息控制和声带协调',
      en: 'Practice steady breath control and vocal cord coordination',
    },
    steps: {
      zh: [
        '深吸一口气（腹式呼吸）',
        '发一个舒适的 "啊" 音，尽量保持稳定',
        '目标：保持15-20秒的稳定发声',
        '注意音量和音高都要保持一致',
        '休息30秒后重复，共做5次',
      ],
      en: [
        'Take a deep breath (diaphragmatic)',
        'Sustain a comfortable "ah" sound, keeping it as steady as possible',
        'Goal: maintain a steady tone for 15-20 seconds',
        'Keep both volume and pitch consistent',
        'Rest 30 seconds, repeat 5 times',
      ],
    },
    tips: {
      zh: ['不要用力压喉咙', '感觉声音"浮在"气息上', '如果感到不适立即停止'],
      en: ["Don't force or squeeze your throat", 'Feel the sound "floating" on your breath', 'Stop immediately if you feel discomfort'],
    },
  },

  // === Pitch Control ===
  {
    id: 'pitch-glide',
    category: 'pitch',
    difficulty: 'beginner',
    durationMinutes: 5,
    name: {
      zh: '音高滑动练习',
      en: 'Pitch Glide Exercise',
    },
    description: {
      zh: '陈臻医生推荐的音高控制基础练习，帮助你感受和控制音高变化',
      en: 'Basic pitch control exercise recommended by Dr. Chen Zhen, helps you feel and control pitch changes',
    },
    steps: {
      zh: [
        '用 "嗯" 音从你舒适的最低音开始',
        '慢慢向上滑动到你舒适的最高音（约5秒）',
        '在最高处停留1秒',
        '慢慢向下滑动回到最低音（约5秒）',
        '重复5-8次，注意保持气息支撑',
      ],
      en: [
        'Start with a "hmm" at your comfortable lowest pitch',
        'Slowly glide up to your comfortable highest pitch (about 5 seconds)',
        'Hold at the top for 1 second',
        'Slowly glide back down to the lowest pitch (about 5 seconds)',
        'Repeat 5-8 times, maintaining breath support',
      ],
    },
    tips: {
      zh: ['观察 VoiceHUD 的音高曲线，目标是平滑的曲线', '不要在喉咙处用力', '找到你的"断裂点"并练习平滑过渡'],
      en: ['Watch the VoiceHUD pitch curve — aim for a smooth line', "Don't strain at your throat", 'Find your "break point" and practice smoothing it out'],
    },
  },
  {
    id: 'target-pitch-hold',
    category: 'pitch',
    difficulty: 'intermediate',
    durationMinutes: 8,
    name: {
      zh: '目标音高保持',
      en: 'Target Pitch Hold',
    },
    description: {
      zh: '练习在特定频率上稳定发声，提高音高控制精度',
      en: 'Practice sustaining voice at specific frequencies to improve pitch control precision',
    },
    steps: {
      zh: [
        '在 VoiceHUD 中设置你的目标音域',
        '尝试发声并让音高保持在目标范围的中间值',
        '保持10秒，观察音高曲线的稳定性',
        '休息15秒',
        '逐渐增加保持时间到20秒',
        '尝试在目标范围内说一句话',
      ],
      en: [
        'Set your target range in VoiceHUD',
        'Try to sustain your voice at the center of the target range',
        'Hold for 10 seconds, observe pitch curve stability',
        'Rest 15 seconds',
        'Gradually increase hold time to 20 seconds',
        'Try speaking a sentence within the target range',
      ],
    },
    tips: {
      zh: ['蓝色区域是你的目标范围', '不要追求完美——±10Hz的波动是正常的', '用说话的感觉而不是唱歌的感觉'],
      en: ['The blue zone is your target range', "Don't aim for perfection — ±10Hz fluctuation is normal", 'Use a speaking feel, not a singing feel'],
    },
  },

  // === Resonance Training ===
  {
    id: 'resonance-exploration',
    category: 'resonance',
    difficulty: 'beginner',
    durationMinutes: 8,
    name: {
      zh: '共振位置探索',
      en: 'Resonance Placement Exploration',
    },
    description: {
      zh: '感受不同共振位置（胸腔、口腔、头腔）的声音差异',
      en: 'Feel the difference between chest, oral, and head resonance',
    },
    steps: {
      zh: [
        '发一个低沉的 "嗯" 音，手放在胸口感受振动——这是胸腔共振',
        '保持相同音高，试着让声音"移到"口腔前部（想象声音在嘴唇处振动）',
        '再试着让声音"移到"头顶（想象声音从眉心处发出）',
        '在三个位置之间来回切换',
        '注意观察 VoiceHUD 中共振峰的变化',
      ],
      en: [
        'Hum a low "mmm", place your hand on your chest to feel vibration — this is chest resonance',
        'Keep the same pitch but try to "move" the sound forward to your mouth (imagine vibration at your lips)',
        'Try to "move" the sound to the top of your head (imagine it coming from between your eyebrows)',
        'Switch between the three placements',
        'Observe how the formants change in VoiceHUD',
      ],
    },
    tips: {
      zh: ['共振位置的变化不会改变音高', '前置共振通常听起来更明亮', '陈臻医生建议先找到每个位置的感觉，再练习控制'],
      en: ['Changing resonance placement should not change your pitch', 'Forward resonance usually sounds brighter', 'Dr. Chen Zhen suggests finding each placement first, then practicing control'],
    },
  },
  {
    id: 'forward-resonance',
    category: 'resonance',
    difficulty: 'intermediate',
    durationMinutes: 10,
    name: {
      zh: '前置共振强化（陈臻法）',
      en: 'Forward Resonance Enhancement (Chen Zhen Method)',
    },
    description: {
      zh: '陈臻医生强调的核心技术：将声音共振点前移，获得更明亮、更有穿透力的声音',
      en: 'Core technique emphasized by Dr. Chen Zhen: moving resonance forward for a brighter, more projecting voice',
    },
    steps: {
      zh: [
        '发 "嘛—咪—姆" 音，感受嘴唇和鼻腔的振动',
        '在 "咪" 音上延长，保持前置共振的感觉',
        '尝试用这个共振位置说 "你好，我是..."',
        '用手指轻触鼻梁两侧，应该能感到振动',
        '逐渐扩展到更长的句子和日常对话',
        '每次练习8-10分钟',
      ],
      en: [
        'Say "ma-me-mu", feeling vibration at lips and nasal area',
        'Sustain the "me" sound, maintaining forward resonance',
        'Try saying "Hello, I am..." with this resonance placement',
        'Lightly touch the sides of your nose bridge — you should feel vibration',
        'Gradually extend to longer sentences and daily conversation',
        'Practice 8-10 minutes per session',
      ],
    },
    tips: {
      zh: ['陈臻医生特别强调：不要挤喉咙来提高音高，而是通过共振位置变化来改变音色', '观察F2值——前置共振时F2通常更高', '结合音高练习效果更好'],
      en: ["Dr. Chen Zhen emphasizes: don't squeeze your throat to raise pitch, change timbre through resonance placement instead", 'Watch your F2 value — forward resonance typically shows higher F2', 'Combining with pitch exercises yields better results'],
    },
  },

  // === Articulation ===
  {
    id: 'lip-trills',
    category: 'articulation',
    difficulty: 'beginner',
    durationMinutes: 3,
    name: {
      zh: '唇颤音练习',
      en: 'Lip Trills',
    },
    description: {
      zh: '放松嘴唇和面部肌肉，热身声带',
      en: 'Relax lips and facial muscles, warm up vocal cords',
    },
    steps: {
      zh: [
        '放松嘴唇，做 "噗噗噗" 的唇颤音',
        '加入声音，让唇颤音有音高',
        '从低到高再回来做一次滑动',
        '保持面部放松',
        '持续2-3分钟',
      ],
      en: [
        'Relax your lips and do a "brrr" lip trill',
        'Add voice to the lip trill so it has pitch',
        'Do a pitch glide from low to high and back',
        'Keep your face relaxed',
        'Continue for 2-3 minutes',
      ],
    },
    tips: {
      zh: ['这是很好的热身练习', '如果做不出唇颤音，可以用手指轻托脸颊两侧', '不要用太大的气息'],
      en: ['This is an excellent warmup exercise', "If you can't do lip trills, lightly support your cheeks with your fingers", "Don't use too much air pressure"],
    },
  },

  // === Intonation ===
  {
    id: 'sentence-intonation',
    category: 'intonation',
    difficulty: 'intermediate',
    durationMinutes: 10,
    name: {
      zh: '句子语调练习',
      en: 'Sentence Intonation Practice',
    },
    description: {
      zh: '练习自然的语调模式，让说话听起来更生动有表现力',
      en: 'Practice natural intonation patterns for more expressive speech',
    },
    steps: {
      zh: [
        '读以下句子，注意音高的自然起伏：',
        '"今天天气真好。"（陈述句——音调平稳略降）',
        '"你吃饭了吗？"（疑问句——尾音上扬）',
        '"太棒了！"（感叹句——音调先升后降）',
        '录音并用 AI 分析功能检查你的语调模式',
        '尝试夸张表达，然后逐渐调整到自然程度',
      ],
      en: [
        'Read the following sentences, paying attention to natural pitch contours:',
        '"The weather is nice today." (Statement — pitch slightly falls)',
        '"Have you eaten yet?" (Question — pitch rises at the end)',
        '"That\'s amazing!" (Exclamation — pitch rises then falls)',
        'Record and use the AI analysis to check your intonation patterns',
        'Try exaggerated expression first, then gradually adjust to natural levels',
      ],
    },
    tips: {
      zh: ['用 VoiceHUD 观察你说话时的音高变化', '每种句型的语调模式都是不同的', '用AI分析可以获得更详细的反馈'],
      en: ['Use VoiceHUD to observe pitch changes while speaking', 'Each sentence type has a different intonation pattern', 'AI analysis can provide more detailed feedback'],
    },
  },
]

export function getExercisesByCategory(category: Exercise['category']): Exercise[] {
  return exercises.filter((e) => e.category === category)
}

export function getExercisesByDifficulty(difficulty: Exercise['difficulty']): Exercise[] {
  return exercises.filter((e) => e.difficulty === difficulty)
}
