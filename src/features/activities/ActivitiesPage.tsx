import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TreePine, Heart, BookOpen, Palette, Users, Clock, CheckCircle, Sparkles, Filter } from 'lucide-react'
import { addOfflineActivity, getOfflineActivities, getBehaviorProfile, getFutureSelf, addReward } from '@/store'
import { getEmotionalReward } from '@/engines/ai'
import type { ActivityCategory, OfflineActivity } from '@/types'

const CATEGORIES = ['All', 'Health', 'Learning', 'Nature', 'Creativity', 'Relationships']

const PREPOPULATED: { category: ActivityCategory; name: string; duration: number; icon: string; description: string }[] = [
  { category: 'health', name: 'Morning Walk', duration: 20, icon: '🚶', description: 'A refreshing walk to start your day' },
  { category: 'health', name: 'Yoga Session', duration: 30, icon: '🧘', description: 'Stretch and breathe' },
  { category: 'health', name: 'Gym Workout', duration: 45, icon: '💪', description: 'Build strength and endurance' },
  { category: 'health', name: 'Stretching', duration: 10, icon: '🤸', description: 'Quick flexibility routine' },
  { category: 'learning', name: 'Read a Book', duration: 30, icon: '📖', description: 'Dive into a good read' },
  { category: 'learning', name: 'Listen to Podcast', duration: 20, icon: '🎧', description: 'Learn something new' },
  { category: 'learning', name: 'Online Course', duration: 45, icon: '🎓', description: 'Level up your skills' },
  { category: 'learning', name: 'Visit Library', duration: 60, icon: '📚', description: 'Explore new worlds' },
  { category: 'nature', name: 'Park Walk', duration: 30, icon: '🌳', description: 'Connect with nature' },
  { category: 'nature', name: 'Garden Time', duration: 20, icon: '🌱', description: 'Tend to your garden' },
  { category: 'nature', name: 'Bird Watching', duration: 30, icon: '🐦', description: 'Observe local wildlife' },
  { category: 'nature', name: 'Sunset Watch', duration: 15, icon: '🌅', description: 'Watch the sky change colors' },
  { category: 'creativity', name: 'Drawing/Sketching', duration: 30, icon: '✏️', description: 'Express yourself visually' },
  { category: 'creativity', name: 'Play Music', duration: 20, icon: '🎵', description: 'Make some music' },
  { category: 'creativity', name: 'Photography Walk', duration: 45, icon: '📸', description: 'Capture the world around you' },
  { category: 'creativity', name: 'Journaling', duration: 15, icon: '📝', description: 'Write down your thoughts' },
  { category: 'relationships', name: 'Call a Friend', duration: 15, icon: '📞', description: 'Catch up with someone' },
  { category: 'relationships', name: 'Family Dinner', duration: 60, icon: '🍽️', description: 'Share a meal together' },
  { category: 'relationships', name: 'Coffee with Friend', duration: 45, icon: '☕', description: 'Quality time over coffee' },
  { category: 'relationships', name: 'Board Game Night', duration: 60, icon: '🎲', description: 'Fun with friends and family' },
]

const getCategoryIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'health': return <Heart size={20} />
    case 'learning': return <BookOpen size={20} />
    case 'nature': return <TreePine size={20} />
    case 'creativity': return <Palette size={20} />
    case 'relationships': return <Users size={20} />
    default: return <Sparkles size={20} />
  }
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case 'health': return 'text-emerald-400 bg-emerald-400/10'
    case 'learning': return 'text-cyan-400 bg-cyan-400/10'
    case 'nature': return 'text-green-400 bg-green-400/10'
    case 'creativity': return 'text-purple-400 bg-purple-400/10'
    case 'relationships': return 'text-rose-400 bg-rose-400/10'
    default: return 'text-text-primary bg-white/10'
  }
}

