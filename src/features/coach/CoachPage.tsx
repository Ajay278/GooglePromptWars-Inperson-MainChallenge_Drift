import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, MessageCircle, CheckCircle, X, Sparkles, Loader2 } from 'lucide-react'
import { getCoachingResponse } from '@/engines/ai'
import { getBehaviorProfile, getFutureSelf, getLatestDrift, getLatestMood, addIntervention } from '@/store'
import type { TriggerType, CoachingResponse } from '@/types'

const TRIGGERS: { id: TriggerType; label: string; icon: string }[] = [
  { id: 'stress', label: 'Stressed', icon: '😤' },
  { id: 'boredom', label: 'Bored', icon: '😑' },
  { id: 'loneliness', label: 'Lonely', icon: '😢' },
  { id: 'fatigue', label: 'Tired', icon: '😩' },
  { id: 'anxiety', label: 'Anxious', icon: '😰' },
  { id: 'procrastination', label: 'Procrastinating', icon: '🦥' },
  { id: 'habit', label: 'Habitual', icon: '🔄' },
  { id: 'fomo', label: 'FOMO', icon: '📱' },
]

export default function CoachPage() {
  const [response, setResponse] = useState<CoachingResponse | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'coaching' | 'accepted' | 'dismissed'>('idle')

  const handleTriggerSelect = async (triggerId: TriggerType) => {
    setStatus('loading')
    try {
      const profile = getBehaviorProfile()
      const futureSelf = getFutureSelf()
      const drift = getLatestDrift()
      const mood = getLatestMood()

      const result = await getCoachingResponse(profile, futureSelf, drift, mood, triggerId)
      setResponse(result)
      setStatus('coaching')
    } catch (error) {
      console.error(error)
      setStatus('idle')
    }
  }

  const handleAccept = () => {
    if (response) {
      addIntervention({
        trigger: response.trigger as TriggerType,
        need: response.need,
        replacement: response.replacement,
        action: response.action,
        aiMessage: response.message,
        accepted: true,
        completed: false,
      })
      setStatus('accepted')
    }
  }

  const handleDismiss = () => {
    if (response) {
      addIntervention({
        trigger: response.trigger as TriggerType,
        need: response.need,
        replacement: response.replacement,
        action: response.action,
        aiMessage: response.message,
        accepted: false,
        completed: false,
      })
      setStatus('dismissed')
    }
  }

  const reset = () => {
    setResponse(null)
    setStatus('idle')
  }

  return (
    <motion.div
      className="page min-h-screen p-4 pb-24 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
          <Brain size={28} />
        </div>
        <h1 className="text-3xl font-bold gradient-text">AI Coach</h1>
      </header>

      <AnimatePresence mode="wait">
        {status === 'idle' && (
          <motion.div key="triggers" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
            <h2 className="text-lg font-medium text-text-primary">What are you feeling right now?</h2>
            <div className="grid grid-cols-2 gap-3">
              {TRIGGERS.map((t) => (
                <button key={t.id} onClick={() => handleTriggerSelect(t.id)} className="glass flex items-center justify-start gap-3 p-4 hover:bg-white/10 transition-colors rounded-2xl">
                  <span className="text-2xl">{t.icon}</span>
                  <span className="font-medium text-text-primary">{t.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {status === 'loading' && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 space-y-4">
            <Loader2 className="animate-spin text-purple-400" size={40} />
            <p className="text-text-secondary animate-pulse">Your coach is thinking...</p>
          </motion.div>
        )}

        {status === 'coaching' && response && (
          <motion.div key="coaching" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="glass-strong glow-purple p-6 rounded-3xl space-y-6">
            <div className="flex gap-4 items-start">
              <div className="p-2 bg-purple-500/20 rounded-full text-purple-400 shrink-0 mt-1"><Sparkles size={20} /></div>
              <p className="text-lg font-medium text-text-primary leading-relaxed">{response.message}</p>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-white/10">
              {[
                { label: 'Trigger', value: response.trigger, color: 'bg-rose-400 shadow-[0_0_10px_rgba(251,113,133,0.5)]' },
                { label: 'Underlying Need', value: response.need, color: 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]' },
                { label: 'Replacement', value: response.replacement, color: 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]' },
                { label: 'Suggested Action', value: response.action, color: 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' },
              ].map(({ label, value, color }) => (
                <div key={label} className="relative">
                  <div className={`absolute -left-[27px] top-1.5 w-3 h-3 rounded-full ${color}`} />
                  <div className="text-sm text-text-secondary mb-1">{label}</div>
                  <div className="text-text-primary font-medium">{value}</div>
                </div>
              ))}
            </div>

            {response.futureReference && (
              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                <p className="italic text-purple-400 text-sm">"{response.futureReference}"</p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button onClick={handleAccept} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 rounded-xl">
                <CheckCircle size={18} /> I'll Try This
              </button>
              <button onClick={handleDismiss} className="btn-ghost flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10">
                <X size={18} /> Not Now
              </button>
            </div>
          </motion.div>
        )}

        {(status === 'accepted' || status === 'dismissed') && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
            {status === 'accepted' ? (
              <>
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-2"><CheckCircle size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Great choice!</h3>
                  <p className="text-text-secondary">Your future self will thank you for taking this step.</p>
                </div>
              </>
            ) : (
              <>
                <div className="w-16 h-16 bg-white/10 text-text-secondary rounded-full flex items-center justify-center mb-2"><MessageCircle size={32} /></div>
                <div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">No pressure.</h3>
                  <p className="text-text-secondary">We're here whenever you're ready to break the cycle.</p>
                </div>
              </>
            )}
            <button onClick={reset} className="btn-ghost mt-8 py-3 px-6 rounded-xl border border-white/10 flex items-center gap-2">
              <Brain size={18} /> Talk to Coach Again
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
