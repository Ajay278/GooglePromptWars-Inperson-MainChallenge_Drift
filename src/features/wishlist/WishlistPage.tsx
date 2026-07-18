import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Plus, X, Star, Edit3, Check } from 'lucide-react'
import { getFutureSelf, setFutureSelf } from '@/store'
import type { FutureSelfProfile } from '@/types'

const SUGGESTIONS = [
  'Read 30 books',
  'Run a marathon',
  'Learn to cook',
  'Write a blog',
  'Meditate daily',
  'Learn a language',
  'Volunteer weekly',
  'Digital minimalism'
]

export default function WishlistPage() {
  const [profile, setProfile] = useState<FutureSelfProfile | null>(null)
  const [isEditingIdentity, setIsEditingIdentity] = useState(false)
  const [identityInput, setIdentityInput] = useState('')
  const [isAddingAspiration, setIsAddingAspiration] = useState(false)
  const [aspirationInput, setAspirationInput] = useState('')

  useEffect(() => {
    const data = getFutureSelf()
    if (data) {
      setProfile(data)
      setIdentityInput(data.identity || 'I want to be someone who...')
    }
  }, [])

  const updateProfile = (updates: Partial<FutureSelfProfile>) => {
    if (!profile) return
    const updated = { ...profile, ...updates }
    setProfile(updated)
    setFutureSelf(updated)
  }

  const saveIdentity = () => {
    updateProfile({ identity: identityInput })
    setIsEditingIdentity(false)
  }

  const addAspiration = (text: string) => {
    if (!text.trim() || !profile) return
    updateProfile({ aspirations: [...profile.aspirations, text.trim()] })
    setAspirationInput('')
    setIsAddingAspiration(false)
  }

  const removeAspiration = (index: number) => {
    if (!profile) return
    const newAspirations = [...profile.aspirations]
    newAspirations.splice(index, 1)
    updateProfile({ aspirations: newAspirations })
  }

  if (!profile) return null

  return (
    <motion.div
      className="page min-h-screen p-4 pb-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <header className="mb-10 text-center mt-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Zap className="text-purple-400 w-8 h-8" />
          <h1 className="text-3xl font-bold gradient-text">Future Self</h1>
        </div>
        <p className="text-text-secondary">Define the person you want to become</p>
      </header>

      <section className="mb-12">
        <div className="glass-strong rounded-2xl p-6 relative overflow-hidden group shadow-[0_0_20px_rgba(168,85,247,0.15)] border-purple-500/30">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent pointer-events-none" />
          
          {isEditingIdentity ? (
            <div className="flex flex-col gap-4 relative z-10">
              <textarea 
                value={identityInput}
                onChange={(e) => setIdentityInput(e.target.value)}
                className="input min-h-[120px] text-lg italic text-text-primary resize-none bg-drift-900/50"
                autoFocus
              />
              <div className="flex justify-end">
                <button onClick={saveIdentity} className="btn-primary py-2 px-6 flex items-center gap-2">
                  <Check className="w-5 h-5" /> Save
                </button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 flex justify-between items-start gap-4">
              <p className="text-2xl italic text-text-primary font-medium leading-relaxed">
                "{profile.identity || 'I want to be someone who...'}"
              </p>
              <button onClick={() => setIsEditingIdentity(true)} className="btn-ghost p-2.5 flex-shrink-0 bg-white/5 rounded-full hover:bg-white/10" aria-label="Edit Identity">
                <Edit3 className="w-5 h-5 text-purple-300" />
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-xl font-semibold text-text-primary mb-5 flex items-center gap-2">
          <Star className="w-6 h-6 text-purple-400" />
          Aspirations
        </h2>
        
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {profile.aspirations.map((asp, idx) => (
              <motion.div
                key={asp + idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-xl p-4 flex justify-between items-center group border border-white/5"
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <Star className="w-5 h-5 text-purple-400/70 flex-shrink-0" />
                  <span className="text-text-primary text-lg truncate">{asp}</span>
                </div>
                <button onClick={() => removeAspiration(idx)} className="text-text-muted hover:text-red-400 transition-colors p-2 flex-shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {isAddingAspiration ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border-dashed border-2 border-purple-500/40 rounded-xl p-3 flex gap-3 items-center bg-purple-500/5"
            >
              <input
                type="text"
                value={aspirationInput}
                onChange={e => setAspirationInput(e.target.value)}
                placeholder="New aspiration..."
                className="input flex-1 bg-transparent border-none focus:ring-0 px-3 py-2 text-lg h-auto"
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter') addAspiration(aspirationInput) }}
              />
              <button onClick={() => addAspiration(aspirationInput)} className="bg-purple-500/20 text-purple-400 p-2.5 rounded-xl hover:bg-purple-500/30 transition-colors">
                <Check className="w-5 h-5" />
              </button>
              <button onClick={() => setIsAddingAspiration(false)} className="bg-white/5 text-text-muted p-2.5 rounded-xl hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          ) : (
            <button
              onClick={() => setIsAddingAspiration(true)}
              className="glass border-dashed border-2 border-white/10 hover:border-purple-500/40 rounded-xl p-5 flex items-center justify-center gap-3 text-text-muted hover:text-purple-400 transition-all bg-white/5"
            >
              <Plus className="w-6 h-6" />
              <span className="text-lg">Add Aspiration</span>
            </button>
          )}
        </div>
      </section>

      <section>
        <p className="text-sm text-text-secondary mb-4 uppercase tracking-wider font-semibold">Need ideas?</p>
        <div className="flex flex-wrap gap-3">
          {SUGGESTIONS.filter(s => !profile.aspirations.includes(s)).map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => addAspiration(suggestion)}
              className="chip py-2 px-4 text-sm hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/30 transition-all"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </section>
    </motion.div>
  )
}
