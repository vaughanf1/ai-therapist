import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, BarChart3, Clock, Settings as SettingsIcon } from 'lucide-react'

interface HeaderProps {
  currentView: 'therapy' | 'progress' | 'history' | 'settings'
  onViewChange: (view: 'therapy' | 'progress' | 'history' | 'settings') => void
}

export function Header({ currentView, onViewChange }: HeaderProps) {
  const navItems = [
    { id: 'therapy' as const, label: 'Therapy', icon: MessageCircle },
    { id: 'progress' as const, label: 'Progress', icon: BarChart3 },
    { id: 'history' as const, label: 'History', icon: Clock },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ]

  return (
    <header className="bg-white border-b border-neutral-100 shadow-soft sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4 max-w-4xl">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2 sm:space-x-3"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-soft">
              <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
              JustTalk
            </span>
          </motion.div>

          <nav className="flex items-center space-x-0.5 sm:space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = currentView === item.id

              return (
                <motion.button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`
                    relative flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-xl font-medium transition-all duration-200 min-w-[44px] min-h-[44px]
                    ${isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-50'
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-4 h-4 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-sm sm:text-base">{item.label}</span>

                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute inset-0 bg-primary/5 rounded-xl border border-primary/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}