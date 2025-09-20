import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { VoiceInterface } from './components/VoiceInterface'
import { ProgressCards } from './components/ProgressCards'
import { SessionHistory } from './components/SessionHistory'
import { Settings } from './components/Settings'
import { OnboardingAssessment } from './components/OnboardingAssessment'
import { Header } from './components/Header'
import { Session, ProgressCard, AssessmentData } from './types'

type View = 'therapy' | 'progress' | 'history' | 'settings' | 'assessment'

function App() {
  const [currentView, setCurrentView] = useState<View>('therapy')
  const [currentSession, setCurrentSession] = useState<Session | null>(null)
  const [progressCards, setProgressCards] = useState<ProgressCard[]>([])
  const [assessmentData, setAssessmentData] = useState<AssessmentData | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)

  // Check if user has completed assessment on first visit
  useEffect(() => {
    const storedAssessment = localStorage.getItem('user_assessment')
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed')
    
    if (storedAssessment) {
      try {
        const parsed = JSON.parse(storedAssessment)
        setAssessmentData(parsed)
      } catch (error) {
        console.error('Error parsing stored assessment:', error)
      }
    }
    
    // Show onboarding if user hasn't seen it and hasn't explicitly skipped it
    if (!hasCompletedOnboarding && !storedAssessment) {
      setShowOnboarding(true)
      setCurrentView('assessment')
    }
  }, [])

  const handleAssessmentComplete = (data: AssessmentData) => {
    const completedData = { ...data, completedAt: new Date() }
    setAssessmentData(completedData)
    localStorage.setItem('user_assessment', JSON.stringify(completedData))
    localStorage.setItem('onboarding_completed', 'true')
    setShowOnboarding(false)
    setCurrentView('therapy')
  }

  const handleAssessmentSkip = () => {
    localStorage.setItem('onboarding_completed', 'true')
    setShowOnboarding(false)
    setCurrentView('therapy')
  }

  const handleSessionComplete = (session: Session) => {
    setCurrentSession(null)
    if (session.progressCards.length > 0) {
      setProgressCards(prev => [...prev, ...session.progressCards])
      setCurrentView('progress')
    }
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'assessment':
        return (
          <OnboardingAssessment
            onComplete={handleAssessmentComplete}
            onSkip={handleAssessmentSkip}
          />
        )
      case 'therapy':
        return (
          <VoiceInterface
            currentSession={currentSession}
            onSessionStart={setCurrentSession}
            onSessionComplete={handleSessionComplete}
            assessmentData={assessmentData}
          />
        )
      case 'progress':
        return <ProgressCards cards={progressCards} />
      case 'history':
        return <SessionHistory />
      case 'settings':
        return <Settings />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-neutral-50 to-cozy">
      {/* Hide header during assessment for immersive experience */}
      {currentView !== 'assessment' && (
        <Header currentView={currentView} onViewChange={setCurrentView} />
      )}
      
      <main className={currentView === 'therapy' || currentView === 'assessment' ? '' : 'container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl'}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App