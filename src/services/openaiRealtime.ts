interface OpenAIRealtimeConfig {
  apiKey: string
  model?: string
  voice?: string
}

export class OpenAIRealtimeService {
  private config: OpenAIRealtimeConfig
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null
  private audioElement: HTMLAudioElement | null = null
  private isConnected = false
  private onAudioResponse?: (audioData: ArrayBuffer) => void
  private onTranscription?: (text: string, speaker: 'user' | 'ai') => void

  constructor(config: OpenAIRealtimeConfig) {
    this.config = {
      model: 'gpt-4o-realtime-preview-2024-10-01',
      voice: 'alloy',
      ...config
    }
  }

  async connect(
    onAudioResponse?: (audioData: ArrayBuffer) => void,
    onTranscription?: (text: string, speaker: 'user' | 'ai') => void
  ): Promise<void> {
    this.onAudioResponse = onAudioResponse
    this.onTranscription = onTranscription

    try {
      console.log('Getting ephemeral session from server...')
      
      // 1) Get an ephemeral session from your backend
      const sessionResponse = await fetch('http://localhost:3001/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: this.config.apiKey,
          model: this.config.model,
          voice: localStorage.getItem('selected_voice') || this.config.voice,
          instructions: this.getCustomInstructions()
        })
      })

      if (!sessionResponse.ok) {
        const error = await sessionResponse.json()
        throw new Error(error.error || 'Failed to create session')
      }

      const sessionData = await sessionResponse.json()
      console.log('Session created successfully')

      // 2) Ask browser for mic permission + stream
      console.log('Requesting microphone access...')
      const micStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 24000,
        } 
      })

      // 3) Create a RTCPeerConnection
      this.peerConnection = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })

      // Play model audio output
      this.audioElement = document.createElement('audio')
      this.audioElement.autoplay = true
      this.audioElement.style.display = 'none'
      document.body.appendChild(this.audioElement)

      this.peerConnection.ontrack = (event) => {
        console.log('Received audio track from OpenAI')
        if (this.audioElement) {
          this.audioElement.srcObject = event.streams[0]
        }
      }

      // Send mic to the model
      micStream.getTracks().forEach(track => {
        this.peerConnection?.addTrack(track, micStream)
      })

      // 4) Create a data channel for events/JSON
      this.dataChannel = this.peerConnection.createDataChannel('oai-events')
      
      this.dataChannel.onmessage = (event) => {
        this.handleRealtimeEvent(event.data)
      }

      this.dataChannel.onopen = () => {
        console.log('Data channel opened')
        this.isConnected = true
        
        // Send initial greeting
        this.sendEvent({
          type: 'response.create',
          response: {
            instructions: 'Say hello warmly and ask how you can help today.',
            modalities: ['audio'],
            voice: this.config.voice
          }
        })
      }

      this.dataChannel.onerror = (error) => {
        console.error('Data channel error:', error)
        throw new Error('Data channel connection failed')
      }

      // 5) Create SDP offer
      console.log('Creating WebRTC offer...')
      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)

      // 6) POST the SDP to OpenAI Realtime using the ephemeral client_secret
      console.log('Sending offer to OpenAI...')
      const rtcResponse = await fetch(
        `https://api.openai.com/v1/realtime?model=${encodeURIComponent(sessionData.model)}`, 
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionData.client_secret?.value || sessionData.client_secret}`,
            'Content-Type': 'application/sdp'
          },
          body: offer.sdp
        }
      )

      if (!rtcResponse.ok) {
        const error = await rtcResponse.text()
        throw new Error(`WebRTC connection failed: ${error}`)
      }

      const answerSDP = await rtcResponse.text()
      await this.peerConnection.setRemoteDescription({ 
        type: 'answer', 
        sdp: answerSDP 
      })

      console.log('WebRTC connection established successfully')

    } catch (error) {
      console.error('Connection failed:', error)
      this.cleanup()
      throw error
    }
  }

  private getCustomInstructions(): string {
    const therapistPreset = localStorage.getItem('therapist_preset') || 'compassionate'
    const customInstructions = localStorage.getItem('custom_instructions') || ''
    const assessmentData = localStorage.getItem('user_assessment')

    const presetInstructions = {
      compassionate: 'You are a warm, compassionate AI therapist who speaks with gentle kindness and deep empathy. Create a safe, judgment-free space and use comforting language.',
      analytical: 'You are a structured, analytical AI therapist who helps clients understand their thoughts systematically. Break down problems and provide clear guidance.',
      mindful: 'You are a mindfulness-focused AI therapist who emphasizes present-moment awareness. Guide users toward mindfulness and introduce grounding techniques.',
      motivational: 'You are an energetic, motivational AI therapist who inspires action. Be encouraging, focus on strengths, and celebrate progress.',
      cognitive: 'You are a CBT-focused AI therapist who helps identify thought patterns. Explore connections between thoughts, feelings, and behaviors.'
    }

    const baseInstructions = presetInstructions[therapistPreset as keyof typeof presetInstructions] || presetInstructions.compassionate

    let fullInstructions = `${baseInstructions}

