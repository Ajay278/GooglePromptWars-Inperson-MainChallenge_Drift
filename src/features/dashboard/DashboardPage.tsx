import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, Activity, TreePine, Zap, RefreshCw, Star } from 'lucide-react'
import { calculateDriftScore, getDriftColor, getDriftLabel } from '@/engines/drift'
import { getDriftExplanation } from '@/engines/ai'
import { getUser, getBehaviorProfile, getFutureSelf, getLatestMood, addDriftSnapshot, addMoodCheckIn, getRewards } from '@/store'
import type { MoodType, EnergyType, DriftSnapshot, Reward } from '@/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const user = getUser()
  const [score, setScore] = useState(0)
  const [riskLabel, setRiskLabel] = useState('')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(true)
  const [moodDone, setMoodDone] = useState(true)
  const [latestReward, setLatestReward] = useState<Reward | null>(null)
  const [moodSelection, setMoodSelection] = useState<MoodType | null>(null)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const currentDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  }).format(new Date())

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const profile = getBehaviorProfile()
      const futureSelf = getFutureSelf()
      const latestMood = getLatestMood()
      const rewards = getRewards()

      const isMoodToday = latestMood && new Date(latestMood.timestamp).toDateString() === new Date().toDateString()
      setMoodDone(!!isMoodToday)

      if (rewards.length > 0) {
        setLatestReward(rewards[rewards.length - 1]!)
      }

      const driftResult = calculateDriftScore()
      setScore(driftResult.score)
      setRiskLabel(getDriftLabel(driftResult.riskLevel))

      const snap: Omit<DriftSnapshot, 'id' | 'timestamp'> = {
        score: driftResult.score,
        riskLevel: driftResult.riskLevel,
        factors: driftResult.factors,
      }
      const saved = addDriftSnapshot(snap)

      try {
        const exp = await getDriftExplanation(profile, futureSelf, saved)
        setExplanation(exp.explanation)
      } catch {
        setExplanation('Check in with your mood to get personalized insights about your attention drift.')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleMoodSubmit = async (mood: MoodType, energy: EnergyType) => {
    addMoodCheckIn({ mood, energy })
    setMoodDone(true)
    setMoodSelection(null)
    await loadData()
  }

  const circumference = 2 * Math.PI * 80
  const offset = circumference - (score / 100) * circumference
  const driftColor = getDriftColor(score)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      className="page p-4 pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {greeting()}, {user?.name || 'Explorer'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">{currentDate}</p>
        </div>
        <button onClick={loadData} className="btn-ghost p-2 rounded-full" aria-label="Refresh">
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-text-secondary' : 'text-text-primary'}`} />
        </button>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
        {/* Drift Score Card */}
        <motion.div variants={itemVariants} className="glass-strong rounded-3xl p-6 relative overflow-hidden glow-purple">
          <div className="flex flex-col items-center justify-center">
            <h2 className="text-lg font-semibold text-text-primary mb-4">Your Drift Score</h2>
            <div className="relative w-48 h-48 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="80" fill="transparent" strokeWidth="12" className="drift-gauge-track" />
                <circle
                  cx="100" cy="100" r="80" fill="transparent" strokeWidth="12" strokeLinecap="round"
                  stroke={driftColor}
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: loading ? circumference : offset,
                    transition: 'stroke-dashoffset 1.5s ease-out'
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-text-primary">{Math.round(score)}</span>
                <span className="text-sm font-medium mt-1" style={{ color: driftColor }}>{riskLabel}</span>
              </div>
            </div>
            <div className="mt-6 text-center text-text-secondary text-sm max-w-xs">
              {loading ? (
                <span className="animate-pulse">Analyzing your digital drift...</span>
              ) : (
                <p>{explanation}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Quick Mood Check */}
        {!moodDone && (
          <motion.div variants={itemVariants} className="glass rounded-2xl p-5">
            <h3 className="text-text-primary font-medium mb-4">How are you feeling?</h3>
            {!moodSelection ? (
              <div className="flex justify-between">
                {([
                  { m: 'great' as MoodType, emoji: '😊' },
                  { m: 'good' as MoodType, emoji: '🙂' },
                  { m: 'okay' as MoodType, emoji: '😐' },
                  { m: 'low' as MoodType, emoji: '😔' },
                  { m: 'stressed' as MoodType, emoji: '😰' }
                ]).map(({ m, emoji }) => (
                  <button key={m} onClick={() => setMoodSelection(m)} className="text-3xl hover:scale-110 transition-transform">
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-text-secondary">And your energy level?</p>
                <div className="flex gap-3">
                  {([
                    { e: 'high' as EnergyType, emoji: '⚡', label: 'High' },
                    { e: 'medium' as EnergyType, emoji: '🔋', label: 'Medium' },
                    { e: 'low' as EnergyType, emoji: '🪫', label: 'Low' }
                  ]).map(({ e, emoji, label }) => (
                    <button
                      key={e}
                      onClick={() => handleMoodSubmit(moodSelection, e)}
                      className="flex-1 glass p-2 rounded-xl flex flex-col items-center gap-1 hover:bg-drift-800 transition-colors"
                    >
                      <span className="text-2xl">{emoji}</span>
                      <span className="text-xs text-text-secondary">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Action Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
          {[
            { to: '/coach', icon: Brain, label: 'AI Coach', desc: 'Get personalized guidance', color: 'purple' },
            { to: '/activities', icon: TreePine, label: 'Discover Offline', desc: 'Find real-world activities', color: 'cyan' },
            { to: '/reflection', icon: Activity, label: 'Weekly Reflection', desc: 'Review your progress', color: 'emerald' },
            { to: '/wishlist', icon: Zap, label: 'Future Self', desc: 'Your long-term goals', color: 'amber' },
          ].map(({ to, icon: Icon, label, desc, color }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="glass rounded-2xl p-4 flex flex-col items-start gap-3 hover:bg-drift-800 transition-colors text-left"
            >
              <div className={`p-2 rounded-full bg-${color}-500/20 text-${color}-400`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-text-primary font-medium">{label}</h4>
                <p className="text-xs text-text-secondary mt-1">{desc}</p>
              </div>
            </button>
          ))}
        </motion.div>

        {/* Latest Reward */}
        {latestReward && (
          <motion.div variants={itemVariants} className="glass rounded-2xl p-4 border border-drift-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-purple-500/10" />
            <div className="relative flex items-center gap-4">
              <div className="p-2 rounded-full bg-amber-500/20">
                <Star className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="text-text-primary font-medium text-sm">Latest Reward</h4>
                <p className="gradient-text-warm font-semibold text-sm mt-0.5">{latestReward.message}</p>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
