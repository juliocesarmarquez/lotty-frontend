'use client'

import { useTranslation } from 'react-i18next'

interface WeekStreakProps {
  weekData: Array<{ day: string; active: boolean }>
}

export default function WeekStreak({ weekData }: WeekStreakProps) {
  const { t } = useTranslation()
  const activeDays = weekData.filter(d => d.active).length

  return (
    <div className="neo-card">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-text-main/60 font-display uppercase">{t('streak.weeklySummary')}</p>
        <p className="text-sm font-display font-bold">{t('streak.ticketsPurchased', { count: activeDays })}</p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekData.map((day, i) => (
          <div
            key={i}
            className={`flex flex-col items-center py-2 px-1 rounded-xl border-2 ${
              day.active
                ? 'bg-primary-yellow border-yellow-600'
                : 'bg-gray-light border-gray-300'
            }`}
          >
            <span className="text-xs font-display font-medium">{day.day}</span>
            <span className="text-lg mt-1">{day.active ? '🔥' : '❄️'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
