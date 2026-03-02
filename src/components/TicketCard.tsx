'use client'

import { useTranslation } from 'react-i18next'

interface TicketCardProps {
  id: string
  quantity: number
  purchaseDate: string
  amount: string
}

export default function TicketCard({ id, quantity, purchaseDate, amount }: TicketCardProps) {
  const { t } = useTranslation()

  return (
    <div className="neo-card flex items-center justify-between" data-testid={`ticket-${id}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary-yellow border-2 border-border-black rounded-lg flex items-center justify-center">
          <span className="text-lg">🎟️</span>
        </div>
        <div>
          <p className="font-display font-bold text-sm">{quantity} {quantity > 1 ? t('tickets.card.tickets') : t('tickets.card.ticket')}</p>
          <p className="text-xs text-text-main/50">{purchaseDate}</p>
        </div>
      </div>
      <p className="font-display font-bold text-sm">{amount} {t('common.usdc')}</p>
    </div>
  )
}
