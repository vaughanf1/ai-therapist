import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, formatDistanceToNow } from 'date-fns'
import { 
  Clock, 
  Calendar, 
  TrendingUp, 
  Award,
  ChevronRight,
  Filter,
  Search,
  Play,
  MoreHorizontal
} from 'lucide-react'
import { Session } from '../types'

export function SessionHistory() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'duration' | 'milestones'>('date')
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)

  useEffect(() => {
    const storedSessions = localStorage.getItem('therapy_sessions')
    if (storedSessions) {
      try {
        const parsed = JSON.parse(storedSessions)
        setSessions(parsed.map((s: any) => ({
          ...s,
          startTime: new Date(s.startTime),
          endTime: s.endTime ? new Date(s.endTime) : undefined,
          transcript: s.transcript.map((t: any) => ({
            ...t,
            timestamp: new Date(t.timestamp)
          })),
          milestones: s.milestones.map((m: any) => ({
            ...m,
            achievedAt: new Date(m.achievedAt)
          }))
        })))
      } catch (error) {
        console.error('Error parsing sessions:', error)
      }
    }
  }, [])

  const filteredAndSortedSessions = sessions
    .filter(session => {
      if (!searchTerm) return true
      return session.milestones.some(m => 
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.startTime.getTime() - a.startTime.getTime()
        case 'duration':
          return (b.duration || 0) - (a.duration || 0)
        case 'milestones':
          return b.milestones.length - a.milestones.length
        default:
          return 0
      }
    })

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60))
    const seconds = Math.floor((ms % (1000 * 60)) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getTotalStats = () => {
    const totalSessions = sessions.length
    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
    const totalMilestones = sessions.reduce((sum, s) => sum + s.milestones.length, 0)
    
    return { totalSessions, totalDuration, totalMilestones }
  }

  const stats = getTotalStats()

  if (sessions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-6"
      >
        <div className="space-y-4">
          <motion.div
            className="w-16 h-16 bg-neutral-200 rounded-full flex items-center justify-center mx-auto"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Clock className="w-8 h-8 text-neutral-400" />
          </motion.div>
          
          <div className="space-y-2">
            <h2 className="text-heading">No Sessions Yet</h2>
            <p className="text-body max-w-md mx-auto">
              Your therapy session history will appear here. 
              Start your first session to begin tracking your progress.
            </p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          className="card text-center"
          whileHover={{ y: -2 }}
        >
          <Calendar className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="text-2xl font-bold text-neutral-800">{stats.totalSessions}</div>
          <div className="text-sm text-neutral-600">Total Sessions</div>
        </motion.div>

        <motion.div
          className="card text-center"
          whileHover={{ y: -2 }}
        >
          <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="text-2xl font-bold text-neutral-800">
            {formatDuration(stats.totalDuration)}
          </div>
          <div className="text-sm text-neutral-600">Total Time</div>
        </motion.div>

        <motion.div
          className="card text-center"
          whileHover={{ y: -2 }}
        >
          <Award className="w-8 h-8 text-primary mx-auto mb-3" />
          <div className="text-2xl font-bold text-neutral-800">{stats.totalMilestones}</div>
          <div className="text-sm text-neutral-600">Milestones</div>
        </motion.div>
      </div>

      <div className="card space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h2 className="text-subheading">Session History</h2>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search milestones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-xl focus:border-primary focus:outline-none"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-sm border border-neutral-200 rounded-xl focus:border-primary focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="duration">Sort by Duration</option>
              <option value="milestones">Sort by Milestones</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {filteredAndSortedSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                <div
                  className="p-4 border border-neutral-200 rounded-2xl hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                  onClick={() => setSelectedSession(
                    selectedSession?.id === session.id ? null : session
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary" />
                      </div>
                      
                      <div>
                        <div className="font-medium text-neutral-800">
                          {format(session.startTime, 'MMMM d, yyyy')}
                        </div>
                        <div className="text-sm text-neutral-600">
                          {formatDistanceToNow(session.startTime, { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-800">
                          {session.duration ? formatDuration(session.duration) : 'Ongoing'}
                        </div>
                        <div className="text-xs text-neutral-500">
                          {session.milestones.length} milestone{session.milestones.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      
                      <motion.div
                        animate={{ 
                          rotate: selectedSession?.id === session.id ? 90 : 0 
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronRight className="w-5 h-5 text-neutral-400" />
                      </motion.div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {selectedSession?.id === session.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pl-16 pr-4 space-y-4"
                    >
                      {session.milestones.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium text-neutral-700">
                            Milestones Achieved
                          </h4>
                          <div className="space-y-2">
                            {session.milestones.map((milestone) => (
                              <div
                                key={milestone.id}
                                className="flex items-start space-x-3 p-3 bg-primary/5 rounded-xl"
                              >
                                <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
                                <div>
                                  <div className="text-sm font-medium text-neutral-800">
                                    {milestone.title}
                                  </div>
                                  <div className="text-xs text-neutral-600">
                                    {milestone.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {session.transcript.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-neutral-700">
                              Session Transcript
                            </h4>
                            <button className="text-xs text-primary hover:text-primary-dark flex items-center space-x-1">
                              <Play className="w-3 h-3" />
                              <span>Replay</span>
                            </button>
                          </div>
                          
                          <div className="max-h-40 overflow-y-auto space-y-2">
                            {session.transcript.slice(-5).map((entry) => (
                              <div
                                key={entry.id}
                                className={`
                                  text-xs p-2 rounded-lg
                                  ${entry.speaker === 'user'
                                    ? 'bg-primary text-white ml-8'
                                    : 'bg-neutral-100 text-neutral-800 mr-8'
                                  }
                                `}
                              >
                                {entry.content}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}