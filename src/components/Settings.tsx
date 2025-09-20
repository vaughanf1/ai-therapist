import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Key, 
  Volume2, 
  Mic, 
  Shield, 
  Trash2, 
  Save,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react'

export function Settings() {
  const [apiKey, setApiKey] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [volume, setVolume] = useState(1)
  const [autoTranscribe, setAutoTranscribe] = useState(true)
  const [dataRetention, setDataRetention] = useState('30')
  const [customInstructions, setCustomInstructions] = useState('')
  const [therapistPreset, setTherapistPreset] = useState('compassionate')
  const [selectedVoice, setSelectedVoice] = useState('alloy')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key')
    const storedVolume = localStorage.getItem('voice_volume')
    const storedAutoTranscribe = localStorage.getItem('auto_transcribe')
    const storedDataRetention = localStorage.getItem('data_retention_days')
    const storedCustomInstructions = localStorage.getItem('custom_instructions')
    const storedTherapistPreset = localStorage.getItem('therapist_preset')
    const storedSelectedVoice = localStorage.getItem('selected_voice')

    if (storedApiKey) setApiKey(storedApiKey)
    if (storedVolume) setVolume(parseFloat(storedVolume))
    if (storedAutoTranscribe) setAutoTranscribe(storedAutoTranscribe === 'true')
    if (storedDataRetention) setDataRetention(storedDataRetention)
    if (storedCustomInstructions) setCustomInstructions(storedCustomInstructions)
    if (storedTherapistPreset) setTherapistPreset(storedTherapistPreset)
    if (storedSelectedVoice) {
      const validVoices = ['alloy', 'ash', 'ballad', 'coral', 'echo', 'sage', 'shimmer', 'verse', 'marin', 'cedar']
      const validVoice = validVoices.includes(storedSelectedVoice) ? storedSelectedVoice : 'alloy'
      setSelectedVoice(validVoice)
      // Update localStorage if we had to fallback
      if (storedSelectedVoice !== validVoice) {
        localStorage.setItem('selected_voice', validVoice)
      }
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem('openai_api_key', apiKey)
    localStorage.setItem('voice_volume', volume.toString())
    localStorage.setItem('auto_transcribe', autoTranscribe.toString())
    localStorage.setItem('data_retention_days', dataRetention)
    localStorage.setItem('custom_instructions', customInstructions)
    localStorage.setItem('therapist_preset', therapistPreset)
    localStorage.setItem('selected_voice', selectedVoice)
    
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const therapistPresets = {
    compassionate: {
      name: 'Compassionate & Gentle',
      description: 'Warm, empathetic, and nurturing approach'
    },
    analytical: {
      name: 'Analytical & Structured',
      description: 'Logical, systematic, and solution-focused'
    },
    mindful: {
      name: 'Mindful & Present',
      description: 'Focus on mindfulness, awareness, and being present'
    },
    motivational: {
      name: 'Motivational & Energetic',
      description: 'Encouraging, uplifting, and action-oriented'
    },
    cognitive: {
      name: 'Cognitive Behavioral',
      description: 'CBT-focused, examining thoughts and behaviors'
    }
  }

  const getPresetInstructions = (preset: string) => {
    const instructions = {
      compassionate: 'You are a warm, compassionate therapist who speaks with gentle kindness. Focus on emotional validation and creating a safe space.',
      analytical: 'You are a structured, analytical therapist who helps break down problems systematically. Ask probing questions and help organize thoughts.',
      mindful: 'You are a mindfulness-focused therapist who emphasizes present-moment awareness and meditation techniques.',
      motivational: 'You are an energetic, motivational therapist who inspires action and celebrates progress. Be encouraging and solution-focused.',
      cognitive: 'You are a CBT therapist who helps identify thought patterns and behavioral connections. Focus on practical strategies and homework.'
    }
    return instructions[preset as keyof typeof instructions] || instructions.compassionate
  }

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all session data? This action cannot be undone.')) {
      localStorage.removeItem('therapy_sessions')
      localStorage.removeItem('progress_cards')
      alert('All session data has been cleared.')
    }
  }

  const maskApiKey = (key: string) => {
    if (key.length < 8) return key
    return key.slice(0, 4) + '•'.repeat(key.length - 8) + key.slice(-4)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 sm:space-y-8 px-4 sm:px-0"
    >
      <div className="text-center space-y-2">
        <h2 className="text-xl sm:text-2xl font-semibold text-neutral-800">Settings</h2>
        <p className="text-sm sm:text-base text-neutral-600">
          Configure your AI therapy experience
        </p>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="card space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3">
            <Key className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-medium text-neutral-700">API Configuration</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                OpenAI API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200 bg-white pr-12 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  {showApiKey ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
          </div>
        </div>

        <div className="card space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-medium text-neutral-700">Therapist Personality</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                Therapist Style
              </label>
              <select
                value={therapistPreset}
                onChange={(e) => setTherapistPreset(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200 bg-white text-sm sm:text-base"
              >
                {Object.entries(therapistPresets).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 mt-2">
                {therapistPresets[therapistPreset as keyof typeof therapistPresets].description}
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                Custom Instructions (Optional)
              </label>
              <textarea
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder="Add specific instructions for how your AI therapist should behave, what topics to focus on, or any personal preferences..."
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200 bg-white min-h-[80px] sm:min-h-[100px] resize-y text-sm sm:text-base"
                rows={3}
              />
              <p className="text-xs text-neutral-500 mt-2">
                These instructions will be added to the selected therapist style.
              </p>
            </div>

            <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
              <h4 className="text-sm font-medium text-sage-800 mb-2">Preview Instructions</h4>
              <p className="text-xs text-sage-700 leading-relaxed">
                {getPresetInstructions(therapistPreset)}
                {customInstructions && (
                  <>
                    <br /><br />
                    <strong>Your custom instructions:</strong><br />
                    {customInstructions}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="card space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3">
            <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-medium text-neutral-700">Audio Settings</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                AI Voice
              </label>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200 bg-white text-sm sm:text-base"
              >
                <option value="alloy">Alloy - Natural and balanced</option>
                <option value="ash">Ash - Smooth and confident</option>
                <option value="ballad">Ballad - Melodic and expressive</option>
                <option value="coral">Coral - Warm and friendly</option>
                <option value="echo">Echo - Clear and articulate</option>
                <option value="sage">Sage - Wise and calming</option>
                <option value="shimmer">Shimmer - Gentle and soothing</option>
                <option value="verse">Verse - Poetic and thoughtful</option>
                <option value="marin">Marin - Fresh and contemporary</option>
                <option value="cedar">Cedar - Rich and grounding</option>
              </select>
              <p className="text-xs text-neutral-500 mt-2">
                Choose the AI voice that feels most comfortable for your therapy sessions.
              </p>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                Voice Volume: {Math.round(volume * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full accent-primary h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
              <div className="flex-1">
                <label className="text-xs sm:text-sm font-medium text-neutral-700">
                  Auto-transcribe conversations
                </label>
                <p className="text-xs text-neutral-500">
                  Automatically convert speech to text for session history
                </p>
              </div>
              <button
                onClick={() => setAutoTranscribe(!autoTranscribe)}
                className={`
                  relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0
                  ${autoTranscribe ? 'bg-primary' : 'bg-neutral-200'}
                `}
              >
                <span
                  className={`
                    inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                    ${autoTranscribe ? 'translate-x-6' : 'translate-x-1'}
                  `}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="card space-y-4 sm:space-y-6">
          <div className="flex items-center space-x-3">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-medium text-neutral-700">Privacy & Data</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-neutral-700 mb-2">
                Data Retention Period
              </label>
              <select
                value={dataRetention}
                onChange={(e) => setDataRetention(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-neutral-200 focus:border-primary focus:ring-0 focus:outline-none transition-colors duration-200 bg-white text-sm sm:text-base"
              >
                <option value="7">7 days</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
                <option value="0">Keep forever</option>
              </select>
              <p className="text-xs text-neutral-500 mt-2">
                Session data older than this period will be automatically deleted.
              </p>
            </div>
            
            <div className="border-t border-neutral-200 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex-1">
                  <h4 className="text-xs sm:text-sm font-medium text-neutral-700">
                    Clear All Session Data
                  </h4>
                  <p className="text-xs text-neutral-500">
                    Permanently delete all your therapy sessions and progress cards
                  </p>
                </div>
                <button
                  onClick={handleClearData}
                  className="bg-white hover:bg-red-50 text-red-600 font-medium px-4 sm:px-6 py-2 sm:py-3 rounded-xl border border-red-200 hover:border-red-300 transition-all duration-200 shadow-soft hover:shadow-soft-lg flex items-center justify-center space-x-2 min-h-[44px] flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Clear Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <motion.div
          className="flex justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            onClick={handleSave}
            className="bg-primary hover:bg-primary-dark text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-2xl transition-all duration-200 shadow-soft hover:shadow-soft-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3 min-h-[48px] text-sm sm:text-base"
          >
            {saved ? (
              <>
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Save Settings</span>
              </>
            )}
          </button>
        </motion.div>
      </div>

      <div className="card bg-primary/5 border-primary/20">
        <div className="space-y-3">
          <h4 className="font-medium text-primary">🔒 Privacy Notice</h4>
          <p className="text-sm text-neutral-700">
            Your conversations are processed using OpenAI's Realtime API. 
            All data is stored locally on your device. We recommend reviewing 
            OpenAI's privacy policy for information about how your data is 
            handled during API calls.
          </p>
        </div>
      </div>
    </motion.div>
  )
}