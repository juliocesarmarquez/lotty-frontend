'use client'
import { useLanguage } from '@/i18n/LanguageContext'

interface TicketCardProps {
  id: string
  quantity: number
  purchaseDate: string
  amount: string
}

export default function TicketCard({ id, quantity, purchaseDate, amount }: TicketCardProps) {
  const { t } = useLanguage()

  return (
    <div className="neo-card flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-yellow border-2 border-border-black rounded-lg flex items-center justify-center">
          <span className="text-lg">🎟️</span>
        </div>
        <div>
          <p className="font-display font-bold text-sm">{quantity} {t(quantity > 1 ? 'modal.Ticket_label' : 'modal.ticket_label', { s: quantity > 1 ? 's' : '' })}</p>
          <p className="text-xs text-text-main/50">{purchaseDate}</p>
        </div>
      </div>
      <p className="font-display font-bold text-sm">{amount} USDC</p>
    </div>
  )
}
