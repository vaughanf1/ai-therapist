import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronRight, 
  ChevronLeft,
  Heart,
  Brain,
  Target,
  MessageCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react'

interface AssessmentData {
  currentMood: number
  primaryGoals: string[]
  stressLevel: number
  previousTherapy: string
  communicationStyle: string
  sessionFrequency: string
  specificConcerns: string[]
  supportPreference: string
}

interface OnboardingAssessmentProps {
  onComplete: (data: AssessmentData) => void
  onSkip: () => void
}

export function OnboardingAssessment({ onComplete, onSkip }: OnboardingAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    currentMood: 5,
    primaryGoals: [],
    stressLevel: 5,
    previousTherapy: '',
    communicationStyle: '',
    sessionFrequency: '',
    specificConcerns: [],
    supportPreference: ''
  })

  const questions = [
    {
      id: 'mood',
      title: 'How are you feeling today?',
      subtitle: 'This helps me understand your current emotional state',
      type: 'scale',
      icon: Heart,
      scaleLabel: ['Very Low', 'Low', 'Okay', 'Good', 'Great'],
      key: 'currentMood'
    },
    {
      id: 'goals',
      title: 'What would you like to focus on?',
      subtitle: 'Select all that apply - we can always adjust these later',
      type: 'multiselect',
      icon: Target,
      options: [
        { value: 'anxiety', label: 'Managing anxiety and worry' },
        { value: 'depression', label: 'Improving mood and motivation' },
        { value: 'stress', label: 'Reducing stress and overwhelm' },
        { value: 'relationships', label: 'Better relationships and communication' },
        { value: 'self-esteem', label: 'Building confidence and self-worth' },
        { value: 'trauma', label: 'Processing difficult experiences' },
        { value: 'life-changes', label: 'Navigating major life changes' },
        { value: 'habits', label: 'Creating healthier habits' }
      ],
      key: 'primaryGoals'
    },
    {
      id: 'stress',
      title: 'What\'s your current stress level?',
      subtitle: 'On a scale of 1-10, how stressed have you been feeling lately?',
      type: 'scale',
      icon: Brain,
      scaleLabel: ['Very Calm', 'Calm', 'Moderate', 'High', 'Very High'],
      key: 'stressLevel'
    },
    {
      id: 'experience',
      title: 'Have you tried therapy before?',
      subtitle: 'This helps me understand your comfort level with therapeutic conversations',
      type: 'select',
      icon: MessageCircle,
      options: [
        { value: 'never', label: 'No, this is my first time' },
        { value: 'some', label: 'Yes, I\'ve had some therapy experience' },
        { value: 'extensive', label: 'Yes, I\'ve had extensive therapy experience' },
        { value: 'prefer-not-say', label: 'I\'d prefer not to say' }
      ],
      key: 'previousTherapy'
    },
    {
      id: 'communication',
      title: 'How do you prefer to communicate?',
      subtitle: 'This helps me match your communication style',
      type: 'select',
      icon: MessageCircle,
      options: [
        { value: 'direct', label: 'Direct and straightforward' },
        { value: 'gentle', label: 'Gentle and encouraging' },
        { value: 'analytical', label: 'Analytical and structured' },
        { value: 'creative', label: 'Creative and exploratory' }
      ],
      key: 'communicationStyle'
    },
    {
      id: 'concerns',
      title: 'Any specific areas you\'d like extra support with?',
      subtitle: 'Optional - select any that feel relevant to you',
      type: 'multiselect',
      icon: HelpCircle,
      options: [
        { value: 'sleep', label: 'Sleep difficulties' },
        { value: 'work', label: 'Work or school stress' },
        { value: 'family', label: 'Family relationships' },
        { value: 'social', label: 'Social situations and friendships' },
        { value: 'grief', label: 'Loss and grief' },
        { value: 'addiction', label: 'Addictive behaviors' },
        { value: 'body-image', label: 'Body image and eating' },
        { value: 'identity', label: 'Identity and life purpose' }
      ],
      key: 'specificConcerns',
      optional: true
    }
  ]

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1

  const handleAnswer = (key: string, value: any) => {
    setAssessmentData(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleNext = () => {
    if (isLastStep) {
      onComplete(assessmentData)
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const isAnswered = () => {
    const value = assessmentData[currentQuestion.key as keyof AssessmentData]
    if (currentQuestion.optional) return true
    if (currentQuestion.type === 'multiselect') {
      return Array.isArray(value) && value.length > 0
    }
    return value !== '' && value !== 0 && value !== 5 // 5 is default for scales
  }

  const ScaleInput = ({ question }: { question: any }) => (
    <div className="space-y-6">
      <div className="space-y-4">
        <input
          type="range"
          min="1"
          max="10"
          value={assessmentData[question.key as keyof AssessmentData] as number}
          onChange={(e) => handleAnswer(question.key, parseInt(e.target.value))}
          className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-neutral-500">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
      <div className="text-center">
        <div className="inline-flex items-center px-4 py-2 bg-primary/10 rounded-full">
          <span className="text-lg font-medium text-primary">
            {assessmentData[question.key as keyof AssessmentData]}
          </span>
          <span className="ml-2 text-sm text-neutral-600">
            {question.scaleLabel[Math.min(Math.floor((assessmentData[question.key as keyof AssessmentData] as number - 1) / 2), question.scaleLabel.length - 1)]}
          </span>
        </div>
      </div>
    </div>
  )

  const SelectInput = ({ question }: { question: any }) => (
    <div className="space-y-3">
      {question.options.map((option: any) => (
        <motion.button
          key={option.value}
          onClick={() => handleAnswer(question.key, option.value)}
          className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
            assessmentData[question.key as keyof AssessmentData] === option.value
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium">{option.label}</span>
            {assessmentData[question.key as keyof AssessmentData] === option.value && (
              <CheckCircle className="w-5 h-5 text-primary" />
            )}
          </div>
        </motion.button>
      ))}
    </div>
  )

  const MultiSelectInput = ({ question }: { question: any }) => {
    const selectedValues = (assessmentData[question.key as keyof AssessmentData] as string[]) || []
    
    return (
      <div className="space-y-3">
        {question.options.map((option: any) => (
          <motion.button
            key={option.value}
            onClick={() => {
              const newValues = selectedValues.includes(option.value)
                ? selectedValues.filter(v => v !== option.value)
                : [...selectedValues, option.value]
              handleAnswer(question.key, newValues)
            }}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
              selectedValues.includes(option.value)
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{option.label}</span>
              {selectedValues.includes(option.value) && (
                <CheckCircle className="w-5 h-5 text-primary" />
              )}
            </div>
          </motion.button>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-cozy via-white to-cozy/50">
      {/* Header */}
      <div className="p-6 border-b border-white/20 bg-white/30 backdrop-blur-sm">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <currentQuestion.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-neutral-800">Getting to know you</h1>
              <p className="text-sm text-neutral-600">
                Step {currentStep + 1} of {questions.length}
              </p>
            </div>
          </div>
          
          <button
            onClick={onSkip}
            className="text-sm text-neutral-500 hover:text-neutral-700 underline"
          >
            Skip for now
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="max-w-2xl mx-auto mt-4">
          <div className="w-full bg-neutral-200 rounded-full h-1">
            <motion.div
              className="h-1 bg-primary rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <h2 className="text-2xl font-light text-neutral-800">
                  {currentQuestion.title}
                </h2>
                <p className="text-neutral-600">
                  {currentQuestion.subtitle}
                </p>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-soft">
                {currentQuestion.type === 'scale' && <ScaleInput question={currentQuestion} />}
                {currentQuestion.type === 'select' && <SelectInput question={currentQuestion} />}
                {currentQuestion.type === 'multiselect' && <MultiSelectInput question={currentQuestion} />}
              </div>

              {/* Help text */}
              <div className="text-center">
                <button className="text-sm text-neutral-500 hover:text-neutral-700 underline flex items-center justify-center space-x-1">
                  <HelpCircle className="w-4 h-4" />
                  <span>I don't understand this question</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-white/20 bg-white/30 backdrop-blur-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              currentStep === 0
                ? 'text-neutral-400 cursor-not-allowed'
                : 'text-neutral-600 hover:bg-white/50 hover:text-neutral-800'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered()}
            className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              isAnswered()
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            <span>{isLastStep ? 'Complete Assessment' : 'Continue'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}