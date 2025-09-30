import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Volume2,
  VolumeX,
  PhoneOff,
  Waves
} from 'lucide-react'
import { OpenAIRealtimeService } from '../services/openaiRealtime'
import { Session, TranscriptEntry, AssessmentData, ProgressCard } from '../types'
import { FluidVoiceVisualizer } from './FluidVoiceVisualizer'
import { detectMilestones } from '../utils/milestoneDetection'

interface VoiceInterfaceProps {
  currentSession: Session | null
  onSessionStart: (session: Session) => void
  onSessionComplete: (session: Session) => void
  assessmentData?: AssessmentData | null
}

export function VoiceInterface({ currentSession, onSessionStart, onSessionComplete, assessmentData }: VoiceInterfaceProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isAISpeaking, setIsAISpeaking] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([])
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTranscript, setCurrentTranscript] = useState('')
  const [currentVoice, setCurrentVoice] = useState('alloy')

  const realtimeServiceRef = useRef<OpenAIRealtimeService | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<Float32Array[]>([])

  const playAudioBuffer = async (audioData: ArrayBuffer) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current
      const audioBuffer = await audioContext.decodeAudioData(audioData.slice(0))
      const source = audioContext.createBufferSource()
      const gainNode = audioContext.createGain()

      source.buffer = audioBuffer
      gainNode.gain.value = isMuted ? 0 : volume
      
      source.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      source.onended = () => {
        setIsAISpeaking(false)
      }
      
      setIsAISpeaking(true)
      source.start()
    } catch (error) {
      console.error('Error playing audio:', error)
      setIsAISpeaking(false)
    }
  }

  const handleTranscription = (text: string, speaker: 'user' | 'ai') => {
    const entry: TranscriptEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      speaker,
      content: text
    }
    
    setTranscript(prev => [...prev, entry])
    
    if (speaker === 'user') {
      setCurrentTranscript(text)
    }
  }

  const handleConnect = async () => {
    // Try to get API key from environment first, then fallback to localStorage
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY || localStorage.getItem('openai_api_key')
    if (!apiKey) {
      alert('Please set your OpenAI API key in Settings first')
      return
    }

    // Validate API key format
    if (!apiKey.startsWith('sk-')) {
      alert('Invalid API key format. OpenAI API keys should start with "sk-"')
      return
    }

    // Get selected voice from settings with validation
    const storedVoice = localStorage.getItem('selected_voice') || 'alloy'
    const validVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar']
    const selectedVoice = validVoices.includes(storedVoice) ? storedVoice : 'alloy'
    
    // Update localStorage if we had to fallback
    if (storedVoice !== selectedVoice) {
      localStorage.setItem('selected_voice', selectedVoice)
    }
    
    setCurrentVoice(selectedVoice)

    setConnectionStatus('connecting')
    
    try {
      console.log('Attempting to connect to OpenAI Realtime API...')
      
      realtimeServiceRef.current = new OpenAIRealtimeService({ 
        apiKey,
        voice: selectedVoice
      })
      
      await realtimeServiceRef.current.connect(
        playAudioBuffer,
        handleTranscription
      )
      
      console.log('Connected successfully, starting audio capture...')
      await realtimeServiceRef.current.startListening()
      
      setIsConnected(true)
      setIsListening(true)
      setConnectionStatus('connected')
      
      const newSession: Session = {
        id: Date.now().toString(),
        startTime: new Date(),
        milestones: [],
        transcript: [],
        progressCards: []
      }
      
      onSessionStart(newSession)
      console.log('Session started successfully')
    } catch (error) {
      console.error('Connection failed:', error)
      setConnectionStatus('disconnected')
      
      // More specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Invalid API key')) {
          alert('Invalid API key. Please check your OpenAI API key in Settings.')
        } else if (error.message.includes('insufficient permissions')) {
          alert('Your API key does not have access to the Realtime API. Please check your OpenAI account.')
        } else if (error.message.includes('microphone')) {
          alert('Microphone access denied. Please allow microphone permissions and try again.')
        } else {
          alert(`Connection failed: ${error.message}`)
        }
      } else {
        alert('Failed to connect to OpenAI Realtime API. Please check your API key and internet connection.')
      }
    }
  }

  const handleDisconnect = () => {
    if (realtimeServiceRef.current) {
      realtimeServiceRef.current.disconnect()
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsConnected(false)
    setIsListening(false)
    setIsAISpeaking(false)
    setConnectionStatus('disconnected')

    if (currentSession) {
      // Detect milestones from transcript
      const milestones = detectMilestones(transcript)
      console.log('Detected milestones:', milestones)

      // Generate progress cards from milestones
      const progressCards: ProgressCard[] = milestones.map(milestone => ({
        id: `card-${milestone.id}`,
        sessionId: currentSession.id,
        title: milestone.title,
        description: milestone.description,
        milestone,
        createdAt: new Date(),
        color: getColorForMilestone(milestone.type),
        icon: getIconForMilestone(milestone.type)
      }))

      const completedSession: Session = {
        ...currentSession,
        endTime: new Date(),
        duration: Date.now() - currentSession.startTime.getTime(),
        transcript,
        milestones,
        progressCards
      }

      // Save session to localStorage for history
      const savedSessions = localStorage.getItem('session_history')
      const sessions = savedSessions ? JSON.parse(savedSessions) : []
      sessions.push({
        ...completedSession,
        startTime: completedSession.startTime.toISOString(),
        endTime: completedSession.endTime?.toISOString(),
        transcript: transcript.map(t => ({
          ...t,
          timestamp: t.timestamp.toISOString()
        })),
        milestones: milestones.map(m => ({
          ...m,
          achievedAt: m.achievedAt.toISOString()
        })),
        progressCards: progressCards.map(p => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          milestone: {
            ...p.milestone,
            achievedAt: p.milestone.achievedAt.toISOString()
          }
        }))
      })
      localStorage.setItem('session_history', JSON.stringify(sessions))
      console.log('Session saved to history:', completedSession)

      onSessionComplete(completedSession)
    }
  }

  const getColorForMilestone = (type: string): string => {
    const colors: Record<string, string> = {
      emotional_breakthrough: '#FF6B6B',
      self_awareness: '#4ECDC4',
      coping_strategy: '#45B7D1',
      goal_setting: '#FFA07A',
      anxiety_management: '#98D8C8',
      communication_improvement: '#F7DC6F',
      confidence_building: '#BB8FCE',
      relationship_insight: '#F8B88B',
      stress_relief: '#85C1E9',
      mindfulness_practice: '#82E0AA'
    }
    return colors[type] || '#0A84FF'
  }

  const getIconForMilestone = (type: string): string => {
    const icons: Record<string, string> = {
      emotional_breakthrough: '🌟',
      self_awareness: '🪞',
      coping_strategy: '🛠️',
      goal_setting: '🎯',
      anxiety_management: '😌',
      communication_improvement: '💬',
      confidence_building: '💪',
      relationship_insight: '🤝',
      stress_relief: '🧘',
      mindfulness_practice: '🧠'
    }
    return icons[type] || '✨'
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getSessionDuration = () => {
    if (!currentSession) return '0:00'
    return formatTime(Date.now() - currentSession.startTime.getTime())
  }

  useEffect(() => {
    return () => {
      if (realtimeServiceRef.current) {
        realtimeServiceRef.current.disconnect()
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [])

  if (!isConnected) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 sm:space-y-12 max-w-md mx-auto w-full"
        >
          <motion.div
            className="space-y-4 sm:space-y-6"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="relative mx-auto w-24 h-24 sm:w-32 sm:h-32">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark rounded-full opacity-20 blur-xl"></div>
              <div className="relative bg-gradient-to-br from-primary to-primary-dark rounded-full w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center shadow-2xl">
                <Waves className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1 className="text-3xl sm:text-4xl font-semibold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
                JustTalk
              </h1>
              <div className="text-center">
                <p className="text-lg sm:text-xl text-neutral-600 mb-2 sm:mb-3">AI Therapy</p>
                <p className="text-sm sm:text-base text-neutral-600 leading-relaxed px-2">
                  Your compassionate AI companion is ready to listen.
                  Start a conversation and let your thoughts flow naturally.
                </p>
                <p className="text-xs sm:text-sm text-neutral-500 mt-2 sm:mt-3 px-2">
                  Backed by clinical research and evidence-based therapeutic approaches
                </p>
              </div>
            </div>
          </motion.div>

          <motion.button
            onClick={handleConnect}
            disabled={connectionStatus === 'connecting'}
            className="group relative bg-gradient-to-r from-primary to-primary-dark text-white px-8 sm:px-12 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium shadow-2xl transition-all duration-300 hover:shadow-3xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[200px]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Begin Session'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>

          <div className="text-xs text-neutral-400 max-w-xs mx-auto text-center px-4">
            <p>
              <strong>Disclaimer:</strong> Not a substitute for professional care. Crisis? Call 988.
            </p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Session Status */}
      <div className="flex flex-col sm:flex-row items-center justify-center p-3 sm:p-6 bg-white/30 backdrop-blur-sm relative gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3 sm:absolute sm:left-6">
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-accent rounded-full animate-pulse"></div>
          <span className="text-xs sm:text-sm font-medium text-neutral-700">
            Session Active • {getSessionDuration()}
          </span>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
          <select
            value={currentVoice}
            onChange={(e) => {
              const newVoice = e.target.value
              setCurrentVoice(newVoice)
              localStorage.setItem('selected_voice', newVoice)
              if (realtimeServiceRef.current) {
                realtimeServiceRef.current.changeVoice(newVoice)
              }
            }}
            className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-white/50 backdrop-blur-sm border border-white/20 rounded-xl focus:outline-none focus:border-primary transition-all duration-200 min-h-[40px]"
          >
            <option value="alloy">Alloy</option>
            <option value="ash">Ash</option>
            <option value="ballad">Ballad</option>
            <option value="coral">Coral</option>
            <option value="echo">Echo</option>
            <option value="sage">Sage</option>
            <option value="shimmer">Shimmer</option>
            <option value="verse">Verse</option>
            <option value="marin">Marin</option>
            <option value="cedar">Cedar</option>
          </select>

          <button
            onClick={toggleMute}
            className="p-2.5 sm:p-3 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all duration-200 shadow-lg min-w-[44px] min-h-[44px]"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-600" />
            )}
          </button>

          <button
            onClick={handleDisconnect}
            className="p-2.5 sm:p-3 rounded-full bg-red-500/10 backdrop-blur-sm hover:bg-red-500/20 transition-all duration-200 shadow-lg text-red-600 min-w-[44px] min-h-[44px]"
          >
            <PhoneOff className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6">
        <div className="text-center space-y-8 sm:space-y-12 max-w-2xl w-full">
          <div className="flex justify-center">
            <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px]">
              <FluidVoiceVisualizer
                isListening={isListening}
                isAISpeaking={isAISpeaking}
                size={150}
              />
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <AnimatePresence mode="wait">
              {isAISpeaking && (
                <motion.div
                  key="ai-speaking"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-primary font-medium text-sm sm:text-base"
                >
                  AI is responding...
                </motion.div>
              )}
              {isListening && !isAISpeaking && (
                <motion.div
                  key="listening"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-accent font-medium text-sm sm:text-base"
                >
                  I'm listening...
                </motion.div>
              )}
              {!isListening && !isAISpeaking && (
                <motion.div
                  key="waiting"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-neutral-500 text-sm sm:text-base"
                >
                  Ready to listen
                </motion.div>
              )}
            </AnimatePresence>

            <p className="text-neutral-600 text-sm sm:text-lg leading-relaxed max-w-lg mx-auto px-2 sm:px-0">
              Speak naturally about what's on your mind. I'm here to listen and support you.
            </p>
          </div>

          {currentTranscript && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 mx-2 sm:mx-0"
            >
              <p className="text-neutral-700 italic text-sm sm:text-base">"{currentTranscript}"</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Transcript History */}
      <AnimatePresence>
        {transcript.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="p-3 sm:p-6 bg-white/30 backdrop-blur-sm border-t border-white/20"
          >
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xs sm:text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Conversation</h3>
              <div className="space-y-2 sm:space-y-3 max-h-32 sm:max-h-40 overflow-y-auto">
                {transcript.slice(-6).map((entry) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: entry.speaker === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${entry.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`
                        max-w-[280px] sm:max-w-xs px-3 sm:px-4 py-2 rounded-2xl text-xs sm:text-sm
                        ${entry.speaker === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white/80 text-neutral-800'
                        }
                      `}
                    >
                      <p className="break-words">{entry.content}</p>
                      <span className="text-xs opacity-70 block mt-1">
                        {entry.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}