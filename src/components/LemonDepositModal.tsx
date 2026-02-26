'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

interface LemonDepositModalProps {
  isOpen: boolean
  onClose: () => void
  onDeposit: (amount: string) => Promise<void>
}

export default function LemonDepositModal({ isOpen, onClose, onDeposit }: LemonDepositModalProps) {
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  if (!isOpen) return null

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) return
    setIsProcessing(true)
    try {
      await onDeposit(amount)
      onClose()
    } catch (err) {
      console.error('Deposit failed:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-cream w-full max-w-lg rounded-t-3xl border-t-3 border-x-3 border-border-black p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Deposit from Lemon</h2>
          <button onClick={onClose}><X size={24} /></button>
        </div>

        <div className="neo-card">
          <label className="text-sm font-display text-text-main/60">Amount (USDC)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full mt-2 p-3 border-2 border-border-black rounded-xl font-display text-xl focus:outline-none focus:ring-2 focus:ring-primary-yellow"
          />
        </div>

        <button
          onClick={handleDeposit}
          disabled={isProcessing || !amount}
          className="neo-button w-full text-center"
        >
          {isProcessing ? 'Processing...' : 'Deposit'}
        </button>
      </div>
    </div>
  )
}
