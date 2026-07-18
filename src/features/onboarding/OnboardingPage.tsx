import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, Sparkles, Target, Brain, Heart, Star } from 'lucide-react'
import type { BehaviorProfile, FutureSelfProfile, GoalType, DistractionType, TriggerType, CoachingStyle } from '@/types'
import { setUser, setBehaviorProfile, setFutureSelf, generateId } from '@/store'

const GOALS: { id: GoalType; label: string; icon: string }[] = [
  { id: 'focus' as GoalType, label: 'Deep Focus', icon: '🎯' },
  { id: 'sleep' as GoalType, label: 'Better Sleep', icon: '😴' },
  { id: 'fitness' as GoalType, label: 'Get Fit', icon: '💪' },
  { id: 'reading' as GoalType, label: 'Read More', icon: '📚' },
  { id: 'family' as GoalType, label: 'Family Time', icon: '👨‍👩‍👧' },
  { id: 'creativity' as GoalType, label: 'Create More', icon: '🎨' },
  { id: 'productivity' as GoalType, label: 'Productivity', icon: '⚡' },
  { id: 'mindfulness' as GoalType, label: 'Mindfulness', icon: '🧘' },
]

const DISTRACTIONS: { id: DistractionType; label: string; icon: string }[] = [
  { id: 'social_media' as DistractionType, label: 'Social Media', icon: '📱' },
  { id: 'youtube' as DistractionType, label: 'YouTube', icon: '▶️' },
  { id: 'news' as DistractionType, label: 'News', icon: '📰' },
  { id: 'gaming' as DistractionType, label: 'Gaming', icon: '🎮' },
  { id: 'messaging' as DistractionType, label: 'Messaging', icon: '💬' },
  { id: 'email' as DistractionType, label: 'Email', icon: '📧' },
  { id: 'shopping' as DistractionType, label: 'Shopping', icon: '🛒' },
  { id: 'doomscrolling' as DistractionType, label: 'Doomscrolling', icon: '🔄' },
]

const TRIGGERS: { id: TriggerType; label: string; icon: string }[] = [
  { id: 'stress' as TriggerType, label: 'Stress', icon: '😫' },
  { id: 'boredom' as TriggerType, label: 'Boredom', icon: '🥱' },
  { id: 'loneliness' as TriggerType, label: 'Loneliness', icon: '🥺' },
  { id: 'fatigue' as TriggerType, label: 'Fatigue', icon: '😩' },
  { id: 'anxiety' as TriggerType, label: 'Anxiety', icon: '😰' },
  { id: 'procrastination' as TriggerType, label: 'Procrastination', icon: '⏳' },
  { id: 'habit' as TriggerType, label: 'Habit', icon: '🔄' },
  { id: 'fomo' as TriggerType, label: 'FOMO', icon: '👀' },
]

const COACHING_STYLES: { id: CoachingStyle; label: string; desc: string; icon: string }[] = [
  { id: 'gentle' as CoachingStyle, label: 'Gentle', desc: 'Soft reminders and encouragement', icon: '🌊' },
  { id: 'direct' as CoachingStyle, label: 'Direct', desc: 'Clear, actionable advice', icon: '⚡' },
  { id: 'motivational' as CoachingStyle, label: 'Motivational', desc: 'Inspiring and energizing', icon: '🔥' },
  { id: 'analytical' as CoachingStyle, label: 'Analytical', desc: 'Data-driven insights', icon: '📊' },
]

const ASPIRATIONS = [
  'Read 20 books', 'Get fit', 'More family time', 'Learn an instrument', 
  'Sleep better', 'Build side projects', 'Travel more', 'Practice mindfulness'
]

