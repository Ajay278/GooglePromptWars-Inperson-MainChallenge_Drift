import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Trophy, Eye, Target, Loader2, RefreshCw, Sparkles } from 'lucide-react'
import { getWeeklyReflection } from '@/engines/ai'
import { getBehaviorProfile, getFutureSelf, getDriftHistory, getOfflineActivities, getMoodHistory, addReflection, getReflections } from '@/store'
import type { ReflectionResponse } from '@/types'

export default function ReflectionPage() {
  const [reflection, setReflection] = useState<ReflectionResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadReflection = async () => {
      const allReflections = getReflections()
      const latest = allReflections.length > 0 ? allReflections[allReflections.length - 1] : null
      if (latest) {
        setReflection({ narrative: latest.narrative, wins: latest.wins, patterns: latest.patterns, nextFocus: latest.nextFocus })
      }
    }
    loadReflection()
  }, [])

  const generateReflection = async () => {
    setLoading(true)
    setError(null)
    try {
      const behavior = getBehaviorProfile()
      const future = getFutureSelf()
      const drift = getDriftHistory()
      const offline = getOfflineActivities()
      const mood = getMoodHistory()
      
      const res = await getWeeklyReflection(behavior, future, drift, offline, mood)
      if (res) {
        addReflection({ weekOf: new Date().toISOString(), ...res })
        setReflection(res)
      }
    } catch (err) {
      console.error(err)
      setError("Failed to generate reflection.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      className="page min-h-screen p-4 pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="mb-6 flex items-center justify-between mt-4">
        <div className="flex items-center gap-3">
          <BookOpen className="text-purple-400 w-8 h-8" />
          <h1 className="text-2xl font-bold gradient-text">Weekly Reflection</h1>
        </div>
        {reflection && !loading && (
          <button onClick={generateReflection} className="btn-ghost p-2" aria-label="Refresh">
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
      </header>

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-6">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Sparkles className="w-12 h-12 text-purple-400" />
          </motion.div>
          <p className="text-text-secondary animate-pulse text-lg">Crafting your reflection...</p>
        </div>
      )}

      {error && !loading && (
        <div className="glass p-4 rounded-xl text-red-400 text-center mb-6 border border-red-500/20 bg-red-500/5">
          {error}
        </div>
      )}

      {!loading && reflection && (
        <motion.div
          className="glass-strong rounded-2xl p-6 space-y-8 shadow-[0_0_15px_rgba(168,85,247,0.1)]"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <p className="text-text-primary text-lg leading-relaxed">
            {reflection.narrative}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-6 h-6 text-emerald-400" />
              <h2 className="text-xl font-semibold text-text-primary">Wins</h2>
            </div>
            <ul className="space-y-3">
              {reflection.wins.map((win, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-text-secondary leading-relaxed">{win}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-6 h-6 text-amber-400" />
              <h2 className="text-xl font-semibold text-text-primary">Patterns</h2>
            </div>
            <ul className="space-y-3">
              {reflection.patterns.map((pattern, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  </div>
                  <span className="text-text-secondary leading-relaxed">{pattern}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass border border-purple-500/30 rounded-xl p-5 bg-purple-500/5 shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-6 h-6 text-purple-400" />
              <h2 className="text-lg font-semibold text-purple-400">Next Focus</h2>
            </div>
            <p className="text-text-primary text-lg">{reflection.nextFocus}</p>
          </div>
        </motion.div>
      )}

      {!loading && !reflection && !error && (
        <div className="flex justify-center mt-24">
          <button onClick={generateReflection} className="btn-primary w-full max-w-xs py-4 text-lg">
            Generate My Reflection
          </button>
        </div>
      )}
    </motion.div>
  )
}
