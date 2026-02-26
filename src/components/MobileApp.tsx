'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useWallet } from '@/hooks/useWallet'
import { useLemonSDK } from '@/hooks/useLemonSDK'
import { useContracts } from '@/hooks/useContracts'
import { getAPYForStreak, getNextMilestone, TICKET_PRICE } from '@/lib/constants'
import BottomNav, { type View } from './BottomNav'
import SuccessToast from './SuccessToast'
import PoolInformation from '@/views/PoolInformation'
import YourTickets from '@/views/YourTickets'
import SavingStreak from '@/views/SavingStreak'
import YourProfile from '@/views/YourProfile'

export default function MobileApp() {
  const [activeView, setActiveView] = useState<View>('pool')
  const [toast, setToast] = useState({ visible: false, message: '' })

  const wallet = useWallet()
  const lemon = useLemonSDK()

  const isConnected = true
  const activeAddress = lemon.wallet || wallet.address
  const activeSigner = wallet.signer

  const contracts = useContracts(
    activeAddress,
    activeSigner,
    lemon.isLemonEnvironment ? lemon.executeContract : undefined,
    lemon.isLemonEnvironment,
  )

  const showToast = (message: string) => {
    setToast({ visible: true, message })
  }


  const currentStreak = contracts.position ? Number(contracts.position.streak) : 0
  const currentDays = currentStreak * 7
  const currentAPY = getAPYForStreak(currentDays)
  const nextMilestone = getNextMilestone(currentDays)
  const userTickets = contracts.position ? Number(contracts.position.tickets) : 0

  const handleBuyTickets = async (quantity: number, onProgress: (step: string) => void) => {
    const amount = BigInt(quantity) * BigInt(TICKET_PRICE)
    if (contracts.position?.isActive) {
      await contracts.addToPosition(amount, onProgress)
    } else {
      await contracts.register(amount, onProgress)
    }
    showToast(`Successfully purchased ${quantity} ticket${quantity > 1 ? 's' : ''}!`)
  }

  const handleWithdraw = async () => {
    await contracts.unregister()
    showToast('Successfully withdrawn!')
  }

  const handleClaimRewards = async () => {
    await contracts.claimPrize()
    showToast('Rewards claimed successfully!')
  }

  const handleDisconnect = () => {
    if (lemon.isLemonEnvironment) {
      // Can't truly disconnect from Lemon WebView
    } else {
      wallet.disconnect()
    }
  }

  // Get week purchase data for streak view
  const getWeekPurchaseData = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const now = new Date()
    const dayOfWeek = now.getDay()
    const monday = new Date(now)
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7))

    let purchases: Record<string, boolean> = {}
    if (activeAddress) {
      try {
        purchases = JSON.parse(localStorage.getItem(`lotty_daily_purchases_${activeAddress}`) || '{}')
      } catch {}
    }

    return days.map((day, i) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      return { day, active: purchases[dateStr] === true }
    })
  }

  return (
    <div className="min-h-screen bg-cream max-w-lg mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 h-[60px] px-4 flex items-center justify-between bg-cream/95 backdrop-blur-sm border-b border-border-black/10">
        <div className="flex h-10 items-center shrink-0">
          <Image
            src="/images/lottyBanner.webp"
            alt="Lotty"
            width={120}
            height={48}
            className="h-10 w-auto block"
          />
        </div>
        <div className="flex h-10 items-center justify-end gap-2 shrink-0">
          <span className="text-xs font-mono leading-none text-text-main/70 bg-card-white/80 border border-border-black/20 rounded-lg px-2.5 py-1.5 shadow-neo-sm inline-flex items-center">
            {activeAddress ? (
              <>
                {activeAddress.slice(0, 6)}…{activeAddress.slice(-4)}
              </>
            ) : (
              <span className="text-text-main/50">Wallet sin conectar</span>
            )}
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="px-4 pt-4">
        {activeView === 'pool' && (
          <PoolInformation
            totalDeposits={contracts.poolStats?.totalDeposits ?? 0n}
            participantCount={contracts.poolStats?.participantCount ?? 0n}
            currentPrizePool={contracts.poolStats?.currentPrizePool ?? 0n}
            timeUntilDraw={contracts.poolStats?.timeUntilDraw ?? 0n}
            estimatedWeeklyYield={contracts.poolStats?.estimatedWeeklyYield ?? 0n}
            userTickets={userTickets}
            accumulatedYield={contracts.poolStats?.accumulatedYield ?? 0n}
            canDraw={contracts.poolStats?.canDraw ?? false}
            isDrawPending={contracts.poolStats?.isDrawPending ?? false}
            onStartDraw={contracts.startDraw}
            onCompleteRNG={contracts.completeRNG}
            onCompleteDraw={contracts.completeDraw}
          />
        )}

        {activeView === 'tickets' && (
          <YourTickets
            onBuyTickets={handleBuyTickets}
            ticketPrice={10}
            walletAddress={activeAddress}
            timeUntilDraw={contracts.poolStats?.timeUntilDraw ?? 0n}
          />
        )}

        {activeView === 'streak' && (
          <SavingStreak
            currentStreak={currentStreak}
            currentAPY={currentAPY}
            weekData={getWeekPurchaseData()}
            nextMilestone={nextMilestone}
          />
        )}

        {activeView === 'profile' && activeAddress && (
          <YourProfile
            address={activeAddress}
            balances={contracts.balances}
            position={contracts.position ? {
              depositedAmount: contracts.position.depositedAmount,
              tickets: contracts.position.tickets,
              streak: contracts.position.streak,
              isActive: contracts.position.isActive,
              accruedYield: contracts.position.accruedYield,
            } : null}
            currentAPY={currentAPY}
            onWithdraw={handleWithdraw}
            onClaimRewards={handleClaimRewards}
            onDisconnect={handleDisconnect}
          />
        )}
      </main>

      <BottomNav activeView={activeView} onViewChange={setActiveView} />

      <SuccessToast
        message={toast.message}
        isVisible={toast.visible}
        onClose={() => setToast({ visible: false, message: '' })}
      />
    </div>
  )
}