export default function OnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  
  // Form State
  const [name, setName] = useState('')
  const [primaryGoal, setPrimaryGoal] = useState<GoalType | null>(null)
  const [distractions, setDistractions] = useState<DistractionType[]>([])
  const [triggers, setTriggers] = useState<TriggerType[]>([])
  const [coachingStyle, setCoachingStyle] = useState<CoachingStyle | null>(null)
  const [identityStatement, setIdentityStatement] = useState('')
  const [aspirations, setAspirations] = useState<string[]>([])

  const nextStep = () => setStep((s) => Math.min(s + 1, 4))
  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleComplete = () => {
    const userId = generateId()
    
    // Save user
    setUser({ id: userId, name, createdAt: new Date().toISOString(), onboardingComplete: true })
    
    // Save behavior profile
    setBehaviorProfile({
      primaryGoal: primaryGoal as GoalType,
      distractions,
      triggers,
      coachingStyle: coachingStyle as CoachingStyle,
      dailyRoutine: '',
    })
    
    // Save future self
    setFutureSelf({
      identity: identityStatement,
      aspirations,
    })
    
    navigate('/dashboard')
  }

  const toggleArrayItem = <T,>(arr: T[], setArr: (val: T[]) => void, item: T) => {
    if (arr.includes(item)) {
      setArr(arr.filter((i) => i !== item))
    } else {
      setArr([...arr, item])
    }
  }

  const stepVariants = {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  return (
    <motion.div
      className="page flex flex-col justify-between p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex-1 w-full max-w-md mx-auto flex flex-col pt-8">
        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 w-2 rounded-full transition-colors ${
                step === i ? 'bg-purple-500' : 'bg-drift-800'
              }`}
            />
          ))}
        </div>

        {/* Back Button */}
        {step > 1 && (
          <button onClick={prevStep} className="btn-ghost self-start mb-6 -ml-2 text-text-secondary flex items-center gap-2">
            <ArrowLeft className="w-5 h-5" /> Back
          </button>
        )}

        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center gap-8 pt-10"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-3xl glass-strong flex items-center justify-center bg-drift-800">
                    <Sparkles className="w-10 h-10 text-purple-400" />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight">
                    <span className="gradient-text">DRIFT</span>
                  </h1>
                  <p className="text-text-secondary text-lg">Reclaim your attention. Rediscover life.</p>
                </div>
                
                <div className="w-full mt-8 flex flex-col gap-4 text-left">
                  <label className="text-sm font-medium text-text-secondary px-1">What should we call you?</label>
                  <input
                    type="text"
                    className="input w-full text-lg p-4"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                  <button 
                    onClick={nextStep}
                    disabled={!name.trim()}
                    className="btn-primary w-full mt-4 p-4 text-lg font-medium flex items-center justify-center gap-2"
                  >
                    Get Started <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-8 pb-20"
              >
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">What would you like to focus on?</h2>
                  <div className="flex flex-wrap gap-3">
                    {GOALS.map((g) => (
                      <button
                        key={g.id}
                        onClick={() => setPrimaryGoal(g.id)}
                        className={`chip ${primaryGoal === g.id ? 'chip-selected' : ''}`}
                      >
                        {g.icon} {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  <h2 className="text-2xl font-bold">What pulls your attention away?</h2>
                  <div className="flex flex-wrap gap-3">
                    {DISTRACTIONS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => toggleArrayItem(distractions, setDistractions, d.id)}
                        className={`chip ${distractions.includes(d.id) ? 'chip-selected' : ''}`}
                      >
                        {d.icon} {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={!primaryGoal || distractions.length === 0}
                  className="btn-primary w-full mt-8 p-4 text-lg font-medium flex items-center justify-center gap-2 fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[calc(100%-3rem)] md:relative md:bottom-auto md:left-auto md:translate-x-0 md:max-w-none z-10"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-8 pb-20"
              >
                <div className="flex flex-col gap-4">
                  <h2 className="text-2xl font-bold">When do you reach for your phone?</h2>
                  <div className="flex flex-wrap gap-3">
                    {TRIGGERS.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => toggleArrayItem(triggers, setTriggers, t.id)}
                        className={`chip ${triggers.includes(t.id) ? 'chip-selected' : ''}`}
                      >
                        {t.icon} {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-4">
                  <h2 className="text-2xl font-bold">How should DRIFT coach you?</h2>
                  <div className="grid grid-cols-1 gap-4">
                    {COACHING_STYLES.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setCoachingStyle(c.id)}
                        className={`glass p-4 rounded-2xl flex items-start gap-4 text-left border-2 transition-colors ${
                          coachingStyle === c.id ? 'border-purple-500 bg-drift-800' : 'border-transparent hover:border-drift-700'
                        }`}
                      >
                        <span className="text-2xl">{c.icon}</span>
                        <div>
                          <h3 className="font-semibold text-text-primary text-lg">{c.label}</h3>
                          <p className="text-text-secondary text-sm mt-1">{c.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={nextStep}
                  disabled={triggers.length === 0 || !coachingStyle}
                  className="btn-primary w-full mt-8 p-4 text-lg font-medium flex items-center justify-center gap-2 fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[calc(100%-3rem)] md:relative md:bottom-auto md:left-auto md:translate-x-0 md:max-w-none z-10"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-8 pb-20"
              >
                <div className="flex flex-col gap-4">
                  <h2 className="text-3xl font-bold leading-tight">Who do you want to become?</h2>
                  <p className="text-text-secondary">Define your future self. We'll help you get there.</p>
                  
                  <textarea
                    className="input w-full p-4 mt-2 min-h-[120px] resize-none"
                    placeholder="I want to be someone who..."
                    value={identityStatement}
                    onChange={(e) => setIdentityStatement(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-4 mt-2">
                  <label className="text-sm font-medium text-text-secondary px-1">Select your aspirations</label>
                  <div className="flex flex-wrap gap-3">
                    {ASPIRATIONS.map((aspiration) => (
                      <button
                        key={aspiration}
                        onClick={() => toggleArrayItem(aspirations, setAspirations, aspiration)}
                        className={`chip ${aspirations.includes(aspiration) ? 'chip-selected' : ''}`}
                      >
                        {aspiration}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleComplete}
                  disabled={!identityStatement.trim() || aspirations.length === 0}
                  className="btn-primary w-full mt-8 p-4 text-lg font-medium flex items-center justify-center gap-2 fixed bottom-6 left-1/2 -translate-x-1/2 max-w-[calc(100%-3rem)] md:relative md:bottom-auto md:left-auto md:translate-x-0 md:max-w-none z-10"
                >
                  Begin Your Journey <Sparkles className="w-5 h-5" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
