'use client'

import Image from 'next/image'
import WeekStreak from '@/components/WeekStreak'
import ProgressLevel from '@/components/ProgressLevel'
import { REWARD_TIERS } from '@/lib/constants'
import { CheckCircle, Snowflake } from 'lucide-react'

interface SavingStreakProps {
  currentStreak: number
  currentAPY: number
  weekData: Array<{ day: string; active: boolean }>
  nextMilestone: { days: number; apy: number } | null
}

export default function SavingStreak({ currentStreak, currentAPY, weekData, nextMilestone }: SavingStreakProps) {
  const currentDays = currentStreak * 7

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/images/lottyPig.webp" alt="" width={48} height={48} />
          <p className="text-sm font-display uppercase text-text-main/60">YOUR STREAK</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-display text-3xl font-bold">{currentDays}</span>
          <span className="text-2xl">🔥</span>
        </div>
      </div>

      <p className="text-sm text-text-main/60">Buy tickets 3 out of 7 days a week to maintain your streak</p>

      <WeekStreak weekData={weekData} />

      <ProgressLevel
        currentDays={currentDays}
        currentAPY={currentAPY}
        nextMilestone={nextMilestone}
      />

      <div className="neo-card space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle size={16} className="text-green-600" />
          <span>buy tickets daily</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle size={16} className="text-green-600" />
          <span>keep your streak</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <CheckCircle size={16} className="text-green-600" />
          <span>win bigger prizes</span>
        </div>
      </div>

      <div className="neo-card">
        <h3 className="font-display font-bold mb-3">ALL REWARDS</h3>
        <div className="space-y-2">
          {REWARD_TIERS.map((tier) => {
            const reached = currentDays >= tier.days
            return (
              <div key={tier.days} className={`flex items-center justify-between p-2 rounded-lg ${reached ? 'bg-primary-yellow/20' : 'bg-gray-light'}`}>
                <div className="flex items-center gap-2">
                  {reached ? (
                    <CheckCircle size={16} className="text-green-600" />
                  ) : (
                    <Snowflake size={16} className="text-blue-400" />
                  )}
                  <span className="text-sm font-display">{tier.days} days</span>
                </div>
                <span className="text-sm font-display font-bold">{tier.apy}% APY</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
