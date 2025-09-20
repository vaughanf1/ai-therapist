import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

interface VoiceVisualizerProps {
  isRecording: boolean
  isPlaying: boolean
}

export function VoiceVisualizer({ isRecording, isPlaying }: VoiceVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const width = canvas.width
      const height = canvas.height
      
      ctx.clearRect(0, 0, width, height)
      
      if (isRecording || isPlaying) {
        const bars = 40
        const barWidth = width / bars
        const centerY = height / 2
        
        for (let i = 0; i < bars; i++) {
          const x = i * barWidth
          const intensity = Math.random() * 0.8 + 0.2
          const barHeight = (height * 0.6) * intensity
          
          const hue = isRecording ? 220 : isPlaying ? 260 : 200
          ctx.fillStyle = `hsl(${hue}, 70%, 60%)`
          
          ctx.fillRect(
            x + barWidth * 0.1,
            centerY - barHeight / 2,
            barWidth * 0.8,
            barHeight
          )
        }
      } else {
        ctx.strokeStyle = '#D1D5DB'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(0, height / 2)
        ctx.lineTo(width, height / 2)
        ctx.stroke()
      }
      
      if (isRecording || isPlaying) {
        animationRef.current = requestAnimationFrame(draw)
      }
    }

    if (isRecording || isPlaying) {
      draw()
    } else {
      draw()
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording, isPlaying])

  return (
    <motion.div
      className="relative w-full h-32 bg-neutral-50 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={canvasRef}
        width={400}
        height={128}
        className="w-full h-full"
      />
      
      {!isRecording && !isPlaying && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="text-neutral-400 text-sm font-medium">
            Voice activity will appear here
          </span>
        </motion.div>
      )}
      
      {(isRecording || isPlaying) && (
        <motion.div
          className="absolute top-4 left-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center space-x-2">
            <div 
              className={`w-2 h-2 rounded-full ${
                isRecording ? 'bg-red-500' : 'bg-blue-500'
              } animate-pulse`} 
            />
            <span className="text-xs font-medium text-neutral-600">
              {isRecording ? 'Recording' : 'Playing'}
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}