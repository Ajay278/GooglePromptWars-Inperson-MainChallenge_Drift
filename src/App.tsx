/* ═══════════════════════════════════════════════════════════════
   DRIFT App — Main Router & Layout
   ═══════════════════════════════════════════════════════════════ */

import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { isOnboarded } from '@/store'
import OnboardingPage from '@/features/onboarding/OnboardingPage'
import DashboardPage from '@/features/dashboard/DashboardPage'
import CoachPage from '@/features/coach/CoachPage'
import ActivitiesPage from '@/features/activities/ActivitiesPage'
import ReflectionPage from '@/features/reflection/ReflectionPage'
import WishlistPage from '@/features/wishlist/WishlistPage'
import BottomNav from '@/components/layout/BottomNav'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isOnboarded()) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

export default function App() {
  const location = useLocation()
  const showNav = isOnboarded() && location.pathname !== '/onboarding'

  return (
    <>
      {/* Background orbs for ambient effect */}
      <div className="bg-orb bg-orb-purple" />
      <div className="bg-orb bg-orb-cyan" />

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/coach"
            element={
              <ProtectedRoute>
                <CoachPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activities"
            element={
              <ProtectedRoute>
                <ActivitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reflection"
            element={
              <ProtectedRoute>
                <ReflectionPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <WishlistPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <Navigate to={isOnboarded() ? '/dashboard' : '/onboarding'} replace />
            }
          />
        </Routes>
      </AnimatePresence>

      {showNav && <BottomNav />}
    </>
  )
}
