import { useState, useRef, useCallback, useEffect } from 'react'
import { VoiceSettings } from '../types'

export function useVoiceRecording() {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>({
    isRecording: false,
    isPlaying: false,
    volume: 1,
    isMuted: false,
    autoTranscribe: true,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        } 
      })
      
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
        
        console.log('Recording stopped, blob size:', audioBlob.size)
        
        audioChunksRef.current = []
      }

      mediaRecorder.start(100)
      
      setVoiceSettings(prev => ({ ...prev, isRecording: true }))
    } catch (error) {
      console.error('Error starting recording:', error)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && voiceSettings.isRecording) {
      mediaRecorderRef.current.stop()
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      setVoiceSettings(prev => ({ ...prev, isRecording: false }))
    }
  }, [voiceSettings.isRecording])

  const toggleRecording = useCallback(() => {
    if (voiceSettings.isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [voiceSettings.isRecording, startRecording, stopRecording])

  const setVolume = useCallback((volume: number) => {
    setVoiceSettings(prev => ({ ...prev, volume: Math.max(0, Math.min(1, volume)) }))
  }, [])

  const toggleMute = useCallback(() => {
    setVoiceSettings(prev => ({ ...prev, isMuted: !prev.isMuted }))
  }, [])

  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      setVoiceSettings(prev => ({ ...prev, isPlaying: true }))
      
      const audio = new Audio(audioUrl)
      audio.volume = voiceSettings.isMuted ? 0 : voiceSettings.volume
      
      audio.onended = () => {
        setVoiceSettings(prev => ({ ...prev, isPlaying: false }))
      }
      
      audio.onerror = () => {
        setVoiceSettings(prev => ({ ...prev, isPlaying: false }))
        console.error('Error playing audio')
      }
      
      await audio.play()
    } catch (error) {
      setVoiceSettings(prev => ({ ...prev, isPlaying: false }))
      console.error('Error playing audio:', error)
    }
  }, [voiceSettings.volume, voiceSettings.isMuted])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return {
    voiceSettings,
    startRecording,
    stopRecording,
    toggleRecording,
    setVolume,
    toggleMute,
    playAudio,
  }
}