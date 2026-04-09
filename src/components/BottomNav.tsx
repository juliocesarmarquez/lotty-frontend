'use client'

import { BarChart3, Ticket, Flame, User, Trophy } from 'lucide-react'
import { useLanguage } from '@/i18n/LanguageContext'

export type View = 'pool' | 'tickets' | 'streak' | 'profile' | 'winners'

interface BottomNavProps {
  activeView: View
  onViewChange: (view: View) => void
}

export default function BottomNav({ activeView, onViewChange }: BottomNavProps) {
  const { t } = useLanguage()

  const tabs: { id: View; icon: typeof BarChart3; label: string }[] = [
    { id: 'pool', icon: BarChart3, label: t('nav.pool') },
    { id: 'tickets', icon: Ticket, label: t('nav.tickets') },
    { id: 'streak', icon: Flame, label: t('nav.streak') },
    { id: 'winners', icon: Trophy, label: t('nav.winners') },
    { id: 'profile', icon: User, label: t('nav.profile') },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-white border-t border-border-black/30">
      <div className="max-w-lg mx-auto flex">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`flex-1 flex flex-col items-center py-3 px-1 transition-colors ${activeView === id
                ? 'text-text-main bg-primary-yellow/20'
                : 'text-text-main/50 hover:text-text-main/80'
              }`}
          >
            <Icon size={20} strokeWidth={activeView === id ? 2.5 : 1.5} />
            <span className="text-[10px] mt-1 font-display font-medium truncate w-full text-center px-0.5">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
