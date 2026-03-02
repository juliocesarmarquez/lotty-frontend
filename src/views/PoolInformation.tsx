'use client'

import { useTranslation } from 'react-i18next'
import StatCard from '@/components/StatCard'
import DrawCountdown from '@/components/DrawCountdown'
import DrawManager from '@/components/DrawManager'
import ProgressLevel from '@/components/ProgressLevel'
import { formatUSDC } from '@/lib/constants'

interface PoolInformationProps {
  totalDeposits: bigint
  participantCount: bigint
  currentPrizePool: bigint
  timeUntilDraw: bigint
  estimatedWeeklyYield: bigint
  userTickets: number
  accumulatedYield?: bigint
  canDraw?: boolean
  isDrawPending?: boolean
  onStartDraw?: (onProgress?: (step: string) => void) => Promise<void>
  onCompleteRNG?: (onProgress?: (step: string) => void) => Promise<void>
  onCompleteDraw?: (onProgress?: (step: string) => void) => Promise<void>
  currentDays: number
  currentAPY: number
  nextMilestone: { days: number; apy: number } | null
}

export default function PoolInformation({
  totalDeposits,
  participantCount,
  currentPrizePool,
  timeUntilDraw,
  estimatedWeeklyYield,
  userTickets,
  accumulatedYield = 0n,
  canDraw = false,
  isDrawPending = false,
  onStartDraw,
  onCompleteRNG,
  onCompleteDraw,
  currentDays,
  currentAPY,
  nextMilestone,
}: Readonly<PoolInformationProps>) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4 pb-24">
      <h2 className="font-display text-2xl font-bold">{t('pool.stats')}</h2>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label={t('pool.totalPool')} value={`$${formatUSDC(totalDeposits)}`} icon="💰" />
        <StatCard label={t('pool.participants')} value={participantCount.toString()} icon="👥" />
        <StatCard label={t('pool.yourTickets')} value={userTickets.toString()} icon="🎟️" />
        <StatCard label={t('pool.weeklyPrize')} value={`$${formatUSDC(estimatedWeeklyYield)}`} icon="🏆" />
      </div>

      <DrawCountdown timeUntilDraw={timeUntilDraw} />

      <ProgressLevel
        currentDays={currentDays}
        currentAPY={currentAPY}
        nextMilestone={nextMilestone}
      />

      {(canDraw || isDrawPending) && onStartDraw && onCompleteRNG && onCompleteDraw && (
        <DrawManager
          canDraw={canDraw}
          isDrawPending={isDrawPending}
          onStartDraw={onStartDraw}
          onCompleteRNG={onCompleteRNG}
          onCompleteDraw={onCompleteDraw}
        />
      )}

      <div className="neo-card space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-display text-text-main/60">{t('pool.currentPrizePool')}</p>
            <p className="font-display text-2xl font-bold">${formatUSDC(currentPrizePool)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-display text-text-main/60">{t('pool.aaveApy')}</p>
            <p className="font-display text-xl font-bold text-green-600">{t('pool.aaveApyValue')}</p>
          </div>
        </div>
        {accumulatedYield > 0n && (
          <div className="border-t border-gray-light pt-3 flex justify-between items-center">
            <p className="text-sm font-display text-text-main/60">{t('pool.yieldForNextDraw')}</p>
            <p className="font-display font-bold text-green-600">${formatUSDC(accumulatedYield)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
