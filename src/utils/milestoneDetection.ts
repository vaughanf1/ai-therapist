import { Milestone, MilestoneType, TranscriptEntry } from '../types'

const MILESTONE_PATTERNS: Record<MilestoneType, { keywords: string[], description: string }> = {
  emotional_breakthrough: {
    keywords: ['I feel', 'I realize', 'breakthrough', 'clarity', 'understand now', 'lightbulb moment', 'epiphany'],
    description: 'A moment of emotional insight or breakthrough'
  },
  self_awareness: {
    keywords: ['I notice', 'I tend to', 'my pattern', 'I usually', 'I always', 'about myself', 'self-reflection'],
    description: 'Gained deeper self-awareness'
  },
  coping_strategy: {
    keywords: ['I could try', 'maybe I can', 'strategy', 'technique', 'cope with', 'manage', 'handle this'],
    description: 'Identified or learned a new coping strategy'
  },
  goal_setting: {
    keywords: ['I want to', 'my goal', 'I will', 'I plan to', 'I hope to', 'objective', 'target'],
    description: 'Set a meaningful goal for personal growth'
  },
  anxiety_management: {
    keywords: ['less anxious', 'calm down', 'breathe', 'relaxed', 'anxiety', 'worry less', 'peaceful'],
    description: 'Made progress managing anxiety'
  },
  communication_improvement: {
    keywords: ['express myself', 'communicate better', 'tell them', 'speak up', 'voice my', 'conversation'],
    description: 'Improved communication skills'
  },
  confidence_building: {
    keywords: ['I can do', 'I am capable', 'confident', 'believe in myself', 'I deserve', 'proud of myself'],
    description: 'Built confidence and self-esteem'
  },
  relationship_insight: {
    keywords: ['relationship', 'my partner', 'friendship', 'family', 'connect with', 'boundary', 'support'],
    description: 'Gained insight into relationships'
  },
  stress_relief: {
    keywords: ['less stress', 'pressure off', 'relieved', 'burden', 'overwhelming', 'manageable'],
    description: 'Found ways to reduce stress'
  },
  mindfulness_practice: {
    keywords: ['present moment', 'mindful', 'aware', 'meditation', 'focus on now', 'centered', 'grounded'],
    description: 'Practiced mindfulness and being present'
  }
}

export function detectMilestones(transcript: TranscriptEntry[]): Milestone[] {
  const milestones: Milestone[] = []
  const userEntries = transcript.filter(entry => entry.speaker === 'user')
  
  userEntries.forEach((entry, index) => {
    const content = entry.content.toLowerCase()
    
    Object.entries(MILESTONE_PATTERNS).forEach(([type, pattern]) => {
      const milestoneType = type as MilestoneType
      const matchingKeywords = pattern.keywords.filter(keyword => 
        content.includes(keyword.toLowerCase())
      )
      
      if (matchingKeywords.length > 0) {
        const confidence = Math.min(matchingKeywords.length / pattern.keywords.length, 1)
        
        if (confidence > 0.2) {
          const milestone: Milestone = {
            id: `${entry.id}-${milestoneType}`,
            type: milestoneType,
            title: getMilestoneTitle(milestoneType),
            description: pattern.description,
            achievedAt: entry.timestamp,
            severity: confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low'
          }
          
          if (!milestones.some(m => m.type === milestoneType && 
              Math.abs(m.achievedAt.getTime() - milestone.achievedAt.getTime()) < 60000)) {
            milestones.push(milestone)
          }
        }
      }
    })
  })
  
  return milestones.sort((a, b) => b.achievedAt.getTime() - a.achievedAt.getTime())
}

function getMilestoneTitle(type: MilestoneType): string {
  const titles: Record<MilestoneType, string> = {
    emotional_breakthrough: '🌟 Emotional Breakthrough',
    self_awareness: '🪞 Self-Awareness Moment',
    coping_strategy: '🛠️ New Coping Strategy',
    goal_setting: '🎯 Goal Setting',
    anxiety_management: '😌 Anxiety Relief',
    communication_improvement: '💬 Communication Growth',
    confidence_building: '💪 Confidence Boost',
    relationship_insight: '🤝 Relationship Insight',
    stress_relief: '🧘 Stress Relief',
    mindfulness_practice: '🧠 Mindfulness Practice'
  }
  
  return titles[type]
}

export function generateProgressSummary(milestones: Milestone[]): string {
  if (milestones.length === 0) {
    return "You showed up for yourself today - that's a meaningful step forward."
  }

  const milestoneTypes = [...new Set(milestones.map(m => m.type))]
  
  if (milestoneTypes.length === 1) {
    return `Great progress with ${getMilestoneTitle(milestoneTypes[0]).toLowerCase()}. Keep building on this insight.`
  }
  
  if (milestoneTypes.length <= 3) {
    const areas = milestoneTypes.map(type => getMilestoneTitle(type).toLowerCase()).join(', ')
    return `Wonderful session! You made progress in: ${areas}.`
  }
  
  return `Incredible session! You achieved ${milestones.length} milestones across multiple areas of personal growth.`
}