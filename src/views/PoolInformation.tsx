'use client'

import StatCard from '@/components/StatCard'
import DrawCountdown from '@/components/DrawCountdown'
import DrawManager from '@/components/DrawManager'
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
}: PoolInformationProps) {
  return (
    <div className="space-y-4 pb-24">
      <h2 className="font-display text-2xl font-bold">Pool Stats</h2>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Total Pool" value={`$${formatUSDC(totalDeposits)}`} icon="💰" />
        <StatCard label="Participants" value={participantCount.toString()} icon="👥" />
        <StatCard label="Your Tickets" value={userTickets.toString()} icon="🎟️" />
        <StatCard label="Weekly Prize" value={`$${formatUSDC(estimatedWeeklyYield)}`} icon="🏆" />
      </div>

      <DrawCountdown timeUntilDraw={timeUntilDraw} />

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
            <p className="text-sm font-display text-text-main/60">Current Prize Pool</p>
            <p className="font-display text-2xl font-bold">${formatUSDC(currentPrizePool)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-display text-text-main/60">Aave APY</p>
            <p className="font-display text-xl font-bold text-green-600">~4%</p>
          </div>
        </div>
        {accumulatedYield > 0n && (
          <div className="border-t border-gray-light pt-3 flex justify-between items-center">
            <p className="text-sm font-display text-text-main/60">Yield for next draw</p>
            <p className="font-display font-bold text-green-600">${formatUSDC(accumulatedYield)}</p>
          </div>
        )}
      </div>
    </div>
  )
}
