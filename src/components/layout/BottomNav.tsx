import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Brain, TreePine, BookOpen, Zap } from 'lucide-react'

const navItems = [
  { id: 'dashboard', path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'coach', path: '/coach', icon: Brain, label: 'Coach' },
  { id: 'activities', path: '/activities', icon: TreePine, label: 'Activities' },
  { id: 'reflection', path: '/reflection', icon: BookOpen, label: 'Reflect' },
  { id: 'wishlist', path: '/wishlist', icon: Zap, label: 'Wishlist' }
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path)
          const Icon = item.icon

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className="relative flex flex-col items-center justify-center w-16 h-full gap-1"
            >
              <div className={`transition-colors duration-200 ${isActive ? 'text-purple-400' : 'text-text-muted'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${isActive ? 'text-purple-400' : 'text-text-muted'}`}>
                {item.label}
              </span>
              
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute bottom-1 w-1 h-1 bg-purple-400 rounded-full"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
