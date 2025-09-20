import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface VoiceOrbProps {
  isListening: boolean
  isAISpeaking: boolean
  size?: number
}

export function VoiceOrb({ isListening, isAISpeaking, size = 150 }: VoiceOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = size / 2
    const centerY = size / 2
    const maxRadius = size * 0.4

    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, size, size)
      
      if (isListening || isAISpeaking) {
        const numWaves = 3
        
        for (let i = 0; i < numWaves; i++) {
          const radius = maxRadius * 0.3 + (Math.sin(phase + i * 0.8) * maxRadius * 0.3)
          const opacity = 0.3 - (i * 0.1)
          
          if (isListening) {
            ctx.fillStyle = `rgba(34, 197, 94, ${opacity})` // Accent green
          } else {
            ctx.fillStyle = `rgba(139, 92, 246, ${opacity})` // Primary purple
          }
          
          ctx.beginPath()
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
          ctx.fill()
        }
        
        // Inner core
        const coreRadius = maxRadius * 0.2 + (Math.sin(phase * 2) * maxRadius * 0.1)
        if (isListening) {
          ctx.fillStyle = 'rgba(34, 197, 94, 0.8)'
        } else {
          ctx.fillStyle = 'rgba(139, 92, 246, 0.8)'
        }
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, coreRadius, 0, 2 * Math.PI)
        ctx.fill()
        
        phase += 0.05
      } else {
        // Idle state - solid orb
        ctx.fillStyle = 'rgba(168, 162, 158, 0.3)' // Neutral
        ctx.beginPath()
        ctx.arc(centerX, centerY, maxRadius * 0.3, 0, 2 * Math.PI)
        ctx.fill()
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
  }, [isListening, isAISpeaking, size])

  return (
    <motion.div
      className="relative"
      animate={{
        scale: isListening || isAISpeaking ? [1, 1.05, 1] : 1
      }}
      transition={{
        duration: 2,
        repeat: isListening || isAISpeaking ? Infinity : 0,
        ease: "easeInOut"
      }}
    >
      <div 
        className="relative rounded-full overflow-hidden backdrop-blur-sm"
        style={{ width: size, height: size }}
      >
        {/* Gradient background */}
        <div className={`
          absolute inset-0 rounded-full transition-all duration-1000
          ${isListening 
            ? 'bg-gradient-to-br from-accent/20 to-accent/10'
            : isAISpeaking
            ? 'bg-gradient-to-br from-primary/20 to-primary/10'
            : 'bg-gradient-to-br from-neutral-200/20 to-neutral-100/10'
          }
        `} />
        
        {/* Animated canvas */}
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="absolute inset-0"
        />
        
        {/* Subtle glow effect */}
        <div className={`
          absolute inset-0 rounded-full transition-all duration-1000
          ${isListening
            ? 'shadow-[0_0_60px_rgba(34,197,94,0.3)]'
            : isAISpeaking
            ? 'shadow-[0_0_60px_rgba(139,92,246,0.3)]'
            : 'shadow-[0_0_30px_rgba(168,162,158,0.1)]'
          }
        `} />
      </div>
    </motion.div>
  )
}