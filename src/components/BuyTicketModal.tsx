'use client'

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Minus, Plus, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface BuyTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onBuy: (quantity: number, onProgress: (step: string) => void) => Promise<void>
  ticketPrice: number
}

export default function BuyTicketModal({ isOpen, onClose, onBuy, ticketPrice }: BuyTicketModalProps) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')

  if (!isOpen) return null

  const totalPrice = quantity * ticketPrice

  const handleBuy = async () => {
    setIsProcessing(true)
    setError('')
    setProgress(t('tickets.modal.preparing'))
    try {
      await onBuy(quantity, (step: string) => setProgress(step))
      setProgress('')
      onClose()
    } catch (err: any) {
      setProgress('')
      const msg = err.message || ''
      if (msg.includes('Insufficient USDC')) {
        setError(msg)
      } else if (msg.includes('Timeout')) {
        setError(t('errors.timeout'))
      } else if (msg.includes('CANCELLED')) {
        setError(t('errors.cancelled'))
      } else if (msg.includes('FAILED') || msg.includes('Internal Server Error') || msg.includes('500')) {
        setError(t('errors.failed'))
      } else if (msg.includes('insufficient') || msg.includes('below min')) {
        setError(t('errors.insufficientBalance'))
      } else if (msg.includes('already registered')) {
        setError(t('errors.alreadyRegistered'))
      } else if (msg.includes('execution reverted')) {
        setError(t('errors.contractReverted'))
      } else {
        setError(msg || t('errors.generic'))
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    if (isProcessing) return
    setError('')
    setProgress('')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
      <div className="bg-cream w-full max-w-lg rounded-t-3xl border-t-3 border-x-3 border-border-black p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/images/lottyRuleta.webp" alt="" width={36} height={36} />
            <h2 className="font-display text-xl font-bold">{t('tickets.modal.title')}</h2>
          </div>
          <button onClick={handleClose} className="p-1" disabled={isProcessing}>
            <X size={24} />
          </button>
        </div>

        <div className="neo-card-yellow flex items-center justify-between p-6">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 bg-card-white border-2 border-border-black rounded-lg flex items-center justify-center"
            disabled={isProcessing}
          >
            <Minus size={18} />
          </button>
          <div className="text-center">
            <p className="font-display text-4xl font-bold">{quantity}</p>
            <p className="text-sm text-text-main/70">{quantity > 1 ? t('tickets.modal.tickets') : t('tickets.modal.ticket')}</p>
          </div>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 bg-card-white border-2 border-border-black rounded-lg flex items-center justify-center"
            disabled={isProcessing}
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="neo-card">
          <div className="flex justify-between text-sm">
            <span>{t('tickets.modal.pricePerTicket')}</span>
            <span className="font-bold">{ticketPrice} {t('common.usdc')}</span>
          </div>
          <div className="border-t border-gray-light my-2" />
          <div className="flex justify-between">
            <span className="font-display font-bold">{t('tickets.modal.total')}</span>
            <span className="font-display font-bold text-lg">{totalPrice} {t('common.usdc')}</span>
          </div>
        </div>

        {isProcessing && progress && (
          <div className="flex items-center justify-center gap-2 py-3">
            <Loader2 size={16} className="animate-spin text-text-main/70" />
            <p className="text-sm text-text-main/70">{progress}</p>
          </div>
        )}

        {error && (
          <div className="neo-card bg-red-50 border-red-300">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <button
          onClick={handleBuy}
          disabled={isProcessing}
          className="neo-button w-full text-center"
        >
          {isProcessing ? t('tickets.modal.processing') : t('tickets.modal.buyButton', { count: quantity })}
        </button>
      </div>
    </div>
  )
}
