export interface Session {
  id: string
  startTime: Date
  endTime?: Date
  duration?: number
  milestones: Milestone[]
  transcript: TranscriptEntry[]
  progressCards: ProgressCard[]
}

export interface Milestone {
  id: string
  type: MilestoneType
  title: string
  description: string
  achievedAt: Date
  severity?: 'low' | 'medium' | 'high'
}

export type MilestoneType = 
  | 'emotional_breakthrough'
  | 'self_awareness'
  | 'coping_strategy'
  | 'goal_setting'
  | 'anxiety_management'
  | 'communication_improvement'
  | 'confidence_building'
  | 'relationship_insight'
  | 'stress_relief'
  | 'mindfulness_practice'

export interface TranscriptEntry {
  id: string
  timestamp: Date
  speaker: 'user' | 'ai'
  content: string
  audioUrl?: string
  emotions?: EmotionAnalysis
}

export interface EmotionAnalysis {
  primary: string
  confidence: number
  secondary?: string
  intensity: number
}

export interface ProgressCard {
  id: string
  sessionId: string
  title: string
  description: string
  milestone: Milestone
  createdAt: Date
  color: string
  icon: string
}

export interface VoiceSettings {
  isRecording: boolean
  isPlaying: boolean
  volume: number
  isMuted: boolean
  autoTranscribe: boolean
}

export interface AIResponse {
  id: string
  content: string
  audioUrl?: string
  timestamp: Date
  emotions?: EmotionAnalysis
}

export interface AssessmentData {
  currentMood: number
  primaryGoals: string[]
  stressLevel: number
  previousTherapy: string
  communicationStyle: string
  sessionFrequency: string
  specificConcerns: string[]
  supportPreference: string
  completedAt?: Date
}