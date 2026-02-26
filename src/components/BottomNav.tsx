'use client'

import { BarChart3, Ticket, Flame, User } from 'lucide-react'

export type View = 'pool' | 'tickets' | 'streak' | 'profile'

interface BottomNavProps {
  activeView: View
  onViewChange: (view: View) => void
}

const tabs: { id: View; icon: typeof BarChart3; label: string }[] = [
  { id: 'pool', icon: BarChart3, label: 'Pool' },
  { id: 'tickets', icon: Ticket, label: 'Tickets' },
  { id: 'streak', icon: Flame, label: 'Streak' },
  { id: 'profile', icon: User, label: 'Profile' },
]

export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-white border-t border-border-black/30">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`flex-1 flex flex-col items-center py-3 px-2 transition-colors ${
              activeView === id
                ? 'text-text-main bg-primary-yellow/20'
                : 'text-text-main/50 hover:text-text-main/80'
            }`}
          >
            <Icon size={20} strokeWidth={activeView === id ? 2.5 : 1.5} />
            <span className="text-xs mt-1 font-display font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