Always:
- Keep responses conversational and natural (1-3 sentences typically)
- Listen actively and ask thoughtful follow-up questions
- Respond with empathy and understanding
- Help users explore their thoughts and emotions
- Provide practical coping strategies when appropriate
- Maintain appropriate therapeutic boundaries`

    // Add personalization from assessment data
    if (assessmentData) {
      try {
        const assessment = JSON.parse(assessmentData)
        fullInstructions += `

User Context (use this to personalize your approach):
- Current mood level: ${assessment.currentMood}/10
- Stress level: ${assessment.stressLevel}/10
- Primary goals: ${assessment.primaryGoals?.join(', ') || 'Not specified'}
- Therapy experience: ${assessment.previousTherapy || 'Not specified'}
- Communication preference: ${assessment.communicationStyle || 'Not specified'}
- Specific concerns: ${assessment.specificConcerns?.join(', ') || 'None specified'}

Adjust your tone and approach based on their mood and stress levels. Focus on their stated goals and be mindful of their therapy experience level.`
      } catch (error) {
        console.error('Error parsing assessment data:', error)
      }
    }

    if (customInstructions) {
      fullInstructions += `

Additional personalized instructions:
${customInstructions}`
    }

    return fullInstructions
  }

  private handleRealtimeEvent(data: string) {
    try {
      const event = JSON.parse(data)
      console.log('Realtime event:', event.type)
      
      switch (event.type) {
        case 'conversation.item.input_audio_transcription.completed':
          if (this.onTranscription && event.transcript) {
            this.onTranscription(event.transcript, 'user')
          }
          break
          
        case 'response.audio_transcript.delta':
          if (this.onTranscription && event.delta) {
            this.onTranscription(event.delta, 'ai')
          }
          break
          
        case 'response.done':
          console.log('Response completed')
          break
          
        case 'error':
          console.error('OpenAI Realtime error:', event.error)
          break
          
        default:
          console.log('Unknown event type:', event.type)
      }
    } catch (error) {
      console.error('Error parsing realtime event:', error)
    }
  }

  private sendEvent(event: any) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(event))
    } else {
      console.warn('Data channel not open, cannot send event')
    }
  }

  async startListening(): Promise<void> {
    // With WebRTC, microphone is already connected when we set up the peer connection
    console.log('Microphone already active via WebRTC')
  }

  stopListening(): void {
    // With WebRTC, we don't need to manually stop listening
    console.log('Microphone remains active (WebRTC handles this)')
  }

  disconnect(): void {
    console.log('Disconnecting from OpenAI Realtime API')
    this.cleanup()
  }

  private cleanup(): void {
    this.isConnected = false
    
    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }
    
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }
    
    if (this.audioElement) {
      document.body.removeChild(this.audioElement)
      this.audioElement = null
    }
  }

  changeVoice(newVoice: string): void {
    if (this.isConnectedToAPI()) {
      console.log(`Changing voice to: ${newVoice}`)
      this.sendEvent({
        type: 'response.create',
        response: {
          instructions: `I'm now speaking with the ${newVoice} voice. How does this sound?`,
          modalities: ['audio', 'text'],
          audio: { voice: newVoice }
        }
      })
    } else {
      console.warn('Cannot change voice - not connected to API')
    }
  }

  isConnectedToAPI(): boolean {
    return this.isConnected && this.dataChannel?.readyState === 'open'
  }
}