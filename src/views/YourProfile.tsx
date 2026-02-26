'use client'

import { useState } from 'react'
import { Copy, LogOut, Wallet, TrendingUp, ArrowDownToLine, Gift } from 'lucide-react'
import Image from 'next/image'
import DisconnectModal from '@/components/DisconnectModal'
import { formatUSDC, NETWORK } from '@/lib/constants'

interface YourProfileProps {
  address: string
  balances: { usdc: bigint; aUsdc: bigint }
  position: {
    depositedAmount: bigint
    tickets: bigint
    streak: bigint
    isActive: boolean
    accruedYield: bigint
  } | null
  currentAPY: number
  onWithdraw: () => Promise<void>
  onClaimRewards: () => Promise<void>
  onDisconnect: () => void
}

export default function YourProfile({
  address,
  balances,
  position,
  currentAPY,
  onWithdraw,
  onClaimRewards,
  onDisconnect,
}: YourProfileProps) {
  const [showDisconnect, setShowDisconnect] = useState(false)
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw all your USDC? This will close your position and reset your streak.')) return
    setIsWithdrawing(true)
    try { await onWithdraw() } finally { setIsWithdrawing(false) }
  }

  const handleClaimRewards = async () => {
    if (!confirm('Claim your accrued rewards?')) return
    setIsClaiming(true)
    try { await onClaimRewards() } finally { setIsClaiming(false) }
  }

  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`
  const networkLabel = NETWORK === 'mainnet' ? 'Base' : 'Base Sepolia'
  const totalBalance = balances.usdc + balances.aUsdc
  const hasActivePosition = position?.isActive ?? false
  const accruedYield = position?.accruedYield ?? 0n

  return (
    <div className="space-y-4 pb-40">
      {/* Profile Header */}
      <div className="flex items-center gap-3">
        <Image src="/images/logoLotty.png" alt="" width={40} height={40} className="rounded-lg" />
        <h2 className="font-display text-2xl font-bold">Your Profile</h2>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* WALLET INFO CARD                           */}
      {/* ═══════════════════════════════════════════ */}
      <div className="neo-card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Wallet size={18} className="text-text-main/70" />
          <h3 className="font-display font-bold">Wallet</h3>
        </div>

        {/* Address row */}
        <div className="flex items-center justify-between bg-gray-light rounded-xl px-3 py-2">
          <code className="text-sm font-mono text-text-main/80">{shortAddress}</code>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-display font-bold uppercase bg-primary-yellow border border-border-black rounded-md px-2 py-0.5">
              {networkLabel}
            </span>
            <button onClick={copyAddress} className="p-1.5 hover:bg-card-white rounded-lg transition-colors">
              <Copy size={14} />
            </button>
          </div>
        </div>
        {copied && <p className="text-xs text-green-600">Copied!</p>}

        {/* Total Balance */}
        <div className="border-t border-gray-light pt-3">
          <p className="text-xs font-display uppercase text-text-main/50 tracking-wide">Total Balance</p>
          <p className="font-display text-2xl font-bold mt-1">${formatUSDC(totalBalance)}</p>
          <div className="flex gap-3 mt-2">
            <div className="text-xs text-text-main/60">
              <span className="text-text-main/40">USDC</span>{' '}
              <span className="font-bold">{formatUSDC(balances.usdc)}</span>
            </div>
            <div className="text-xs text-text-main/60">
              <span className="text-text-main/40">aUSDC</span>{' '}
              <span className="font-bold">{formatUSDC(balances.aUsdc)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════ */}
      {/* ACCOUNT STATS CARD                         */}
      {/* ═══════════════════════════════════════════ */}
      <div className="neo-card space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp size={18} className="text-text-main/70" />
          <h3 className="font-display font-bold">Account Stats</h3>
        </div>

        {hasActivePosition ? (
          <>
            {/* Deposit Info */}
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 px-3 bg-gray-light rounded-xl">
                <span className="text-sm text-text-main/70">Deposited</span>
                <span className="font-display font-bold">${formatUSDC(position!.depositedAmount)}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-gray-light rounded-xl">
                <span className="text-sm text-text-main/70">Active Tickets</span>
                <span className="font-display font-bold">{Number(position!.tickets)}</span>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-gray-light rounded-xl">
                <span className="text-sm text-text-main/70">Streak</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-display font-bold">{Number(position!.streak) * 7} days</span>
                  <span className="text-sm">🔥</span>
                </div>
              </div>
              <div className="flex justify-between items-center py-2 px-3 bg-gray-light rounded-xl">
                <span className="text-sm text-text-main/70">Current APY</span>
                <span className="font-display font-bold text-green-600">{currentAPY}%</span>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="border-t border-gray-light pt-3">
              <div className="neo-card-yellow flex items-center justify-between !p-3">
                <div>
                  <p className="text-xs font-display uppercase text-text-main/60">Accrued Rewards</p>
                  <p className="font-display text-xl font-bold">${formatUSDC(accruedYield)}</p>
                </div>
                <Image src="/images/lottyPig.webp" alt="" width={40} height={40} />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6">
            <Image src="/images/lottyCaja.webp" alt="" width={64} height={64} className="mx-auto mb-3 opacity-60" />
            <p className="font-display font-bold text-text-main/60">No active position</p>
            <p className="text-sm text-text-main/40 mt-1">Buy tickets to start earning rewards</p>
          </div>
        )}
      </div>

      {/* Disconnect */}
      <button
        onClick={() => setShowDisconnect(true)}
        className="w-full flex items-center justify-center gap-2 py-3 text-text-main/50 hover:text-text-main transition-colors"
      >
        <LogOut size={16} />
        <span className="text-sm">Disconnect Wallet</span>
      </button>

      <DisconnectModal
        isOpen={showDisconnect}
        onClose={() => setShowDisconnect(false)}
        onConfirm={() => { setShowDisconnect(false); onDisconnect() }}
      />

      {/* ═══════════════════════════════════════════ */}
      {/* STICKY BOTTOM ACTION BAR                   */}
      {/* ═══════════════════════════════════════════ */}
      {hasActivePosition && (
        <div className="fixed bottom-[57px] left-0 right-0 bg-cream border-t-3 border-border-black z-40">
          <div className="max-w-lg mx-auto flex gap-3 p-3">
            <button
              onClick={handleWithdraw}
              disabled={isWithdrawing}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-3 border-red-500 text-red-600 bg-red-50 rounded-xl font-display font-bold transition-all hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '3px 3px 0px rgba(239, 68, 68, 0.5)' }}
            >
              <ArrowDownToLine size={16} />
              <span className="text-sm">{isWithdrawing ? 'Withdrawing...' : 'Withdraw'}</span>
            </button>
            <button
              onClick={handleClaimRewards}
              disabled={isClaiming || accruedYield === 0n}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border-3 border-border-black bg-primary-yellow rounded-xl font-display font-bold transition-all hover:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '3px 3px 0px rgba(0, 0, 0, 1)' }}
            >
              <Gift size={16} />
              <span className="text-sm">{isClaiming ? 'Claiming...' : 'Claim Rewards'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
