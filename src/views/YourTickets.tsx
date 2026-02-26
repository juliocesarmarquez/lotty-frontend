'use client'

import { useState, useEffect } from 'react'
import { Plus, Info } from 'lucide-react'
import Image from 'next/image'
import TicketCard from '@/components/TicketCard'
import BuyTicketModal from '@/components/BuyTicketModal'
import DrawCountdown from '@/components/DrawCountdown'

interface TicketRecord {
  id: string
  quantity: number
  purchaseDate: string
  amount: string
}

interface YourTicketsProps {
  onBuyTickets: (quantity: number, onProgress: (step: string) => void) => Promise<void>
  ticketPrice: number
  walletAddress: string | null
  timeUntilDraw?: bigint
}

export default function YourTickets({ onBuyTickets, ticketPrice, walletAddress, timeUntilDraw }: YourTicketsProps) {
  const [showModal, setShowModal] = useState(false)
  const [tickets, setTickets] = useState<TicketRecord[]>([])

  // Load tickets from localStorage
  useEffect(() => {
    if (!walletAddress) return
    try {
      const stored = localStorage.getItem(`lotty_tickets_${walletAddress}`)
      if (stored) setTickets(JSON.parse(stored))
    } catch {}
  }, [walletAddress])

  const handleBuy = async (quantity: number, onProgress: (step: string) => void) => {
    await onBuyTickets(quantity, onProgress)

    // Save ticket to localStorage
    const newTicket: TicketRecord = {
      id: Date.now().toString(),
      quantity,
      purchaseDate: new Date().toLocaleDateString(),
      amount: (quantity * ticketPrice).toString(),
    }

    const updated = [newTicket, ...tickets]
    setTickets(updated)
    if (walletAddress) {
      localStorage.setItem(`lotty_tickets_${walletAddress}`, JSON.stringify(updated))
    }

    // Track daily purchase for streak
    if (walletAddress) {
      const today = new Date().toISOString().split('T')[0]
      const key = `lotty_daily_purchases_${walletAddress}`
      try {
        const purchases = JSON.parse(localStorage.getItem(key) || '{}')
        purchases[today] = true
        localStorage.setItem(key, JSON.stringify(purchases))
      } catch {}
    }
  }

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Your Tickets</h2>
        <button onClick={() => setShowModal(true)} className="neo-button flex items-center gap-2 py-2 px-4">
          <Plus size={16} />
          <span>Buy</span>
        </button>
      </div>

      {tickets.length === 0 ? (
        <div className="neo-card text-center py-8">
          <Image
            src="/images/lottyCaja.webp"
            alt="Buy tickets"
            width={80}
            height={80}
            className="mx-auto mb-3"
          />
          <p className="font-display font-bold">No tickets yet</p>
          <p className="text-sm text-text-main/60 mt-1">Buy tickets to enter the weekly draw</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} {...ticket} />
          ))}
        </div>
      )}

      {timeUntilDraw !== undefined && (
        <DrawCountdown timeUntilDraw={timeUntilDraw} variant="compact" />
      )}

      <div className="neo-card flex items-start gap-3">
        <Info size={18} className="text-text-main/50 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-text-main/70">
          <p className="font-display font-bold text-text-main mb-1">How tickets work</p>
          <p>Each ticket costs {ticketPrice} USDC. Your deposit earns yield in Aave, and the accumulated yield forms the weekly prize pool. You can withdraw your deposit anytime.</p>
        </div>
      </div>

      <BuyTicketModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onBuy={handleBuy}
        ticketPrice={ticketPrice}
      />
    </div>
  )
}
