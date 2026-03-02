'use client'

import { BarChart3, Ticket, Flame, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export type View = 'pool' | 'tickets' | 'streak' | 'profile'

interface BottomNavProps {
  activeView: View
  onViewChange: (view: View) => void
}

const tabIds: View[] = ['pool', 'tickets', 'streak', 'profile']
const tabIcons = [BarChart3, Ticket, Flame, User]

export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  const { t } = useTranslation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-white border-t border-border-black/30">
      <div className="max-w-lg mx-auto flex">
        {tabIds.map((id, i) => {
          const Icon = tabIcons[i]
          return (
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
              <span className="text-xs mt-1 font-display font-medium">{t(`nav.${id}`)}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
