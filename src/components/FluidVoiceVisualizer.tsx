import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

interface FluidVoiceVisualizerProps {
  isListening: boolean
  isAISpeaking: boolean
  size?: number
  audioLevel?: number
}

export function FluidVoiceVisualizer({ 
  isListening, 
  isAISpeaking, 
  size = 300,
  audioLevel = 0.5
}: FluidVoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    let time = 0

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      
      if (isListening || isAISpeaking) {
        // Create simple fluid blob effect
        const baseRadius = size * 0.2
        const maxVariation = size * 0.05
        const points = 6 // Fewer control points for smoother look
        
        // Gentler animation patterns
        const frequency = isListening ? 1.5 : 2
        const amplitude = isListening ? 
          0.2 + (audioLevel * 0.2) : 
          0.3 + (Math.sin(time * 0.03) * 0.2)
        
        // Create only 2 fluid layers for simplicity
        for (let layer = 0; layer < 2; layer++) {
          const layerRadius = baseRadius * (1 + layer * 0.2)
          const opacity = 0.4 - (layer * 0.1)
          
          // Generate fluid blob shape
          ctx.beginPath()
          
          for (let i = 0; i <= points; i++) {
            const angle = (i / points) * Math.PI * 2
            
            // Create organic variation using multiple sine waves
            const variation = 
              Math.sin(angle * frequency + time * 0.02 + layer) * amplitude +
              Math.sin(angle * (frequency + 1) + time * 0.03 + layer) * (amplitude * 0.5) +
              Math.sin(angle * (frequency - 1) + time * 0.01 + layer) * (amplitude * 0.3)
            
            const radius = layerRadius + (variation * maxVariation)
            const x = centerX + Math.cos(angle) * radius
            const y = centerY + Math.sin(angle) * radius
            
            if (i === 0) {
              ctx.moveTo(x, y)
            } else {
              // Use quadratic curves for smooth blob edges
              const prevAngle = ((i - 1) / points) * Math.PI * 2
              const prevVariation = 
                Math.sin(prevAngle * frequency + time * 0.02 + layer) * amplitude +
                Math.sin(prevAngle * (frequency + 1) + time * 0.03 + layer) * (amplitude * 0.5)
              const prevRadius = layerRadius + (prevVariation * maxVariation)
              const prevX = centerX + Math.cos(prevAngle) * prevRadius
              const prevY = centerY + Math.sin(prevAngle) * prevRadius
              
              const cpX = (prevX + x) / 2 + Math.sin(angle + time * 0.04) * 10
              const cpY = (prevY + y) / 2 + Math.cos(angle + time * 0.04) * 10
              
              ctx.quadraticCurveTo(cpX, cpY, x, y)
            }
          }
          
          ctx.closePath()
          
          // Different colors for listening vs speaking
          if (isListening) {
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, layerRadius * 1.5)
            gradient.addColorStop(0, `rgba(34, 197, 94, ${opacity})`) // Green
            gradient.addColorStop(0.7, `rgba(34, 197, 94, ${opacity * 0.6})`)
            gradient.addColorStop(1, `rgba(34, 197, 94, 0)`)
            ctx.fillStyle = gradient
          } else {
            const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, layerRadius * 1.5)
            gradient.addColorStop(0, `rgba(139, 92, 246, ${opacity})`) // Purple
            gradient.addColorStop(0.7, `rgba(139, 92, 246, ${opacity * 0.6})`)
            gradient.addColorStop(1, `rgba(139, 92, 246, 0)`)
            ctx.fillStyle = gradient
          }
          
          ctx.fill()
        }
        
        // Add inner core with pulsing effect
        const coreRadius = baseRadius * 0.4
        const pulseIntensity = isListening ? 
          0.8 + (audioLevel * 0.4) : 
          0.9 + (Math.sin(time * 0.08) * 0.2)
        
        const coreGradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, coreRadius * pulseIntensity
        )
        
        if (isListening) {
          coreGradient.addColorStop(0, 'rgba(34, 197, 94, 0.9)')
          coreGradient.addColorStop(1, 'rgba(34, 197, 94, 0.2)')
        } else {
          coreGradient.addColorStop(0, 'rgba(139, 92, 246, 0.9)')
          coreGradient.addColorStop(1, 'rgba(139, 92, 246, 0.2)')
        }
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, coreRadius * pulseIntensity, 0, 2 * Math.PI)
        ctx.fillStyle = coreGradient
        ctx.fill()
        
        
        time += 1
      } else {
        // Idle state - subtle breathing effect
        const breathRadius = size * 0.12
        const breathIntensity = 0.8 + Math.sin(time * 0.02) * 0.2
        
        const gradient = ctx.createRadialGradient(
          centerX, centerY, 0,
          centerX, centerY, breathRadius * breathIntensity
        )
        gradient.addColorStop(0, 'rgba(168, 162, 158, 0.3)')
        gradient.addColorStop(1, 'rgba(168, 162, 158, 0.1)')
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, breathRadius * breathIntensity, 0, 2 * Math.PI)
        ctx.fillStyle = gradient
        ctx.fill()
        
        time += 0.5
      }
      
      if (isListening || isAISpeaking) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    draw()
    
    if (isListening || isAISpeaking) {
      animationRef.current = requestAnimationFrame(draw)
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isListening, isAISpeaking, size, audioLevel])

  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{
        scale: isListening || isAISpeaking ? [1, 1.02, 1] : 1
      }}
      transition={{
        duration: 2,
        repeat: isListening || isAISpeaking ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      {/* Background glow */}
      <div 
        className={`absolute inset-0 rounded-full transition-all duration-1000 ${
          isListening
            ? 'bg-gradient-radial from-green-400/10 via-green-400/5 to-transparent'
            : isAISpeaking
            ? 'bg-gradient-radial from-purple-400/10 via-purple-400/5 to-transparent'
            : 'bg-gradient-radial from-neutral-400/5 via-neutral-400/2 to-transparent'
        }`}
        style={{
          filter: `blur(${isListening || isAISpeaking ? '15px' : '8px'})`,
        }}
      />
      
      {/* Main canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="relative z-10"
        style={{ width: size, height: size }}
      />
      
    </motion.div>
  )
}