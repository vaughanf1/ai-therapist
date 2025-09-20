import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { 
  Star, 
  Target, 
  Heart, 
  Brain, 
  Shield, 
  MessageSquare, 
  Zap,
  Users,
  Wind,
  Lightbulb
} from 'lucide-react'
import { ProgressCard, MilestoneType } from '../types'

interface ProgressCardsProps {
  cards: ProgressCard[]
}

const MILESTONE_ICONS: Record<MilestoneType, React.ComponentType<{ className?: string }>> = {
  emotional_breakthrough: Star,
  self_awareness: Brain,
  coping_strategy: Shield,
  goal_setting: Target,
  anxiety_management: Wind,
  communication_improvement: MessageSquare,
  confidence_building: Zap,
  relationship_insight: Users,
  stress_relief: Heart,
  mindfulness_practice: Lightbulb
}

const MILESTONE_COLORS: Record<MilestoneType, string> = {
  emotional_breakthrough: 'from-yellow-400 to-orange-500',
  self_awareness: 'from-purple-400 to-pink-500',
  coping_strategy: 'from-blue-400 to-cyan-500',
  goal_setting: 'from-green-400 to-emerald-500',
  anxiety_management: 'from-sky-400 to-blue-500',
  communication_improvement: 'from-indigo-400 to-purple-500',
  confidence_building: 'from-amber-400 to-yellow-500',
  relationship_insight: 'from-pink-400 to-rose-500',
  stress_relief: 'from-teal-400 to-green-500',
  mindfulness_practice: 'from-violet-400 to-indigo-500'
}

export function ProgressCards({ cards }: ProgressCardsProps) {
  if (cards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <motion.div
            className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Star className="w-8 h-8 text-neutral-400" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-heading">No Progress Cards Yet</h2>
            <p className="text-body max-w-md mx-auto">
              Complete therapy sessions to earn personalized progress cards 
              that celebrate your milestones and growth.
            </p>
          </div>
        </div>

        <motion.div
          className="bg-primary/5 border border-primary/20 rounded-2xl p-6 max-w-md mx-auto"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-primary font-medium text-sm">
            💡 Progress cards are generated based on breakthroughs, insights, 
            and coping strategies you discover during your sessions.
          </p>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="text-center space-y-2">
        <h2 className="text-heading">Your Progress Journey</h2>
        <p className="text-body">
          Celebrating your milestones and breakthroughs
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {cards.map((card, index) => {
            const Icon = MILESTONE_ICONS[card.milestone.type]
            const gradientColor = MILESTONE_COLORS[card.milestone.type]
            
            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="group cursor-pointer"
              >
                <div className="card p-0 overflow-hidden h-full">
                  <div className={`
                    h-32 bg-gradient-to-br ${gradientColor} 
                    flex items-center justify-center relative
                  `}>
                    <Icon className="w-12 h-12 text-white drop-shadow-sm" />
                    
                    <motion.div
                      className="absolute top-4 right-4"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ 
                        duration: 2, 
                        repeat: Infinity, 
                        repeatDelay: 4,
                        delay: index * 0.5
                      }}
                    >
                      <div className={`
                        w-3 h-3 rounded-full bg-white/30
                        ${card.milestone.severity === 'high' ? 'animate-pulse' : ''}
                      `} />
                    </motion.div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-neutral-800 group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>{format(card.createdAt, 'MMM d, h:mm a')}</span>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: 3 }, (_, i) => (
                          <div
                            key={i}
                            className={`
                              w-1.5 h-1.5 rounded-full
                              ${i < (card.milestone.severity === 'high' ? 3 : card.milestone.severity === 'medium' ? 2 : 1)
                                ? 'bg-primary'
                                : 'bg-neutral-200'
                              }
                            `}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {cards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center space-x-3 bg-white rounded-2xl px-6 py-4 shadow-soft border border-neutral-100">
            <div className="flex -space-x-2">
              {Object.entries(MILESTONE_COLORS).slice(0, 4).map(([type, color], index) => {
                const Icon = MILESTONE_ICONS[type as MilestoneType]
                return (
                  <div
                    key={type}
                    className={`
                      w-8 h-8 rounded-full bg-gradient-to-br ${color} 
                      flex items-center justify-center border-2 border-white
                    `}
                  >
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                )
              })}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-neutral-800">
                {cards.length} milestone{cards.length !== 1 ? 's' : ''} achieved
              </p>
              <p className="text-xs text-neutral-500">
                Keep up the great progress!
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}