export default function ActivitiesPage() {
  const [filter, setFilter] = useState('All')
  const [activities, setActivities] = useState<OfflineActivity[]>([])
  const [rewardToast, setRewardToast] = useState<string | null>(null)

  useEffect(() => {
    const stored = getOfflineActivities()
    if (stored.length > 0) {
      setActivities(stored)
    } else {
      const initial: OfflineActivity[] = PREPOPULATED.map((a, i) => ({
        id: `activity-${i}`,
        name: a.name,
        category: a.category,
        duration: a.duration,
        icon: a.icon,
        description: a.description,
      }))
      setActivities(initial)
      initial.forEach(a => addOfflineActivity(a))
    }
  }, [])

  const handleComplete = async (activity: OfflineActivity) => {
    const updated: OfflineActivity = { ...activity, completedAt: new Date().toISOString() }
    setActivities(prev => prev.map(a => a.id === activity.id ? updated : a))

    try {
      const profile = getBehaviorProfile()
      const futureSelf = getFutureSelf()
      const rewardMsg = await getEmotionalReward(profile, futureSelf, updated)
      addReward({ message: rewardMsg, type: 'daily' })
      setRewardToast(rewardMsg)
      setTimeout(() => setRewardToast(null), 4000)
    } catch (e) {
      const fallback = `You just invested ${activity.duration} minutes in real life. Amazing! 🌟`
      addReward({ message: fallback, type: 'daily' })
      setRewardToast(fallback)
      setTimeout(() => setRewardToast(null), 4000)
    }
  }

  const filtered = activities.filter(a => filter === 'All' || a.category === filter.toLowerCase())
  const pending = filtered.filter(a => !a.completedAt)
  const completed = filtered.filter(a => a.completedAt)

  return (
    <motion.div
      className="page min-h-screen p-4 pb-24 space-y-6 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400"><TreePine size={28} /></div>
        <h1 className="text-3xl font-bold gradient-text">Discover Offline</h1>
      </header>

      <div className="flex overflow-x-auto pb-2 -mx-4 px-4 gap-2">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-medium transition-colors ${
              filter === c
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-white/5 text-text-secondary hover:bg-white/10'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-medium text-text-secondary flex items-center gap-2"><Filter size={16} /> Suggestions</h2>
        {pending.length === 0 ? (
          <p className="text-text-secondary text-center py-8">All activities completed! 🎉</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <AnimatePresence>
              {pending.map(activity => (
                <motion.div
                  key={activity.id} layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass p-4 rounded-2xl flex items-center gap-4"
                >
                  <div className={`p-3 rounded-xl shrink-0 ${getCategoryColor(activity.category)}`}>
                    {getCategoryIcon(activity.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-text-primary truncate">{activity.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-text-secondary mt-1">
                      <Clock size={14} /><span>{activity.duration} min</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleComplete(activity)}
                    className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors"
                  >
                    <CheckCircle size={20} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {completed.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-white/5">
          <h2 className="text-sm font-medium text-text-secondary">Completed</h2>
          <div className="grid grid-cols-1 gap-3">
            {completed.map(activity => (
              <div key={activity.id} className="glass p-4 rounded-2xl flex items-center gap-4 opacity-60">
                <div className={`p-3 rounded-xl shrink-0 ${getCategoryColor(activity.category)}`}>
                  {getCategoryIcon(activity.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-secondary line-through truncate">{activity.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-text-secondary mt-1">
                    <Clock size={14} /><span>{activity.duration} min</span>
                  </div>
                </div>
                <div className="shrink-0 text-emerald-500"><CheckCircle size={24} /></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <AnimatePresence>
        {rewardToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-4 right-4 z-50 pointer-events-none"
          >
            <div className="glass-strong glow-purple p-4 rounded-2xl flex items-center gap-4 border border-purple-500/20 shadow-2xl">
              <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center text-purple-400 shrink-0">
                <Sparkles size={24} />
              </div>
              <p className="text-text-primary font-medium">{rewardToast}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
